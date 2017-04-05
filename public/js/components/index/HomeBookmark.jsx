var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var ReactModal = require('react-modal');
var LinksSelectDropdown = require('./LinksSelectDropdown.jsx');
var utils = require('../utils.jsx');

var HomeBookmark = React.createClass({
  getInitialState: function() {
    return {
      showModal: true,
      linkId: '',
      linkUrl: '',
      linkLabel: '',
      link_otherLabel: '',
      isChecked: false,
      showOtherlabel: false
    }
  },
  componentDidMount:function() {
    var self = this;
    self.linkHoverHandler();
    self.setState({showModal: false});
    api.fetchTeamLinkLabels()
      .then(function(result) {
        var linkLabels = self.state.initSelectLabel;
        if (!_.isEmpty(result)) {
          var linkLabels = [{id: '-1', text: 'Select label'}];
          _.each(result, function(label) {
            linkLabels.push({id: label, text: label});
          });
          return self.setState({
            initSelectLabel: linkLabels
          });
        }
      })
      .catch(function(err){
        return console.log(err);
      });
  },
  componentDidUpdate: function(prevProps, prevState) {
    this.linkHoverHandler();
    $('.edit-bookmark svg').attr('title','Edit Bookmark').children('title').remove();
    $('.remove-bookmark svg').attr('title','Remove Bookmark').children('title').remove();
  },
  linkHoverHandler: function() {
    var self = this;
    if (self.props.loadDetailTeam.team !=null && self.props.loadDetailTeam.team.links != null && self.props.loadDetailTeam.team.links.length > 0) {
      _.each(self.props.loadDetailTeam.team.links, function(link){
        $('#'+link.id).hover(function(){
          $('#'+link.id).css('background-color','rgba(85,150,230,0.12)');
          if (self.props.loadDetailTeam.access) {
            $('#'+link.id+' > div').css('display','block');
            $('#'+link.id+' > a').css('left','4%');
            $('#'+link.id+' > span').css('left','3%');
            $('#'+link.id+' > span').css('display','block');
          }
        }, function(){
          $('#'+link.id).css('background-color','#FFFFFF');
          $('#'+link.id+' > div').css('display','none');
          $('#'+link.id+' > a').css('left','5%');
          $('#'+link.id+' > span').css('left','3%');
          $('#'+link.id+' > span').css('display','none');
        });
      });
    }
  },
  showTeamLinkModal: function(id) {
    var self = this;
    self.props.closeBookmark();
    self.setState({showModal: true});
    var defaultSelectData = self.state.initSelectLabel;
    if(id) {
      self.setState({modalTitle: 'Important Link Edit'});
      var links = self.props.loadDetailTeam.team.links;
      var linkIds1 = _.pluck(links, 'linkLabel');
      var linkIds2 = _.pluck(defaultSelectData, 'id');
      var diffLinks = _.difference(linkIds1, linkIds2);
      var selectData = [];
      var tmpselectData = [];
      var isChecked = false;
      if (diffLinks.length > 0) {
        _.each(diffLinks, function(tmp){
          tmpselectData.push({id: tmp, text: tmp});
        });
      }
      tmpselectData = defaultSelectData.concat(tmpselectData);
      var selectData = [];
      _.each(_.uniq(_.pluck(tmpselectData, 'text'), utils.toLowerCase), function(txt) {
        selectData.push(_.findWhere(tmpselectData, {text: txt}));
      });
      selectData = _.sortBy(selectData, function(item) {
        if (item.text == 'Other...') return 'zzzzz';
        else return item.text.toLowerCase();
      });
      var linkLabelOption = selectData.map(function(row, idx){
        return <option value={row.id} key={idx}>{row.text}</option>
      });
      var teamLink = self.props.loadDetailTeam.team.links.map(function(link){
        if(link.id === id) {
          var label = link.linkLabel;
          var url = link.linkUrl;
          var type = link.type;
          if(type === 'iteration') {
            isChecked = true;
          }
          $('select[name="link_label"]').val(label);
          self.setState({
            linkId: id,
            linkUrl: url,
            linkLabel: label,
            isChecked: isChecked
          });
        }
        self.setState({linkLabelOption: linkLabelOption});
      });
    } else {
      var linkLabelOption = defaultSelectData.map(function(row, idx){
        return <option value={row.id} key={idx}>{row.text}</option>
      });
      self.setState({
        linkLabelOption: linkLabelOption,
        linkId: '',
        linkUrl: '',
        linkLabel: '',
        isChecked: false,
        modalTitle: 'Important Link Add'
      });
    }
  },
  hideTeamLinkModal: function() {
    this.setState({
      showModal: false,
      showOtherlabel: false
    });
  },
  deleteTeamLink: function(id) {
    console.log('deleteTeamLink:',id);
    var self = this;
    var team_id = self.props.loadDetailTeam.team._id;
    var linkData = [];
    if (id) {
      linkData.push({id: id});
      var updateData = {
        teamId: team_id,
        links: linkData
      };
      api.deleteLink(updateData)
        .then(function(loadTeamResult) {
          var newLinkResult = loadTeamResult['links'];
          self.props.updateTeamLink(team_id, newLinkResult);
          return newLinkResult;
        })
        .catch(function(err){
          if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
            var error = err.responseJSON['error'];
            alert(error);
          } else {
            alert(err);
          }
          console.log('[deleteTeamLink] Error:', JSON.stringify(err));
        });
    }
  },
  onchangeLinkLabel: function(event) {
    var selectVal = event.target.value;
    console.log('onchangeLinkLabel selectVal:', selectVal);
    if (selectVal == 'Other...') {
      this.setState({showOtherlabel: true});
    } else {
      this.setState({showOtherlabel: false});
    }
    $('select[name="link_label"]').val(selectVal);
    this.setState({linkLabel: selectVal});
  },
  onchangeLinkUrl: function(event) {
    var value = event.target.value;
    this.setState({linkUrl: value});
  },
  saveTeamLinkModal: function(event) {
    var self = this;
    var team_id = self.props.loadDetailTeam.team._id;
    var links = self.props.loadDetailTeam.team.links;
    var link_url = $('#link_url').val().trim();
    var link_label = $('#link_label').val().trim();
    var link_type = $('#link_type').is(':checked') == true ? 'iteration': null;
    var insertmode = true;
    if (self.state.showOtherlabel) {
      var link_label = $('#link_otherlabel').val();
    }
    var link_id = self.state.linkId;
    console.log('saveTeamLinkModal..');
    console.log('current links:',links);

    var linkData = [];
    _.each(links, function(link){
      if (link && link.id === link_id){
        insertmode = false;
        var obj = {};
        obj.id = link_id;
        obj.linkLabel = link_label;
        obj.linkUrl = link_url;
        obj.type = link_type;
        linkData.push(obj);
      } else {
        var obj = {};
        obj.id = link.id;
        obj.linkLabel = link.linkLabel;
        obj.linkUrl = link.linkUrl;
        obj.type = link.type || null;
        linkData.push(obj);
      }
    });
    if (insertmode){
      var obj = {};
      obj.linkLabel = link_label;
      obj.linkUrl = link_url;
      obj.type = link_type;
      linkData.push(obj);
    }
    var updateData = {
      teamId: team_id,
      links: linkData
    };
    api.updateLink(updateData)
      .then(function(loadTeamResult) {
        var newLinkResult = loadTeamResult['links'];
        console.log('updated links:', newLinkResult);
        self.setState({showOtherlabel: false});
        self.props.updateTeamLink(team_id, newLinkResult);
        self.hideTeamLinkModal();
        return loadTeamResult;
      })
      .catch(function(err){
        if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          var error = err.responseJSON['error'];
          self.handleTeamLinksValidationErrors(error);
        } else {
          console.log('err:',err);
          if (err['statusText'] != undefined) {
            alert(err['statusText']);
          } else {
            alert(err);
          }
        }
      });
  },
  clearTeamLinkErrorField: function(errorField) {
    if (errorField == 'linkUrl') {
      $('#link_url').removeClass('ibm-field-error');
      $('#link_url_error').removeClass('ibm-alert-link');
      $('#link_url_error').html('');
    }
    if (errorField == 'linkLabel') {
      $('#select2-link_label-container').removeClass('ibm-field-error');
      $('#link_label_error').removeClass('ibm-alert-link');
      $('#link_label_error').html('');
    }
    if (errorField == 'otherLinkLabel') {
      $('#select2-link_label-container').removeClass('ibm-field-error');
      $('#link_label_error').removeClass('ibm-alert-link');
      $('#link_label_error').html('');
    }
    if (errorField == 'both') {
      $('#link_url, #select2-link_label-container, #link_otherlabel').removeClass('ibm-field-error');
      $('#link_url_error, #link_label_error, #link_otherlabel_error').removeClass('ibm-alert-link');
      $('#link_url_error, #link_label_error, #link_otherlabel_error').html('');
    }
  },
  setTeamLinkErrorField: function(errorField, errorMsg) {
    if (errorField == 'linkUrl') {
      $('#link_url').addClass('ibm-field-error');
      $('#link_url_error').addClass('ibm-alert-link');
      $('#link_url_error').html(errorMsg);
    }
    if (errorField == 'linkLabel') {
      $('#select2-link_label-container').addClass('ibm-field-error');
      $('#link_label_error').addClass('ibm-alert-link');
      $('#link_label_error').html(errorMsg);
    }
    if (errorField == 'otherLinkLabel') {
      this.clearTeamLinkErrorField('linkLabel');
      $('#link_otherlabel').addClass('ibm-field-error');
      $('#link_otherlabel_error').addClass('ibm-alert-link');
      $('#link_otherlabel_error').html(errorMsg);
    }
  },
  handleTeamLinksValidationErrors: function(err) {
    var self = this;
    console.log('handleTeamLinksValidationErrors err:', JSON.stringify(err));
    self.clearTeamLinkErrorField('both');
    err.links.forEach(function(klinkStr, iddx) {
      // check linkUrl value e.g. abcd is not a valid url.
      if (klinkStr['linkUrl']) {
        self.setTeamLinkErrorField('linkUrl', klinkStr['linkUrl']);
      }

      if (klinkStr['linkLabel']) {
        var selectValue = self.state.linkLabel;
        if (selectValue) {
          selectValue = selectValue.toLowerCase();
          if (selectValue === '-1') { // Select label
            self.setTeamLinkErrorField('linkLabel', klinkStr['linkLabel']);
          } else if (selectValue === 'other...') { // Other...
            self.setTeamLinkErrorField('otherLinkLabel', klinkStr['linkLabel']);
          } else {
            self.setTeamLinkErrorField('linkLabel', klinkStr['linkLabel']);
          }
        } else {
          self.setTeamLinkErrorField('linkLabel', klinkStr['linkLabel']);
        }
      }
    });
  },
  onchangeType: function() {
    this.setState({
      isChecked: !this.state.isChecked
    }, function() {
      console.log(this.state);
    }.bind(this));
  },
  updateStateLinkLabel: function(label) {
    console.log('updateStateLinkLabel label:', label);
    this.setState({linkLabel: label});
    if (label) {
      var label = label.toLowerCase();
      if (label == 'other...') {
        this.setState({showOtherlabel: true});
        this.clearTeamLinkErrorField('otherLinkLabel');
      } else {
        this.setState({showOtherlabel: false});
      }
    }
  },
  render: function() {
    var self = this;
    var isShowOtherlabel = self.state.showOtherlabel;
    var showOtherlabelStyle = {'display': 'none'};
    var iterSpecificLink = [];
    if (isShowOtherlabel) {
      showOtherlabelStyle = {'display': 'block'};
    }

    if (this.props.loadDetailTeam.team !=null && this.props.loadDetailTeam.team.links != null && this.props.loadDetailTeam.team.links.length > 0) {
      var teamLinks = this.props.loadDetailTeam.team.links.map(function(link){
        if (link && link.type != 'iteration') {
          var linkLabel = link.linkLabel;
          if (linkLabel && linkLabel.length > 30)
            linkLabel = linkLabel.substr(0,30)+'...';
          return (
            <div key={link.id} id={link.id}>
              <div style={{'display':'none'}}></div>
              <a href={link.linkUrl} title={link.linkUrl} target='_blank'>{linkLabel}</a>
              <span style={{'display':'none'}} class='edit-bookmark'>
                  <InlineSVG onClick={self.showTeamLinkModal.bind(null, link.id)} src={require('../../../img/Att-icons/att-icons_edit.svg')}></InlineSVG>
              </span>
              <span style={{'display':'none','marginLeft':'3%'}} class='remove-bookmark'>
                  <InlineSVG onClick={self.deleteTeamLink.bind(null, link.id)} src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
              </span>
            </div>
          );
        }
      });
      var teamIterLinks = this.props.loadDetailTeam.team.links.map(function(link){
        if (link && link.type == 'iteration') {
          iterSpecificLink.push(link);
          return (
            <div key={link.id} id={link.id}>
              <div style={{'display':'none'}}></div>
              <a href={link.linkUrl} title={link.linkUrl} target='_blank'>{link.linkLabel}</a>
              <span style={{'display':'none'}}>
                  <InlineSVG onClick={self.showTeamLinkModal.bind(null, link.id)} src={require('../../../img/Att-icons/att-icons_edit.svg')}></InlineSVG>
              </span>
              <span style={{'display':'none','marginLeft':'3%'}}>
                  <InlineSVG onClick={self.deleteTeamLink.bind(null, link.id)} src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
              </span>
            </div>
          );
        }
      });
    } else {
      teamLinks = (<div class='no-link-block'><h>No links have been added.</h></div>);
    }
    return (
      <div id='teamBookmark' class='team-bookmark-block' style={{'display':'none'}}>
        <div class='home-team-header-bookmark-arrow'>
          <InlineSVG class='home-team-header-bookmark-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
        </div>
        <div class='home-team-header-bookmark-content'>
          <div class='home-team-header-bookmark-title'>
            <h>Important Links</h>
            <div onClick={self.props.closeBookmark}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='home-team-header-bookmark-scroll'>
            {teamLinks}
            {(iterSpecificLink !== undefined && iterSpecificLink.length > 0) ? <div class='iterspecific'><span class='caption'>Iteration specific links</span></div> : ''}
            {teamIterLinks}
          </div>
          <div class='home-team-header-bookmark-btns'>
            <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'15%','right':'5%','float':'right'}}>
              <button class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.showTeamLinkModal.bind(null, null)} disabled={!self.props.loadDetailTeam.access}>Add New Link</button>
              <button class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.closeBookmark}>Cancel</button>
            </p>
          </div>
        </div>

        <ReactModal
           isOpen={this.state.showModal}
           className="att-modal"
           onRequestClose={this.hideTeamLinkModal}
           overlayClassName="att-modal-overlay"
           shouldCloseOnOverlayClick={true}
           contentLabel="Important links modal">
           <div class='modal-wrapper' style={{'minHeight':'32em', 'width':'36em'}}>
            <header role="banner" class="modal-header" aria-labelledby="x1ModalTitle">
              <h id="x1ModalTitle" class="modal-title">{self.state.modalTitle}</h>
              <div class='close-btn' onClick={self.hideTeamLinkModal}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
              </div>
            </header>
            <section aria-label="Modal body content" class="modal-body" role="main">
              <form class="ibm-row-form">
                <LinksSelectDropdown updateStateLinkLabel={self.updateStateLinkLabel} linkLabel={self.state.linkLabel} linkLabelOption={self.state.linkLabelOption} onchangeLinkLabel={self.onchangeLinkLabel} />

                <p style={showOtherlabelStyle}>
                  <label>Enter Link Name</label>
                  <span class="ibm-input-group">
                    <input name='link_otherlabel' id='link_otherlabel' type='text' class='implink' />
                    <span id='link_otherlabel_error' class='ibm-item-note'></span>
                  </span>
                </p>

                <p>
                  <label>Link URL Address</label>
                  <span>
                    <input name='link_url' id='link_url' type='text' class='implink' value={self.state.linkUrl} onChange={self.onchangeLinkUrl}/>
                    <span id='link_url_error' class='ibm-item-note'></span>
                  </span>
                </p>
                {/*
                <p class="ibm-form-elem-grp">
                  <span class="ibm-input-group">
                    <input name='link_type' id='link_type' type='checkbox' value='yes' class='ibm-styled-checkbox' checked={self.state.isChecked} onChange={self.onchangeType} /> <label for="link_type" class="lblRoman">Iteration Specific Link</label>
                  </span>
                </p>
                <input name='link_id' id='link_id' type='hidden' value='{self.state.link_id}' />
                */}
              </form>
            </section>
            <div class='clearboth'></div>
            <footer aria-label="Modal footer content" class="modal-footer" role="contentinfo">
              <button class="btn ibm-btn-pri ibm-btn-small ibm-btn-blue-50" onClick={self.saveTeamLinkModal} disabled={!self.props.loadDetailTeam.access}>Save</button>
              <button class="btn ibm-btn-sec ibm-btn-small ibm-btn-blue-50" onClick={self.hideTeamLinkModal}>Cancel</button>
            </footer>
           </div>
        </ReactModal>
      </div>
    );
  }
});

module.exports = HomeBookmark;
