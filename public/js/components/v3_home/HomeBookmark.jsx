var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var _ = require('underscore');

var HomeBookmark = React.createClass({
  render: function() {
    if (this.props.loadDetailTeam.team !=null && this.props.loadDetailTeam.team.links != null && this.props.loadDetailTeam.team.links.length > 0) {
      console.log(this.props.loadDetailTeam.team.links);
      var teamLinks = this.props.loadDetailTeam.team.links.map(function(link){
        return (
          <div key={link.id} id={link.id}>
            <h1>{link.linkLabel}</h1>
          </div>
        )
      });
    } else {
      teamLinks = null;
    }
    return (
      <div id='teamBookmark' class='team-bookmark-block'>
        <div class='home-team-header-bookmark-arrow'>
          <InlineSVG class='home-team-header-bookmark-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
        </div>
        <div class='home-team-header-bookmark-content'>
          <div class='home-team-header-bookmark-title'>
            <h>Important Links</h>
            <h1 onClick={self.showDescriptionBlock}>X</h1>
          </div>
          <div class='home-team-header-bookmark-scroll'>
            {teamLinks}
          </div>
          <div class='home-team-header-bookmark-btns'>
            <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'15%','right':'5%','float':'right'}}>
              <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50'>Add New Link</a>
              <a class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'>Cancel</a>
            </p>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeBookmark;
