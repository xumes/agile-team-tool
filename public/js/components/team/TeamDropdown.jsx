var _ = require('underscore');
var React = require('react');
var api = require('../api.jsx');
var ReactDOM = require('react-dom');

var TeamDropdown = React.createClass({
  getInitialState: function() {
    return {
      teamNames: []
    }
  },
  componentDidMount: function() {
    var self = this;
    self.getTeamNames();
    // Use IBM's bundled select2 package
    $(self.refs.teamSelectList).select2();
    $(self.refs.teamSelectList).change(this.props.teamChangeHandler);
  },
  getTeamNames: function() {
    var self = this;
    return api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });
  },
  componentWillReceiveProps: function(newProps) {
    this.getTeamNames();
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (_.isEqual(this.props.defaultTeam, 'delete'))
      this.refs.teamSelectList.value = 'new';
    else
      this.refs.teamSelectList.value = this.props.defaultTeam;
    $(this.refs.teamSelectList).select2();
  },
  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamSelectListStyle = {
      'width': '400px'
    };
    var populateTeamNames = this.state.teamNames.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });
    return (
      <p>
        <label style={labelStyle} for='teamSelectList'>Create or select an existing team:<span class="ibm-required">*</span></label>
          <span>
            <select defaultValue={this.props.defaultTeam} id="teamSelectList"  name="teamSelectList" ref='teamSelectList' style={teamSelectListStyle} >
              <option value="new">Create new...</option>
              {populateTeamNames}
            </select>
         </span>
      </p>
    )
  }
});

module.exports = TeamDropdown;
