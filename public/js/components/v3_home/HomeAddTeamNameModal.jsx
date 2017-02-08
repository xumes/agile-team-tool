var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeTeamNameFooter = require('./HomeTeamNameFooter.jsx');


var HomeAddTeamNameModal = React.createClass({
  addTeamHandler: function() {
    var self = this;
    if ($('#newTeamName').val() == '') {
        alert('Please fill in a new team name.');
    } else {
        api.fetchTeamNames()
         .then(function(teams) {
            var isTeamExist = false;
            isTeamExist = _.find(teams, function(m){
              if (m.name == $('#newTeamName').val()) {
                console.log('in team exist = true');
                return true;
              }
            });

            if (isTeamExist) {
              alert('This team name already exists. Please enter a different team name.');
            } else {
              self.props.updateStep('showTeamTypeSelection'); // Proceed to next screen -Selecting team type (parent or squad team)
              console.log('Proceed to Team type(parent or squad team) selection modal..');
              self.props.setTeamObj({name: self.props.getTeamObj().name, description: self.props.getTeamObj().description});
            }
         });
    }
  },

  render: function () {
    var self = this;
    var noteStyle = {
       color: '#4178BE'
    };
    // console.log(self.props);
    var teamObj = self.props.getTeamObj();
    return (
      <div>
        <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.showModal} onHide={self.props.closeWindow}>

          <div class='new-team-creation-add-block'>
            <div class='new-team-creation-add-block-header'>
              <h>New Team Creation</h>
              <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
            </div>

            <div class='new-team-creation-add-block-content ibm-row-form1'>
              <div class='new-team-creation-add-block-content-name'>
               <label for='newTeamName'>Team Name</label>
                <input type='text' size='30' id='newTeamName' name='newTeamName' aria-label='team name' ref='newTeamName' value={teamObj.name} onChange={self.props.changeHandlerTeamName} />
              </div>

              <div class='new-team-creation-add-block-content-description'>
                <label for='newTeamDescription'>Team Description</label>
                <textarea type='textarea' rows='15' id='newTeamDescription' name='newTeamDescription' ref='newTeamDescription' value={teamObj.description} onChange={self.props.changeHandlerTeamDesc} aria-label='new team description' role='combobox'/>
              </div>
              
              <div class='footer-note-add-team-name'><strong class="note1">NOTE:</strong>&nbsp;To join an existing team, click the "All teams" tab, find the team and click "request to join"</div>

            </div>

            <HomeTeamNameFooter updateStep={self.addTeamHandler} />

          </div>
        </Modal>
      </div>
    )
  }
});
module.exports = HomeAddTeamNameModal;
