var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var squadBtns = ['Velocity', 'Throughput', 'Deployments & Defects', 'Cycle Time', 'Team Size', 'FTE', 'Satisfaction', 'Project', 'Team Delivery', 'Operations'];
var nonSquadBtns = ['Velocity', 'Throughput', 'Deployments & Defects', 'Cycle Time', 'Team Size', 'FTE', 'Satisfaction', 'Trends', 'Evaluation'];
var squadBtns = {
  'velocity': true,
  'throuthput': true,
  'defects': true,
  'wipBacklog': true,
  'pizza': true,
  'unitCost': true,
  'prj':true,
  'ops':true,
  'devops':true
}

var HomeChartFilter = React.createClass({
  showSec: function(id) {
    if ($('#'+id+'Chart_block').css('display') == 'none') {
      $('#'+id+'Chart_block').fadeIn();
      $('#'+id+'ChartBtn').removeClass('home-chart-filter-unselected');
      $('#'+id+'ChartBtn').addClass('home-chart-filter-selected');
    } else {
      $('#'+id+'Chart_block').fadeOut();
      $('#'+id+'ChartBtn').removeClass('home-chart-filter-selected');
      $('#'+id+'ChartBtn').addClass('home-chart-filter-unselected');
    }

  },
  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      var team = self.props.loadDetailTeam.team;
      if (team.type == 'squad') {
        // var content = Object.keys(squadBtns).map(function(key){
        //
        // });
        var content = (
          <div class='home-chart-filter-content'>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected' id='velocityChartBtn' onClick={()=>this.showSec('velocity')}>Velocity</div>
              <div class='home-chart-filter-selected' id='throughputChartBtn' onClick={()=>this.showSec('throughput')} style={{'left':'15%'}}>Throughput</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected' id='defectsChartBtn' onClick={()=>this.showSec('defects')}>Defects</div>
              <div class='home-chart-filter-selected' id='wipBacklogChartBtn' onClick={()=>this.showSec('wipBacklog')} style={{'left':'15%'}}>Cycle Time</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected' id='pizzaChartBtn' onClick={()=>this.showSec('pizza')}>Team Size</div>
              <div class='home-chart-filter-selected' id='unitCostChartBtn' onClick={()=>this.showSec('unitCost')} style={{'left':'15%'}}>FTE</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected' id='statisfactionChartBtn' onClick={()=>this.showSec('statisfaction')}>Satisfaction</div>
              <div class='home-chart-filter-selected' id='prjChartBtn' id=''onClick={()=>this.showSec('prj')} style={{'left':'15%'}}>Project</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected' id='devopsChartBtn' onClick={()=>this.showSec('devops')}>Team Delivery</div>
              <div class='home-chart-filter-selected' id='opsChartBtn' onClick={()=>this.showSec('ops')} style={{'left':'15%'}}>Operations</div>
            </div>
          </div>
        )
      } else {
        content = (
          <div class='home-chart-filter-content'>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected'>Velocity</div>
              <div class='home-chart-filter-selected' style={{'left':'15%'}}>Throughput</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected'>Defects</div>
              <div class='home-chart-filter-selected' style={{'left':'15%'}}>Cycle Time</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected'>Team Size</div>
              <div class='home-chart-filter-selected' style={{'left':'15%'}}>FTE</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected'>Satisfaction</div>
              <div class='home-chart-filter-selected' style={{'left':'15%'}}>Trends</div>
            </div>
            <div class='home-chart-filter-columns'>
              <div class='home-chart-filter-selected'>Evaluation</div>
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
