var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');

var HomeBookmark = React.createClass({
  componentDidMount:function() {
    this.linkHoverHandler();
  },
  componentDidUpdate: function() {
    this.linkHoverHandler();
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
  render: function() {
    var self = this;
    if (this.props.loadDetailTeam.team !=null && this.props.loadDetailTeam.team.links != null && this.props.loadDetailTeam.team.links.length > 0) {
      console.log(this.props.loadDetailTeam.team.links);
      var teamLinks = this.props.loadDetailTeam.team.links.map(function(link){
        return (
          <div key={link.id} id={link.id}>
            <div style={{'display':'none'}}></div>
            <a href={link.linkUrl} title={link.linkUrl}>{link.linkLabel}</a>
            <span style={{'display':'none'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_edit.svg')}></InlineSVG>
            </span>
            <span style={{'display':'none','marginLeft':'3%'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
            </span>
          </div>
        )
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
              <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Add New Link</a>
              <a class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.showBookmark}>Cancel</a>
            </p>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeBookmark;
