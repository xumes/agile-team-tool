var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');

var HomeAddTeamNameModal = React.createClass({
  getInitialState: function() {
    return {
      teams: [],
      showStyle: {
        'display': 'none'
      },
      buttonOptions: {
        prevScreen: '',
        prevDisabled: 'disabled',
        nextScreen: 'showTeamTypeModal',
        nextDisabled: 'disabled'
      }
    };
  },
  componentWillReceiveProps: function(newProps) {
    if (_.isEmpty(newProps.newTeamObj.name)) {
      this.disableNextButton();
    }
  },
  disableNextButton: function() {
    var buttonOptions = this.state.buttonOptions;
    buttonOptions.nextDisabled = 'disabled';
    this.setState({buttonOptions: buttonOptions, showStyle: {'display': 'none'}});
  },
  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    // make sure to get the latest team names on focus of this screen
    if (!self.props.activeWindow && nextProps.activeWindow) {
      api.fetchTeamNames()
        .then(function(teams) {
          self.setState({teams : teams});
        });
    }
  },
  nameUpdate: function() {
    var self = this;
    console.log('nameUpdate');
    var newTeamName = self.refs.newTeamName.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    var team = _.find(self.state.teams, function(team) {
      var strippedName = team.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (_.isEqual(strippedName, newTeamName)) return team;
    });
    var hasError = false;
    if (!_.isEmpty(team)) {
      // TODO: actual implem should be message on screen, not alert
      //alert('This team name already exists. Please enter a different team name.');
      hasError = true;
    }

    if (hasError ) {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.nextDisabled = 'disabled';
      self.setState({ buttonOptions: buttonOptions, showStyle: {'display': 'inline'} });
    } else if (_.isEmpty(newTeamName)) {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.nextDisabled = 'disabled';
      self.setState({ buttonOptions: buttonOptions, showStyle: {'display': 'none'} });      
    } else {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.nextDisabled = '';
      self.setState({ buttonOptions: buttonOptions, showStyle: {'display': 'none'} });
      self.props.setTeamNameDesc(self.refs.newTeamName.value, self.refs.newTeamDescription.value);
    }
  },
  descriptionUpdate: function() {
    var self = this;
    console.log('descriptionUpdate');
    self.props.setTeamNameDesc(self.refs.newTeamName.value, self.refs.newTeamDescription.value);
  },
  render: function () {
    var self = this;
    var noteStyle = {
       color: '#4178BE'
    };
    return (
      <div>
        <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onHide={self.props.closeWindow}>
          <div class='new-team-creation-add-block'>
            <div class='new-team-creation-add-block-header'>
              <h>New Team Creation</h>
              <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
            </div>
            
            <div class='new-team-creation-add-block-content ibm-row-form1'>
              <div class='new-team-creation-add-block-content-name-wrapper'>
                <div class='new-team-creation-add-block-content-name'>
                <label for='newTeamName'>Team Name</label>
                <input type='text' size='30' id='newTeamName' name='newTeamName' aria-label='team name' ref='newTeamName' onChange={self.nameUpdate} defaultValue={self.props.newTeamObj.name}/>
                <div class='error-dup-team-name'>
                  <span style={this.state.showStyle}>
                    <span class='alert-icon'>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_alert.svg')}></InlineSVG>
                    </span>
                    <span class='alert-text'>
                      This team name is already used
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div class='new-team-creation-add-block-content-description'>
              <label for='newTeamDescription'>Team Description</label>
              <textarea type='textarea' rows='15' id='newTeamDescription' name='newTeamDescription' ref='newTeamDescription' onChange={self.descriptionUpdate}  defaultValue={self.props.newTeamObj.description} />
            </div>
            
            <div class='footer-note-add-team-name'><strong class="note1">NOTE:</strong>&nbsp;To join an existing team, click the "All teams" tab, find the team and click "request to join"</div>
          </div>

          <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} />
          </div>
        </Modal>
      </div>
    )
  }
});
module.exports = HomeAddTeamNameModal;
