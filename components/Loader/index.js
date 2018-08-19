import React from 'react';
// import '../../assets/scss/loader.scss';

export default ({ showLoader }) => (
  <div className={`bouncing-loader ${showLoader ? 'visible' : ''}`}>
    <div className="bouncing-loader__item-1" />
    <div className="bouncing-loader__item-2"/>
    <div className="bouncing-loader__item-3" />
  </div>
);
