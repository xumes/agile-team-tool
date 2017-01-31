var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var facesPerson = {};

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
           <label for='teamName'>Team Name</label>
            <input type='text' size='30' id='teamName' name='teamName' ref='teamName' aria-label='team name' role='combobox'/>
          </div>
          <p/>
          <div class='new-team-creation-add-block-content-description'>
           <label for='teamMemberRole'>Team Description</label>
            <textarea type='textarea' rows='15' id='teamName' name='teamName' ref='teamName' aria-label='team name' role='combobox'/>
          </div>
        </div>

        <div class='new-team-creation-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'30%','right':'42%','float':'right'}}>
            <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Next</a>
          </p>
       </div>             
      </div>

    )
  }
});
module.exports = HomeAddTeam;
