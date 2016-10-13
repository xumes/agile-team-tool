var React = require('react');
var Header = require('./Header.jsx');
var HomeNav = require('./HomeNav.jsx');

var HomePage = React.createClass({
  render: function() {
    return (
      <div class="ibm-columns" >
        <div class="ibm-col-6-2">
          <HomeNav />
        </div>
        <div id="mainContent" class="ibm-col-6-4">
        </div>
      </div>
    )
  }
});
module.exports = HomePage;
