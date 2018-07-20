import { handle } from 'redux-pack';
import { isEmpty } from 'lodash';
import { ADD_ITEM, STORE_ITEMS } from '../../actionTypes';

const initialState = {
  data: [],
  error: null,
};

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case STORE_ITEMS:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          return {
            data: [...payload.data],
            error: null,
          };
        },
        failure: prevState => {
          return {
            data: prevState.data,
            error: payload.error,
          };
        },
      });
    case ADD_ITEM:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          return {
            data: [...prevState.data, payload],
            error: null,
          };
        },
        failure: prevState => {
          return {
            data: prevState.data,
            error: 'Loading items failed',
          };
        },
      });
    default:
      return state;
  }
};
