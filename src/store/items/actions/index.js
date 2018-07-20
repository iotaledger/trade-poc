import { ADD_ITEM, STORE_ITEMS } from '../../actionTypes';
import { getFirebaseSnapshot, getItemsReference } from '../../../utils/firebase';

export const addItem = itemId => {
  const promise = getFirebaseSnapshot(itemId, console.log);
  return {
    type: ADD_ITEM,
    promise,
  };
};

export const storeItems = user => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const results = [];
      const promises = [];
      const ref = getItemsReference();

      switch (user.role) {
        case 'owner':
          const queryByOwner = ref.orderByChild('owner').equalTo(user.id);
          promises.push(queryByOwner.once('value'));
          break;
        case 'observer':
          promises.push(ref.once('value'));
          break;
        default:
          const queryByStatus = ref.orderByChild('status');
          user.previousEvent.forEach(status => {
            const query = queryByStatus.equalTo(status);
            promises.push(query.once('value'));
          });
          break;
      }

      await Promise.all(promises)
        .then(snapshots => {
          snapshots.forEach(snapshot => {
            const val = snapshot.val();
            if (val) {
              results.push(...Object.values(val));
            }
          });
        })
        .catch(error => {
          return reject({ error: 'Loading items failed' });
        });

      if (results.length > 0) {
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
