var React = require('react');

var ProjectComponent = React.createClass({

  render: function() {
    var resultBodyAry = this.props.resultBodyAry;
    return (
      <div data-widget="showhide" data-type="panel" class="ibm-show-hide ibm-widget-processed" id="colContainer">
        <h2 class="agile-summary" data-open="true" id="assessId_0"></h2>
        <div class="ibm-container-body" id="assessContainer_0">
          <div class="ibm-columns">
            <div class="ibm-col-2-1">
              <div class="ibm-card">
                <div class="ibm-card__content">
                  <table class="ibm-data-table ibm-altrows" summary="__REPLACE_ME__" id="colTable" width="90%">
                    <thead>
                      <tr>
                        <th>Practice</th>
                        <th>Current</th>
                        <th>Target</th>
                        <th id="resultIndAsses">Ind Assess</th>
                      </tr>
                    </thead>
                    <tbody id="resultBody">
                      {resultBodyAry}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="ibm-col-2-1 m-height">
              <div class="ibm-card">
                <div class="ibm-card__content">
                  <div id="container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProjectComponent;
