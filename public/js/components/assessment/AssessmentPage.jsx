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
        return self.setState({assessmentStatus: returnObject});
      })
      .catch(function(err){
        return console.log(err);
      });
    // // reset UI
  //   var self = this;
  //   var assessId = e.target.value;
  //   var teamId = '';
  //   var status = '';
  //   api.getAssessmentDetails(assessId)
  //  .then(function(result){
  //     teamId = result['teamId'];
  //     status = result['assessmentStatus'];
  //     var details = {
  //       assessmentStatus : result['assessmentStatus']
  //     };
  //     self.setState({
  //       assessmentStatus: details['assessmentStatus']
  //     })
  //  })
  //  .then(function(){
  //     console.log('getting user edit permission for team: ', teamId);
  //    // check user permission in this team
  //    // agile team tool id on my local, 580f5ebe6ea2e326d40b9377
  //    //teamId = '580f5ebe6ea2e326d40b9377'; // hardcoding member team id to simulate isUserAllowed === true
  //    api.isUserAllowed(teamId)
  //    .then(function(allowed){
  //       console.log('assessmentStatus: ', status);
  //       if(allowed && status == 'Draft'){
  //         self.setState({
  //           disabledFormTwo: '',
  //           disabledButtons: ''
  //         });
  //       } else{
  //         self.setState({
  //           disabledFormTwo: 'disabled',
  //           disabledButtons: 'disabled'
  //         });
  //       }
  //    });
  //  })
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
       }
       var returnAssessments = {
         'assessments': results[0],
         'access': results[1]
       }
       self.setState({assessmentStatus: returnObject});
       return self.setState({assessmentInfo: returnAssessments});
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
        <AssessmentPageFormTwo disabledFormTwo={this.state.disabledFormTwo} formTwo={this.state.FormTwo} />
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
