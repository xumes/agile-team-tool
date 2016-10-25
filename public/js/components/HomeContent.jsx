var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var _ = require('underscore');

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
        <HomeHighlightBox />
        <div id='mainContent' class='ibm-col-6-4'>
          <HomeTeamHeader selectedTeam={this.props.selectedTeam}/>
          <HomeIterSection selectedTeam={this.props.selectedTeam}/>
        </div>
      </div>
    )
  }
});

module.exports = HomeContent;
