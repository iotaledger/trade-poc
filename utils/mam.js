import IOTA from 'iota.lib.js';
import Mam from 'mam.client.js';
import { isEmpty, uniqBy, pick, find, last } from 'lodash';
// import { createItem, updateItem } from './firebase';
import config from '../config/config.json';

const iota = new IOTA({ provider: config.provider });

// Initialise MAM State
let mamState = Mam.init(iota);

const fetchChannels = async (rootList) => {
  let allChannelData = []
  return Promise.all(
     rootList.map(async (root) => {
      let channelData = []
      try {
        channelData = await Mam.fetch(
          root, 'restricted', config.sideKey
        );
        //data => allChannelData.push(JSON.parse(iota.utils.fromTrytes(data)))
      } catch (e) {
        console.log('something wrong ', e)
      }
        return {...channelData, root}
    })
  ).then(res => {
    const channels = res.map(channel => channel.messages.map(msg => ({...JSON.parse(iota.utils.fromTrytes(msg)), root: channel.root})))
    return channels.map(channelArr => channelArr[0])
  })
}

const fetchChannel = async (root) => {
    let allChannelData = []
    let channelData = []
    try {
      channelData = await Mam.fetch(
          root, 'restricted', config.sideKey
      );
      //data => allChannelData.push(JSON.parse(iota.utils.fromTrytes(data)))
    } catch (e) {
      console.log('something wrong ', e)
    }
  return channelData.messages.map(msg => JSON.parse(iota.utils.fromTrytes(msg)))
}

const publish = async (data, state) => {
  try {
    // Create MAM Payload - STRING OF TRYTES
    const trytes = iota.utils.toTrytes(JSON.stringify(data));
    const message = Mam.create(state, trytes);

    // Save new mamState
    mamState = message.state;

    // Attach the payload.
    const ret = await Mam.attach(message.payload, message.address);
    return { root: message.root, state: message.state };
  } catch (error) {
    console.log('MAM publish error', error);
    throw error;
  }
};

const createNewChannel = async (payload, state) => {
  // Set channel mode for default state
  mamState = Mam.changeMode(mamState, 'restricted', config.sideKey);
  const mamData = await publish(payload, mamState);
  return mamData;
}

export {
  fetchChannels,
  fetchChannel,
  createNewChannel
}
