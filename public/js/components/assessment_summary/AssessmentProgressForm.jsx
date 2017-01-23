var React = require('react');
var api = require('../api.jsx');
var utils = require('../utils.jsx');
var ActionPlanComponent = require('./ActionPlanComponent.jsx');
var LastUpdateSection = require('./LastUpdateSection.jsx');
var DebugSection = require('./DebugSection.jsx');
var IndependentAssessorSection = require('./IndependentAssessorSection.jsx');
var _ = require('underscore');
var moment = require('moment');
var team = null;
var assessmentData = [];
var hasIndAssessment = false;
var selAssessment;
var principles = [];

var teamId = '';
var assessId = '';

var AssessmentProgressForm = React.createClass({
  getInitialState: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    var teamId = urlParameters.id;
    var assessId = urlParameters.assessId;
    var assessResult = {};
    return {
      teamId: teamId,
      assessId: assessId,
      assessResult: assessResult,
      selectedAssessment: {}
    }
  },

  componentDidMount: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;
    self.initShowHideWidget();
    api.getTeamAssessments(teamId, assessId)
      .then(function(assessResult) {
        _.each(assessResult, function(value, key, list) {
          if (value._id === assessId) {
            self.setState({selectedAssessment: value});
          }
        });
        self.setState({assessResult: assessResult});
      })
      .catch(function(err) {
        return console.log(err);
      });
  },

  initShowHideWidget: function() {
    $("#colContainer").showhide();
    $("#delContainer").showhide();
    $("#actPlanContainer").showhide();
  },

  submitActionPlan: function (data, msg) {
    var self = this;
    api.updateAssessment(data)
    .then(function(result){
      self.setState({selectedAssessment:result});
      if (msg != null && msg != '')
        self.showMessagePopup(msg);
    })
    .catch(function(err){
      self.validationHandler(err);
    });
  },

  showMessagePopup: function(message) {
    alert(message);
  },

  validationHandler:function (errorResponse, operation) {
    var self = this;
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){
        var popupMsg = '';
        if (_.isObject(errors)) {
          _.each(errors, function(err, attr) {
            popupMsg += err.message + '<br>';
          });
        } else {
          popupMsg = errors;
        }
        if (!_.isEmpty(popupMsg)) {
          self.showMessagePopup(popupMsg);
        }
      }
    }
  },

  executeReset: function (actionPlan) {
    var self = this;
    api.getAssessmentDetails(this.state.assessId)
      .then(function(data){
        self.setState({selectedAssessment: data});
      })
      .catch(function(err){
        console.log(JSON.stringify(err));
      });
  },

  render: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;

    return (
      <div>
        <ActionPlanComponent teamId={this.state.teamId} submitActionPlan={this.submitActionPlan} executeReset={this.executeReset} selectedAssessment={this.state.selectedAssessment} />
        <IndependentAssessorSection selectedAssessment={this.state.selectedAssessment} />
        <LastUpdateSection selectedAssessment={this.state.selectedAssessment} />
        <DebugSection selectedAssessment={this.state.selectedAssessment} />
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </div>
    );
  }
});

module.exports = AssessmentProgressForm;
