var React = require('react');
var Header = require('../Header.jsx');
var IterationForm = require('./IterationForm.jsx');

var IterationPage = React.createClass({
  render: function() {
    return (
      <div>
        <Header title='Iteration management' />
        <IterationForm />
      </div>
    )
  }
});

module.exports = IterationPage;
