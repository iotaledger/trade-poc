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
        <style jsx global>{`
          .status-wrapper {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: stretch;

            @media (max-width: 1092px) {
              margin: 0 20px;
            }

            .status {
              min-width: 198px;
              max-width: 212px;
              width: auto;
              height: 150px;
              background-color: rgb(232, 241, 241);
              display: flex;
              flex-direction: column;
              justify-content: space-evenly;
              text-align: center;
              position: relative;
              margin: 12px 6px;
              padding: 0 20px;

              &:not(:first-child):before {
                content: "";
                position: absolute;
                bottom: 55px;
                left: -20px;
                height: 28px;
                width: 28px;
                background-image: url(/static/images/arrow_icon.png);
                background-repeat: no-repeat;
              }

              &:not(:last-child):after {
                content: "";
                position: absolute;
                bottom: 55px;
                right: -20px;
                height: 28px;
                width: 28px;
                background-image: url(/static/images/arrow_icon.png);
                background-repeat: no-repeat;
              }

              .value {
                font-size: 18px;
                font-weight: 400;
                color: rgb(63, 63, 63);
              }

              div {
                color: rgb(34, 177, 171);
                font-size: 18px;
                font-weight: 700;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;

                .day {
                  font-size: 36px;
                  line-height: 36px;
                }

                .time {
                  font-weight: 400;
                }
              }
            }
          }

        `}</style>
  </div>
);

export default StatusList;
