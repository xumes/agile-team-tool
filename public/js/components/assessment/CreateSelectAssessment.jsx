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
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamSelectListStyle = {
      'width': '300px'
    };
    return (
      <p>
        <label for="assessmentSelectList">Create new or select an existing assessment:<span class="ibm-required">*</span></label>
          <span>
            <select name="teamSelectList" style={teamSelectListStyle}>
            <option value="">Create new assessment...</option>
          </select>
         </span>
       </p>
    )
  }

});

module.exports = CreateSelectAssessment;