var React = require('react');
var api = require('../api.jsx');
var selectedChildId = '';

var TeamChildAddSection = React.createClass({
  componentDidUpdate: function() {
    $('#childSelectList').val('').change();
    $('#updateChildBtn').prop('disabled', true);
    selectedChildId = '';
  },
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.selectDropDown).select2();
    $(this.refs.selectDropDown).change(this.childTeamChangeHandler);
  },
  childTeamChangeHandler: function(event) {
    selectedChildId = event.target.value.toString();
    if (selectedChildId == '') {
      $('#updateChildBtn').prop('disabled', true);
    } else {
      $('#updateChildBtn').prop('disabled', false);
    }
  },
  associateTeamHandler: function() {
    var self = this;
    if (selectedChildId == '') {
      return;
    } else {
      api.associateTeam(this.props.childrenTeams.teamId, selectedChildId)
        .then(function(result){
          $('#updateParentBtn').prop('disabled', true);
          alert('You have successfully updated the Child team association.');
          return self.props.childTeamsUpdateHandler();
        })
        .catch(function(err){
          alert(err);
          return err;
        });
    }
  },
  render: function() {
    if (this.props.childrenTeams.selectableChildren.length <= 0 || this.props.childrenTeams.selectableChildren == undefined) {
      var populateTeamNames = null;
    } else {
      var populateTeamNames = this.props.childrenTeams.selectableChildren.map(function(item) {
        return (
          <option key={item._id} value={item._id}>{item.name}</option>
        )
      });
    }
    return (
      <div id='childAddSection'>
        <p>
          <label aria-label='childSelectList'>Select a child team:<span class='ibm-required'>*</span></label>
          <span>
            <select id='childSelectList' name='childSelectList' style={{'width':'400px'}} ref='selectDropDown'>
              <option key='' value=''>Select One</option>
              {populateTeamNames}
            </select>
          </span>
        </p>
        <p class='ibm-btn-row'>
          <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
          <span>
            <input type='button' class='ibm-btn-pri ibm-btn-small' id='updateChildBtn' value='Associate team to a child team' onClick={this.associateTeamHandler}/>
          </span>
        </p>
      </div>
    )
  }
});

module.exports = TeamChildAddSection;
