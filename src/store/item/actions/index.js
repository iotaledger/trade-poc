import { STORE_ITEM } from '../../actionTypes';

export const storeItem = data => ({
  type: STORE_ITEM,
  payload: data,
});
