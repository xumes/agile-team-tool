var React = require('react');

var HomeAddTeamMemberFooter = React.createClass({

  render: function() {
    var self = this;

    return (
      <div class='new-team-creation-addteam-member-footer'>
        <p class='ibm-btn-row ibm-button-link' class='footer-btn'>
          <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-back' onClick={this.props.updateStep.bind(null, 'showTeamName')}>Back</button>
          <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-next' onClick={this.props.updateTeam}>Next</button>
        </p>
      </div>
    );
  }
});

module.exports = HomeAddTeamMemberFooter;
