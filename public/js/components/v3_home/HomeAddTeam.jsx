var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeAddTeam = React.createClass({
  componentDidUpdate: function() {
  },
  componentDidMount: function() {
    var self = this;
  },
  componentWillUnmount: function() {
  },
  addTeamHandler: function() {
    var self = this;
    if ($('#newTeamName').val() == '') {
        alert('Please fill in a new team name.');
    } else {          
        api.fetchTeamNames()
         .then(function(teams) {
            var isTeamExist = false;
            isTeamExist = _.find(teams, function(m){
              if (m.name == $('#newTeamName').val()) {
                console.log('in team exist = true');  
                return true;
              }
            })

            if (isTeamExist) {
              alert('This team name already exists. Please enter a different team name.');
            } else {
              alert('Proceed forward.');
            }
         });
    }
  },

  render: function () {
    var self = this;

    return (
      <div class='new-team-creation-add-block'>
       <div class='new-team-creation-add-block-header'>
          <h>New Team Creation</h>
             <span onClick={self.props.hideAddTeamModal}>X</span>
       </div>
       <p/>
       <div class='new-team-creation-add-block-content'>
         <div class='new-team-creation-add-block-content-name'>
           <label for='newTeamName'>Team Name</label>
            <input type='text' size='30' id='newTeamName' name='newTeamName' aria-label='team name' ref='newTeamName'/>            
          </div>
          <p/>
          <div class='new-team-creation-add-block-content-description'>
           <label for='newTeamDescription'>Team Description</label>
            <textarea type='textarea' rows='15' id='newTeamDescription' name='newTeamDescription' ref='newTeamDescription' aria-label='new team description' role='combobox'/>
          </div>
        </div>

        <div class='new-team-creation-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'15%','right':'42%','float':'right'}}>
            <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.addTeamHandler}>Next</a>
          </p>
       </div>             
      </div>

    )
  }
});
module.exports = HomeAddTeam;
