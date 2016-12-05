var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var HomeAseSection = require('./HomeAseSection.jsx');
var HomeTeamInfo = require('./HomeTeamInfo.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');

var HomeContent = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.loadDetailTeam == this.props.loadDetailTeam) {
      return false;
    } else {
      return true;
    }
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function() {
  },
  render: function() {
    return (
      <div style={{'width': '100%', 'height': '100%'}}>
        <HomeSpinner id={'contentSpinner'}/>
        <div id="bodyContent" style={{'height':'100%','width':'100%'}}>
          <HomeHighlightBox />
          <HomeTeamHeader loadDetailTeam={this.props.loadDetailTeam}/>
          <HomeIterSection loadDetailTeam={this.props.loadDetailTeam}/>
          <HomeAseSection loadDetailTeam={this.props.loadDetailTeam}/>
          <HomeTeamInfo loadDetailTeam={this.props.loadDetailTeam} selectedTeamChanged={this.props.selectedTeamChanged} tabClickedHandler={this.props.tabClickedHandler}/>
          <HomeMemberTable loadDetailTeam={this.props.loadDetailTeam}/>
        </div>
      </div>
    )
  }
});

module.exports = HomeContent;
