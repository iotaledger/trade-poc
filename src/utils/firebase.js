import firebase from 'firebase';
import config from '../config.json';

export const initializeFirebaseApp = () => firebase.initializeApp(config);
export const getItemsReference = () => firebase.database().ref('items');
const getItemReference = containerId => firebase.database().ref(`items/${containerId}`);
const getSettingsReference = () => firebase.database().ref('settings');
const getEventMappingReference = () => firebase.database().ref('roleEventMapping');
const getRoleEventMappingReference = role => firebase.database().ref(`roleEventMapping/${role}`);

export const getFileStorageReference = (pathTofile, fileName) =>
  firebase.storage().ref(`${pathTofile}/${fileName}`);

export const getProjectSettings = onError => {
  const promise = new Promise((resolve, reject) => {
    try {
      const settingsRef = getSettingsReference();

      settingsRef
        .once('value')
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(onError(error));
        });
    } catch (error) {
      reject(onError(error));
    }
  });

  return promise;
};

export const getEvents = (role, onError) => {
  const promise = new Promise((resolve, reject) => {
    try {
      const roleEventsRef = getRoleEventMappingReference(role);

      roleEventsRef
        .once('value')
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(onError(error));
        });
    } catch (error) {
      reject(onError(error));
    }
  });

  return promise;
};

export const getFirebaseSnapshot = (containerId, onError) => {
  const promise = new Promise((resolve, reject) => {
    try {
      // Create reference
      const itemsRef = getItemReference(containerId);

      itemsRef
        .once('value')
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(onError(error));
        });
    } catch (error) {
      reject(onError(error));
    }
  });

  return promise;
};

export const createItem = (eventBody, channel, secretKey) => {
  // Create item reference
  const itemsRef = getItemReference(eventBody.containerId);

  itemsRef.set({
    ...eventBody,
    mam: {
      root: channel.root,
      seed: channel.state.seed,
      next: channel.state.channel.next_root,
      start: channel.state.channel.start,
      secretKey,
    },
  });
};

export const updateItem = (eventBody, mam, newItemData) => {
  // Create reference
  const itemsRef = getItemReference(eventBody.containerId);

  itemsRef.update({
    ...eventBody,
    mam: {
      root: mam.root,
      secretKey: mam.secretKey,
      seed: newItemData.state.seed,
      next: newItemData.state.channel.next_root,
      start: newItemData.state.channel.start,
    },
  });
};

export const getEventMappings = onError => {
  const promise = new Promise((resolve, reject) => {
    try {
      const eventsRef = getEventMappingReference();

      eventsRef
        .once('value')
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(onError(error));
        });
    } catch (error) {
      reject(onError(error));
    }
  });

  return promise;
};
