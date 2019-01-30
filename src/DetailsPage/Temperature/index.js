import React, { Component } from 'react';
import sizeMe from 'react-sizeme';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import { LineChart } from 'react-easy-chart';
import { TextField, Button } from 'react-md';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import last from 'lodash/last';
import Loader from '../../SharedComponents/Loader';
import updateStep from '../../utils/cookie';
import { appendTemperatureLocation } from '../../utils/mam';

class Temperature extends Component {
  state = {
    showLoader: false,
    loaderHint: null
  };

  componentDidMount() {
    updateStep(this.props.cookies, 19);
  }

  addTemperature = async event => {
    event.preventDefault();
    const temperature = this.temperature && this.temperature.value;
    if (!temperature) return;

    const { cookies, data, callback } = this.props;

    if (data && data[data.length - 1]) {
      const last = data[data.length - 1];
      last.temperature = temperature;
      last.timestamp = Date.now();
      this.setState({ showLoader: true, loaderHint: 'Updating Tangle' });
      const result = await appendTemperatureLocation(last, this.props);
      this.setState({ showLoader: false, loaderHint: null });
      updateStep(cookies, 20);
      callback(result);
    }
  }

  getTemperatureData = data => {
    return data.map(({ temperature, timestamp }) => ({
      x: moment(timestamp).format('YYYY-MM-DD HH:mm'),
      y: Number(temperature),
    }));
  };

  getXRange = data => {
    const dataSet = sortBy(data, 'timestamp');
    return [
      moment(dataSet[0].timestamp).format('YYYY-MM-DD HH:mm'),
      moment(last(dataSet).timestamp).add(1, 'h').format('YYYY-MM-DD HH:mm'),
    ];
  };

  getYRange = data => {
    const temps = data.map(({ temperature }) => temperature);
    return [Math.ceil(Math.min(...temps) - 5), Math.ceil(Math.max(...temps) + 5)];
  };

  getFakeData = () => {
    const temperatures = [15, 12, 10, 13, 15, 17, 18, 15, 14, 12];
    const data = Array.from(new Array(10), (_, index) => ({
      timestamp: Date.now() - 3600000 * (10 - index),
      temperature: temperatures[index]
    }));
    return data;
  }

  render() {
    const { showLoader, loaderHint } = this.state;
    const { data, size: { width } } = this.props;
    let xRange, yRange, temperature;
    let filteredData = data.filter(({ temperature }) => temperature);
    if (filteredData.length < 2) {
      filteredData = this.getFakeData().concat(filteredData);
    }

    temperature = this.getTemperatureData(filteredData);
    xRange = this.getXRange(filteredData);
    yRange = this.getYRange(filteredData);

    return (
      <div className="temperature-chart">
        {
          <LineChart
            dataPoints
            xType={'time'}
            axes
            xTicks={3}
            yTicks={3}
            grid
            verticalGrid
            width={width}
            height={400}
            datePattern={'%Y-%m-%d %H:%M'}
            tickTimeDisplayFormat={'%b %d %H:%M'}
            // interpolate={'cardinal'}
            lineColors={['#18807b']}
            yDomainRange={yRange}
            xDomainRange={xRange}
            data={[temperature]}
            style={{ height: 300 }}
          />
        }
        <form className="add-new" onSubmit={this.addTemperature}>
          <TextField
            ref={temperature => (this.temperature = temperature)}
            id="temperature"
            label="Temperature"
            type="number"
            className={`input-temperature ${showLoader ? 'hidden' : ''}`}
          />
          <Button raised onClick={this.addTemperature} className={`form-button temperature-cta ${showLoader ? 'hidden' : ''}`}>
            Add temperature value
          </Button>
          {
            showLoader ? (
              <div className="loader-wrapper">
                <Loader showLoader={showLoader} text={loaderHint} />
              </div>
            ) : null
          }
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  item: state.item,
  items: state.items,
  project: state.project,
});

export default connect(mapStateToProps)(sizeMe({ monitorHeight: false })(withRouter(withCookies(Temperature))));
