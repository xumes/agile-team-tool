var React = require('react');
var Header = require('./Header.jsx');

var HomePage = React.createClass({
  render: function() {
    return (
      <div>
        <Header title="home"/>
      </div>
    )
  }
});
module.exports = HomePage;
