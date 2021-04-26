import axios from 'axios';
import firebase from "firebase/app";
import "firebase/storage";
import config from '../config.json';

firebase.initializeApp(config);

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

export const createItem = (eventBody, mam) => {
  const item = {
    ...eventBody,
    mam
  };

  return axios.post(`${config.rootURL}/itemCreate?containerId=${eventBody.containerId}`, item);
};

export const updateItem = (eventBody, mam) => {
  const item = {
    ...eventBody,
    mam
  };

  return axios.post(`${config.rootURL}/itemUpdate?containerId=${eventBody.containerId}`, item);
};

