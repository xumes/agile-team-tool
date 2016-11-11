var React = require('react');
var Header = require('../Header.jsx');
var AssessmentPageFormOne = require('./AssessmentPageFormOne.jsx');
var AssessmentPageFormTwo = require('./AssessmentPageFormTwo.jsx');
var AssessmentPageLastUpdate = require('./AssessmentPageLastUpdate.jsx');
var AssessmentTemplates = require('./AssessmentTemplates.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');
var api = require('../api.jsx');

var AssessmentPage = React.createClass({
  getInitialState : function(){
    return {
      disabledButtons: 'disabled',
      assessmentStatus : '',
      disabledFormTwo: 'disabled',
      formTwo: {
        assessmentStatus: '',
        projectDelivery : '',
        isSoftware: '',
        assessmentDate: ''
      }
    }
  },

  assessmentSelected: function(e){
    var self = this;
    var assessId = e.target.value;
    var teamId = '';
    api.getAssessmentDetails(assessId)
   .then(function(result){
      //console.log('assessment details: ', result);
      teamId = result['teamId'];
      var details = {
        assessmentStatus : result['assessmentStatus']
      };
      self.setState({
        assessmentStatus: details['assessmentStatus']
      })
      console.log('details: ', details);
   })
   .then(function(){
     // check user permission in this team
     // agile team tool id on my local, 580f5ebe6ea2e326d40b9377
     //teamId = '580f5ebe6ea2e326d40b9377';
     api.isUserAllowed(teamId)
     .then(function(allowed){
        if(allowed){
            console.log('Enable Form inputs and buttons');
        } else {
            console.log('User not allowd to edit team id: ', teamId);
        }
     });
   })
  },

  render: function() {
    return (<form id="assessmentForm" class="ibm-column-form">
                {/* START choose squad team, select or create assessment form */}
                <AssessmentPageFormOne assessmentSelected={this.assessmentSelected} />
                {/* END choose squad team, select or create assessment form */}

                {/* START assessment generic buttons */}
                <AssessmentButtons disabledButtons={this.state.disabledButtons} assessmentStatus={this.state.assessmentStatus} />
                {/* END assessment generic buttons */}

                {/* START Project or Operations team Form Two */}
                <AssessmentPageFormTwo disabledFormTwo={this.state.disabledFormTwo} />
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
