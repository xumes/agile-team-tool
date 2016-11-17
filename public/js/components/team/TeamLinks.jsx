var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var LoadLinkData = require('./LoadLinkData.jsx');
var AddNewLinks = require('./AddNewLinks.jsx');

var TeamLinks = React.createClass({
  getInitialState: function() {
    return {
      numChildLinks: 0
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

  render: function() {
    var self = this;
    if (this.props.selectedTeam.team != undefined) {
      return (
        <div class='ibm-show-hide ibm-widget-processed' id='teamLinkSection'>
          <h2 class='ibm-bold ibm-h4'>
            <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={()=>self.props.showHideSection('teamLinkSection')}>
              Important Links
            </a>
          </h2>
          <div class="ibm-container-body" id="importantLinks" style={{'display':'none'}}>
            <div id="importantLinkWrapper">
              <LoadLinkData selectedTeam={self.props.selectedTeam}
                initSelectLabel={self.props.initSelectLabel}
                updateLink={self.props.updateLink}
                resetNumChildLinks={self.resetNumChildLinks}
                updateSelectLabel={self.props.updateSelectLabel}
                getSelectedLinkLabel={self.props.getSelectedLinkLabel}
                setSelectedLinkLabel={self.props.setSelectedLinkLabel} />

              <AddNewLinks selectedTeam={self.props.selectedTeam}
                getNumChildLinks={self.getNumChildLinks}
                initSelectLabel={self.props.initSelectLabel}
                updateLink={self.props.updateLink}
                resetNumChildLinks={self.resetNumChildLinks}
                getSelectedLinkLabel={self.props.getSelectedLinkLabel}
                setSelectedLinkLabel={self.props.setSelectedLinkLabel} />
            </div>
            <div class="addlinkWrapper">
              <a href="javascript:void(0)" onClick={self.addNewLinkClickHandler} class="add_link">&nbsp;Add a link...</a>
            </div>
          </div>
        </div>
      )
    } else {
      return null;
    }
  }
});

module.exports = TeamLinks;
