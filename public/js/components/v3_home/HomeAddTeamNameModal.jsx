var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;

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
            })

            if (isTeamExist) {
              alert('This team name already exists. Please enter a different team name.');
            } else {
              // alert('Proceed forward.');
              self.props.updateStep('showTeamTypeSelection'); // Proceed to next screen -Selecting team type (parent or squad team)
            }
         });
    }
  },

  render: function () {
    var self = this;

    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    var noteStyle = {
       color: '#4178BE'
    };
    console.log(self.props);
    return (
      <div>
        <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.props.showModal} onHide={self.props.closeWindow}>

          <div class='new-team-creation-add-block'>
           <div class='new-team-creation-add-block-header'>
              <h>New Team Creation</h>
                 <span onClick={self.props.closeWindow}>X</span>
           </div>
           
           <div class='new-team-creation-add-block-content'>
             <div class='new-team-creation-add-block-content-name'>
               <label for='newTeamName'>Team Name</label>
                <input type='text' size='30' id='newTeamName' name='newTeamName' aria-label='team name' ref='newTeamName'/>
              </div>
              
              <div class='new-team-creation-add-block-content-description'>
               <label for='newTeamDescription'>Team Description</label>
                <textarea type='textarea' rows='15' id='newTeamDescription' name='newTeamDescription' ref='newTeamDescription' aria-label='new team description' role='combobox'/>
              </div> 
            </div>
            
            <div class='new-team-creation-add-note-section'>
             <label class='new-team-creation-add-note-section-notetext' for='teamNotes-label'><span style={noteStyle}>NOTE: </span>
             To join the existing team, click the "All Teams" tab, find the team and click "request to join".
             </label>
             
            </div>

            <div class='new-team-creation-add-block-footer'>
              <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'40%','right':'45%','float':'right'}}>
                <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.addTeamHandler}>Next</a>
              </p>
           </div>
          </div>
        </Modal>
      </div>
    )
  }
});
module.exports = HomeAddTeamNameModal;
