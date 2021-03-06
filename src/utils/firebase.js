import axios from 'axios';
import * as firebase from "firebase/app";
import "firebase/storage";
import config from '../config.json';

export const initializeFirebaseApp = () => firebase.initializeApp(config);

export const getFileStorageReference = (pathTofile, fileName) =>
  firebase.storage().ref(`${pathTofile}/${fileName}`);

export const getProjectSettings = () => {
  return axios.get(`${config.rootURL}/settingsGet`).then(r => r.data);
};

export const getEvents = (role) => {
  return axios.get(`${config.rootURL}/eventGet?role=${role}`).then(r => r.data);
};

export const getEventMappings = () => {
  return new Promise((resolve) => {
    axios.get(`${config.rootURL}/eventsGet`).then(r => resolve(r.data));
  });
};

export const getItem = async (containerId) => {
  return await axios.get(`${config.rootURL}/itemGet?containerId=${containerId}`).then(r => r.data);
};

export const getItems = async (status) => {
  const statusQuery = status ? `?status=${status}` : '';
  const result = await axios.get(`${config.rootURL}/itemsGet${statusQuery}`).then(r => r.data);
  return result;
};

export const createItem = (eventBody, channel, secretKey) => {
  const item = {
    ...eventBody,
    mam: {
      root: channel.root,
      seed: channel.state.seed,
      next: channel.state.channel.next_root,
      start: channel.state.channel.start,
      secretKey,
    },
  };

  return axios.post(`${config.rootURL}/itemCreate?containerId=${eventBody.containerId}`, item);
};

export const updateItem = (eventBody, mam, newItemData) => {
  const item = {
    ...eventBody,
    mam: {
      root: mam.root,
      secretKey: mam.secretKey,
      seed: newItemData.state.seed,
      next: newItemData.state.channel.next_root,
      start: newItemData.state.channel.start,
    },
  };

  return axios.post(`${config.rootURL}/itemUpdate?containerId=${eventBody.containerId}`, item);
};

