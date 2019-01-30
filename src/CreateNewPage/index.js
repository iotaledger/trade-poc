import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
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
import { addItem } from '../store/items/actions';
import { storeItem } from '../store/item/actions';
import { getFirebaseSnapshot } from '../utils/firebase';
import { createItemChannel } from '../utils/mam';
import { BrowserQRCodeReader } from '@zxing/library';

const codeReader = new BrowserQRCodeReader();

const PORTS = ['Rotterdam', 'Singapore'];
const CARGO = ['Car', 'Coffee', 'Heavy Machinery', 'Pharma'];
const TYPE = ['Dry storage', 'Refrigerated'];

class CreateItemPage extends Component {
  state = {
    showLoader: false,
    showQR: false,
    idError: false,
    destinationError: false,
    departureError: false,
    cargoError: false,
    typeError: false,
    id: '',
  };

  componentDidMount() {
    const { user, history } = this.props;
    if (isEmpty(user)) {
      history.push('/login');
    }
    ReactGA.pageview('/new');
  }

  onBlur = () => {
    updateStep(this.props.cookies, 3);
  }

  notifySuccess = message => toast.success(message);
  notifyError = message => toast.error(message);

  validate = () => {
    this.setState({
      idError: !this.state.id,
      departureError: !this.departure.value,
      destinationError: !this.destination.value,
      cargoError: !this.cargo.value,
      typeError: !this.type.value,
    });

    return (
      !this.state.id ||
      !this.departure.value ||
      !this.destination.value ||
      !this.cargo.value ||
      !this.type.value ||
      this.departure.value === this.destination.value
    );
  };

  startScanner = async () => {
    this.setState({ showQR: true });
    const devices = await codeReader.getVideoInputDevices();
    if (devices.length) {
      const firstDeviceId = devices[0].deviceId;

      codeReader
        .decodeFromInputVideoDevice(firstDeviceId, 'video-area')
        .then(result => {
          this.setState({ id: result.text });
          ReactGA.event({
            category: 'QR Code reader',
            action: 'Read QR code',
            label: `Container ID ${result.text}`,
            value: result.text
          });
        })
        .catch(err => console.error(err));
    } else {
      this.notifyError('Please check your video inputs!, we cant find any');
    }
  };

  stopScanner = () => {
    codeReader.reset();
    this.setState({ showQR: false });
  };

  handleTextChange = textID => {
    this.setState({ id: textID });
  };

  onError = error => {
    this.setState({ showLoader: false });
    this.notifyError(error || 'Something went wrong');
  };

  createItem = async event => {
    event.preventDefault();
    const formError = this.validate();
    const { cookies, history, storeItem, addItem, user, project } = this.props;

    if (!formError) {
      const { id, name, previousEvent } = user;
      const request = {
        departure: this.departure.value,
        destination: this.destination.value,
        load: this.cargo.value,
        type: this.type.value,
        shipper: name,
        status: previousEvent[0],
      };

      // Format the item ID to remove dashes and parens
      const containerId = this.state.id.replace(/[^0-9a-zA-Z_-]/g, '');

      const firebaseSnapshot = await getFirebaseSnapshot(containerId, this.onError);
      if (firebaseSnapshot === null) {
        updateStep(cookies, 4);
        cookies.set('containerId', containerId, { path: '/' });

        this.setState({ showLoader: true });
        const eventBody = await createItemChannel(project, containerId, request, id);

        await addItem(containerId);
        await storeItem([eventBody]);

        ReactGA.event({
          category: 'Create container',
          action: 'Create container',
          label: `Container ID ${containerId}`,
          value: containerId
        });

        history.push(`/details/${containerId}`);
      } else {
        this.notifyError(`${upperFirst(project.trackingUnit)} exists`);
      }
    } else {
      this.notifyError('Error with some of the input fields');
    }
  };

  render() {
    const {
      showLoader,
      showQR,
      idError,
      departureError,
      destinationError,
      cargoError,
      typeError,
    } = this.state;
    const { project: { trackingUnit, qrReader } } = this.props;
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
            onSubmit={this.createItem}
            aria-labelledby="create-item"
          >
            <div className="input-wrapper">
              <TextField
                value={this.state.id}
                onChange={this.handleTextChange}
                onBlur={this.onBlur}
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
                        onClick={this.stopScanner}
                        raised
                        secondary
                        iconChildren="close"
                        swapTheming
                      >
                        Stop camera
                      </Button>
                    ) : (
                      <Button onClick={this.startScanner} raised primary swapTheming>
                        Scan QR code
                      </Button>
                    )
                  }
                </div>
              ) : null}
            </div>
            {qrReader && showQR ? <video id="video-area" /> : null}
            <SelectField
              ref={departure => (this.departure = departure)}
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
              ref={destination => (this.destination = destination)}
              id="destination"
              label="Destination Port"
              menuItems={PORTS}
              error={destinationError}
              {...selectFieldProps}
            />
            <SelectField
              ref={cargo => (this.cargo = cargo)}
              id="cargo"
              label="Cargo"
              menuItems={CARGO}
              error={cargoError}
              {...selectFieldProps}
            />
            <SelectField
              ref={type => (this.type = type)}
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
              <button className={`button create-cta ${showLoader ? 'hidden' : ''}`} onClick={this.createItem}>
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
}

const mapStateToProps = state => ({
  user: state.user,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  addItem: containerId => dispatch(addItem(containerId)),
  storeItem: item => dispatch(storeItem(item)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(withCookies(CreateItemPage)));
