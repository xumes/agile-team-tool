var _ = require('underscore');
var React = require('react');
var teamApi = require('./TeamApi.jsx');
var TeamAccessMessage = require('./TeamAccessMessage.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');
var TeamFormButtons = require('./TeamFormButtons.jsx');

var TeamForm = React.createClass({
  componentDidMount: function() {
    console.log('componentDidMount TeamForm', (this.props.defaultTeam != 'new'));
    $('select[name="teamSquadYesNo"]').select2();
    $("a[data-widget='tooltip']").tooltip();
    //if (this.props.defaultTeam != 'new')
      //$('#teamSelectList').val(this.props.defaultTeam).trigger('change');
  },
  /*
  componentWillReceiveProps: function(newProps) {
    console.log('TeamForm componentWillReceiveProps ', newProps);
    var selectedTeam = newProps.selectedTeam;
    if (!_.isEmpty(selectedTeam)) 
      this.setState({teamSelectListDefault: selectedTeam.team._id});
    else
      this.setState({teamSelectListDefault: 'new'});
  },
  */
  componentDidUpdate: function() {
    console.log('TeamForm componentDidUpdate', this.props);
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
          if (!_.isEmpty(selectedTeam.subtree))
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
    //console.log( this.state.teamSelectListDefault);
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
        teamApi.postTeam(team)
          .then(function(result) {
            console.log('add', result);
            self.props.getSelectedTeam(result._id);
          })
          .catch(function(err) {
            console.log('error', err);
          });
      } else {
        teamApi.putTeam(team)
          .then(function(result) {
            console.log('add update', result);
            self.props.getSelectedTeam(result._id);
          })
          .catch(function(err) {
            console.log('update error', err);
          });
      }
    } else if (action=='delete') {
      // ajax call
      teamApi.deleteTeam(team)
        .then(function(result) {
          console.log('delete', result);
          self.props.getSelectedTeam('delete');
        })
        .catch(function(err) {
          console.log('delete error', err);
        });
    } else if (action=='reset') {
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
      </div>
    )
  }
});

module.exports = TeamForm;
