var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');
var ReactModal = require('react-modal');
var teamApi = require('./TeamApi.jsx');

var HomeBookmark = React.createClass({
  getInitialState: function() {
    return {
      showModal: true,
      linkId: '',
      linkUrl: '',
      linkLabel: '',
      isChecked: false,
      showOtherlabel: false
    }
  },
  componentDidMount:function() {
    var self = this;
    self.linkHoverHandler();
    $('.implabel').select2();
    $('.ReactModalPortal').css('display', 'none');
    $('#link_label').change(self.onchangeLinkLabel);
    teamApi.fetchTeamLinkLabels()
      .then(function(result) {
        var linkLabels = self.state.initSelectLabel;
        if (!_.isEmpty(result)) {
          console.log('res:',result);
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
    $('.implabel').select2();
  },
  linkHoverHandler: function() {
    var self = this;
    if (self.props.loadDetailTeam.team !=null && self.props.loadDetailTeam.team.links != null && self.props.loadDetailTeam.team.links.length > 0) {
      _.each(self.props.loadDetailTeam.team.links, function(link){
        $('#'+link.id).hover(function(){
          $('#'+link.id).css('background-color','rgba(85,150,230,0.12)');
          $('#'+link.id+' > div').css('display','block');
          $('#'+link.id+' > a').css('left','4%');
          $('#'+link.id+' > span').css('left','28%');
          $('#'+link.id+' > span').css('display','block');
        }, function(){
          $('#'+link.id).css('background-color','#FFFFFF');
          $('#'+link.id+' > div').css('display','none');
          $('#'+link.id+' > a').css('left','5%');
          $('#'+link.id+' > span').css('left','29%');
          $('#'+link.id+' > span').css('display','none');
        });
      });
    }
  },
  showTeamLinkModal: function(id) {
    var self = this;
    console.log('showTeamLinkModal:',id);
    // $('.implabel').select2();
    $('.ReactModalPortal').css('display', 'block');
    var defaultSelectData = self.state.initSelectLabel;
    if(id) {
      self.setState({modalTitle: 'Important Link Edit'});
      var links = self.props.loadDetailTeam.team.links;
      var linkIds1 = _.pluck(links, 'linkLabel');
      var linkIds2 = _.pluck(defaultSelectData, 'id');
      var diffLinks = _.difference(linkIds1, linkIds2);
      var selectData = [];
      var isChecked = false;
      if (diffLinks.length > 0) {
        _.each(diffLinks, function(tmp){
          selectData.push({id: tmp, text: tmp});
        });
      }
      selectData = defaultSelectData.concat(selectData);
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
          // $('select[name="link_label"]').change(self.onchangeLinkLabel);
          self.setState({linkId: id});
          self.setState({linkUrl: url});
          self.setState({linkLabel: label});
          self.setState({isChecked: isChecked});
        }
        self.setState({linkLabelOption: linkLabelOption});
      });
    } else {
      var linkLabelOption = defaultSelectData.map(function(row, idx){
        return <option value={row.id} key={idx}>{row.text}</option>
      });
      self.setState({linkLabelOption: linkLabelOption});
      self.setState({linkId: ''});
      self.setState({linkUrl: ''});
      self.setState({linkLabel: ''});
      self.setState({isChecked: false});
      self.setState({modalTitle: 'Important Link Add'});
    }
  },
  hideTeamLinkModal: function() {
    $('.implabel').select2();
    $('.ReactModalPortal').css('display', 'none');
    this.setState({showOtherlabel: false});
  },
  deleteLink: function() {
    console.log('delete...');
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
    // $('select[name="link_label"]').change(this.onchangeLinkLabel);
    this.setState({linkLabel: selectVal});
  },
  onchangeLinkUrl: function(event) {
    var value = event.target.value;
    this.setState({linkUrl: value});
  },
  saveTeamLinkModal: function(event) {
    var self = this;
    var team_id = this.props.loadDetailTeam.team._id;
    var links = this.props.loadDetailTeam.team.links;
    var link_url = $('#link_url').val();
    var link_label = $('#link_label').val();
    var link_type = $('#link_type').is(':checked') == true ? 'iteration': null;
    var insertmode = true;
    if (self.state.showOtherlabel) {
      var link_label = $('#link_otherlabel').val();
    }
    self.setState({showOtherlabel: false});
    var link_id = this.state.linkId;
    console.log('saveTeamLinkModal..');
    console.log('link_type:',link_type);
    console.log('BEFORE links:',links);

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
    console.log('updateData:',updateData);
    teamApi.updateLink(updateData)
      .then(function(loadTeamResult) {
        // $('#UpdateCancelLinkGrp_'+id).hide();
        // $('#DeleteLinkGrp_'+id).show();
        // utils.clearLinkAndSelectFieldErrorHighlight();
        // if (action === 'onEdit') {
          // self.props.removeOnEditModeLinkIds();
        // }
        var newLinkResult = loadTeamResult['links'];
        // self.props.updateLink(teamId, newLinkResult);
        // self.props.resetNumChildLinks();
        console.log('loadTeamResult:',loadTeamResult);
        console.log('newLinkResult:',newLinkResult);
        self.props.updateTeamLink(team_id, newLinkResult);
        self.hideTeamLinkModal();
        return loadTeamResult;
      })
      .catch(function(err){
        if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          var error = err.responseJSON['error'];
          // var result = self.handleTeamLinksValidationErrors(error);
          alert(result);
        } else {
          alert(err);
        }
        console.log('[updateLink] Error:', JSON.stringify(err));
      });
  },
  onchangeType: function() {
    this.setState({
      isChecked: !this.state.isChecked
    }, function() {
      console.log(this.state);
    }.bind(this));
  },
  render: function() {
    var self = this;
    var isShowOtherlabel = self.state.showOtherlabel;
    var showOtherlabelStyle = {'display': 'none'};
    if (isShowOtherlabel) {
      showOtherlabelStyle = {'display': 'block'};
    }

    if (this.props.loadDetailTeam.team !=null && this.props.loadDetailTeam.team.links != null && this.props.loadDetailTeam.team.links.length > 0) {
      var teamLinks = this.props.loadDetailTeam.team.links.map(function(link){
        if (link && link.type != 'iteration') {
          return (
            <div key={link.id} id={link.id}>
              <div style={{'display':'none'}}></div>
              <a href={link.linkUrl} title={link.linkUrl}>{link.linkLabel}</a>
              <span style={{'display':'none'}}>
                  <InlineSVG onClick={self.showTeamLinkModal.bind(null, link.id)} src={require('../../../img/Att-icons/att-icons_edit.svg')}></InlineSVG>
              </span>
              <span style={{'display':'none','marginLeft':'3%'}}>
                  <InlineSVG onClick={self.deleteLink} src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
              </span>
            </div>
          );
        }
      });

    } else {
      teamLinks = null;
    }
    return (
      <div id='teamBookmark' class='team-bookmark-block' style={{'display':'none'}}>
        <div class='home-team-header-bookmark-arrow'>
          <InlineSVG class='home-team-header-bookmark-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
        </div>
        <div class='home-team-header-bookmark-content'>
          <div class='home-team-header-bookmark-title'>
            <h>Important Links</h>
            <h1 onClick={self.props.showBookmark}>X</h1>
          </div>
          <div class='home-team-header-bookmark-scroll'>
            {teamLinks}
          </div>
          <div class='home-team-header-bookmark-btns'>
            <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'15%','right':'5%','float':'right'}}>
              <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.showTeamLinkModal.bind(null, null)}>Add New Link</a>
              <a class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.showBookmark}>Cancel</a>
            </p>
          </div>
        </div>

        <ReactModal 
           isOpen={this.state.showModal}
           className="att-modal"
           overlayClassName="att-modal-overlay"
           contentLabel="Important links modal">
            <header role="banner" class="modal-header" aria-labelledby="x1ModalTitle">
              <h3 id="x1ModalTitle" class="modal-title">{self.state.modalTitle}</h3>
              <button type="button" class="close" onClick={self.hideTeamLinkModal} aria-label="Close modal" title="Close modal">
                <span class="sr-only">Close modal</span>
                <span class="glyphicon glyphicon-xs glyphicon-remove" aria-hidden="true"></span>
              </button>
            </header>
          <section aria-label="Modal body content" class="modal-body" role="main">
            <form class="ibm-row-form">
              <p class="ibm-form-elem-grp">
                <label>Link Name</label>
                <span>
                  <select name='link_label' class='implabel' id='link_label' value={self.state.linkLabel} onChange={self.onchangeLinkLabel} >
                    {self.state.linkLabelOption}
                  </select>
                </span>
              </p>

              <p style={showOtherlabelStyle}>
                <label>Enter Link Name</label>
                <span class="ibm-input-group">
                  <input name='link_otherlabel' id='link_otherlabel' type='text' class='implink' />
                </span>
              </p>

              <p>
                <label>Link URL Address</label>
                <span>
                  <input name='link_url' id='link_url' type='text' class='implink' value={self.state.linkUrl} onChange={self.onchangeLinkUrl}/>
                </span>
              </p>

              <p class="ibm-form-elem-grp">
                <span class="ibm-input-group">
                  <input name='link_type' id='link_type' type='checkbox' value='yes' class='ibm-styled-checkbox' checked={self.state.isChecked} onChange={self.onchangeType} /> <label for="link_type" class="lblRoman">Iteration Specific Link</label>
                </span>
              </p>
              <input name='link_id' id='link_id' type='hidden' value='{self.state.link_id}' />
            </form>
          </section>
          <footer aria-label="Modal footer content" class="modal-footer" role="contentinfo">
            <button class="btn btn-primary modal-ok" onClick={self.saveTeamLinkModal} >Save</button>
            <button class="btn btn-secondary modal-close" onClick={self.hideTeamLinkModal}>Cancel</button>
          </footer>
        </ReactModal>
      </div>
    );
  }
});

module.exports = HomeBookmark;
