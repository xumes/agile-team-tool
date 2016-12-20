var React = require('react');
var TeamDropdownParent = require('./TeamDropdownParent.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');
var TeamErrorValidationHandler = require('./TeamErrorValidationHandler.jsx');
var api = require('../api.jsx');
var teamApi = require('./TeamApi.jsx');
var currentTeamId = '';
var currentParentId = '';

var TeamParentAssociation = React.createClass({
  getInitialState: function() {
    return {
      selectableParentTeams: {
        'access': false,
        'currentParentId': '',
        'selectableParents': []
      },
      formError: {
        error: {},
        map: [
          {field: 'path', id: 'parentSelectList'}
        ]
      }
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (!_.isEmpty(self.props.selectedTeam) && (currentTeamId != self.props.selectedTeam.team._id || currentParentId != self.state.selectableParentTeams.currentParentId)) {
      currentTeamId = self.props.selectedTeam.team._id.toString();
      api.getTeamHierarchy(self.props.selectedTeam.team.path)
        .then(function(result) {
          currentParentId = '';
          if (result && result.length > 0) {
            currentParentId = result[result.length - 1]._id.toString();
          }
          return teamApi.getSelectableParents(currentTeamId);
        })
        .then(function(result) {
          var returnResult = {
            currentParentId: currentParentId,
            selectableParents: result,
            access: self.props.selectedTeam.access
          };
          self.refs.updateParentBtn.disabled = !self.props.selectedTeam.access;
          return self.setState({selectableParentTeams:returnResult});
        })
        .catch(function(err){
          var map = self.state.formError.map;
          self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        });
    }
  },
  parentChangeHandler: function() {
    this.state.selectableParentTeams.currentParentId = document.getElementById('parentSelectList').value;
  },
  associateTeamHandler: function() {
    var self = this;
    if (this.state.selectableParentTeams.currentParentId != '') {
      teamApi.associateTeam(self.state.selectableParentTeams.currentParentId, self.props.selectedTeam.team._id)
        .then(function(results) {
          currentParentId = self.state.selectableParentTeams.currentParentId;
          alert('You have successfully updated the Parent team association.');
          var result = _.find(results, function(team) {
            if (team._id == self.props.selectedTeam.team._id) return team;
          });
          self.props.sectionUpdateHandler(result);
          return result;
        })
        .catch(function(err) {
          alert(err);
          return err;
        });
    } else {
      if (currentParentId == '' && currentParentId == self.state.selectableParentTeams.currentParentId) {
        alert('No Parent team association to remove.');
        return;
      }
      teamApi.removeAssociation(self.props.selectedTeam.team._id)
        .then(function(results) {
          currentParentId = '';
          alert('You have successfully removed the Parent team association.');
          var result = _.find(results, function(team) {
            if (team._id == self.props.selectedTeam.team._id) return team;
          });
          self.props.sectionUpdateHandler(result);
          return result;
        })
        .catch(function(err) {
          alert(err);
          return err;
        });
    }
  },
  showHideSection: function() {
    this.props.showHideSection('assocParentPageSection');
  },
  render: function() {
    var self = this;
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='assocParentPageSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={self.showHideSection}>
            Parent team association
          </a>
        </h2>
        <div class='ibm-container-body' style={{'display':'none'}}>
          <p>
            <label aria-label='parentSelectList'>Select a parent team:<span class='ibm-required'>*</span></label>
            <span>
              <TeamDropdownParent selectableParentTeams={self.state.selectableParentTeams} parentChangeHandler={self.parentChangeHandler}/>
            </span>
          </p>
          <p class='ibm-btn-row'>
            <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
            <span>
              <input type='button' class='ibm-btn-pri ibm-btn-small' id='updateParentBtn' ref='updateParentBtn' value='Associate team to a parent team' onClick={self.associateTeamHandler}/>
            </span>
          </p>
        </div>
        <TeamErrorValidationHandler formError={this.state.formError} />
      </div>
    )
  }
});

module.exports = TeamParentAssociation;