var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var facesPerson = {};

var HomeAddMember = React.createClass({
  componentDidUpdate: function() {
    facesPerson = {};
    // $('#teamMemberRoleSelect').select2({'width':'100%'});
  },
  componentDidMount: function() {
    var self = this;
    $('#teamMemberRoleSelect').select2({'width':'100%'});
    $('#teamMemberRoleSelect').change(self.roleHandler);
    $('#teamMemberAllocationSelect').select2({'width':'100%'});
    $('#teamMemberAwkSelect').select2({'width':'100%'});
    FacesTypeAhead.init(
      $('#teamMemberName'), {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            self.facesClickHandler(person);
            return person['name'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: false
        }
      });
  },
  componentWillUnmount: function() {
    $('.typeahead-results').remove();
  },

  facesClickHandler: function(person) {
    facesPerson = person;
    $('#teamMemberName').text(person.name);
  },

  roleHandler: function(e) {
    if (e.target.value == 'Other...') {
      $('.team-member-add-block-content-allocation').css('top','20%');
      $('.team-member-add-block-content-awk').css('top','20%');
      $('#otherRole').fadeIn();
      console.log('other');
    } else {
      $('.team-member-add-block-content-allocation').css('top','5%');
      $('.team-member-add-block-content-awk').css('top','5%');
      $('#otherRole').fadeOut();
    }
  },

  render: function () {
    var self = this;
    var allocationArray = Array.from(Array(101).keys())
    var allocationSelection = allocationArray.map(function(a){
      return (
        <option key={a} value={a}>{a}%</option>
      )
    });
    return (
      <div class='team-member-add-block'>
        <div class='team-member-add-block-header'>
          <h>Add Team Member</h>
          <span onClick={self.props.hideAddTeamTable}>X</span>
        </div>
        <div class='team-member-add-block-content'>
          <div class='team-member-add-block-content-name'>
            <label for='teamMemberName'>Name</label>
            <input type='text' placeholder='Ex: Name or Email Adress' size='50' id='teamMemberName' name='teamMemberName' ref='teamMemberName' aria-label='team member' role='combobox'/>
          </div>
          <div class='team-member-add-block-content-role'>
            <label for='teamMemberRole'>Role</label>
            <div class='role-select'>
              <select id='teamMemberRoleSelect' defaultValue='psr'>
                <option key='psr' value='psr'>Please select a role</option>
                {self.props.roleSelection}
              </select>
            </div>
          </div>
          <div class='team-member-add-block-content-other'>
            <input type='text' placeholder='Other role description' size='50' id='otherRole' name='otherRole' ref='otherRole' />
          </div>
          <div class='team-member-add-block-content-allocation'>
            <label for='teamMemberAllocation'>Allocation</label>
            <div class='allocation-select'>
              <select id='teamMemberAllocationSelect' defaultValue='100'>
                {allocationSelection}
              </select>
            </div>
          </div>
          <div class='team-member-add-block-content-awk'>
            <label for='teamMemberAwk'>Average Work Week</label>
            <div class='awk-select'>
              <select id='teamMemberAwkSelect' defaultValue='Full Time'>
                <option key='Full Time' value='Full Time'>Full Time</option>
                <option key='Part Time' value='Part Time'>Part Time</option>
              </select>
            </div>
          </div>
        </div>
        <div class='team-member-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'30%','right':'5%','float':'right'}}>
            <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Add</a>
            <a class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.hideAddTeamTable}>Cancel</a>
          </p>
        </div>
      </div>
    )
  }
});
module.exports = HomeAddMember;
