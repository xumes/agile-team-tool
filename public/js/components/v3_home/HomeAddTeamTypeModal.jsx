var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');

var HomeAddTeamTypeModal = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamNameModal',
        prevDisabled: '',
        nextScreen: 'showTeamHierarchyModal',
        nextDisabled: 'disabled'
      }
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    // make sure to get the latest team names on focus of this screen
    if (!self.props.activeWindow && nextProps.activeWindow) {
      api.getNonSquadTeams()
        .then(function(teams) {
          var selectableParents = _.sortBy(teams, 'name');
          self.props.setSelectableParents(selectableParents);
        });
    }
  },

  setDefaultMember: function() {
    var self = this;
    api.getUsersInfo(user.ldap.uid)
      .then(function(result){
        console.log('setDefaultMember getUsersInfo:', result);
        var data = {
          userId: user.ldap.uid,
          email: user.ldap.emailAddress,
          name: user.ldap.hrFirstName + ' ' + user.ldap.hrLastName,
          role: _.isEqual(self.props.newTeamObj.type, 'squad') ? 'Iteration Manager' : 'Team Lead',
          allocation: 100,
          location: result[0].location || ''
        };
        self.props.setTeamMember([data]);
      });
  },

  show: function() {
    var self = this;
    console.log('show',self.props.selectedParentTeam);
    $('#teamTypeBlock select').select2({'dropdownParent':$('#teamTypeBlock')});
    $('#parentSelectList').change(self.parentSelectHandler);
    if (!_.isEmpty(self.props.selectedParentTeam))
      $('#parentSelectList').val(self.props.selectedParentTeam._id).change();
    else
      $('#parentSelectList').val('').change();
    $("#teamTypeBlock span[data-widget=tooltip]").tooltip();
  },

  changeTypeHandler: function(event) {
    var self = this;
    var selectedValue = event.target.value;
    if (_.isEqual('squadTeam', selectedValue))
      self.props.setTeamType('squad');
    else
      self.props.setTeamType(null);

    if (!_.isEmpty(selectedValue)) {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.nextDisabled = '';
      buttonOptions.nextScreen = _.isEqual('squadTeam', selectedValue) ? 'showTeamMemberModal' : 'showTeamHierarchyModal';
      self.setState({ buttonOptions: buttonOptions });
    }
    self.setDefaultMember();
  },

  parentSelectHandler: function(event) {
    var self = this;
    var selectedValue = event.target.value;
    console.log('parentSelectHandler', selectedValue);
    var team = _.find(self.props.selectableParents, function(team) {
      if (_.isEqual(selectedValue,team._id)) return team;
    });
    console.log('parentSelectHandler', team);
    self.props.setSelectedParentTeam(team);
  },

  render: function() {
    var self = this;
    console.log('render team type',this.props.newTeamObj);
    var displayParents = {display: 'none'};
    var parentTeamChecked = '';
    var squadTeamChecked = '';
    if (!_.isEmpty(self.props.newTeamObj)) {
      if (_.isEqual('squad', this.props.newTeamObj.type)) {
        displayParents = {display: 'block'};
        squadTeamChecked = 'checked';
      } else if (this.props.newTeamObj.type == null) {
        parentTeamChecked = 'checked';
      }
    }
    var populateTeamNames = self.props.selectableParents.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      );
    });

    return (
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-add-block' id='teamTypeBlock'>
          <div class='new-team-creation-add-block-header'>
            <h>New Team Creation</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>
          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <h3 class="lblstyle2">I am creating a...</h3>

              <div class="midcontent">
                <div class="optbox">
                  <span class="ibm-radio-wrapper obtbox-radio">
                    <input class="ibm-styled-radio" id="pteam" name="teamtype" type="radio" defaultValue="parentTeam" checked={parentTeamChecked} onChange={self.changeTypeHandler} defaultValue={this.props.newTeamObj.type == null}/>
                    <label for="pteam" class="ibm-field-label lbl"><span data-widget="tooltip" title="A parent team, also known as a domain, subdomain, or tribe, is a team who oversees numerous teams below them and would have 'Roll up' data from each of those teams.">Parent team</span></label>
                  </span>
                  <div class="pteam-bg">
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_parentteam.svg')}></InlineSVG>
                  </div>
                </div>

                <div class="optbox">
                  <span class="ibm-radio-wrapper obtbox-radio">
                    <input class="ibm-styled-radio" id="steam" name="teamtype" type="radio" defaultValue="squadTeam" checked={squadTeamChecked} onChange={self.changeTypeHandler} />
                    <label for="steam" class="ibm-field-label lbl"><span data-widget="tooltip" title="Typically, a squad is a team that uses Agile frameworks like Scrum or Kanban to deliver outcomes. Still not sure if you are a squad? If your team does not have any other teams organized below it, then it would be a squad.">Squad team</span></label>
                  </span>
                  <div class="pteam-bg">
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_squadteam.svg')}></InlineSVG>
                  </div>

                  <div class='optbox-select' style={displayParents}>
                    <select name="parentSelectList" id="parentSelectList" style={{width: '100%'}}>
                      <option value=''>Select parent team (optional)</option>
                      {populateTeamNames}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class='footer-note'><strong class="note1">NOTE:</strong>&nbsp;To join an existing team, click the "All teams" tab, find the team and click "request to join"</div>
          </div>

          <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} />
        </div>
      </Modal>
    );
  }
});

module.exports = HomeAddTeamTypeModal;
