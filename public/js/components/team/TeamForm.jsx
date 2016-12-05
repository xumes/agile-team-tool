var _ = require('underscore');
var React = require('react');
var teamApi = require('./TeamApi.jsx');
var TeamAccessMessage = require('./TeamAccessMessage.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');
var TeamFormButtons = require('./TeamFormButtons.jsx');
var TeamErrorValidationHandler = require('./TeamErrorValidationHandler.jsx');

var TeamForm = React.createClass({
  getInitialState: function() {
    return {
      formError: {
        error: new Object(),
        map: [
          {field: 'name', id: 'teamName'},
          {field: 'type', id: 'teamSquadYesNo'}
        ]
      }
    }
  },
  componentDidMount: function() {
    $('select[name="teamSquadYesNo"]').select2();
    $("a[data-widget='tooltip']").tooltip();
  },
  componentWillReceiveProps: function(newProps) {
    this.setState(this.getInitialState());
  },
  componentDidUpdate: function() {
    var selectedTeam = this.props.selectedTeam;
    if (!_.isEmpty(selectedTeam)) {
      //this.setState({teamSelectListDefault: selectedTeam.team._id});
      this.refs.teamName.value = selectedTeam.team.name;
      this.refs.teamDesc.value = selectedTeam.team.description;
      this.refs.teamSquadYesNo.value = selectedTeam.team.type == 'squad' ? 'Yes' : 'No';
      this.refs.teamName.disabled = !selectedTeam.access;
      this.refs.teamDesc.disabled = !selectedTeam.access;
      this.refs.teamSquadYesNo.disabled = !selectedTeam.access;
      if (selectedTeam.access) {
        if (selectedTeam.team.type == 'squad') {
          if (!_.isEmpty(selectedTeam.iterations) || !_.isEmpty(selectedTeam.assessments))
            this.refs.teamSquadYesNo.disabled = true;
        } else {
          if (!_.isEmpty(selectedTeam.children) && selectedTeam.children.length > 0)
            this.refs.teamSquadYesNo.disabled = true;
        }
      }
    } else {
      //this.setState({teamSelectListDefault: 'new'});
      this.refs.teamName.value = '';
      this.refs.teamDesc.value = '';
      this.refs.teamSquadYesNo.value = 'Yes';
      this.refs.teamName.disabled = false;
      this.refs.teamDesc.disabled = false;
      this.refs.teamSquadYesNo.disabled = false;
    }
    // force select2 to update display value
    $('#teamSquadYesNo').trigger('change');
  },
  formAction: function(action) {
    var self = this;
    var team = self.props.selectedTeam.team;
    if (_.isEmpty(team))
      team = new Object();
    if (action=='add' || action=='update') {
      team.name = this.refs.teamName.value;
      team.description = this.refs.teamDesc.value;
      if (this.refs.teamSquadYesNo.value == 'Yes')
        team.type = 'squad';
      else
        team.type = null;
      // ajax call
      if (action=='add') {
        teamApi.postTeam(JSON.stringify(team))
          .then(function(result) {
            self.props.getSelectedTeam(result._id, 'You have successfully added a team and you have been added as the first team member. You can now add additional team members.');
          })
          .catch(function(err) {
            var map = self.state.formError.map;
            self.setState({
              formError: {
                error: err,
                map: map
              }
            });
          });
      } else {
        teamApi.putTeam(JSON.stringify(team))
          .then(function(result) {
            self.props.getSelectedTeam(team._id, 'You have successfully updated Team Information.');
          })
          .catch(function(err) {
            var map = self.state.formError.map;
            self.setState({
              formError: {
                error: err,
                map: map
              }
            });
          });
      }
    } else if (action=='delete') {
      var selectedTeam = self.props.selectedTeam;
      var hasAssoc = false;
      var msg = 'You have requested to delete ' + selectedTeam.team.name + '. \n\n';
      msg = msg + 'This team has the following associations: \n';

      if (!_.isEmpty(selectedTeam.hierarchy) && selectedTeam.hierarchy.length > 0) {
        msg = msg + '\t Parent team: 1 \n';
        hasAssoc = true;
      }
      if (!_.isEqual(selectedTeam.type, 'squad') && selectedTeam.children.length > 0) {
        msg = msg + '\t Child team(s): ' + selectedTeam.children.length + ' \n';
        hasAssoc = true;
      }
      if (!_.isEmpty(selectedTeam.iterations) && selectedTeam.iterations.length > 0) {
        msg = msg + '\t Iteration information: ' + selectedTeam.iterations.length + ' \n';
        hasAssoc = true;
      }
      if (!_.isEmpty(selectedTeam.assessments) && selectedTeam.assessments.length > 0) {
        msg = msg + '\t Maturity assessment(s): ' + selectedTeam.assessments.length + ' \n';
        hasAssoc = true;
      }
      if (!hasAssoc) {
        msg = msg + '\t Team has no associations. \n\n';
      } else {
        msg = msg + '\n\t *You can return to Team Management page to review any of these associations. \n\n';
        if (!_.isEqual(selectedTeam.type, 'squad'))
          msg = msg + 'If you delete this team, any parent/child associations to this team will be removed. \n\n';
        else
          msg = msg + 'If you delete this team, any parent/child associations to this team will be removed. Any iteration information, and maturity assessments related to this team will be DELETED. \n\n';
      }
      msg = msg + 'Select OK to proceed with the team delete or Cancel.';
      if (confirm(msg)) {
        // ajax call
        teamApi.deleteTeam(JSON.stringify(team))
          .then(function(result) {
            self.props.getSelectedTeam('delete');
          })
          .catch(function(err) {
            var map = self.state.formError.map;
              self.setState({
                formError: {
                  error: err,
                  map: map
                }
              });
          });
        }
    } else if (action=='reset') {
      var map = self.state.formError.map;
      self.setState({
        formError: {
          error: new Object(),
          map: map
        }
      });
      $('#teamSelectList').val('new').trigger('change');
    }
  },
  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamNameStyle = {
      'width': '400px'
    };
    var teamDescStyle = {
      'width': '400px',
      'height': '70px'
    };
    var squadTooltipStyle = {
      'position': 'relative',
      'top': '-5%',
      'left': '5%'
    };
    return (
      <div>
        <p>
          <label style={labelStyle} for='teamSelectList'>Create or select an existing team:<span class="ibm-required">*</span></label>
            <span>
              <TeamDropdown teamChangeHandler={this.props.teamChangeHandler} defaultTeam={this.props.defaultTeam}/>
           </span>
        </p>
        <TeamAccessMessage selectedTeam={this.props.selectedTeam} />
        <p>
          <label for="teamName">&nbsp;<span class="ibm-access">Team name:</span></label>
          <span>
            <input type="text" name="teamName" id="teamName" ref="teamName" size="50" placeholder="Type team name" aria-label="Team name" style={teamNameStyle} />
          </span>
        </p>
        <p>
          <label for="teamDesc">Team description:</label>
          <span>
            <textarea name="teamDesc" id="teamDesc" ref="teamDesc" placeholder="Type a short team description" style={teamDescStyle}  ></textarea>
          </span>
        </p>
        <p>
          <label for="teamSquadYesNo">Is this a squad team?<span class="ibm-required">*</span>
            <a class="ibm-information-link" data-widget="tooltip" data-contentid="squadToolTip" style={squadTooltipStyle}><span class="ibm-access">Tooltip</span></a>
          </label>
          <span>
            <select defaultValue='Yes' id="teamSquadYesNo" name="teamSquadYesNo" ref="teamSquadYesNo" style={teamNameStyle} >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </span>
        </p>
        <div id="squadToolTip" class="ibm-tooltip-content">
          <p class="toolTip">
            You can change the Squad Team Indicator from No to Yes if the team does not have any associated Child Teams.<br/> <br/> You can change the Squad Team Indicator from Yes to No if there is no associated data like Iteration Information.<br/> <br/> Otherwise, you cannot change the squad team indicator.
          </p>
        </div>
        <TeamFormButtons selectedTeam={this.props.selectedTeam} formAction={this.formAction} updateTeamSelelictList={this.props.updateTeamSelelictList}/>
        <TeamErrorValidationHandler formError={this.state.formError} />
      </div>
    )
  }
});

module.exports = TeamForm;
