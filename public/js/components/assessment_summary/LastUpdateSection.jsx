var React = require('react');

var LastUpdateSection = React.createClass({
  render: function() {
    var updatedBy = this.props.selectedAssessment.updatedBy;
    var updateDate = this.props.selectedAssessment.updateDate;
    return (
      <div>
        <h3 class="ibm-bold ibm-h4">Last update</h3>
        <div class="ibm-rule ibm-alternate-2">
          <hr />
        </div>

        <div class="ibm-columns">
          <div class="ibm-col-2-1">
            <p>
              <label><span class="defaultFontSize">Last update user:</span></label> <span class="defaultFontSize" id="lastUpdateUser">{updatedBy}</span>
            </p>

          </div>
          <div class="ibm-col-2-1">
            <p>
              <label><span class="defaultFontSize">Last update timestamp:</span></label> <span class="defaultFontSize" id="lastUpdateTimestamp">{updateDate}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LastUpdateSection;
