var React = require('react');
var Header = require('../Header.jsx');
var AssessmentPageFormOne = require('./AssessmentPageFormOne.jsx');
var AssessmentPageFormTwo = require('./AssessmentPageFormTwo.jsx');
var AssessmentPageLastUpdate = require('./AssessmentPageLastUpdate.jsx');
var AssessmentTemplates = require('./AssessmentTemplates.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');
var AssessmentTeamSquad = require('./AssessmentTeamSquad.jsx');
var api = require('../api.jsx');
var Promise = require('bluebird');
var _ = require('underscore');

var displayNone = { display: 'none'};
var displayBlock = { display: 'block'};


var AssessmentPage = React.createClass({
  getInitialState : function(){
    return {
      disabledFormTwo: 'disabled',
      showInfoDisplayStyle : displayNone,
      formTwo: {
        assessmentStatus: '',
        projectDelivery : '',
        isSoftware: '',
        assessmentDate: ''
      },
      'assessmentInfo': {
        'assessments': [],
        'access': false
      },
      'assessmentStatus': {
        'disabledButtons': [
          'disabled',
          'disabled',
          'disabled',
          'disabled'
        ],
        'status': ''
      },
      'selectedAssessment': {
        'isNew': false,
        'assessment': {}
      }
    }
  },

  assessmentChangeHandler: function(e){
    var self = this;
    var assessId = e.target.value;
    api.getAssessmentDetails(assessId)
      .then(function(result){
        if (result.assessmentStatus == 'Draft') {
          var returnObject = {
            'disabledButtons': [
              '', '', '', ''
            ],
            'status': result.assessmentStatus
          }
        } else {
          returnObject = {
            'disabledButtons': [
              'disabled', 'disabled', 'disabled', 'disabled'
            ],
            'status': result.assessmentStatus
          }
        }
        var returnAssessment = {
          'isNew': false,
          'assessment': result
        };
        self.setState({
          assessmentStatus: returnObject,
          selectedAssessment: returnAssessment
        });
        return;
      })
      .catch(function(err){
        return console.log(err);
      });
  },

  teamChangeHandler: function(e) {
    var self = this;
    var teamId = e.target.value;
    var promiseArray = [];
    promiseArray.push(api.getSquadAssessments(teamId));
    promiseArray.push(api.isUserAllowed(teamId));
    Promise.all(promiseArray)
     .then(function(results){
       var returnObject = {
         'disabledButtons': [
           '',
           '',
           'disabled',
           ''
         ],
         'status': ''
       };
       var returnAssessments = {
         'assessments': results[0],
         'access': results[1]
       };
       var returnAssessment = {
         'isNew': true,
         'assessment': {}
       };
       self.setState({
         assessmentStatus: returnObject,
         assessmentInfo: returnAssessments,
         selectedAssessment: returnAssessment
       });
       return;
     })
     .catch(function(err){
       return console.log(err);
     });
  },

  render: function() {
    return (
      <form id="assessmentForm" class="ibm-column-form">
        <Header title="Team Maturity Assessment" />
        <AssessmentTeamSquad teamChangeHandler={this.teamChangeHandler} />
        {/* START choose squad team, select or create assessment form */}
        <AssessmentPageFormOne assessmentInfo={this.state.assessmentInfo} assessmentChangeHandler={this.assessmentChangeHandler}/>
        {/* END choose squad team, select or create assessment form */}

        {/* START assessment generic buttons */}
        <AssessmentButtons assessmentStatus={this.state.assessmentStatus} />
        {/* END assessment generic buttons */}

        {/* START Project or Operations team Form Two */}
        <AssessmentPageFormTwo selectedAssessment={this.state.selectedAssessment} />
        {/* END Project or Operations team Form Two */}

        {/* START Assessment Template */}
        <AssessmentTemplates />
        {/* END Assessment Template */}

        {/* START assessment last update */}
        <AssessmentPageLastUpdate />
        {/* END assessment last update */}

        {/* START assessment generic buttons */}
        {/* END assessment generic buttons */}
      </form>
    )
  }
});

module.exports = AssessmentPage;
