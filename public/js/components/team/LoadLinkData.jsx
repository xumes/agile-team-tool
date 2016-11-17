var React = require('react');
var LinksButtonCtl = require('./LinksButtonCtl.jsx');
var LinksSelectDropdown = require('./LinksSelectDropdown.jsx');
var _ = require('underscore');

var LoadLinkData = React.createClass({
  getInitialState: function() {
    return {
      onEditModeLinkIds: {}
    };
  },

  setOnEditModeLinkIds: function(id) {
    var self = this;
    var editedLinkIds = {};
    editedLinkIds[id] = id;
    onEditModeLinkIds = Object.assign(self.state.onEditModeLinkIds, editedLinkIds);
    // console.log('setOnEditModeLinkIds onEditModeLinkIds:',onEditModeLinkIds)
    self.setState({onEditModeLinkIds: onEditModeLinkIds});
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
    var updatedlinkUrl = event.target.value;
    // console.log('onEditmodeLink id:',id, ' updatedlinkUrl:',updatedlinkUrl)
    $('#UpdateCancelLinkGrp_'+id).show();
    $('#DeleteLinkGrp_'+id).hide();
    this.setOnEditModeLinkIds(id);
  },

  render: function() {
    var self = this;
    var teamId = self.props.selectedTeam.team._id;
    var links = self.props.selectedTeam.team.links;
    var defaultSelectData = self.props.initSelectLabel;
    // console.log('LoadLinkData render BEFORE initSelectLabel:',JSON.stringify(defaultSelectData))
    var linkIds1 = _.pluck(links, 'linkLabel');
    var linkIds2 = _.pluck(defaultSelectData, 'id');
    var diffLinks = _.difference(linkIds1, linkIds2);
    var selectData = [];
    if (diffLinks.length > 0) {
      _.each(diffLinks, function(tmp){
        selectData.push({id: tmp, text: tmp});
      });
    }
    selectData = defaultSelectData.concat(selectData);
    // console.log('LoadLinkData render AFTER initSelectLabel:',JSON.stringify(selectData))
    // console.log('LoadLinkData render diffLinks:', JSON.stringify(diffLinks))
    var linkLabelOption = selectData.map(function(row, idx){
      return <option value={row.id} key={idx}>{row.text}</option>
    });
    var styleRemoveLink = {'display': 'none'};
    var linkSection = links.map(function(row, idx){
      var _id = row._id;
      var id = row.id;
      var selectedVal = row.linkLabel;
      var linkUrl = row.linkUrl;
      return(
        <div id={`link_${id}`} key={_id} data-counter={id} class='importantLinksSection'>
          {/* display dropdown select for link labels */}
          <LinksSelectDropdown
            row={row}
            id={id}
            _id={_id}
            selectedVal={selectedVal}
            linkLabelOption={linkLabelOption}
            getSelectedLinkLabel={self.props.getSelectedLinkLabel}
            setSelectedLinkLabel={self.props.setSelectedLinkLabel}
            updateSelectLabel={self.props.updateSelectLabel}
            initSelectLabel={self.props.initSelectLabel}
            setOnEditModeLinkIds={self.setOnEditModeLinkIds} />

          <div>{/* display url textfield */}
            <input type='text' name='url_[]' id={`url_${id}`}
              data-id={id} defaultValue={linkUrl}
              placeholder='URL' size='60' 
              onChange={(event) => self.onEditmodeLink(event) }/>
          </div>

          {/* display update, cancel & delete icon button */}
          <LinksButtonCtl row={row}
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

    return(
      <div>
        {linkSection}
      </div>
    );
  }
});

module.exports = LoadLinkData;
