var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');

var AssessmentSummaryTable = React.createClass({
  render: function() {
    var self = this;
    if (!_.isEmpty(self.props.componentResult)) {
      var components = self.props.componentResult.assessedComponents.map(function(component, idx){
        return (
          <div key={'component-block_' + idx} class='component-block'>
            <div style={{'width':'70%'}}>
              <h1>{component.practiceName}</h1>
            </div>
            <div style={{'width':'15%'}}>
              <h2>{component.currentScore}</h2>
            </div>
            <div style={{'width':'15%'}}>
              <h2>{component.targetScore}</h2>
            </div>
          </div>
        )
      });
      return (
        <div class='agile-summary' id={'assessmentContainer' + self.props.componentId}>
          <div class='agile-summary-table'>
            <div class='header-title'>
              <h1 style={{'width':'70%'}}>{'Practice'}</h1>
              <h1 style={{'width':'15%'}}>{'Current'}</h1>
              <h1 style={{'width':'15%'}}>{'Target'}</h1>
            </div>
            <div class='component-block'>
              <div style={{'width':'70%'}}>
                <h1>{'Overall'}</h1>
              </div>
              <div style={{'width':'15%'}}>
                <h2>{self.props.componentResult.currentScore}</h2>
              </div>
              <div style={{'width':'15%'}}>
                <h2>{self.props.componentResult.targetScore}</h2>
              </div>
            </div>
            {components}
          </div>
        </div>
      )
    } else {
      return null;
    }
  }
});

module.exports = AssessmentSummaryTable;
