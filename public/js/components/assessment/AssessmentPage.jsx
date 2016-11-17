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
var moment = require('moment');
var _ = require('underscore');

var displayNone = { display: 'none'};
var displayBlock = { display: 'block'};


var AssessmentPage = React.createClass({
  getInitialState : function(){
    return {
      'squadAssessments': {
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
        'assessId': '',
        'type': 'Project',
        'software': 'Yes',
        'date': moment()
      },
      'assessmentDetail': {}
    }
  },

  assessmentChangeHandler: function(e){
    var self = this;
    var assessId = e.target.value;
    if (assessId == '') {
      var rAssessmentStatus = {
        'disabledButtons': [
          '', '', 'disabled', ''
        ],
        'status': ''
      };
      var rSelectedAssessment = {
        'isNew': true,
        'assessId': '',
        'type': 'Project',
        'software': 'Yes',
        'date': moment()
      };
      return self.setState({
        assessmentStatus: rAssessmentStatus,
        selectedAssessment: rSelectedAssessment,
        assessmentDetail: {}
      });
    } else {
      api.getAssessmentDetails(assessId)
        .then(function(result){
          if (result.assessmentStatus == 'Draft') {
            var rAssessmentStatus = {
              'disabledButtons': [
                '', '', '', ''
              ],
              'status': result.assessmentStatus
            }
          } else {
            rAssessmentStatus = {
              'disabledButtons': [
                'disabled', 'disabled', 'disabled', 'disabled'
              ],
              'status': result.assessmentStatus
            }
          }
          if (result.deliversSoftware) {
            var software = 'Yes';
          } else {
            software = 'No';
          }
          var rSelectedAssessment = {
            'isNew': false,
            'assessId': result._id.toString(),
            'type': result.type,
            'software': software,
            'date': result.submittedDate
          };
          var rAssessmentDetail = result;
          return self.setState({
            assessmentStatus: rAssessmentStatus,
            selectedAssessment: rSelectedAssessment,
            assessmentDetail: rAssessmentDetail
          });
        })
        .catch(function(err){
          return console.log(err);
        });
    }
  },

  teamChangeHandler: function(e) {
    var self = this;
    var teamId = e.target.value;
    if (teamId == '') {
      var rAssessmentStatus = {
        'disabledButtons': [
          'disabled', 'disabled', 'disabled', 'disabled'
        ],
        'status': ''
      };
      var rSquadAssessments = {
        'assessments': {},
        'access': false
      };
      var rSelectedAssessment = {
        'isNew': false,
        'assessId': '',
        'type': 'Project',
        'software': 'Yes',
        'date': moment()
      };
      return self.setState({
        assessmentStatus: rAssessmentStatus,
        squadAssessments: rSquadAssessments,
        selectedAssessment: rSelectedAssessment,
        assessmentDetail: {}
      });
    } else {
      var promiseArray = [];
      promiseArray.push(api.getSquadAssessments(teamId));
      promiseArray.push(api.isUserAllowed(teamId));
      Promise.all(promiseArray)
       .then(function(results){
         var rAssessmentStatus = {
           'disabledButtons': [
             '', '', 'disabled', ''
           ],
           'status': ''
         };
         var rSquadAssessments = {
           'assessments': results[0],
           'access': results[1]
         };
         var rSelectedAssessment = {
           'isNew': true,
           'assessId': '',
           'type': 'Project',
           'software': 'Yes',
           'date': moment()
         };
         return self.setState({
           assessmentStatus: rAssessmentStatus,
           squadAssessments: rSquadAssessments,
           selectedAssessment: rSelectedAssessment,
           assessmentDetail: {}
         });
       })
       .catch(function(err){
         return console.log(err);
       });
    }
  },

  dateChangeHandler: function(date) {
    var rSelectedAssessment = this.state.selectedAssessment;
    rSelectedAssessment.date = date;
    this.setState({selectedAssessment: rSelectedAssessment});
  },

  render: function() {
    return (
      <form id="assessmentForm" class="ibm-column-form">
        <Header title="Team Maturity Assessment" />
        {/* START choose squad team*/}
        <AssessmentTeamSquad teamChangeHandler={this.teamChangeHandler} />
        {/* END choose squad team*/}

        {/* START select or create assessment form */}
        <AssessmentPageFormOne squadAssessments={this.state.squadAssessments} assessmentChangeHandler={this.assessmentChangeHandler}/>
        {/* END select or create assessment form */}

        {/* START assessment generic buttons */}
        <AssessmentButtons assessmentStatus={this.state.assessmentStatus} />
        {/* END assessment generic buttons */}

        {/* START Project or Operations team Form Two */}
        <AssessmentPageFormTwo selectedAssessment={this.state.selectedAssessment} dateChangeHandler={this.dateChangeHandler}/>
        {/* END Project or Operations team Form Two */}

        {/* START Assessment Template */}
        <AssessmentTemplates assessmentDetail={this.state.assessmentDetail}/>
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
