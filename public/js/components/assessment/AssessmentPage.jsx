var React = require('react');
var Header = require('./AssessmentHeader.jsx');
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
      'assessment': {
        'teamId': '',
        'squadAssessments': [],
        'assessment': {},
        'access': false,
        'assessmentTemplate': {},
        'templateType': {
          'type': 'Project',
          'software': true,
          'submittedDate': null
        }
      }
    }
  },
  componentDidMount: function() {
    var self = this;
    var urlParams = getJsonParametersFromUrl();
    var teamId =  _.isEmpty(urlParams) || _.isEmpty(urlParams.id) ? '' : urlParams.id;
    var assessId = _.isEmpty(urlParams) || _.isEmpty(urlParams.assessId) ? null : urlParams.assessId;
    if (teamId != '') {
      //self.teamChangeHandler(null, teamId, assessId);
      setTimeout(function(){
        $('select[name=\'teamSelectList\']').val(teamId).change();
      },1000);
    }
  },

  teamChangeHandler: function(e, tId, sId) {
    var self = this;
    if (e != null) {
      var teamId = e.target.value;
    } else {
      teamId = tId
    }
    if (teamId == '') {
      var rAssessment = {
        'teamId': '',
        'squadAssessments': [],
        'assessment': {},
        'access': false,
        'assessmentTemplate': {},
        'templateType': {
          'type': 'Project',
          'software': true,
          'submittedDate': null
        }
      }
      self.setState({
        assessment: rAssessment
      });
      $('select[name=\'assessmentSelectList\']').val('n').change();
      return;
    } else {
      var rAssessment = {
        'teamId': teamId.toString(),
        'squadAssessments': [],
        'assessment': {},
        'access': false,
        'assessmentTemplate': {},
        'templateType': {
          'type': 'Project',
          'software': true,
          'submittedDate': null
        }
      }
      var promiseArray = [];
      promiseArray.push(api.getSquadAssessments(teamId));
      promiseArray.push(api.isUserAllowed(teamId));
      Promise.all(promiseArray)
       .then(function(results){
         rAssessment['squadAssessments'] = results[0];
         rAssessment['access'] = results[1];
         self.setState({
           assessment: rAssessment
         });
         if (results[0].length > 0 && results[0][0]['assessmentStatus'] == 'Draft') {
           $('select[name=\'assessmentSelectList\']').val(results[0][0]._id.toString()).change();
         } else {
           if (results[1]) {
             $('select[name=\'assessmentSelectList\']').val('n').change();
           } else {
             $('select[name=\'assessmentSelectList\']').val('s').change();
           }
         }
         return;
       })
       .catch(function(err){
         return console.log(err);
       });
    }
  },

  assessmentChangeHandler: function(e){
    var self = this;
    var assessId = e.target.value;
    var rAssessment = self.state.assessment;
    if (assessId == 's' || assessId == 'n') {
      self.getTeamAssessment()
        .then(function(result){
          rAssessment['assessment'] = {};
          rAssessment['assessmentTemplate'] = result[0];
          rAssessment['templateType'] = {
            'type': 'Project',
            'software': true,
            'submittedDate': null
          };
          self.setState({
            assessment: rAssessment
          });
          return;
        })
        .catch(function(err){
          return err;
        });
    } else {
      var assess = {}
      api.getAssessmentDetails(assessId)
        .then(function(result){
          rAssessment['assessment'] = result;
          rAssessment['templateType'] = {
            'type': result.type,
            'software': result.deliversSoftware,
            'submittedDate': result.submittedDate
          }
          return self.getTeamAssessment(result);
        })
        .then(function(result){
          rAssessment['assessmentTemplate'] = result;
          self.setState({
            assessment: rAssessment
          });
          return;
        })
        .catch(function(err){
          return console.log(err);
        });
    }
  },

  getTeamAssessment: function(assess) {
    var self = this;
    return new Promise(function(resolve, reject){
      if (assess == null) {
        var req = api.getAssessmentTemplate(null, 'active');
      } else {
        req = api.getTemplateByVersion(assess.version);
      }
      req.then(function(result){
        if (result == null) {
          console.log('no template for this version: ' + assess.version);
          return reject({'error': 'no template for this version'});
        } else {
          return resolve(result)
        }
      })
      .catch(function(err){
        console.log(err);
        return reject(err);
      });

    });
  },

  dateChangeHandler: function(date) {
    var rAssessment = this.state.assessment;
    if (date == undefined) {
      rAssessment.templateType.submittedDate = null;
    } else {
      rAssessment.templateType.submittedDate = date;
    }
    this.setState({
      assessment: rAssessment
    });
  },

  assessTypeChangeHandler: function(e) {
    var rAssessment = this.state.assessment;
    rAssessment.templateType.type = e.target.value;
    this.setState({
      assessment: rAssessment
    });
  },

  assessSoftwareChangeHandler: function(e) {
    var rAssessment = this.state.assessment;
    if (e.target.value == 'Yes') {
      rAssessment.templateType.software = true;
    } else {
      rAssessment.templateType.software = false;
    }
    this.setState({
      assessment: rAssessment
    });
    // $('select[name="softwareYesNo"]').select2();
  },

  showDateUTC: function(formatDate) {
    if (formatDate == null || formatDate == '' || formatDate == 'NaN') {
      return 'Not available';
    }
    var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
    return utcTime;
  },

  render: function() {
    return (
      <form id="assessmentForm" class="ibm-column-form">
        <Header title="Team Maturity Assessment" assessment={this.state.assessment}/>

        <AssessmentTeamSquad teamChangeHandler={this.teamChangeHandler} />

        <AssessmentPageFormOne assessment={this.state.assessment} assessmentChangeHandler={this.assessmentChangeHandler} />

        <AssessmentButtons assessment={this.state.assessment} teamChangeHandler={this.teamChangeHandler}/>

        <AssessmentPageFormTwo assessment={this.state.assessment} dateChangeHandler={this.dateChangeHandler} assessTypeChangeHandler={this.assessTypeChangeHandler} assessSoftwareChangeHandler={this.assessSoftwareChangeHandler}/>

        <AssessmentTemplates assessment={this.state.assessment}/>

        <AssessmentPageLastUpdate assessment={this.state.assessment}/>

        <AssessmentButtons assessment={this.state.assessment} teamChangeHandler={this.teamChangeHandler}/>
      </form>
    )
  }
});

module.exports = AssessmentPage;
