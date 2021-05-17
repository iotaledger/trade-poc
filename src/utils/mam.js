import { createChannel, createMessage, mamAttach, mamFetchAll, TrytesHelper } from '@iota/mam.js';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import pick from 'lodash/pick';
import last from 'lodash/last';
import memoize from 'lodash/memoize';
import { createItem, updateItem } from './firebase';

let node;

export const initializeMamState = memoize(provider => {
  node = provider;
});

const createNewChannel = async (payload) => {
  try {
    const secretKey = generateSeed(81);
    let channelState = createChannel(generateSeed(81), 2, 'restricted', secretKey)
    const mamMessage = createMessage(channelState, TrytesHelper.fromAscii(JSON.stringify(payload)));
    channelState.root = mamMessage.root;
    await mamAttach(node, mamMessage, "TRACKANDTRACE");
    return channelState;
  } catch (error) {
    console.error('Channel create error', error);
    return null;
  }
};

const appendToChannel = async (payload, savedChannelState) => {
  try {
    let channelState = savedChannelState;
    const mamMessage = createMessage(channelState, TrytesHelper.fromAscii(JSON.stringify(payload)));
    await mamAttach(node, mamMessage, "TRACKANDTRACE");
    return channelState;
  } catch (error) {
    console.error('Channel append error', error);
    return null;
  }
};

export const fetchItem = async (root, secretKey, storeItemCallback, setStateCalback) => {
  try {
    const itemEvents = [];
    const convertData = data => {
      const itemEvent = JSON.parse(TrytesHelper.toAscii(data));
      storeItemCallback(itemEvent);
      itemEvents.push(itemEvent);
      setStateCalback(itemEvent, getUniqueStatuses(itemEvents));
    }

    const fetched = await mamFetchAll(node, root, 'restricted', secretKey, 20);
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
  const promise = new Promise(async (resolve, reject) => {
    try {
      const eventBody = {};
      project.firebaseFields.forEach(field => (eventBody[field] = request[field]));
      eventBody.containerId = containerId;
      eventBody.timestamp = Date.now();

      const messageBody = {
        ...request,
        ...eventBody,
        temperature: null,
        position: null,
        lastPositionIndex: 0,
        documents: [],
      };

      const channel = await createNewChannel(messageBody);

      if (channel && !isEmpty(channel)) {
        // Create a new item entry using that item ID
        await createItem(eventBody, channel);
      }

      return resolve(eventBody);
    } catch (error) {
      console.error('createItemChannel error', error);
      return reject();
    }
  });

  return promise;
};

export const appendItemChannel = async (metadata, props, documentExists, status) => {
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

        const newChannelState = await appendToChannel(newPayload, mam);

        if (newChannelState && !isEmpty(newChannelState)) {
          const eventBody = {};
          project.firebaseFields.forEach(field => (eventBody[field] = last(item)[field]));
          eventBody.status = newStatus;
          eventBody.timestamp = timestamp;

          await updateItem(eventBody, newChannelState);

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
        const newChannelState = await appendToChannel(payload, container.mam);

        if (newChannelState && !isEmpty(newChannelState)) {
          const eventBody = {};
          project.firebaseFields.forEach(field => (eventBody[field] = last(item)[field]));
          eventBody.status = payload.status;
          eventBody.timestamp = payload.timestamp;
          
          await updateItem(eventBody, newChannelState);

          return resolve(containerId);
        }
      }
      console.error("No payload to append")
      return reject();
    } catch (error) {
      console.error(error)
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
