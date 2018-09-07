import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
//import { connect } from 'react-redux';
//import { withRouter } from 'react-router';
import { isEmpty, upperFirst } from 'lodash';
import { FocusContainer, TextField, SelectField, Button, CardActions, FontIcon } from 'react-md';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Notification from '../components/Notification';
import Head from '../components/Head';
// import { addItem } from '../store/items/actions';
// import { storeItem } from '../store/item/actions';
// import { getFirebaseSnapshot, reassignOwnership } from '../utils/firebase';
import { createNewChannel } from '../utils/mam';
//import '../static/assets/scss/createItemPage.scss';
//import { BrowserQRCodeReader } from '@zxing/library';
import projectJson from '../config/project.json'
import axios from 'axios';

// const codeReader = new BrowserQRCodeReader();
let codeReader = null;

class CreateItemPage extends Component {
  static async getInitialProps(context) {
    return { settings: projectJson.settings, events: projectJson.roleEventMapping, user: {canCreateStream: true, name: 'fake name'}, project: {} }
  }
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
    /* const { user, history } = this.props;
    if (isEmpty(user)) {
      history.push('/login');
    } */
  }

  notifySuccess = message => toast.success(message);
  notifyError = message => toast.error(message);

  validate = () => {
    this.setState({
      idError: !this.state.id,
    });

    return !this.state.id;
  };

  startScanner = async () => {
    if (typeof window !== 'undefined') {
      this.setState({ showQR: true });
      const lib = require('@zxing/library');
      codeReader = new lib.BrowserQRCodeReader();
      const devices = await codeReader.getVideoInputDevices();
        if (devices.length) {
          const firstDeviceId = devices[0].deviceId;

          codeReader
            .decodeFromInputVideoDevice(firstDeviceId, 'video-area')
            .then(result => {
              this.setState({ id: result.text });
            })
            .catch(err => console.error(err));
        } else {
          this.notifyError('Please check your video inputs!, we cant find any');
        }
    }
  };


  stopScanner = () => {
    codeReader.reset()
  }
  handleTextChange = textID => {
    this.setState({ id : textID })
  }
  onError = error => {
    this.setState({ showLoader: false });
    this.notifyError(error || 'Something went wrong');
  };

  createItem = async event => {
    const formError = this.validate();
    //const { history, storeItem, addItem, user, project } = this.props;

    if (!formError) {
      // Format the item ID to remove dashes and parens
        const itemId = this.state.id.replace(/[^0-9a-zA-Z_-]/g, '');
        const userID = 'fakeUserID'
        const status = this.props.events.owner.initEvent

        this.setState({ showLoader: true });
        const newChannel = {
          itemId,
          owner: userID,
          status,
          timestamp: Date.now()
        }
        let mamResp = null
        try {
          mamResp = await createNewChannel(newChannel);
        } catch(e) {
          console.error('something went wrong when fetching from mam', e)
        }
      mamResp && axios
      .post(`/api/channel`, { root: mamResp.root })
      .then(response => {
        this.setState({ showLoader: false });
        console.log(response.data._id)
      })
      .catch(error => {
        this.setState({ showLoader: false });
        console.error('something NOT ok', error)
      });
    };
  }

  render() {
      const { showLoader, idError } = this.state;
      const {
        project: { trackingUnit },
      } = this.props;
      const history = { push: () => {} }

      const unit = upperFirst(trackingUnit);
    return (
    <div>
      <Head />
    <Header>
      <div>
        <div>
          <a onClick={() => history.push('/')}>
            <img src="/static/images/arrow_left.svg" alt="back" />
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
    <style jsx global>{`
      @mixin button {
        letter-spacing: 1.5px;
        text-transform: uppercase;
        text-align: center;
        position: relative;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        display: inline-block;
        color: #ffffff;
        background: linear-gradient(90deg,#18817c,#22b1ab);
      }


      .create-item-wrapper {
        max-width: 630px;
        width: 40%;
        margin: 30px auto 0;

        .md-grid {

          & > div {
            width: 100%;
          }
          .input-wrapper {
            display: flex;
            align-items: center;
          }
          #video-area {
            border: 1px solid gray;
            width: 100%;
          }
          input {
            font-size: 18px;
            font-weight: 700;
            padding-left: 10px;
          }

          .md-divider {
            background-color: rgb(151, 151, 151);
          }

          .md-floating-label {
            color: rgb(63, 63, 63);
            font-size: 18px;
            font-weight: 400;
            padding-left: 10px;
          }

          .md-layover {
            width: 100%;
            margin: 0;
            padding: 0;
            border-bottom: 1px solid rgb(151, 151, 151);
            margin-bottom: 20px;

            .md-select-field--btn {
              color: rgb(63, 63, 63);
              font-size: 18px;
              font-weight: 700;
              padding-left: 10px;
            }

            .md-icon-separator {
              padding-right: 0;
            }
          }

          .md-tile-content {
            .md-text {
              color: rgb(63, 63, 63);
              font-size: 18px;
              font-weight: 700;
            }
          }

          .md-list--menu-below {
            top: 80%;
          }
        }

        .iota-theme-button {
          @include button();
          width: 100%;
          margin-top: 20px;
          font-size: 22px;
          padding: 35px 50px;
          line-height: 2px;
          border-radius: 45px;
        }
      }

      @media (max-width: 900px) {
        .create-item-wrapper {
          width: 70%;
        }
      }

      @media (max-width: 500px) {
        .create-item-wrapper {
          width: 85%;
        }
      }

    `}</style>
  </div>
    );
  }
}

CreateItemPage.propTypes = {
  project: PropTypes.object
};

CreateItemPage.defaultProps = {
  project: {
    trackingUnit: "container",
    qrReader: true
  }
};

/*
const mapStateToProps = state => ({
  user: state.user,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  addItem: itemId => dispatch(addItem(itemId)),
  storeItem: item => dispatch(storeItem(item)),
});
 */
export default CreateItemPage;
