import React from 'react';

export default ({ showLoader, text = null }) => (
  <React.Fragment>
    <div className={`bouncing-loader ${showLoader ? 'visible' : ''}`}>
      <div className="bouncing-loader__item-1" />
      <div className="bouncing-loader__item-2"/>
      <div className="bouncing-loader__item-3" />
    </div>
    {
      text ? (
        <div className={`bouncing-loader-text-wrapper ${showLoader ? 'visible' : ''}`}>
          <span className="bouncing-loader-text">{text}</span>
        </div>
      ) : null
    }
  </React.Fragment>
);
