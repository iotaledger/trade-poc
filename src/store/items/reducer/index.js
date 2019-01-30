import { handle } from 'redux-pack';
import isEmpty from 'lodash/isEmpty';
import { ADD_ITEM, STORE_ITEMS } from '../../actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case STORE_ITEMS:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          return {
            ...payload.data,
          };
        },
        failure: prevState => {
          return {
            error: payload.error,
          };
        },
      });
    case ADD_ITEM:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          const containerId = payload.containerId;
          return {
            ...prevState,
            [containerId]: payload,
          };
        },
        failure: prevState => {
          return {
            ...prevState,
            error: 'Loading items failed',
          };
        },
      });
    default:
      return state;
  }
};
