var React = require('react');

var DebugSection = React.createClass({
  render: function() {
    var assessmentId = this.props.selectedAssessment._id;
    return (
      <div id="debugSection">
        <p>
          <label><span class="defaultFontSize">Doc id for this page(for SIT only):</span></label> <span class="defaultFontSize" id="doc_id">{assessmentId}</span>
        </p>
      </div>
    );
  }
});

module.exports = DebugSection;
