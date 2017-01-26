var React = require('react');
var api = require('../api.jsx');

var HomeSnapshotPull = React.createClass({
  render: function() {
    return (
      <p class='ibm-ind-link' style={{'float': 'right', 'display': 'none'}} id='snapshotPull'>
      <a class='ibm-refresh-link' href='#' id='refreshData' style={{'float': 'right'}} title='refreshData'
       onClick={this.props.refreshSnapshot} >
        <label style={{'float': 'right','fontSize': '0pt'}}>Refresh</label>
      </a>
      Data as of:&nbsp;<label id='refreshDate'>Last update date</label>&nbsp;&nbsp;
      </p>
    )
  }
});

module.exports = HomeSnapshotPull;
