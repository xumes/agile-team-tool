var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');

var HomeTeamDescription = React.createClass({
  getInitialState: function() {
    return {
      showModal: false
    }
  },
  componentDidMount: function() {
    var self = this;
    self.updatePosition();
    $('#homeHeaderDesBtn svg').attr('title','Team Information').children('title').remove();
    $('#homeHeaderDesBtn, .home-team-header-teamname-div, .home-team-header-description-div').unbind('mouseenter mouseleave');

    $('#homeHeaderDesBtn').bind('mouseenter', function() {
      if ($('.home-team-header-description-div').css('display') == 'none') {
        $('.home-team-header-description-div').fadeIn();
      }
    });
    $('.home-team-header-teamname-div').bind('mouseenter mouseleave', function() {
      if ($('.home-team-header-description-div').css('display') != 'none') {
        $('.home-team-header-description-div').fadeOut();
      }
    });
    $('.home-team-header-description-div').bind('mouseleave', function() {
      if ($('.home-team-header-description-div').css('display') != 'none') {
        $('.home-team-header-description-div').fadeOut();
      }
    });
  },
  componentDidUpdate: function() {
    this.updatePosition();
    console.log('componentDidUpdate',$('.modal-wrapper .modal-header svg'));
  },
  updatePosition: function() {
    var self = this;
    setTimeout(function(){
      // if (self.props.teamName.length > 35) {
      //   var divLength = $('#homeHeaderDesBtn').position().left/$('.home-team-header').width() * 100 + 10 + '%';
      // } else {
      //   divLength = $('#homeHeaderDesBtn').position().left/$('.home-team-header').width() * 100 + 6 + '%';
      // }
      var headerLength = $('.home-team-header').width() * 0.9;
      if (self.props.loadDetailTeam.team.type != 'squad') {
        var divLength = $('#teamName').width()/headerLength * 100 + 5.5 + '%';
      } else {
        divLength = ($('#teamName').width() + $('.home-team-header-img-div').width())/headerLength * 100 + 5.5 + '%';
      }
      $('.home-team-header-description-div').css('left', divLength);
    },1000);
  },
  handleTeamDescValidationErrors: function(err) {
    var self = this;
    //console.log('handleTeamDescValidationErrors err:', JSON.stringify(err));
    if (err && err['name']) {
      $('#team_name').addClass('ibm-field-error');
      $('#team_name_error').addClass('ibm-alert-link');
      $('#team_name_error').html(err['name']['message']);
    }
  },
  clearTeamDescValidationErrors: function() {
    $('#team_name').removeClass('ibm-field-error');
    $('#team_name_error').removeClass('ibm-alert-link');
    $('#team_name_error').html('');
  },
  saveTeamDescModal: function() {
    var self = this;
    var team_id = self.props.loadDetailTeam.team._id;
    var team = self.props.loadDetailTeam.team;
    team.name = self.refs.team_name.value;
    team.description = self.refs.team_desc.value;
    api.putTeam(JSON.stringify(team))
      .then(function(result) {
        self.clearTeamDescValidationErrors();
        self.hideTeamDescModal();
        self.props.updateTeamDetails(team_id, result);
      })
      .catch(function(err) {
        //console.log('saveTeamDescModal err:',err);
        if (err.responseJSON !== undefined && err.responseJSON['errors'] !== undefined) {
          var error = err.responseJSON['errors'];
          self.handleTeamDescValidationErrors(error);
        } else if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          alert(err.responseJSON['error']);
        } else {
          if (err['statusText'] != undefined) {
            alert(err['statusText']);
          } else {
            alert(err);
          }
        }
      });
  },
  showTeamDescModal: function() {
    this.showDescriptionBlock();
    this.setState({showModal: true});
  },
  hideTeamDescModal: function() {
    this.setState({showModal: false});
  },
  showDescriptionBlock: function() {
    if ($('.home-team-header-description-div').css('display') == 'none') {
      $('.home-team-header-description-div').fadeIn();
    } else {
      $('.home-team-header-description-div').fadeOut();
    }
  },
  onFormSubmit: function(e) {
    e.preventDefault();
    this.saveTeamDescModal();
  },
  render: function() {
    var self = this;
    return (
      <div style={{'height': '100%', 'display':'inline'}} id='teamInfoBlock'>
        <div class='home-team-header-teamname-btn' id='homeHeaderDesBtn'>
          <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
        </div>

        <div class='home-team-header-description-div' style={{'display':'none'}}>
          <div class='home-team-header-description-arrow'>
            <InlineSVG class='home-team-header-description-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
          </div>
          <div class='home-team-header-description-title'>
            <h>Team Description</h>
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
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50 ibm-btn-small' onClick={self.showTeamDescModal} disabled={!self.props.loadDetailTeam.access}>Edit</button>
          </div>
          <ReactModal
             isOpen={this.state.showModal}
             className="att-modal"
             onRequestClose={this.hideTeamDescModal}
             overlayClassName="att-modal-overlay"
             shouldCloseOnOverlayClick={true}
             contentLabel="Team description modal">
             <div class='modal-wrapper' style={{'minHeight':'36em', 'width':'38em', 'maxHeight':'42em'}}>
              <header role="banner" class="modal-header" aria-labelledby="teamNameDescEdit">
                <h id="teamNameDescEdit" class="modal-title">Team Description Edit</h>
                <div class='close-btn' onClick={self.hideTeamDescModal}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
                </div>
              </header>
              <section aria-label="Modal body content" class="modal-body" role="main">
                <form class="ibm-row-form" onSubmit={self.onFormSubmit}>
                  <p>
                    <label>Team Name</label>
                    <span class="ibm-input-group">
                      <input name='team_name' id='team_name' type='text' class='implink' defaultValue={self.props.teamName}  ref='team_name' />
                      <span id='team_name_error' class='ibm-item-note'></span>
                    </span>
                  </p>

                  <p>
                    <label>Team Description</label>
                    <span>
                      <textarea name='team_desc' id='team_desc' class='txtarea' rows='3' defaultValue={self.props.teamDescription} ref='team_desc' ></textarea>
                      <span id='team_desc_error' class='ibm-item-note'></span>
                    </span>
                  </p>

                </form>
              </section>
              <div class='clearboth'></div>
              <footer aria-label="Modal footer content" class="modal-footer" role="contentinfo">
                <button class="btn ibm-btn-pri ibm-btn-small ibm-btn-blue-50" onClick={self.saveTeamDescModal} disabled={!self.props.loadDetailTeam.access}>Save</button>
                <button class="btn ibm-btn-sec ibm-btn-small ibm-btn-blue-50 modal-close" onClick={self.hideTeamDescModal}>Cancel</button>
              </footer>
             </div>
          </ReactModal>
        </div>
      </div>
    )
  }
});

module.exports = HomeTeamDescription;
