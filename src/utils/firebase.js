import firebase from 'firebase';
import { getNextUsers } from './common';
import config from '../config.json';

export const initializeFirebaseApp = () => firebase.initializeApp(config);
export const getItemsReference = () => firebase.database().ref('items');
const getItemReference = itemId => firebase.database().ref(`items/${itemId}`);
const getUserReference = userId => firebase.database().ref(`users/${userId}`);
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

export const getFirebaseSnapshot = (itemId, onError) => {
  const promise = new Promise((resolve, reject) => {
    try {
      // Create reference
      const itemsRef = getItemReference(itemId);

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

const appendItemToNewUser = (userId, itemId) => {
  try {
    // Get user reference
    const userRef = getUserReference(userId);

    userRef
      .once('value')
      .then(snapshot => {
        const user = snapshot.val();
        const items = user.items || [];

        userRef.update({
          items: [...items, itemId],
        });
      })
      .catch(error => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const removeItemFromCurrentUser = (user, itemId) => {
  // Get user reference
  const userRef = getUserReference(user.userId);
  const items = user.items || [];
  const index = items.indexOf(itemId);
  if (index > -1) {
    items.splice(index, 1);
  }

  userRef.update({
    items: [...items],
  });
};

export const reassignOwnership = (project, user, item, status, removeFromCurrentOwner = true) => {
  if (removeFromCurrentOwner) {
    // for create item set flag to "false"
    removeItemFromCurrentUser(user, item.itemId);
  }
  const newUsers = getNextUsers(project, user, item, status);
  newUsers.map(newUser => appendItemToNewUser(newUser, item.itemId));
};

export const createItem = (eventBody, channel, secretKey, userId) => {
  // Create item reference
  const itemsRef = getItemReference(eventBody.itemId);
  appendItemToNewUser(userId, eventBody.itemId);

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

export const updateItem = (eventBody, mam, newItemData, user) => {
  // Create reference
  const itemsRef = getItemReference(eventBody.itemId);

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
