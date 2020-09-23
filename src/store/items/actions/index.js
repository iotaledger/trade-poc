import isEmpty from 'lodash/isEmpty';
import { ADD_ITEM, STORE_ITEMS } from '../../actionTypes';
import { getItem, getItems } from '../../../utils/firebase';

export const addItem = containerId => {
  const promise = getItem(containerId);
  return {
    type: ADD_ITEM,
    promise,
  };
};

export const storeItems = (user, containerId = null) => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const results = {};
      const items = [];

      if (user.role === 'shipper') {
        // Add containers of the shipper
        items.push(await getItems());
      } else {
        for await (const status of user.previousEvent) {
          items.push(await getItems(status));
        };
      }

      if (containerId) {
        // Add a container under review, which status was already changed
        items.push(await getItem(containerId));
      }

      items.forEach(item => {
        // Sort by most recently changed first
        Object.values(item).sort((a, b) => b.timestamp - a.timestamp).forEach(result => {
          if (!results[result.containerId]) {
            results[result.containerId] = result;
          }
        });
      });


      if (!isEmpty(results)) {
        return resolve({ data: results, error: null });
      } else {
        return reject({ error: 'No items found' });
      }
    } catch (error) {
      return reject({ error: 'Loading items failed' });
    }
  });

  return {
    type: STORE_ITEMS,
    promise,
  };
};
