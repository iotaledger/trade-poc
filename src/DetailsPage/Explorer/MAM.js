import { trytesToAscii } from '@iota/converter'
import { createHttpClient } from '@iota/http-client'
import { createContext, Reader, Mode } from 'mam.client.js/lib/mam'
import { provider } from '../../config.json';

export const fetch = (
  root,
  key = null,
  reportEvent,
  onFetchComplete
) => {
  if (!root) return;
  const promise = new Promise(async (resolve, reject) => {
    try {
      const client = createHttpClient({ provider })
      let ctx = await createContext()
      let newRoot = root
      let hasMessage

      do {
        let reader = new Reader(ctx, client, Mode.Old, newRoot, key);
        const message = await reader.next();
        hasMessage = message && message.value && message.value[0]
        if (hasMessage) {
          newRoot = message.value[0].message.nextRoot;
          const event = JSON.parse(trytesToAscii(message.value[0].message.payload))
          reportEvent(event)
        }
      } while(hasMessage)
      return resolve(onFetchComplete());
    } catch (error) {
      console.log('MAM fetch error', error);
      return reject();
    }
  });

  return promise;
};
