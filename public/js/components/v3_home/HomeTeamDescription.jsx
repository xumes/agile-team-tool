var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');

var HomeTeamDescription = React.createClass({
  componentDidMount: function() {
    this.updatePosition();
  },
  componentDidUpdate: function() {
    this.updatePosition();
  },
  updatePosition: function() {
    var self = this;
    setTimeout(function(){
      if (self.props.teamName.length > 35) {
        var divLength = $('#homeHeaderDesBtn').position().left/$('.home-team-header').width() * 100 + 10 + '%';
      } else {
        divLength = $('#homeHeaderDesBtn').position().left/$('.home-team-header').width() * 100 + 6 + '%';
      }
      $('.home-team-header-description-div').css('left', divLength);
    },1000);
  },
  render: function() {
    var self = this;
    return (
      <div class='home-team-header-description-div' style={{'display':'none'}}>
        <div class='home-team-header-description-arrow'>
          <InlineSVG class='home-team-header-description-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
        </div>
        <div class='home-team-header-description-title'>
          <h>Team Description</h>
          <h1 onClick={self.props.showDescriptionBlock}>X</h1>
        </div>
        <div class='home-team-header-description-content'>
          <div>
            <h1>
              {self.props.teamName}
            </h1>
            <p>
              {self.props.teamDescription}
            </p>
          </div>
          <button type='button' class='ibm-btn-sec ibm-btn-blue-50 ibm-btn-small'>Edit</button>
        </div>
      </div>
    )
  }
});

module.exports = HomeTeamDescription;
