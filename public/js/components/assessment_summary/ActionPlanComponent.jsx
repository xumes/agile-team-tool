var React = require('react');

var ActionPlanComponent = React.createClass({
  render: function() {
    return (
      <div data-widget="showhide" data-type="panel" class="ibm-show-hide" id="actPlanContainer">
        <h2 class="agile-summary" data-open="true">Action Plan</h2>
        <div class="ibm-container-body">
          <div class="auto-container">
            <table class="ibm-data-table ibm-altrows ibm-col-1-1 action datatable-margin" summary="__REPLACE_ME__">
              <thead>
                <tr>
                  <th id="selectCol"></th>
                  <th>Related Practice</th>
                  <th>Principle</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>How do we get better?</th>
                  <th>Progress Summary</th>
                  <th>Key Metric</th>
                  <th>Review Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="actionPlan">
              </tbody>
            </table>
          </div>
          <div class="ibm-btn-row btnRow">
            <h3 class="floatLeft">*Note: there is a 350 character limit on entered text</h3>
            <input type="button" class="ibm-btn-sec ibm-btn-small" id="addActEntryBtn" value="Add action item"  disabled /> <input type="button"
              class="ibm-btn-sec ibm-btn-small" id="deleteActPlanBtn" value="Delete action item"  disabled /> <input type="button"
              class="ibm-btn-pri ibm-btn-small" id="saveActPlanBtn" value="Save action plan"  disabled /> <input type="button"
              class="ibm-btn-sec ibm-btn-small" id="cancelActPlanBtn" value="Reset action plan"  disabled />
          </div>
          <div id="dialog" title="Confirmation Required" />
        </div>
      </div>
    );
  }
});

module.exports = ActionPlanComponent;
