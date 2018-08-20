import React from 'react';
import * as moment from 'moment';
import '../../static/assets/scss/status.scss';

const StatusList = ({ statuses }) => (
  <div className="status-wrapper">
    {statuses.map(({ status, timestamp }) => (
      <div key={timestamp} className="status">
        <span className="value">{status}</span>
        <div>
          <span className="day">{moment(timestamp).format('D')}</span>
          <span className="month">{moment(timestamp).format('MMMM')}</span>
          <span className="time">{moment(timestamp).format('LT')}</span>
        </div>
      </div>
    ))}
  </div>
);

export default StatusList;
