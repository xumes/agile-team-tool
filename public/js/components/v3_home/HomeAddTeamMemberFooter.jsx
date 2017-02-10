var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamMemberFooter = React.createClass({

  render: function() {
    var self = this;

    return (
      <div class='new-team-creation-addteam-member-footer'>
        <p class='ibm-btn-row ibm-button-link' class='footer-btn'>
          <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-back' onClick={this.props.updateStep.bind(null, 'showTeamName')}>Back</button>
          <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-next' onClick={this.props.updateStep.bind(null, 'showTeamMemberRole')}>Next</button>
        </p>
      </div>
    );
  }
});

module.exports = HomeAddTeamMemberFooter;
