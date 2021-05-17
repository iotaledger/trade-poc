import { sha256 } from 'js-sha256';
import axios from 'axios';

export const validateIntegrity = async document => {
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
            resolve({
              hashMatch: sha256Hash === document.sha256Hash,
              sizeMatch: response.data.size === document.size,
            });
          };
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      return reject(error);
    }
  });
  return promise;
};
