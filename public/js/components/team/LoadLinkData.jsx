var React = require('react');
var LinksButtonCtl = require('./LinksButtonCtl.jsx');
var LinksSelectDropdown = require('./LinksSelectDropdown.jsx');
var LinksUrlTextfield = require('./LinksUrlTextfield.jsx');
var utils = require('../../utils');
var _ = require('underscore');

var LoadLinkData = React.createClass({
  getInitialState: function() {
    return {
      onEditModeLinkIds: {}
    };
  },

  componentDidMount: function() {
    utils.autoAddHttp();
  },

  setOnEditModeLinkIds: function(id) {
    var self = this;
    var editedLinkIds = {};
    editedLinkIds[id] = id;
    onEditModeLinkIds = Object.assign(self.state.onEditModeLinkIds, editedLinkIds);
    //self.setState({onEditModeLinkIds: onEditModeLinkIds});
  },

  getOnEditModeLinkIds: function() {
    return this.state.onEditModeLinkIds;
  },

  removeOnEditModeLinkIds: function(id) {
    if (id !== undefined) {
      onEditModeLinkIds = this.state.onEditModeLinkIds;
      delete onEditModeLinkIds[id];
      this.setState({onEditModeLinkIds: onEditModeLinkIds});
    } else {
      this.setState({onEditModeLinkIds: {}});
    }
  },

  onEditmodeLink: function(event) {
    var id = event.target.dataset.id;
    console.log('onEditmodeLink', id);
    $('#UpdateCancelLinkGrp_'+id).show();
    $('#DeleteLinkGrp_'+id).hide();
    this.setOnEditModeLinkIds(id);
  },

  render: function() {
    var self = this;
    var teamId = self.props.selectedTeam.team._id;
    var links = self.props.selectedTeam.team.links;
    var defaultSelectData = self.props.initSelectLabel;
    var linkIds1 = _.pluck(links, 'linkLabel');
    var linkIds2 = _.pluck(defaultSelectData, 'id');
    var diffLinks = _.difference(linkIds1, linkIds2);
    var hasAccess = self.props.selectedTeam.access;
    var selectData = [];
    if (diffLinks.length > 0) {
      _.each(diffLinks, function(tmp){
        selectData.push({id: tmp, text: tmp});
      });
    }
    selectData = defaultSelectData.concat(selectData);
    var linkLabelOption = selectData.map(function(row, idx){
      return <option value={row.id} key={idx}>{row.text}</option>
    });
    var linkSection;
    if (links && links.length > 0) {
      linkSection = links.map(function(row, idx){
        var _id = row._id;
        var id = row.id;
        var selectedVal = row.linkLabel;
        var linkUrl = row.linkUrl;
        return(
          <div id={`link_${id}`} key={`linkWrapper-${id}`} data-counter={id} class='importantLinksSection'>
            {/* display dropdown select for link labels */}
            <LinksSelectDropdown key={`select-${idx}-${id}`}
              row={row}
              id={id}
              _id={_id}
              selectedVal={selectedVal}
              linkLabelOption={linkLabelOption}
              getSelectedLinkLabel={self.props.getSelectedLinkLabel}
              setSelectedLinkLabel={self.props.setSelectedLinkLabel}
              initSelectLabel={self.props.initSelectLabel}
              setOnEditModeLinkIds={self.setOnEditModeLinkIds}
              selectedTeam={self.props.selectedTeam} />

            {/* display url textfield */}
            <LinksUrlTextfield data-id={id} selectedTeam={self.props.selectedTeam}
              linkUrl={linkUrl} data-counter={idx} onEditmodeLink={self.onEditmodeLink} />

            {/* display update, cancel & delete icon button */}
            <LinksButtonCtl row={row} key={`btnctl-${idx}-${id}`}
              data-counter={id}
              action='onEdit'
              getOnEditModeLinkIds={self.getOnEditModeLinkIds}
              setOnEditModeLinkIds={self.setOnEditModeLinkIds}
              removeOnEditModeLinkIds={self.removeOnEditModeLinkIds}
              selectedTeam={self.props.selectedTeam}
              updateLink={self.props.updateLink}
              resetNumChildLinks={self.props.resetNumChildLinks} />
          </div>
        );
      });
    } else {
      linkSection = hasAccess ? '' : <span>No data available</span>;
    }

    return(
      <div>
        {linkSection}
      </div>
    );
  }
});

module.exports = LoadLinkData;
