var React = require('react');

var DeliveryComponent = React.createClass({
  render: function() {
    var displayType = this.props.displayType;
    var deliveryResultAry = this.props.deliveryResultAry;
    var componentName = '';
    if (deliveryResultAry.length > 0) {
      componentName = deliveryResultAry[0]['props']['assessed_cmpnt'].componentName;
    }

    return (
      <div data-widget="showhide" data-type="panel" class="ibm-show-hide" id="delContainer" style={displayType} >
        <h2 class="agile-summary" data-open="true" id="assessId_1"><a href="javascript:void();" class="ibm-show-active">{componentName}</a></h2>
        <div class="ibm-container-body" id="assessContainer_1">
          <div class="ibm-columns">
            <div class="ibm-col-2-1">
              <div class="ibm-card">
                <div class="ibm-card__content">
                  <table class="ibm-data-table ibm-altrows" summary="__REPLACE_ME__" id="delTable" width="90%">
                    <thead>
                      <tr>
                        <th>Practice</th>
                        <th>Current</th>
                        <th>Target</th>
                        <th id="deliveryIndAsses">Ind Assess</th>
                      </tr>
                    </thead>
                    <tbody id="deliveryResult">
                    {deliveryResultAry}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="ibm-col-2-1 m-height">
              <div class="ibm-card">
                <div class="ibm-card__content">
                  <div id="deliveryContainer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = DeliveryComponent;
