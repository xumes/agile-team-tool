var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamNameFooter = React.createClass({
  componentDidMount: function() {
    $('#btn-teamadd').prop('disabled', true);
  },

  render: function() {
    var self = this;
    var type = self.props.selectedteamType;
    var step;
    if (type === 'parentteam') {
      step = 'showParentChildTeamHierarchy';
    }
    if (type === 'squadteam') {
      step = 'showAddTeamMembers';
    }
    return (
    <div class='new-team-creation-add-block-footer'>
      <p class='ibm-btn-row ibm-button-link' class='footer-btn'>
        <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-teamadd' onClick={this.props.updateStep.bind(null, step)}>Next</button>
      </p>
    </div>
    );
  }
});

module.exports = HomeTeamNameFooter;
