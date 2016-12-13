var React = require('react');
var api = require('../api.jsx');
var teamApi = require('./TeamApi.jsx');
var utils = require('../../utils');

var LinksButtonCtl = React.createClass({
  componentDidMount: function() {
    var self = this;
    var hasAccess = self.props.selectedTeam.access;
    if (hasAccess) {
      self.showHideLinkDivOnEdit();
      self.showHideLinkDivOnAdd();
    }
  },

  showHideLinkDivOnEdit: function() {
    var self = this;
    var action = self.props.action;
    if (action == 'onEdit') {
      $('#importantLinkWrapper div.importantLinksSection').on('mouseover', function(){
        var ctr = $(this).attr('data-counter');
        var editModeLinkIds = self.props.getOnEditModeLinkIds();
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
      utils.clearFieldErrorHighlight('url_'+id);
      utils.clearFieldErrorHighlight('linklabel_'+id);
      self.props.removeOnEditModeLinkIds(id);
    }
  },

  removetmpLink: function(id, event) {
    var self = this;
    self.props.resetNumChildLinks();
    // $('#link_'+id).remove(); // dont use this
  },

  deleteLink: function(id) {
    var self = this;
    var teamId = self.props.selectedTeam['team']._id;
    var linkData = [];
    linkData.push({id: id});
    var updateData = {
      teamId: teamId,
      links: linkData
    };
    teamApi.deleteLink(updateData)
      //.then(function(result) {
      //  if (result !== undefined && result['ok'] == 1){
      //    return api.loadTeam(teamId);
      //  }
      //})
      .then(function(loadTeamResult) {
        var newLinkResult = loadTeamResult['links'];
        self.props.updateLink(teamId, newLinkResult);
        self.props.resetNumChildLinks();
        return loadTeamResult;
      })
      .catch(function(err){
        if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          var error = err.responseJSON['error'];
          alert(error);
        } else {
          alert(err);
        }
        console.log('[deleteLink] Error:', JSON.stringify(err));
      });
  },

  updateLink: function(id, event) {
    var self = this;
    var action = self.props['action'];
    var linkData = self.getLinkData();
    var teamId = self.props.selectedTeam['team']._id;
    var updateData = {
      teamId: teamId,
      links: linkData
    };
    teamApi.updateLink(updateData)
      //.then(function(result) {
      //  if (result !== undefined && result['ok'] == 1) {
      //    $('#UpdateCancelLinkGrp_'+id).hide();
      //    $('#DeleteLinkGrp_'+id).show();
      //    utils.clearLinkAndSelectFieldErrorHighlight();
      //    if (action === 'onEdit') {
      //      self.props.removeOnEditModeLinkIds();
      //    }
      //    return api.loadTeam(teamId);
      //  }
      //})
      .then(function(loadTeamResult) {
        $('#UpdateCancelLinkGrp_'+id).hide();
        $('#DeleteLinkGrp_'+id).show();
        utils.clearLinkAndSelectFieldErrorHighlight();
        if (action === 'onEdit') {
          self.props.removeOnEditModeLinkIds();
        }
        var newLinkResult = loadTeamResult['links'];
        self.props.updateLink(teamId, newLinkResult);
        self.props.resetNumChildLinks();
        return loadTeamResult;
      })
      .catch(function(err){
        if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          var error = err.responseJSON['error'];
          var result = self.handleTeamLinksValidationErrors(error);
          alert(result);
        } else {
          alert(err);
        }
        console.log('[updateLink] Error:', JSON.stringify(err));
      });
  },

  handleTeamLinksValidationErrors: function(err) {
    var self = this;
    var tmpErr = '';
    utils.clearLinkAndSelectFieldErrorHighlight();
    if (err.links) {
      err.links.forEach(function(klinkStr, iddx) {
        if (klinkStr['linkUrl'] == undefined && klinkStr['linkLabel'] == undefined){
          tmpErr = klinkStr;
        }
        // check linkUrl value e.g. abcd is not a valid url.
        if (klinkStr['linkUrl']) {
          tmpErr = tmpErr + klinkStr['linkUrl'] + '\n';
          tmp = $.trim(klinkStr['linkUrl'].split('is not a valid url.').shift());
          $('#importantLinkWrapper .implink').each(function(idx) {
            var link = $.trim($(this).val());
            var elem = $(this).attr('id');
            if (link === 'http://') {
              utils.setFieldErrorHighlight(elem);
            }
            // check if the link is empty then highlight field error
            if (link == '') {
              utils.setFieldErrorHighlight(elem);
            }
            // check if the url is not valid
            if (link === tmp) {
              utils.setFieldErrorHighlight(elem);
            }
          });
        }
        // check if the link label is valid e.g. Wall of work, Defects
        if (klinkStr['linkLabel']){
          tmpErr = tmpErr + klinkStr['linkLabel'] + '\n';
          $('#importantLinkWrapper .implabel').each(function(idx) {
            var elem = $(this).attr('id');
            var selectValue = $(this).val().toLowerCase();
            if (selectValue === '-1' || selectValue === 'other...') {
              utils.setFieldErrorHighlight(elem);
            }
          });
        }
      });
    } else if (err.error) {
      tmpErr = err.error['message'];
    }
    return tmpErr;
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
      url = utils.setPrefixHttp($(this).val().trim());
      var url = $(this).val().trim();
      urlsArray.push(url);
    });

    var linkData = [];
    for (var i=0; i<labelArray.length; i++){
      var obj = {};
      obj.id = labelId[i];
      obj._id = labelmongoId[i];
      obj.linkLabel = labelArray[i];
      obj.linkUrl = urlsArray[i];
      linkData.push(obj);
    }

    return linkData;
  },

  render: function() {
    var self = this;
    var id = self.props['data-counter'];
    var action = self.props['action'];
    var row = self.props['row'];
    var styleDisplayNone = {
      'display': 'none'
    };
    var hasAccess = self.props.selectedTeam.access;
    if (action === 'onEdit') {
      if (hasAccess) {
        return(
          <div key={id} >
            <div data-counter={id} id={'UpdateCancelLinkGrp_' + id} style={styleDisplayNone} >
              <a href='javascript:void(0)' alt='Cancel' title='Cancel' class='cancellink existlink' onClick={self.cancelLink.bind(this, id)}><img src='../img/delete-ico.png' /></a>
              <a href='javascript:void(0)' alt='Update link' title='Update link' class='updatelink existlink' onClick={self.updateLink.bind(this, id)}><img src='../img/accept-ico.png' /></a>
            </div>
            <div data-counter={id} id={'DeleteLinkGrp_' + id} style={styleDisplayNone}>
              <a href='javascript:void(0)' id={'removelink_' + id}  title='Delete the link' alt='Delete the link' class='removelink' onClick={self.deleteLink.bind(null, id)} ><img src='../img/trash-ico.svg' class='trash_icon' /></a>
            </div>
          </div>
        );
      } else {
        return null;
      }
    }

    if (action === 'onInsert') {
      if (hasAccess) {
        return(
          <div key={id} >
            <a href='javascript:void(0)' id={'tmpcancellink_' + id} alt='Cancel' title='Cancel' class='newlink' onClick={self.removetmpLink.bind(this, id)} ><img src='img/delete-ico.png'/></a>
            <a href='javascript:void(0)' id={'tmpsavelink_' + id} alt='Save link' title='Save link' class='newlink' onClick={self.updateLink.bind(this, id)} ><img src='img/accept-ico.png'/></a>
          </div>
        );
      } else {
        return null;
      }
    }
  }
});

module.exports = LinksButtonCtl;
