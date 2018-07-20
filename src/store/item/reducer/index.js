import { STORE_ITEM } from '../../actionTypes';

export default (state = [], action) => {
  const { type, payload } = action;

  switch (type) {
    case STORE_ITEM:
      return [...state, payload];
    default:
      return state;
  }
};
