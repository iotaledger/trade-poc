import { AUTH, LOGOUT, LOAD_EVENTS } from '../../actionTypes';
import { getEvents } from '../../../utils/firebase';

export const storeCredentials = data => ({
  type: AUTH,
  payload: data,
});

export const logout = () => ({
  type: LOGOUT,
});

export const storeEvents = role => {
  const promise = getEvents(role);
  return {
    type: LOAD_EVENTS,
    promise,
  };
};
