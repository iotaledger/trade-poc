import { STORE_ITEM, RESET_ITEM } from '../../actionTypes';

export default (state = [], action) => {
  const { type, payload } = action;

  switch (type) {
    case STORE_ITEM:
      return [...state, payload];
    case RESET_ITEM:
      return [];
    default:
      return state;
  }
};
