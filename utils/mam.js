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
            'F9UUOKYOUBVGVERC9P9PBKTPRYASVWBYMUEUPFDHIOEZFQGGRZCYPLU99QAJRMTSVSPXIWMTTTDBUTNYF', 'restricted', config.sideKey
        );
        //data => allChannelData.push(JSON.parse(iota.utils.fromTrytes(data)))
      } catch (e) {
        console.log('something wrong ', e)
      }
        return channelData
    })
  ).then(res => {
    return res[0].messages.map(msg => JSON.parse(iota.utils.fromTrytes(msg)))
  })
}

const createNewChannel = async (payload) => {
  // Set channel mode for default state
  mamState = Mam.changeMode(mamState, 'restricted', config.sideKey);
  const mamData = await publish(payload);
  return mamData;
}

export {
  fetchChannels,
  createNewChannel
}
