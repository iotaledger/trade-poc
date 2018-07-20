import { fromJS } from 'immutable';
import MAP_STYLE from './map-style-basic-v8.json';

export const lineLayer = id =>
  fromJS({
    id,
    source: id,
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      'line-round-limit': 8,
    },
    paint: {
      'line-color': '#22b1ab',
      'line-width': 2,
    },
  });

export const defaultMapStyle = fromJS(MAP_STYLE);
