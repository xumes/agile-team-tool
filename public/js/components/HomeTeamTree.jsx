var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var _ = require('underscore');

var HomeTeamTree = React.createClass({
  render: function() {
    console.log('n:',this.props.newTeams);
    if (_.isUndefined(this.props.newTeams.teams)) {
      return(
        <HomeSpinner spinnerHide={'block'}/>
      )
    } else {
      return (
        <div id='searchTree'>
        </div>
      )
    }
  }
});

module.exports = HomeTeamTree;
