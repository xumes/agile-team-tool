var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeIterContent = React.createClass({
  render: function() {
    var self = this;
    if (_.isEmpty(self.props.loadDetailTeam) || self.props.loadDetailTeam.team.type != 'squad') {
      return null;
    } else {
      return (
        <div style={{'height':'100%'}}>
          <div class='home-iter-title'></div>
          <div class='home-iter-selection-block'>
            <select id='homeIterSelection'></select>
          </div>
        </div>
      )
    }
  }
});

module.exports = HomeIterContent;
