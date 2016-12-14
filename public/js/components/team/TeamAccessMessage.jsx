var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamAccessMessage = React.createClass({
  render: function() {
    var accessStyle = {
      'display': !_.isEmpty(this.props.selectedTeam) && !this.props.selectedTeam.access ? 'block' : 'none',
      'marginLeft': '650px'
    };

    return (
      <div class="agile-read-only-status ibm-item-note-alternate" style={accessStyle}>
        You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team).
      </div>
    )
  }
});

module.exports = TeamAccessMessage;
