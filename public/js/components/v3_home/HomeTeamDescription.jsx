var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');
var ReactModal = require('react-modal');
var teamApi = require('./TeamApi.jsx');

var HomeTeamDescription = React.createClass({
  getInitialState: function() {
    return {
      showModal: false,
      teamId: '',
      teamName: '',
      teamDesc: '',
      formError: ''
    }
  },
  componentDidMount: function() {
    this.setState({modalTitle: 'Team Description Edit'});
    this.setState({teamName: this.props.teamName});
    this.setState({teamDesc: this.props.teamDescription});
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
  handleTeamDescValidationErrors: function(err) {
    var self = this;
    console.log('handleTeamDescValidationErrors err:', JSON.stringify(err));
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
    var links = self.props.loadDetailTeam.team.links;
    var team = self.props.loadDetailTeam.team;
    team.name = self.state.teamName;
    team.description =  self.state.teamDesc;
    console.log('saveTeamDescModal...');
    teamApi.putTeam(JSON.stringify(team))
      .then(function(result) {
        self.clearTeamDescValidationErrors();
        self.props.updateTeamDetails(team_id, result);
        self.hideTeamDescModal();
      })
      .catch(function(err) {
        console.log('err:',err);
        if (err.responseJSON !== undefined && err.responseJSON['errors'] !== undefined) {
          var error = err.responseJSON['errors'];
          console.log('error:',error);
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
  onchangeTeamName: function(event) {
    var name = event.target.value;
    this.setState({teamName: name});
  },
  onchangeTeamDesc: function(event) {
    var desc = event.target.value;
    this.setState({teamDesc: desc});
  },
  showTeamDescModal: function() {
    this.setState({showModal: true});
  },
  hideTeamDescModal: function() {
    this.setState({showModal: false});
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
          <button type='button' class='ibm-btn-sec ibm-btn-blue-50 ibm-btn-small' onClick={self.showTeamDescModal}>Edit</button>
        </div>
        <ReactModal
           isOpen={this.state.showModal}
           className="att-modal"
           overlayClassName="att-modal-overlay"
           contentLabel="Team description modal">
           <div class='modal-wrapper'>
            <header role="banner" class="modal-header" aria-labelledby="x1ModalTitle">
              <h3 id="x1ModalTitle" class="modal-title">{self.state.modalTitle}</h3>
              <button type="button" class="close" onClick={self.hideTeamDescModal} aria-label="Close modal" title="Close modal">
                <span class="sr-only">Close modal</span>
                <span class="glyphicon glyphicon-xs glyphicon-remove" aria-hidden="true"></span>
              </button>
            </header>
            <section aria-label="Modal body content" class="modal-body" role="main">
              <form class="ibm-row-form">
                <p>
                  <label>Team Name</label>
                  <span class="ibm-input-group">
                    <input name='team_name' id='team_name' type='text' class='implink' value={self.state.teamName} onChange={self.onchangeTeamName} />
                    <span id='team_name_error' class='ibm-item-note'></span>
                  </span>
                </p>

                <p>
                  <label>Team Description</label>
                  <span>
                    <textarea name='team_desc' id='team_desc' class='txtarea' rows='6' value={self.state.teamDesc} onChange={self.onchangeTeamDesc} ></textarea>
                    <span id='team_desc_error' class='ibm-item-note'></span>
                  </span>
                </p>

                <input name='team_id' id='team_id' type='hidden' value='{self.state.teamId}' />
              </form>
            </section>
            <div class='clearboth'></div>
            <footer aria-label="Modal footer content" class="modal-footer" role="contentinfo">
              <button class="btn btn-primary modal-ok" onClick={self.saveTeamDescModal} >Save</button>
              <button class="btn btn-secondary modal-close" onClick={self.hideTeamDescModal}>Cancel</button>
            </footer>
           </div>
        </ReactModal>
      </div>
    )
  }
});

module.exports = HomeTeamDescription;
