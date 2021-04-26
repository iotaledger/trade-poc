import Mam from 'mam.client.js';
import { composeAPI } from '@iota/core';
import { mamFetchAll, createChannel, createMessage, mamAttach, TrytesHelper } from '@iota/mam-chrysalis.js';
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import pick from 'lodash/pick';
import last from 'lodash/last';
import memoize from 'lodash/memoize';
import { createItem, updateItem } from './firebase';


// Initialise MAM State
let mamChannelState;
let api;


export const initializeMamState = memoize(provider => {
  // mamState = Mam.init(provider);
  console.info("Initializing MamState")
  api = composeAPI({ provider: "https://nodes.devnet.iota.org:443" });
  const secretKey = generateSeed(81);
  console.info('Secret Key: ', secretKey);
  mamChannelState = createChannel(generateSeed(81), 2, 'restricted', secretKey);
  console.info('MamChannel: ', mamChannelState);
});


// Publish to tangle
const publish = async data => {
  console.log('publish called')
  let message;
  try {
    const trytes = TrytesHelper.fromAscii(JSON.stringify(data))
    message = createMessage(mamChannelState, trytes)
    // Save new mamState
    // ? Message of type IMamMessage does not have state
    console.log('Published message:', message)
    updateMamState(message.state);
  } catch (error) {
    console.log('MAM create message error', error);
    return null;
  }
  try {
    // Attach the payload.
    // await Mam.attach(message.payload, message.address);
    await mamAttach(api, message)

    return { root: message.root, state: message.state };
  } catch (error) {
    console.log('MAM publish error', error);
    return null;
  }
};

const updateMamState = newMamState => (mamChannelState = newMamState);

const createNewChannel = async (payload, secretKey) => {
  console.log('createNewChannel called')
  // Set channel mode for default state
  // const defaultMamState = Mam.changeMode(mamState, 'restricted', secretKey);
  const defaultMamState = createChannel(generateSeed(81), 2, 'restricted', secretKey);
  updateMamState(defaultMamState);
  const mamData = await publish(payload);
  console.log('createNewChannel mamData', mamData)
  return mamData;
};

const appendToChannel = async (payload, savedMamData) => {
  console.log('appendToChannel called')
  console.log('appendChannel savedMamData', savedMamData)
  const mamState = {
    subscribed: [],
    channel: {
      side_key: savedMamData.secretKey,
      mode: 'restricted',
      next_root: savedMamData.next,
      security: 2,
      start: savedMamData.start,
      count: 1,
      next_count: 1,
      index: 0,
    },
    seed: savedMamData.seed,
  };
  try {
    updateMamState(mamState);
    const mamData = await publish(payload);
    return mamData;
  } catch (error) {
    console.log('MAM append error', error);
    return null;
  }
};

export const fetchItem = async (root, secretKey, storeItemCallback, setStateCalback) => {
  try {
    const itemEvents = [];
    const convertData = data => {
      const itemEvent = JSON.parse(trytesToAscii(data));
      storeItemCallback(itemEvent);
      itemEvents.push(itemEvent);
      setStateCalback(itemEvent, getUniqueStatuses(itemEvents));
    }
    console.log('API', api);
    console.log('root', root);
    console.log('secretkey', secretKey);
    const fetched = await mamFetchAll(api, root, 'restricted', secretKey, 5);
    console.log('Fetched ', fetched)
    if (fetched && fetched.length > 0) {
      for (let i = 0; i < fetched.length; i++) {
        convertData(fetched[i].message);
      }
    }
    return itemEvents[itemEvents.length - 1];
  } catch (e) {
    console.error("fetchItem:", "\n", e);
    return e;
  }
};

const getUniqueStatuses = itemEvents =>
  uniqBy(itemEvents.map(event => pick(event, ['status', 'timestamp'])), 'status');

export const createItemChannel = (project, containerId, request) => {
  console.info('CreateItemChannel called');
  const promise = new Promise(async (resolve, reject) => {
    try {
      const secretKey = generateSeed(81);
      const eventBody = {};
      project.firebaseFields.forEach(field => (eventBody[field] = request[field]));
      eventBody.containerId = containerId;
      eventBody.timestamp = Date.now();
      console.log('createItemChannel - Eventbody', eventBody)
      const messageBody = {
        ...request,
        ...eventBody,
        temperature: null,
        position: null,
        lastPositionIndex: 0,
        documents: [],
      };

      const channel = await createNewChannel(messageBody, secretKey);
      // const channel = createChannel(generateSeed(81), 2, 'restricted', secretKey)
      console.log('Channel', channel)
      if (channel && !isEmpty(channel)) {
        // Create a new item entry using that item ID
        await createItem(eventBody, channel, secretKey);
      }

      return resolve(eventBody);
    } catch (error) {
      console.log('createItemChannel error', error);
      return reject();
    }
  });

  return promise;
};

export const appendItemChannel = async (metadata, props, documentExists, status) => {
  console.info('AppendItemChannel called')
  const meta = metadata.length;
  const {
    project,
    item,
    items,
    match: {
      params: { containerId },
    },
  } = props;

  const { mam } = items[containerId];
  const { documents } = last(item);

  const promise = new Promise(async (resolve, reject) => {
    try {
      if (item) {
        const timestamp = Date.now();
        const newStatus = meta ? last(item).status : status;

        metadata.forEach(({ name }) => {
          documents.forEach(existingDocument => {
            if (existingDocument.name === name) {
              reject(documentExists(name));
            }
          });
        });

        const payload = {};
        project.fields.forEach(field => (payload[field] = last(item)[field]));
        const newPayload = {
          ...payload,
          timestamp,
          status: newStatus,
          documents: [...documents, ...metadata],
        };

        const newItemData = await appendToChannel(newPayload, mam);

        if (newItemData && !isEmpty(newItemData)) {
          const eventBody = {};
          project.firebaseFields.forEach(field => (eventBody[field] = last(item)[field]));
          eventBody.status = newStatus;
          eventBody.timestamp = timestamp;

          await updateItem(eventBody, mam, newItemData);

          return resolve(containerId);
        }
      }
      return reject();
    } catch (error) {
      return reject();
    }
  });

  return promise;
};

export const appendTemperatureLocation = async (payload, props) => {
  const {
    project,
    item,
    items,
    match: {
      params: { containerId },
    },
  } = props;
  const container = items[containerId];
  if (!container) return containerId;

  const promise = new Promise(async (resolve, reject) => {
    try {
      if (payload) {
        const newItemData = await appendToChannel(payload, container.mam);

        if (newItemData && !isEmpty(newItemData)) {
          const eventBody = {};
          project.firebaseFields.forEach(field => (eventBody[field] = last(item)[field]));
          eventBody.status = payload.status;
          eventBody.timestamp = payload.timestamp;

          await updateItem(eventBody, container.mam, newItemData);

          return resolve(containerId);
        }
      }
      return reject();
    } catch (error) {
      return reject();
    }
  });

  return promise;
};

const generateSeed = length => {
  if (window.crypto && window.crypto.getRandomValues) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let result = '';
    let values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    values.forEach(value => (result += charset[value % charset.length]));
    return result;
  } else throw new Error("Your browser is outdated and can't generate secure random numbers");
};
