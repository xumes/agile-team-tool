var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');

var HomeContent = React.createClass({
  render: function() {
    console.log(this.props.selectedTeam);
    return (
      <div>
        <HomeSpinner spinnerHide={'none'}/>
      </div>
    )
  }
});

module.exports = HomeContent;
