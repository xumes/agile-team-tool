var React = require('react');
var api = require('../api.jsx');
var utils = require('../../utils');
var _  = require('underscore');
var displayType = {'display': 'none'};

var AssessmentSummaryInfo = React.createClass({
  getInitialState: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    if (urlParameters != undefined) {
      var teamId = urlParameters.id;
      var assessId = urlParameters.assessId;
      if (teamId != undefined && assessId != undefined) {
        // this.retrieveAssessmentResult(teamId, assessId);
        // setAssessmentLink(teamId, assessId);
      }
    }
    if (urlParameters != undefined && urlParameters.testUser != undefined) {
      // setTestUser(urlParameters.testUser);
      alert('here TestUser is: ' + urlParameters.testUser);
    }
    return {
      teamId: teamId,
      assessId: assessId,
      teamName: null,
      assessInfo: {}
    };
  },

  componentDidMount: function() {
    var self = this;
    api.loadTeam(self.state.teamId)
      .then(function(teamDetail) {
        // console.log('AssessmentSummaryInfo componentDidMount teamDetail:',teamDetail)
        if (teamDetail !== undefined && teamDetail._id !== undefined) {
          self.setState({teamName: teamDetail.name});
          return api.getTeamAssessments(self.state.teamId, self.state.assessId);
        }
      })
      .then(function(assessResult) {
        console.log('AssessmentSummaryInfo [componentDidMount] assessResult:',assessResult);
        _.each(assessResult, function(value, key, list) {
          console.log('AssessmentSummaryInfo value._id:', value._id)
          console.log('AssessmentSummaryInfo assessId:', self.state.assessId)
          console.log('AssessmentSummaryInfo key:', key)
          if (value._id === self.state.assessId) {
            var assessInfo = {
              assessId: value._id,
              assessmentStatus: value.assessmentStatus,
              createDate: value.createDate,
              assessorStatus: value.assessorStatus,
              assessedDate: value.assessedDate,
              submittedDate: value.submittedDate,
              assessorUserId: value.assessorUserId
            }
            console.log('AssessmentSummaryInfo assessInfo.assessId:', assessInfo.assessId);
            console.log('AssessmentSummaryInfo assessInfo:', JSON.stringify(assessInfo,null,1));
            self.setState({assessInfo: assessInfo});
          }
        });
      })
      .catch(function(err) {
        return console.log(err);
      });
  },

  render: function() {
    var self = this;
    var teamName = self.state.teamName;
    var indStatus = self.state.assessInfo['assessorStatus'];
    var assessorUserId = self.state.assessInfo['assessorUserId'];
    var selfStatus = self.state.assessInfo['assessmentStatus'];
    var assessmentDt = utils.showDateDDMMYYYYV2(self.state.assessInfo['submittedDate'], true);
    var indDt = self.state.assessInfo['assessedDate'];
    var displayType = {'display': 'none'};

    if (!_.isEmpty(assessorUserId)) {
      displayType = {'display': 'block'};
    } else {
      displayType = {'display': 'none'};
      // $('#indAssmtStat').remove();
      // $('#indAssmtDt').remove();
    }

    console.log('AssessmentSummaryInfo [render] assessmentDt:', assessmentDt)
    console.log('AssessmentSummaryInfo [render] assessorUserId:', assessorUserId)
    console.log('AssessmentSummaryInfo [render] isEmpty? assessorUserId:', _.isEmpty(assessorUserId))
    console.log('AssessmentSummaryInfo [render] indDt:', indDt);
    console.log('AssessmentSummaryInfo [render] displayType:', displayType);

    return (
      <div class="ibm-container-body">
        <div class="ibm-columns">
          <div class="ibm-col-1-1">
            <label><span>Team Name:</span></label> <span id="teamName">{teamName}</span>
          </div>
        </div>
        <div class="ibm-columns padTopby5">
          <div class="ibm-col-4-1">
            <label><span>Team assessment status:</span></label> <span id="selfStatus">{selfStatus}</span>
          </div>
          <div class="ibm-col-4-1">
            <label><span>Team assessment date:</span></label> <span id="assessmentDt">{assessmentDt}</span>
          </div>
          <div class="ibm-col-4-1" id="indAssmtStat" style={displayType} >
            <label><span>Independent assessment status:</span></label> <span id="indStatus">{indStatus}</span>
          </div>
          <div class="ibm-col-4-1" id="indAssmtDt" style={displayType}>
            <label><span>Independent assessment date:</span></label> <span id="indDt">{indDt}</span>
          </div>
        </div>
        <div class="ibm-columns padTopby10">
          <div class="ibm-col-1-1">
            <label><span class="mat-levels">Maturity Levels: 1-Initiating, 2-Practicing, 3-Transforming, 4-Scaling</span></label>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = AssessmentSummaryInfo;
