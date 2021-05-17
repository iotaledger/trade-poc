import React, { useContext, useEffect, useRef, useState } from 'react';
import sizeMe from 'react-sizeme';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import { LineChart } from 'react-easy-chart';
import { TextField, Button } from 'react-md';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import last from 'lodash/last';
import Loader from '../../SharedComponents/Loader';
import updateStep from '../../utils/cookie';
import { appendTemperatureLocation } from '../../utils/mam';
import { ProjectContext } from '../../contexts/project.provider';
import { ItemContext } from '../../contexts/item.provider';
import { ItemsContext } from '../../contexts/items.provider';

const Temperature = ({ cookies, data, callback, size: { width }, match }) => {

  const { project } = useContext(ProjectContext);
  const { item } = useContext(ItemContext);
  const { items } = useContext(ItemsContext);

  const [showLoader, setShowLoader] = useState(false);
  const [loaderHint, setLoaderHint] = useState(null);

  const [temperature, setTemperature] = useState([]);
  const [addedTemperature, setAddedTemperature] = useState(null);
  const xRange = useRef();
  const yRange = useRef();

  useEffect(() => {
    updateStep(cookies, 19);
  }, [cookies]);

  useEffect(() => {
    let filteredData = data.filter(tempData => tempData.temperature);
    if (filteredData.length < 2) {
      filteredData = getFakeData().concat(filteredData);
    }
    setTemperature(getTemperatureData(filteredData));
    xRange.current = getXRange(filteredData);
    yRange.current = getYRange(filteredData);
  }, [data]);

  const addTemperature = async event => {
    event.preventDefault();
    const isTemperatureSet = addedTemperature && addedTemperature.value;
    if (!isTemperatureSet) return;
    if (data && data[data.length - 1]) {
      const lastData = data[data.length - 1];
      lastData.temperature = addedTemperature.value;
      lastData.timestamp = Date.now();
      setShowLoader(true);
      setLoaderHint('Updating Tangle');
      const itemInformation = { project, item, items, match };
      let result;
      try {
         result = await appendTemperatureLocation(lastData, itemInformation);
      } catch (e) {
        console.error("Could not append temperature location:", e)
      }

      setShowLoader(false);
      setLoaderHint(null);
      updateStep(cookies, 20);
      callback(result);
    }
  }

  const getTemperatureData = filteredData => {
    return filteredData.map(({ temperature, timestamp }) => ({
      x: moment(timestamp).format('YYYY-MM-DD HH:mm'),
      y: Number(temperature),
    }));
  };

  const getXRange = filteredData => {
    const dataSet = sortBy(filteredData, 'timestamp');
    return [
      moment(dataSet[0].timestamp).format('YYYY-MM-DD HH:mm'),
      moment(last(dataSet).timestamp).add(1, 'h').format('YYYY-MM-DD HH:mm'),
    ];
  };

  const getYRange = filteredData => {
    const temps = filteredData.map(({ temperature }) => temperature);
    return [Math.ceil(Math.min(...temps) - 5), Math.ceil(Math.max(...temps) + 5)];
  };

  const getFakeData = () => {
    const temperatures = [15, 12, 10, 13, 15, 17, 18, 15, 14, 12];
    const temperatureData = Array.from(new Array(10), (_, index) => ({
      timestamp: Date.now() - 3600000 * (10 - index),
      temperature: temperatures[index]
    }));
    return temperatureData;
  }

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
          yDomainRange={yRange.current}
          xDomainRange={xRange.current}
          data={[temperature]}
          style={{ height: 300 }}
        />
      }
      <form className="add-new" onSubmit={addTemperature}>
        <TextField
          ref={tempTemperature => (setAddedTemperature(tempTemperature))}
          id="temperature"
          label="Temperature"
          type="number"
          className={`input-temperature ${showLoader ? 'hidden' : ''}`}
        />
        <Button raised onClick={addTemperature} className={`form-button temperature-cta ${showLoader ? 'hidden' : ''}`}>
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


export default sizeMe({ monitorHeight: false })(withRouter(withCookies(Temperature)));
