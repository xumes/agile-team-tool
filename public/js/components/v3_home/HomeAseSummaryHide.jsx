var React = require('react');
var _ = require('underscore');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');

var HomeAseSummaryHide = React.createClass({
  render: function() {
    if (this.props.loadDetailTeam.type != 'squad') {
      return null;
    } else {
      return (
        <div class='home-assessment-summary-hide' style={{'display':this.props.showAseSummary?'none':'block'}}>
          <div>
            <div class='first-title'>
              <h1>Agile Maturity Overview</h1>
            </div>
            <div class='hide-show-btn' onClick={this.props.showHideAseSummary}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
            </div>
          </div>
        </div>
      )
    }
  }
});
module.exports = HomeAseSummaryHide;
