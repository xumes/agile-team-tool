var React = require('react');
var api = require('../api.jsx');

var HomeSearchField = React.createClass({


  render: function() {
    return (
      <div>
        <input type="search" name="homeSearchField" />
      </div>
    )

  }
});

module.exports = HomeSearchField;
