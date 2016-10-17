var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');

var HomeNav = React.createClass({
  getInitialState: function() {
    return {
      spinnerHide: 'none',
    }
  },

  searchChangeHandler: function(searchTeams) {
    console.log('search:',searchTeams);
  },

  render: function() {
    var spinnerStyle = {
      'display': this.state.spinnerHide
    };
    return (
      <div>
        <HomeNavTab sendSearchTeams={this.searchChangeHandler}/>
        <HomeSpinner style={spinnerStyle}/>
      </div>
    )
  }
});

module.exports = HomeNav;
