var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var LinkLabelOption = React.createClass({
  componentDidMount: function() {
    $('select[name=\'linklabel_[]\']').select2();
  },

  render: function() {
    var selectedTeam = this.props.selectedTeam.team;
    var links = selectedTeam.links;
    console.log('LinkLabelOption links:', links);
    var selectdata = [
      {id: '-1', text: 'Select label'},
      {id: 'Wall of work', text: 'Wall of work'},
      {id: 'Backlog', text: 'Backlog'},
      {id: 'Retrospectives', text: 'Retrospectives'},
      {id: 'Defects', text: 'Defects'},
      {id: 'Standup schedule', text: 'Standup schedule'},
      {id: 'Other', text: 'Other...'}
    ];
    var linkLabelOpts = selectdata.map(function(row){
      var linklabelId = row.id;
      var linklabelValue = row.text;
      return (
        <option value={linklabelId} key={linklabelId}>
          {linklabelValue}
        </option>
      );
    });    
    // var dataCounter = this.props.datacounter;
    // console.log('LinkLabelOption :', dataCounter);
  }
});

module.exports = LinkLabelOption;