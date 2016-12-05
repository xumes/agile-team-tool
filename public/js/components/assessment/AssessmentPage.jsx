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
        'status': '',
        'assessId': '',
        'noShowSummary': true
      },
      'selectedAssessment': {
        'isNew': false,
        'assessId': '',
        'type': 'Project',
        'software': 'Yes',
        'date': moment(),
        'updatedBy': '',
        'updateDate': null,
      },
      'assessmentTemplate': {
        'type': 'Project',
        'software': 'Yes',
        'template': {},
        'assessment': {},
        'access': false
      }
    }
  },
  componentDidMount: function() {
    var self = this;
    var urlParams = getJsonParametersFromUrl();
    var teamId =  _.isEmpty(urlParams) || _.isEmpty(urlParams.id) ? '' : urlParams.id;
    var assessId = _.isEmpty(urlParams) || _.isEmpty(urlParams.assessId) ? null : urlParams.assessId;
    if (teamId != '') {
      self.teamChangeHandler(null, teamId, assessId);
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
      self.getTeamAssessment()
        .then(function(result){
          var rAssessmentStatus = {
            'disabledButtons': [
              'disabled', 'disabled', 'disabled', 'disabled'
            ],
            'status': '',
            'assessId': '',
            'noShowSummary': true
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
            'date': moment(),
            'updatedBy': '',
            'updateDate': null
          };
          self.setState({
            assessmentStatus: rAssessmentStatus,
            squadAssessments: rSquadAssessments,
            selectedAssessment: rSelectedAssessment,
            assessmentTemplate: result
          });
          return;
        })
        .catch(function(err){
          console.log(err);
          return err;
        });
    } else {
      var rSquadAssessments = {};
      var rSelectedAssessment = {};
      var rAssessmentStatus = {};
      var rAssessmentTemplate = {};
      var promiseArray = [];
      if (sId != null) {
        promiseArray.push(api.getSquadAssessments(teamId));
        promiseArray.push(api.isUserAllowed(teamId));
        promiseArray.push(api.getAssessmentDetails(sId));
      } else {
        promiseArray.push(api.getSquadAssessments(teamId));
        promiseArray.push(api.isUserAllowed(teamId));
        promiseArray.push(self.getTeamAssessment());
      }
      Promise.all(promiseArray)
       .then(function(results){
         rSquadAssessments = {
           'assessments': results[0],
           'access': results[1]
         };
         if (sId != null) {
           return self.getTeamAssessment(results[2]);
         } else {
           if (results[0].length > 0 && results[0][0]['assessmentStatus'] == 'Draft') {
             rSelectedAssessment = {
               'isNew': false,
               'assessId': '',
               'type': 'Project',
               'software': 'Yes',
               'date': moment(),
               'updatedBy': '',
               'updateDate': null
             };
           } else {
             rSelectedAssessment = {
               'isNew': true,
               'assessId': '',
               'type': 'Project',
               'software': 'Yes',
               'date': moment(),
               'updatedBy': '',
               'updateDate': null
             };
           }
           results[2].access = results[1];
           if (results[1]) {
             if (results[0].length > 0 && results[0][0]['assessmentStatus'] == 'Draft') {
               rAssessmentStatus = {
                 'disabledButtons': [
                   'disabled', 'disabled', 'disabled', 'disabled'
                 ],
                 'status': '',
                 'assessId': '',
                 'noShowSummary': true
               };
             } else {
               rAssessmentStatus = {
                 'disabledButtons': [
                   '', '', 'disabled', ''
                 ],
                 'status': '',
                 'assessId': '',
                 'noShowSummary': true
               };
             }
           } else {
             rAssessmentStatus = {
               'disabledButtons': [
                 'disabled', 'disabled', 'disabled', 'disabled'
               ],
               'status': '',
               'assessId': '',
               'noShowSummary': true
             };
           }
           rAssessmentTemplate = results[2];
           return true;
         }
       })
       .then(function(result){
         if (sId != null) {
           if (result.deliversSoftware == true) {
             var sf = 'Yes';
           } else {
             sf = 'No';
           }
           rSelectedAssessment = {
             'isNew': false,
             'assessId': sId,
             'type': result.type,
             'software': sf,
             'date': result.submittedDate,
             'updatedBy': result.updatedBy,
             'updateDate': result.updateDate
           };
           if (result.assessmentStatus == 'Draft' && self.state.squadAssessments.access) {
             rAssessmentStatus = {
               'disabledButtons': [
                 '', '', '', ''
               ],
               'status': result.assessmentStatus,
               'assessId': sId,
               'noShowSummary': true
             }
           } else {
             rAssessmentStatus = {
               'disabledButtons': [
                 'disabled', 'disabled', 'disabled', 'disabled'
               ],
               'status': result.assessmentStatus,
               'assessId': sId,
               'noShowSummary': false
             }
           }
           self.setState({
             squadAssessments: rSquadAssessments,
             assessmentStatus: rAssessmentStatus,
             selectedAssessment: rSelectedAssessment,
             assessmentTemplate: result
           });
           $('select[name=\'teamSelectList\']').val(tId).change();
           $('select[name=\'assessmentSelectList\']').val(sId).change();
           return;
         } else {
           self.setState({
             assessmentStatus: rAssessmentStatus,
             squadAssessments: rSquadAssessments,
             selectedAssessment: rSelectedAssessment,
             assessmentTemplate: rAssessmentTemplate
           });
           if (tId != '' && tId != null) {
             $('select[name=\'teamSelectList\']').val(tId).change();
           }
           return;
         }
       })
       .catch(function(err){
         return console.log(err);
       });
    }
  },

  assessmentChangeHandler: function(e){
    var self = this;
    var assessId = e.target.value;
    if (assessId == 's' || assessId == 'n') {
      if (self.state.squadAssessments.access && assessId == 'n') {
        var rAssessmentStatus = {
          'disabledButtons': [
            '', '', 'disabled', ''
          ],
          'status': '',
          'assessId': '',
          'noShowSummary':true
        };
      } else {
        var rAssessmentStatus = {
          'disabledButtons': [
            'disabled', 'disabled', 'disabled', 'disabled'
          ],
          'status': '',
          'assessId': '',
          'noShowSummary':true
        };
      }
      var rSelectedAssessment = {
        'isNew': true,
        'assessId': '',
        'type': 'Project',
        'software': 'Yes',
        'date': moment(),
        'updatedBy': '',
        'updateDate': null,
      };
      self.getTeamAssessment()
        .then(function(result){
          self.setState({
            assessmentStatus: rAssessmentStatus,
            selectedAssessment: rSelectedAssessment,
            assessmentTemplate: result
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
          assess = result;
          return self.getTeamAssessment(result);
        })
        .then(function(result){
          if (assess.assessmentStatus == 'Draft' && self.state.squadAssessments.access) {
            var rAssessmentStatus = {
              'disabledButtons': [
                '', '', '', ''
              ],
              'status': assess.assessmentStatus,
              'assessId': assess._id.toString(),
              'noShowSummary': true
            }
          } else {
            rAssessmentStatus = {
              'disabledButtons': [
                'disabled', 'disabled', 'disabled', 'disabled'
              ],
              'status': assess.assessmentStatus,
              'assessId': assess._id.toString(),
              'noShowSummary': false
            }
          }
          if (assess.deliversSoftware) {
            var software = 'Yes';
          } else {
            software = 'No';
          }
          var rSelectedAssessment = {
            'isNew': false,
            'assessId': assess._id.toString(),
            'type': assess.type,
            'software': software,
            'date': assess.submittedDate,
            'updatedBy': assess.updatedBy,
            'updateDate': assess.updateDate
          };
          self.setState({
            assessmentStatus: rAssessmentStatus,
            selectedAssessment: rSelectedAssessment,
            assessmentTemplate: result
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
      var rAssessmentTemplate = {};
      if (assess == null) {
        rAssessmentTemplate.type = 'Project';
        rAssessmentTemplate.software = 'Yes';
        var req = api.getAssessmentTemplate(null, 'active');
      } else {
        rAssessmentTemplate.type = assess.type;
        if (assess.deliversSoftware) {
          var software = 'Yes';
        } else {
          software = 'No';
        }
        rAssessmentTemplate.software = software;
        req = api.getTemplateByVersion(assess.version);
      }
      req.then(function(result){
        if (result == null) {
          console.log('no template for this version: ' + assess.version);
          return reject({'error': 'no template for this version'});
        } else {
          rAssessmentTemplate.template = result;
          rAssessmentTemplate.assessment = assess;
          rAssessmentTemplate.access = self.state.squadAssessments.access;
          // self.setState({
          //   assessmentTemplate: rAssessmentTemplate
          // });
          return resolve(rAssessmentTemplate)
        }
      })
      .catch(function(err){
        console.log(err);
        return reject(err);
      });

    });
  },

  dateChangeHandler: function(date) {
    var rSelectedAssessment = this.state.selectedAssessment;
    rSelectedAssessment.date = date;
    this.setState({selectedAssessment: rSelectedAssessment});
  },

  assessTypeChangeHandler: function(e) {
    var rAssessmentTemplate = this.state.assessmentTemplate;
    rAssessmentTemplate.type = e.target.value;
    this.setState({
      assessmentTemplate: rAssessmentTemplate
    });
  },

  assessSoftwareChangeHandler: function(e) {
    var rAssessmentTemplate = this.state.assessmentTemplate;
    rAssessmentTemplate.software = e.target.value;
    this.setState({
      assessmentTemplate: rAssessmentTemplate
    });
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
        <Header title="Team Maturity Assessment" noShowSummary={this.state.assessmentStatus.noShowSummary}/>
        {/* START choose squad team*/}
        <AssessmentTeamSquad teamChangeHandler={this.teamChangeHandler} />
        {/* END choose squad team*/}

        {/* START select or create assessment form */}
        <AssessmentPageFormOne squadAssessments={this.state.squadAssessments} assessmentChangeHandler={this.assessmentChangeHandler}/>
        {/* END select or create assessment form */}

        {/* START assessment generic buttons */}
        <AssessmentButtons assessmentStatus={this.state.assessmentStatus} teamChangeHandler={this.teamChangeHandler}/>
        {/* END assessment generic buttons */}

        {/* START Project or Operations team Form Two */}
        <AssessmentPageFormTwo selectedAssessment={this.state.selectedAssessment} access={this.state.squadAssessments.access} dateChangeHandler={this.dateChangeHandler} assessTypeChangeHandler={this.assessTypeChangeHandler} assessSoftwareChangeHandler={this.assessSoftwareChangeHandler}/>
        {/* END Project or Operations team Form Two */}

        {/* START Assessment Template */}
        <AssessmentTemplates assessmentTemplate={this.state.assessmentTemplate}/>
        {/* END Assessment Template */}

        {/* START assessment last update */}
        <AssessmentPageLastUpdate selectedAssessment={this.state.selectedAssessment}/>
        {/* END assessment last update */}

        {/* START assessment generic buttons */}
        <AssessmentButtons assessmentStatus={this.state.assessmentStatus} teamChangeHandler={this.teamChangeHandler}/>
        {/* END assessment generic buttons */}
      </form>
    )
  }
});

module.exports = AssessmentPage;
