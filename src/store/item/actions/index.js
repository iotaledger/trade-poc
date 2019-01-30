import { STORE_ITEM, RESET_ITEM } from '../../actionTypes';

export const storeItem = data => ({
  type: STORE_ITEM,
  payload: data,
});

export const resetStoredItem = () => ({
  type: RESET_ITEM,
  payload: null,
});
