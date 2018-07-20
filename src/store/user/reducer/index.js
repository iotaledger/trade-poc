import { AUTH, LOGOUT, LOAD_EVENTS } from '../../actionTypes';

export default (state = {}, action) => {
  const { type, payload } = action;

  switch (type) {
    case AUTH:
      return {
        ...state,
        ...payload,
      };
    case LOAD_EVENTS:
      return {
        ...state,
        ...payload,
      };
    case LOGOUT:
      return {};
    default:
      return state;
  }
};
