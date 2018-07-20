import React from 'react';
import '../../assets/scss/loader.scss';

export default ({ showLoader }) => (
  <div className={`bouncing-loader ${showLoader ? 'visible' : ''}`}>
    <div />
    <div />
    <div />
  </div>
);
