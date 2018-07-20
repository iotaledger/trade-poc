import { LOAD_PROJECT_SETTINGS, LOAD_EVENT_MAPPINGS } from '../../actionTypes';
import { getProjectSettings, getEventMappings } from '../../../utils/firebase';

export const storeProjectSettings = () => {
  const promise = getProjectSettings(console.log);
  return {
    type: LOAD_PROJECT_SETTINGS,
    promise,
  };
};

export const storeEventMappings = () => {
  const promise = getEventMappings(console.log);
  return {
    type: LOAD_EVENT_MAPPINGS,
    promise,
  };
};
