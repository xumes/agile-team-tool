var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var HomeAseSection = require('./HomeAseSection.jsx');
var HomeTeamInfo = require('./HomeTeamInfo.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var InlineSVG = require('svg-inline-react');

var HomeContent = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.loadDetailTeam == this.props.loadDetailTeam) {
      return false;
    } else {
      return true;
    }
  },

  handleResize: function(e) {
    $(Highcharts.charts).each(function(i,chart) {
      if (chart == null) return;
      if ($('#' + $(chart.container).attr('id')).length > 0) {
        var height = chart.renderTo.clientHeight;
        var width = chart.renderTo.clientWidth;
        chart.setSize(width, height);
      }
    });
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  render: function() {
    return (
      <div style={{'width': '100%', 'height': '100%'}}>
        <HomeSpinner id={'contentSpinner'}/>
        <div id="bodyContent" style={{'height':'100%','width':'100%'}}>
          <HomeHighlightBox />
          <HomeTeamHeader loadDetailTeam={this.props.loadDetailTeam} selectedTeamChanged={this.props.selectedTeamChanged} tabClickedHandler={this.props.tabClickedHandler}/>
          <div class='home-trends-block'>
            <div class='home-trends-block-title'>
              <h1>Trends</h1>
              <span></span>
              <h4>&nbsp;/&nbsp;</h4>
              <h4 style={{'color':'#FFA501'}}>---</h4>
              <h4>&nbsp;Partial data</h4>
              <div>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              </div>
            </div>
            <HomeIterSection loadDetailTeam={this.props.loadDetailTeam}/>
            <HomeAseSection loadDetailTeam={this.props.loadDetailTeam}/>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeContent;
