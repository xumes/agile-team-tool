var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var squadBtns = ['Velocity', 'Throughput', 'Deployments & Defects', 'Cycle Time', 'Team Size', 'FTE', 'Satisfaction', 'Project', 'Team Delivery', 'Operations'];
var nonSquadBtns = ['Velocity', 'Throughput', 'Deployments & Defects', 'Cycle Time', 'Team Size', 'FTE', 'Satisfaction', 'Trends', 'Evaluation'];

var HomeChartFilter = React.createClass({
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      var team = self.props.loadDetailTeam.team;
      if (team.type == 'squad') {
        var content = (
          <div class='home-chart-filter-content'>
            <div class='home-chart-filter-columns'>
              <div>Velocity</div>
              <div style={{'left':'15%'}}>Throughput</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Defects</div>
              <div style={{'left':'15%'}}>Cycle Time</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Team Size</div>
              <div style={{'left':'15%'}}>FTE</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Satisfaction</div>
              <div style={{'left':'15%'}}>Project</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Team Delivery</div>
              <div style={{'left':'15%'}}>Operations</div>
            </div>
          </div>
        )
      } else {
        content = (
          <div class='home-chart-filter-content'>
            <div class='home-chart-filter-columns'>
              <div>Velocity</div>
              <div style={{'left':'15%'}}>Throughput</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Defects</div>
              <div style={{'left':'15%'}}>Cycle Time</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Team Size</div>
              <div style={{'left':'15%'}}>FTE</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Satisfaction</div>
              <div style={{'left':'15%'}}>Trends</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div>Evaluation</div>
            </div>
          </div>
        )
      }
      return (
        <div class='home-chart-filter-block' style={{'display':'none','width':'32%','height':'400%','top':'21%'}}>
          <div class='home-chart-filter-arrow'>
            <InlineSVG class='home-chart-filter-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
          </div>
          <div class='home-chart-filter-title'>
            <h1>Filter Trends Display</h1>
            <h2 onClick={self.props.showFilter}>X</h2>
          </div>
          {content}
          <div class='home-chart-filter-btns'>
            <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'10%','right':'5%','float':'right'}}>
              <a href='#' class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Apply</a>
              <a href='#' class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'>Cancel</a>
            </p>
          </div>
        </div>
      )
    }
  }
});
module.exports = HomeChartFilter;
