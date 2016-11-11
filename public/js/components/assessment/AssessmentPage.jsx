var React = require('react');
var Header = require('../Header.jsx');
var AssessmentPageFormOne = require('./AssessmentPageFormOne.jsx');
var AssessmentPageFormTwo = require('./AssessmentPageFormTwo.jsx');
var AssessmentPageLastUpdate = require('./AssessmentPageLastUpdate.jsx');
var AssessmentTemplates = require('./AssessmentTemplates.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');
var api = require('../api.jsx');

var displayNone = { display: 'none'};
var displayBlock = { display: 'block'};


var AssessmentPage = React.createClass({
  getInitialState : function(){
    return {
      disabledButtons: 'disabled',
      assessmentStatus : '',
      disabledFormTwo: 'disabled',
      showInfoDisplayStyle : displayNone, 
      formTwo: {
        assessmentStatus: '',
        projectDelivery : '',
        isSoftware: '',
        assessmentDate: ''
      }
    }
  },

  setUIState : function(isUserAllowed){
    this.setState({
      disabledButtons: 'disabled', // disable Submit button components
      assessmentStatus: '' // hide Assessment status text/ label
    });
    if(isUserAllowed){
      this.setState({
        showInfoDisplayStyle: displayNone
      });
    } else {
      this.setState({
        showInfoDisplayStyle: displayBlock
      });
    }
  },

  assessmentSelected: function(e){
    // // reset UI
    var self = this;
    var assessId = e.target.value;
    var teamId = '';
    var status = '';
    api.getAssessmentDetails(assessId)
   .then(function(result){
      teamId = result['teamId'];
      status = result['assessmentStatus'];
      var details = {
        assessmentStatus : result['assessmentStatus']
      };
      self.setState({
        assessmentStatus: details['assessmentStatus']
      })
   })
   .then(function(){
      console.log('getting user edit permission for team: ', teamId);
     // check user permission in this team
     // agile team tool id on my local, 580f5ebe6ea2e326d40b9377
     //teamId = '580f5ebe6ea2e326d40b9377'; // hardcoding member team id to simulate isUserAllowed === true
     api.isUserAllowed(teamId)
     .then(function(allowed){
        console.log('assessmentStatus: ', status);
        if(allowed && status == 'Draft'){
          self.setState({
            disabledFormTwo: '',
            disabledButtons: ''
          });
        } else{
          self.setState({
            disabledFormTwo: 'disabled',
            disabledButtons: 'disabled'
          });
        }
     });
   })
  },

  render: function() {
    return (<form id="assessmentForm" class="ibm-column-form">
                {/* START choose squad team, select or create assessment form */}
                <AssessmentPageFormOne assessmentSelected={this.assessmentSelected} showInfoDisplayStyle={this.state.showInfoDisplayStyle} setUIState={this.setUIState}/>
                {/* END choose squad team, select or create assessment form */}

                {/* START assessment generic buttons */}
                <AssessmentButtons disabledButtons={this.state.disabledButtons} assessmentStatus={this.state.assessmentStatus} />
                {/* END assessment generic buttons */}

                {/* START Project or Operations team Form Two */}
                <AssessmentPageFormTwo disabledFormTwo={this.state.disabledFormTwo} formTwo={this.state.FormTwo} />
                {/* END Project or Operations team Form Two */}

                {/* START Assessment Template */}
                <AssessmentTemplates />
                {/* END Assessment Template */}

                {/* START assessment last update */}
                <AssessmentPageLastUpdate />
                {/* END assessment last update */}

                {/* START assessment generic buttons */}
                <AssessmentButtons disabledButtons={this.state.disabledButtons}/>
                {/* END assessment generic buttons */}
              </form>)
  }
});

module.exports = AssessmentPage;
