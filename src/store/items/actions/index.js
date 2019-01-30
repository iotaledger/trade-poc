import isEmpty from 'lodash/isEmpty';
import { ADD_ITEM, STORE_ITEMS } from '../../actionTypes';
import { getFirebaseSnapshot, getItemsReference } from '../../../utils/firebase';

export const addItem = containerId => {
  const promise = getFirebaseSnapshot(containerId, console.log);
  return {
    type: ADD_ITEM,
    promise,
  };
};

export const storeItems = (user, containerId = null) => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const results = {};
      const promises = [];
      const ref = getItemsReference();

      if (user.role === 'shipper') {
        // Add containers of the shiiper
        promises.push(ref.once('value'));
      } else {
        const queryByStatus = ref.orderByChild('status');
        user.previousEvent.forEach(status => {
          const query = queryByStatus.equalTo(status);
          promises.push(query.once('value'));
        });

        if (user.role !== 'port') {
          // Add additional demo container. Port user will already have it
          const query = ref.orderByChild('containerId').equalTo('9');
          promises.push(query.once('value'));
        }
      }

      if (containerId) {
        // Add a container under review, which status was already changed
        const query = ref.orderByChild('containerId').equalTo(containerId);
        promises.push(query.once('value'));
      }

      // const newResults = {}
      await Promise.all(promises)
        .then(snapshots => {
          snapshots.forEach(snapshot => {
            const val = snapshot.val();
            if (val) {
              Object.values(val).forEach(result => {
                if (!results[result.containerId]) {
                  results[result.containerId] = result;
                }
              });
            }
          });
        })
        .catch(error => {
          return reject({ error: 'Loading items failed' });
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
