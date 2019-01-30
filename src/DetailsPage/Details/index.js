import React from 'react';
import * as moment from 'moment';

const Details = ({ item, fields }) => {
  const updated = timestamp => moment.duration(Date.now() - timestamp).humanize();

  return (
    <div className="detail-section-wrapper">
      {fields.body.map((field, index) => (
        <div className="details-section" key={fields.headers[index]}>
          <span className="label">{fields.headers[index]}</span>
          <span className="value">
            {field === 'timestamp' ? updated(item[field]) : item[field]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Details;
