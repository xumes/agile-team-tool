var React = require('react');
var api = require('../api.jsx');

var LinksButtonCtl = React.createClass({
  showHideLinkDivOnCancel: function() {
    var self = this;
    var action = self.props.action;
    // console.log('LinksButtonCtl action:',action);
    if (action == 'onEdit') {
      $('#importantLinkWrapper div.importantLinksSection').on('mouseover', function(){
        var ctr = $(this).attr('data-counter');
        var editModeLinkIds = self.props.getOnEditModeLinkIds();
        // console.log('LinksButtonCtl showHideLinkDivOnCancel editModeLinkIds:',editModeLinkIds)
          if ((editModeLinkIds !== undefined) && (editModeLinkIds[ctr] === ctr)) {
            $('#UpdateCancelLinkGrp_'+ctr).show();
          }
          if ((editModeLinkIds !== undefined) && (editModeLinkIds[ctr] === undefined) 
            || (editModeLinkIds !== undefined && editModeLinkIds[ctr] !== ctr) ) {
            $('#DeleteLinkGrp_'+ctr).show();
          }
      });
      $('#importantLinkWrapper div.importantLinksSection').on('mouseout', function(){
        var ctr = $(this).attr('data-counter');
        var editModeLinkIds = self.props.getOnEditModeLinkIds();
        // if (editModeLinkIds) console.log('mouseout editModeLinkIds[ctr]:',editModeLinkIds[ctr])
        $('#DeleteLinkGrp_'+ctr).hide();
        $('#UpdateCancelLinkGrp_'+ctr).hide();
      });
    }
  },

  showHideLinkDivOnAdd: function() {
    $('#importantLinkWrapper div.importantLinksSection').on('mouseover', function(){
      var ctr = $(this).attr('data-counter');
      $('#tmpcancellink_'+ctr).show();
      $('#tmpsavelink_'+ctr).show();
    });
    $('#importantLinkWrapper div.importantLinksSection').on('mouseout', function(){
      $('.newlink').hide();
    });
  },

  cancelLink: function(id, event) {
    var self = this;
    var row = self.props['row'];
    if (row !== undefined && row['id'] !== undefined && row['id'] === id) {
      var currentUrl = row['linkUrl'];
      var currentLabel = row['linkLabel'];
      $('#url_'+id).val(currentUrl);
      $('#linklabel_'+id).val(currentLabel);
      $('#select2-linklabel_' + id + '-container').text(currentLabel);
      // on cancel lets hide the update/cancel and show the delete icon
      $('#UpdateCancelLinkGrp_'+id).hide();
      $('#DeleteLinkGrp_'+id).show();
      self.props.removeOnEditModeLinkIds(id);
    }
  },

  componentDidMount: function() {
    var self = this;
    self.showHideLinkDivOnCancel();
    self.showHideLinkDivOnAdd();
  },

  removetmpLink: function(id, event) {
    var self = this;
    self.props.resetNumChildLinks();
    // $('#link_'+id).remove(); // dont use this
  },

  deleteLink: function(event, id) {
    var self = this;
    var teamId = self.props.selectedTeam['team']._id;
    var linkData = [];
    linkData.push({id: id});
    var updateData = {
      teamId: teamId,
      links: linkData
    };
    api.deleteLink(updateData)
      .then(function(result) {
        if (result !== undefined && result['ok'] == 1){
          return api.loadTeam(teamId);
        }
      })
      .then(function(loadTeamResult) {
        var newLinkResult = loadTeamResult['links'];
        self.props.updateLink(teamId, newLinkResult);
        self.props.resetNumChildLinks();
        return loadTeamResult;
      })
      .catch(function(err){
        console.log('err:', JSON.stringify(err));
        return null;
      });
  },

  updateLink: function(id, event) {
    var self = this;
    var action = self.props['action'];
    // console.log('updateLink action:', action);
    $('#UpdateCancelLinkGrp_'+id).hide();
    $('#DeleteLinkGrp_'+id).show();
    if (action === 'onEdit') {
      self.props.removeOnEditModeLinkIds();
    }
    var linkData = self.getLinkData();
    console.log('updateLink linkData:', JSON.stringify(linkData) );
    var teamId = self.props.selectedTeam['team']._id;
    var updateData = {
      teamId: teamId,
      links: linkData
    };
    api.updateLink(updateData)
      .then(function(result) {
        // console.log('api.updateLink result:',result);
        if (result !== undefined && result['ok'] == 1){
          return api.loadTeam(teamId);
        }
      })
      .then(function(loadTeamResult) {
        var newLinkResult = loadTeamResult['links'];
        self.props.updateLink(teamId, newLinkResult);
        self.props.resetNumChildLinks();
        return loadTeamResult;
      })
      .catch(function(err){
        console.log('err:', JSON.stringify(err));
        return null;
      });
  },

  getLinkData: function() {
    var self = this;
    var labelArray = [];
    $('.importantLinksSection option:selected').each(function(){
      var labelStr = $(this).text().trim();
      labelArray.push(labelStr);
    });

    var labelId = [];
    var labelmongoId = [];
    $('.implabel').each(function(){
      var labelID = $(this).attr('data-id');
      var labelmongoID = $(this).attr('data-mongo-id');
      labelId.push(labelID);
      labelmongoId.push(labelmongoID);
    });

    var urlsArray = [];
    $('.importantLinksSection input[type="text"]').each(function(){
      url = self.setPrefixHttp($(this).val().trim());
      var url = $(this).val().trim();
      urlsArray.push(url);
    });

    var linkData = [];
    for (i=0; i<labelArray.length; i++){
      var obj = {};
      obj.id = labelId[i];
      obj._id = labelmongoId[i];
      obj.linkLabel = labelArray[i];
      obj.linkUrl = urlsArray[i];
      linkData.push(obj);
    }

    return linkData;
  },

  setPrefixHttp: function(url) {
    console.log('setPrefixHttp url:',url)
    var pattern = /^((http|https):\/\/)/;
    if (!pattern.test(url)) {
      url = 'http://' + url;
    }
    return url;
  },

  render: function() {
    var self = this;
    var id = self.props['data-counter'];
    var action = self.props['action'];
    var row = self.props['row'];
    var styleDisplayNone = {
      'display': 'none'
    };

    if (action === 'onEdit') {
      return(
        <div key={id} >
          <div data-counter={id} id={`UpdateCancelLinkGrp_${id}`} style={styleDisplayNone} >
            <a href='javascript:void(0)' alt='Cancel' title='Cancel' class='cancellink existlink' onClick={self.cancelLink.bind(this, id)}><img src='../img/delete-ico.png' /></a>
            <a href='javascript:void(0)' alt='Update link' title='Update link' class='updatelink existlink' onClick={self.updateLink.bind(this, id)}><img src='../img/accept-ico.png' /></a>
          </div>
          <div data-counter={id} id={`DeleteLinkGrp_${id}`} style={styleDisplayNone}>
            <a href='javascript:void(0)' id={`removelink_${id}`}  title='Delete the link' alt='Delete the link' class='removelink' onClick={(event) => self.deleteLink(event, id)} ><img src='../img/trash-ico.svg' class='trash_icon' /></a>
          </div>
        </div>
      );
    }

    if (action === 'onInsert') {
      return(
        <div key={id} >
          <a href='javascript:void(0)' id={`tmpcancellink_${id}`} alt='Cancel' title='Cancel' class='newlink' onClick={self.removetmpLink.bind(this, id)} ><img src='img/delete-ico.png'/></a>
          <a href='javascript:void(0)' id={`tmpsavelink_${id}`} alt='Save link' title='Save link' class='newlink' onClick={self.updateLink.bind(this, id)} ><img src='img/accept-ico.png'/></a>
        </div>
      );
    }
  }
});

module.exports = LinksButtonCtl;
