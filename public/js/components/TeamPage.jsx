var React = require('react');
var Header = require('./Header.jsx');
var TeamForm = require('./TeamForm.jsx');

var TeamPage = React.createClass({
  render: function() {
    return (
      <div>
        <Header title="Agile Team"/>
        <TeamForm />
      </div>
    )
  }
});

module.exports = TeamPage;
