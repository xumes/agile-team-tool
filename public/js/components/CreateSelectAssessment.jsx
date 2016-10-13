var React = require('react');

var CreateSelectAssessment = React.createClass({
  getInitialState: function() {
    return {
      }
  },

  componentDidMount: function() {
    var self = this;
  },
  render: function() {
    return (
      <p>
        <label for="assessmentSelectList">Create new or select an existing assessment:<span class="ibm-required">*</span></label>
        </p>
    )
  }

});

module.exports = CreateSelectAssessment;