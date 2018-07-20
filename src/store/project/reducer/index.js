import { handle } from 'redux-pack';
import { isEmpty } from 'lodash';
import { LOAD_PROJECT_SETTINGS, LOAD_EVENT_MAPPINGS } from '../../actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_PROJECT_SETTINGS:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          return {
            ...prevState,
            ...payload,
          };
        },
        failure: prevState => {
          return {
            data: prevState,
          };
        },
      });
    case LOAD_EVENT_MAPPINGS:
      if (isEmpty(payload)) return state;
      return handle(state, action, {
        success: prevState => {
          return {
            ...prevState,
            events: { ...payload },
          };
        },
        failure: prevState => {
          return {
            data: prevState,
          };
        },
      });
    default:
      return state;
  }
};
