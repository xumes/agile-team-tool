var React = require('react');
var TeamDropdownParent = require('./TeamDropdownParent.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');
var api = require('../api.jsx');
var currentTeam = '';

var TeamParentAssociation = React.createClass({
  getInitialState: function() {
    return {
      selectableParentTeams: [],
    }
  },
  componentDidUpdate: function() {
    var self = this;
    if (self.props.selectedTeam.team._id && currentTeam != self.props.selectedTeam.team._id.toString()) {
      api.getSelectableParents(self.props.selectedTeam.team._id)
        .then(function(result){
          currentTeam = self.props.selectedTeam.team._id.toString();
          return self.setState({selectableParentTeams:result});
        })
        .catch(function(err){
          console.log(err);
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
              <TeamDropdownParent selectableParentTeams={self.state.selectableParentTeams}/>
            </span>
          </p>
          <p class='ibm-btn-row'>
            <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
            <span>
              <input type='button' class='ibm-btn-pri ibm-btn-small' id='updateParentBtn' value='Associate team to a parent team'/>
            </span>
          </p>
        </div>
      </div>
    )
  }



});

module.exports = TeamParentAssociation;
