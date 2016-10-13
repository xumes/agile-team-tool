var React = require('react');
var api = require('../api.jsx');
var HomeNavTab = require('./HomeNavTab.jsx');

var HomeNav = React.createClass({
  render: function() {
    var indicateStyle = {
      'position': 'absolute',
      'fontSize': '8pt',
      'textAlign': 'right',
      'display': 'inline-block',
      'float': 'right',
      'left': '0px',
      'width': '100%',
      'top': '25px',
      'paddingBottom': '0px'
    };

    return (
      <nav class="tab-nav">
        <HomeNavTab />
        <i style={indicateStyle}>
          <i class="agile-team-squad">*</i>
            indicates squad team
        </i>
      </nav>
    )
  }
});

module.exports = HomeNav;
