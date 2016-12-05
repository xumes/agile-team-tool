var React = require('react');

var DebugSection = React.createClass({
  render: function() {
    return (
      <div id="debugSection">
        <p>
          <label><span class="defaultFontSize">Doc id for this page(for SIT only):</span></label> <span class="defaultFontSize" id="doc_id"></span>
        </p>
      </div>
    );
  }
});

module.exports = DebugSection;
