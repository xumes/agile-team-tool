var React = require('react');
var ReactDOM = require('react-dom');

var TeamDropdownParent = React.createClass({
  componentDidUpdate: function() {
    this.refs.selectDropDown.disabled = !this.props.selectableParentTeams.access;
    $('#parentSelectList').val(this.props.selectableParentTeams.currentParentId).change();
  },
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.selectDropDown).select2();
    $(this.refs.selectDropDown).change(this.props.parentChangeHandler);
  },
  render: function() {
    var self = this;
    var teamSelectListStyle = {
      'width': '400px'
    };
    if (this.props.selectableParentTeams.selectableParents.length <= 0 || this.props.selectableParentTeams.selectableParents == undefined) {
      var populateTeamNames = null;
    } else {
      var populateTeamNames = this.props.selectableParentTeams.selectableParents.map(function(item) {
        return (
          <option key={item._id} value={item._id}>{item.name}</option>
        )
      });
    }
    return (
      <select id='parentSelectList' name='parentSelectList' style={teamSelectListStyle} ref='selectDropDown' disabled={!this.props.selectableParentTeams.access} >
        <option key='' value=''>No parent team</option>
        {populateTeamNames}
      </select>
    )
  }
});

module.exports = TeamDropdownParent;
