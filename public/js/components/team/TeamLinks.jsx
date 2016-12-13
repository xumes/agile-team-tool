var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var LoadLinkData = require('./LoadLinkData.jsx');
var AddNewLinks = require('./AddNewLinks.jsx');
var teamApi = require('./TeamApi.jsx');

var TeamLinks = React.createClass({
  getInitialState: function() {
    return {
      numChildLinks: 0,
      initSelectLabel: [
        {id: '-1', text: 'Select label'},
        {id: 'Wall of work', text: 'Wall of work'},
        {id: 'Backlog', text: 'Backlog'},
        {id: 'Retrospectives', text: 'Retrospectives'},
        {id: 'Defects', text: 'Defects'},
        {id: 'Standup schedule', text: 'Standup schedule'},
        {id: 'Other...', text: 'Other...'}
      ],
    }
  },

  componentDidMount: function() {
    var self = this;
    teamApi.fetchTeamLinkLabels()
      .then(function(result) {
        var linkLabels = self.state.initSelectLabel;
        if (!_.isEmpty(result)) {
          var linkLabels = [{id: '-1', text: 'Select label'}];
          _.each(result, function(label) {
            linkLabels.push({id: label, text: label});
          });
          return self.setState({
            initSelectLabel: linkLabels
          })
        }
      })
      .catch(function(err){
        return console.log(err);
      });
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps['selectedTeam'].team !== undefined) {
      var curteamId = this.props.selectedTeam && this.props.selectedTeam.team ? this.props.selectedTeam.team._id : '';
      var teamId = prevProps['selectedTeam'].team._id;
      if (curteamId !== teamId) {
        this.setState({numChildLinks: 0});
      }
    }
  },

  resetNumChildLinks: function() {
    var ctr = 0;
    if (this.state.numChildLinks != 0) {
      var ctr = this.state.numChildLinks - 1;
    }
    this.setState({numChildLinks: ctr});
  },

  addNewLinkClickHandler: function(event) {
    this.setState({
      numChildLinks: this.state.numChildLinks + 1
    });
  },

  getNumChildLinks: function() {
    return this.state.numChildLinks;
  },

  showHideSection: function() {
    this.props.showHideSection('teamLinkSection');
  },

  render: function() {
    var self = this;
    if (this.props.selectedTeam.team != undefined) {
      return (
        <div class='ibm-show-hide ibm-widget-processed' id='teamLinkSection'>
          <h2 class='ibm-bold ibm-h4'>
            <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={self.showHideSection}>
              Important Links
            </a>
          </h2>
          <div class="ibm-container-body" id="importantLinks" style={{'display':'none'}}>
            <div id="importantLinkWrapper">
              <LoadLinkData selectedTeam={self.props.selectedTeam}
                initSelectLabel={self.state.initSelectLabel}
                updateLink={self.props.updateLink}
                resetNumChildLinks={self.resetNumChildLinks}
                getSelectedLinkLabel={self.props.getSelectedLinkLabel}
                setSelectedLinkLabel={self.props.setSelectedLinkLabel} />

              <AddNewLinks selectedTeam={self.props.selectedTeam}
                getNumChildLinks={self.getNumChildLinks}
                initSelectLabel={self.state.initSelectLabel}
                updateLink={self.props.updateLink}
                resetNumChildLinks={self.resetNumChildLinks}
                getSelectedLinkLabel={self.props.getSelectedLinkLabel}
                setSelectedLinkLabel={self.props.setSelectedLinkLabel} />
            </div>
            {this.props.selectedTeam.access &&
            <div class="addlinkWrapper">
              <a href="javascript:void(0)" onClick={self.addNewLinkClickHandler} class="add_link">&nbsp;Add a link...</a>
            </div>
            }
          </div>
        </div>
      )
    } else {
      return null;
    }
  }
});

module.exports = TeamLinks;
