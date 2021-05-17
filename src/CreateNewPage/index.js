import React, { useContext, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';
import updateStep from '../utils/cookie';
import { Col } from 'reactstrap';
import { FocusContainer, TextField, SelectField, Button, CardActions, FontIcon } from 'react-md';
import { toast } from 'react-toastify';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Notification from '../SharedComponents/Notification';
import Tooltip from '../SharedComponents/Tooltip';
import { getItem } from '../utils/firebase';
import { createItemChannel } from '../utils/mam';
import { BrowserQRCodeReader } from '@zxing/library';
import { UserContext } from '../contexts/user.provider';
import { ProjectContext } from '../contexts/project.provider';
import { ItemsContext } from '../contexts/items.provider';
import { ItemContext } from '../contexts/item.provider';

const codeReader = new BrowserQRCodeReader();

const PORTS = ['Rotterdam', 'Singapore'];
const CARGO = ['Car', 'Coffee', 'Heavy Machinery', 'Pharma'];
const TYPE = ['Dry storage', 'Refrigerated'];

const CreateItemPage = ({ history, cookies }) => {

  const { user } = useContext(UserContext);
  const { project } = useContext(ProjectContext);
  const { storeItem } = useContext(ItemContext);
  const { addItem } = useContext(ItemsContext);

  const [showLoader, setShowLoader] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [idError, setIdError] = useState(false);
  const [destination, setDestination] = useState('');
  const [destinationError, setDestinationError] = useState(false);
  const [departure, setDeparture] = useState('');
  const [departureError, setDepartureError] = useState(false);
  const [cargo, setCargo] = useState('');
  const [cargoError, setCargoError] = useState(false);
  const [type, setType] = useState('');
  const [typeError, setTypeError] = useState(false);
  const [id, setId] = useState('');

  useEffect(() => {
    if (isEmpty(user)) {
      history.push('/login');
    }
    ReactGA.pageview('/new');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onBlur = () => {
    updateStep(cookies, 3);
  }

  const notifyError = message => toast.error(message);

  const validate = () => {
    setIdError(!id);
    setDepartureError(!departure.value);
    setDestinationError(!destination.value);
    setCargoError(!cargo.value);
    setTypeError(!type.value)

    return (
      !id ||
      !departure.value ||
      !destination.value ||
      !cargo.value ||
      !type.value ||
      departure.value === destination.value
    );
  };

  const startScanner = async () => {
    setShowQR(true);
    const devices = await codeReader.getVideoInputDevices();
    if (devices.length) {
      const firstDeviceId = devices[0].deviceId;

      codeReader
        .decodeFromInputVideoDevice(firstDeviceId, 'video-area')
        .then(result => {
          setId(result.text);
          ReactGA.event({
            category: 'QR Code reader',
            action: 'Read QR code',
            label: `Container ID ${result.text}`
          });
        })
        .catch(err => console.error(err));
    } else {
      notifyError('Please check your video inputs!, we cant find any');
    }
  };

  const stopScanner = () => {
    codeReader.reset();
    setShowQR(false);
  };

  const handleTextChange = textID => {
    setId(textID);
  };

  const createItem = async event => {
    event.preventDefault();
    const formError = validate();

    if (!formError) {
      const { name, previousEvent } = user;
      const userId = user.id;
      const request = {
        departure: departure.value,
        destination: destination.value,
        load: cargo.value,
        type: type.value,
        shipper: name,
        status: previousEvent[0],
      };

      // Format the item ID to remove dashes and parens
      const containerId = id.replace(/[^0-9a-zA-Z_-]/g, '');

      const firebaseSnapshot = await getItem(containerId);
      if (!firebaseSnapshot) {
        updateStep(cookies, 4);
        cookies.set('containerId', containerId, { path: '/' });

        setShowLoader(true);
        const eventBody = await createItemChannel(project, containerId, request, userId);

        await addItem(containerId);
        await storeItem([eventBody]);

        ReactGA.event({
          category: 'Create container',
          action: 'Create container',
          label: `Container ID ${containerId}`
        });

        history.push(`/details/${containerId}`);
      } else {
        notifyError(`${upperFirst(project.trackingUnit)} exists`);
      }
    } else {
      notifyError('Error with some of the input fields');
    }
  };


  const { trackingUnit, qrReader } = project;
  const unit = upperFirst(trackingUnit);

  const selectFieldProps = {
    dropdownIcon: <FontIcon>expand_more</FontIcon>,
    position: SelectField.Positions.BELOW,
    required: true,
    className: 'md-cell',
    errorText: 'This field is required.',
  };
  return (
    <div className="create-page">
      <Header ctaEnabled>
        <Col md={3} xl={4} className="heading hidden-md-down">
          <span className="heading-text">
            Create new {trackingUnit}
          </span>
        </Col>
      </Header>
      <div className="create-item-wrapper">
        <FocusContainer
          // focusOnMount
          containFocus
          component="form"
          className="md-grid"
          onSubmit={createItem}
          aria-labelledby="create-item"
        >
          <div className="input-wrapper">
            <TextField
              value={id}
              onChange={handleTextChange}
              onBlur={onBlur}
              id="containerId"
              className="input-containerId"
              label={`${unit} ID`}
              required
              type="text"
              error={idError}
              errorText="This field is required."
            />
            {qrReader ? (
              <div className="create-item-wrapper__qr-code-btn-container">
                {
                  showQR ? (
                    <Button
                      onClick={stopScanner}
                      raised
                      secondary
                      iconChildren="close"
                      swapTheming
                    >
                      Stop camera
                    </Button>
                  ) : (
                    <Button onClick={startScanner} raised primary swapTheming>
                      Scan QR code
                    </Button>
                  )
                }
              </div>
            ) : null}
          </div>
          {qrReader && showQR ? <video id="video-area" /> : null}
          <SelectField
            ref={tempDeparture => (setDeparture(tempDeparture))}
            id="departure"
            required
            label="Departure Port"
            className="md-cell"
            menuItems={PORTS}
            position={SelectField.Positions.BELOW}
            error={departureError}
            errorText="This field is required."
            dropdownIcon={<FontIcon>expand_more</FontIcon>}
          />
          <SelectField
            ref={tempDestination => (setDestination(tempDestination))}
            id="destination"
            label="Destination Port"
            menuItems={PORTS}
            error={destinationError}
            {...selectFieldProps}
          />
          <SelectField
            ref={tempCargo => (setCargo(tempCargo))}
            id="cargo"
            label="Cargo"
            menuItems={CARGO}
            error={cargoError}
            {...selectFieldProps}
          />
          <SelectField
            ref={tempType => (setType(tempType))}
            id="type"
            label={`${unit} type`}
            menuItems={TYPE}
            error={typeError}
            {...selectFieldProps}
          />
        </FocusContainer>
        <Notification />
        <div>
          <Loader showLoader={showLoader} />
          <CardActions className="md-cell md-cell--12">
            <Link to="/list" className={`button secondary ${showLoader ? 'hidden' : ''}`}>
              Cancel
              </Link>
            <button className={`button create-cta ${showLoader ? 'hidden' : ''}`} onClick={createItem}>
              Create
              </button>
          </CardActions>
        </div>
      </div>
      <Tooltip />
      <Footer />
    </div>
  );
}


export default withRouter(withCookies(CreateItemPage));
