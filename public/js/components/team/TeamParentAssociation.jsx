var React = require('react');
var TeamDropdownParent = require('./TeamDropdownParent.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');
var api = require('../api.jsx');
var currentTeam = '';
var teamParentId = '';
var selecedParentId = '';

var TeamParentAssociation = React.createClass({
  getInitialState: function() {
    return {
      selectableParentTeams: {
        'parent': null,
        'selectableParents': []
      },
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (self.props.selectedTeam.team._id && currentTeam != self.props.selectedTeam.team._id.toString()) {
      api.getSelectableParents(self.props.selectedTeam.team._id)
        .then(function(result){
          currentTeam = self.props.selectedTeam.team._id.toString();
          if (self.props.selectedTeam.hierarchy.length > 0) {
            var currentParent = self.props.selectedTeam.hierarchy[self.props.selectedTeam.hierarchy.length - 1];
            teamParentId = self.props.selectedTeam.hierarchy[self.props.selectedTeam.hierarchy.length - 1]._id.toString();
          } else {
            currentParent = null;
            teamParentId = '';
          }
          var returnResult = {
            'parent': currentParent,
            'selectableParents': result
          };
          return self.setState({selectableParentTeams:returnResult});
        })
        .catch(function(err){
          console.log(err);
          return err;
        });
    }
  },
  parentChangeHandler: function(event) {
    selecedParentId = event.target.value.toString();
    if (selecedParentId == teamParentId) {
      $('#updateParentBtn').prop('disabled', true);
    } else {
      $('#updateParentBtn').prop('disabled', false);
    }
  },
  associateTeamHandler: function() {
    var self = this;
    if (selecedParentId == teamParentId) {
      return ;
    } else {
      api.associateTeam(selecedParentId, self.props.selectedTeam.team._id)
        .then(function(result){
          teamParentId = selecedParentId;
          $('#updateParentBtn').prop('disabled', true);
          alert('You have successfully updated the Parent team association.');
          return result;
        })
        .catch(function(err){
          alert(err);
          return err;
        });
    }
  },
  render: function() {
    var self = this;
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='assocParentPageSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse'onClick={()=>self.props.showHideSection('assocParentPageSection')}>
            Parent Team Association
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
              <input type='button' class='ibm-btn-pri ibm-btn-small' id='updateParentBtn' value='Associate team to a parent team' onClick={self.associateTeamHandler}/>
            </span>
          </p>
        </div>
      </div>
    )
  }



});

module.exports = TeamParentAssociation;
