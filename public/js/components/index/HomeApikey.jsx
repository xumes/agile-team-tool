var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var clipboard = null;
var _ = require('underscore');

var HomeApikey = React.createClass({
  getInitialState: function() {
    return {
      apiKey: ''
    }
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (!_.isEmpty(this.state.apiKey)) {
      if (clipboard) clipboard.destroy();
      clipboard = new Clipboard('#copyApikeyBtn');
      setTimeout(function() {
        $('#copyApikeyBtn').focus();
      }, 0);

    }
  },
  show: function() {
    var self = this;
    api.getApiKeyByUser()
      .then(function(data) {
        if (data && data.apiKey)
          self.setState({ apiKey: data.apiKey });
      })
      .catch(function(err) {
        self.setState({ apiKey: '' });
      });
  },
  generateApikey: function() {
    var self = this;
    api.getApiKey()
      .then(function(data) {
        self.setState({ apiKey: data.apiKey });
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    var confirmHeaderStyle = self.state.submitStatusOk ? null : {'backgroundColor':'#d0021b'};
    return (
      <div>
        <Modal aria-labelledby='API Key Dialog' style={modalStyle} backdropStyle={backdropStyle} show={self.props.showApikeyModal} onHide={self.props.closeApikey} onShow={self.show}>
          <div class='home-modal-block' style={{'width':'29em'}} id='apikeyBlock'>
            <div class='home-modal-block-header'>
              <h>API Key</h>
              <div class='home-modal-block-close-btn' onClick={self.props.closeApikey}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </div>

            <div class='home-modal-block-content'>
              <div class='apikey-block'>
                <p class='apikey-note'>
                  The API key is used for APIs that write data directly to the Agile Team Tool from another system.
                </p>
                <p style={_.isEmpty(this.state.apiKey) ? {'display': 'none'} : {}}>
                  <label>Your key</label>
                  <span id='userApikey'>
                    <h>{this.state.apiKey}</h>
                  </span>
                </p>
              </div>
            </div>
            <div class='home-modal-block-footer ibm-btn-row' style={{'width':'95%','top':'-3%'}}>
              <div style={_.isEmpty(this.state.apiKey) ? {'display': 'none'} : {'float':'left'}}>
                <button class=' ibm-btn-sec ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} id='copyApikeyBtn' data-clipboard-target='#userApikey' >Copy to clipboard</button>
              </div>
              <div style={{'float':'right'}}>
                <button class=' ibm-btn-pri ibm-btn-small ibm-btn-blue-50' style={{'marginRight':'.5em'}} onClick={self.generateApikey} id='genApikeyBtn' disabled={_.isEmpty(this.state.apiKey) ? '' : 'disabled'} >Generate API Key</button>
                <button class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.closeApikey} id='cancelApikeyBtn'>Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
});

module.exports = HomeApikey;