const Mam = require('mam.client.js');
const IOTA = require('iota.lib.js');
const config = require('./config.json');
const iota = new IOTA({ provider: config.provider });

// Initialise MAM State
let mamState = Mam.init(iota);

// Publish to tangle
const publish = async data => {
  // Create MAM Payload - STRING OF TRYTES
  const trytes = iota.utils.toTrytes(JSON.stringify(data));
  const message = Mam.create(mamState, trytes);

  // Save new mamState
  updateMamState(message.state);

  // Attach the payload.
  await Mam.attach(message.payload, message.address);

  return { root: message.root, state: message.state };
};

const updateMamState = newMamState => (mamState = newMamState);

const fetchChannel = async (root, secretKey) => {
  const fetchResults = [];
  await Mam.fetch(root, 'restricted', secretKey, data =>
    fetchResults.push(JSON.parse(iota.utils.fromTrytes(data)))
  );
  return fetchResults;
};

const createNewChannel = async (payload, secretKey) => {
  // Set channel mode for default state
  const defaultMamState = Mam.changeMode(mamState, 'restricted', secretKey);
  updateMamState(defaultMamState);
  const mamData = await publish(payload);
  return mamData;
};

const appendToChannel = async (payload, savedMamData, secretKey) => {
  const mamState = {
    subscribed: [],
    channel: {
      side_key: secretKey,
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
  updateMamState(mamState);
  const mamData = await publish(payload);
  return mamData;
};

module.exports = {
  appendToChannel,
  createNewChannel,
  fetchChannel,
};
