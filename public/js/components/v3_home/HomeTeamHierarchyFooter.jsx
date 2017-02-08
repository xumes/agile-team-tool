var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamHierarchyFooter = React.createClass({
  componentDidMount: function() {
    $('#btn-teamaddparentchildhier').prop('disabled', true);
  },

  render: function() {
    var self = this;
    var type = self.props.selectedteamType;
    var step;
    return (
    <div class='new-team-creation-add-block-footer'>
      <p class='ibm-btn-row ibm-button-link' class='footer-btn'>
        <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' id='btn-teamaddparentchildhier' onClick={this.props.updateStep.bind(null, step)}>Next</button>
      </p>
    </div>
    );
  }
});

module.exports = HomeTeamHierarchyFooter;
