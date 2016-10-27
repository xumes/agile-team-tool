var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var HomeAseSection = require('./HomeAseSection.jsx');
var HomeTeamInfo = require('./HomeTeamInfo.jsx');

var HomeContent = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.selectedTeam == this.props.selectedTeam) {
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
      <div>
        <HomeSpinner id={'contentSpinner'}/>
        <div id="bodyContent" class="ibm-col-6-4">
          <HomeHighlightBox />
          <HomeTeamHeader selectedTeam={this.props.selectedTeam}/>
          <HomeIterSection selectedTeam={this.props.selectedTeam}/>
          <HomeAseSection selectedTeam={this.props.selectedTeam}/>
          <HomeTeamInfo selectedTeam={this.props.selectedTeam}/>
        </div>
      </div>
    )
  }
});

module.exports = HomeContent;
