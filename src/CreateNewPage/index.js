import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { isEmpty, upperFirst } from 'lodash';
import { FocusContainer, TextField, Button, CardActions } from 'react-md';
import { toast } from 'react-toastify';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Notification from '../SharedComponents/Notification';
import { addItem } from '../store/items/actions';
import { storeItem } from '../store/item/actions';
import { getFirebaseSnapshot } from '../utils/firebase';
import { createItemChannel } from '../utils/mam';
import '../assets/scss/createItemPage.scss';
import { BrowserQRCodeReader } from '@zxing/library'

const codeReader = new BrowserQRCodeReader();

class CreateItemPage extends Component {
  state = {
    showLoader: false,
    idError: false,
    destinationError: false,
    departureError: false,
    cargoError: false,
    typeError: false,
    id: ''
  };

  componentDidMount() {
    const { user, history } = this.props;
    if (isEmpty(user)) {
      history.push('/login');
    }
  }

  notifySuccess = message => toast.success(message);
  notifyError = message => toast.error(message);

  validate = () => {
    this.setState({
      idError: !this.itemId.value,
    });

    return !this.itemId.value;
  };

  startScanner = async () => {
    const devices = await codeReader.getVideoInputDevices()
    if(devices.length) {
      const firstDeviceId = devices[0].deviceId;

      codeReader.decodeFromInputVideoDevice(firstDeviceId, 'video-area')
      .then(result => {
        this.setState({ id: result.text })
      })
      .catch(err => console.error(err));
    } else {
      this.notifyError('Please check your video inputs!, we cant find any');
    }

  }

  stopScanner = () => {
    codeReader.reset()
  }
  handleTextChange = e => {

  }
  onError = error => {
    this.setState({ showLoader: false });
    this.notifyError(error || 'Something went wrong');
  };

  createItem = async event => {
    event.preventDefault();
    const formError = this.validate();
    const { history, storeItem, addItem, user, project } = this.props;

    if (!formError) {
      const { id, previousEvent } = user;
      const request = {
        owner: id,
        status: previousEvent[0],
      };
      // Format the item ID to remove dashes and parens
      const itemId = this.itemId.value.replace(/[^0-9a-zA-Z_-]/g, '');
      const firebaseSnapshot = await getFirebaseSnapshot(itemId, this.onError);
      if (firebaseSnapshot === null) {
        this.setState({ showLoader: true });
        const eventBody = await createItemChannel(project, itemId, request, id);

        await addItem(itemId);
        await storeItem([eventBody]);

        history.push(`/details/${itemId}`);
      } else {
        this.notifyError(`${upperFirst(project.trackingUnit)} exists`);
      }
    } else {
      this.notifyError('Error with some of the input fields');
    }
  };

  render() {
    const { showLoader, idError } = this.state;
    const {
      history,
      project: { trackingUnit },
    } = this.props;

    const unit = upperFirst(trackingUnit);

    return (
      <div>
        <Header>
          <div>
            <div>
              <a onClick={() => history.push('/')}>
                <img src="arrow_left.svg" alt="back" />
              </a>
              <span>Create new {trackingUnit}</span>
            </div>
          </div>
        </Header>
        <div className="create-item-wrapper">
          <FocusContainer
            focusOnMount
            containFocus
            component="form"
            className="md-grid"
            onSubmit={this.createItem}
            aria-labelledby="create-item"
          >
            <div className="input-wrapper">
              <TextField
                ref={id => (this.itemId = id)}
                value={this.state.id}
                onChange={this.handleTextChange}
                id="itemId"
                label={`${unit} ID`}
                required
                type="text"
                error={idError}
                errorText="This field is required."
              />

              <Button onClick={this.startScanner} raised primary swapTheming>Start</Button>
              <Button onClick={this.stopScanner} raised secondary iconChildren="close" swapTheming>Stop</Button>
            </div>
            <video id="video-area"></video>

          </FocusContainer>
          <Notification />
          <div>
            <Loader showLoader={showLoader} />
            <CardActions className={`md-cell md-cell--12 ${showLoader ? 'hidden' : ''}`}>
              <Button className="iota-theme-button" raised onClick={this.createItem}>
                Create
              </Button>
            </CardActions>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  addItem: itemId => dispatch(addItem(itemId)),
  storeItem: item => dispatch(storeItem(item)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateItemPage));
