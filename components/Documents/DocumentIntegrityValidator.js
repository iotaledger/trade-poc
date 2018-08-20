import { sha256 } from 'js-sha256';
import axios from 'axios';

export const validateIntegrity = async itemEvent => {
  const promises = [];

  itemEvent.documents.forEach(document => {
    const promise = new Promise((resolve, reject) => {
      try {
        axios
          .get(document.downloadURL, { responseType: 'blob' })
          .then(response => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(response.data);
            reader.onload = () => {
              const arrayBuffer = reader.result;
              const sha256Hash = sha256(arrayBuffer);
              document.hashMatch = sha256Hash === document.sha256Hash;
              document.sizeMatch = response.data.size === document.size;
              resolve();
            };
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        return reject(error);
      }
    });
    promises.push(promise);
  });

  await Promise.all(promises)
    .then(() => itemEvent)
    .catch(error => {
      console.log('validateIntegrity error', error);
    });
};
