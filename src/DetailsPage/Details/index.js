import React from 'react';
import * as moment from 'moment';
import '../../assets/scss/details.scss';

const Details = ({ item, fields }) => {
  const updated = timestamp => moment.duration(Date.now() - timestamp).humanize();

  return (
    <div className="detailSectionWrapper">
      {fields.body.map((field, index) => (
        <div className="detailsSection" key={fields.headers[index]}>
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
