var React = require('react');
var api = require('../api.jsx');
var utils = require('../../utils');
var displayType = {'display': 'none'};

var AssessmentSummaryInfo = React.createClass({
  getInitialState: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    // console.log('AssessmentSummaryInfo urlParameters:',urlParameters);
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
      defaultTeamId: teamId,
      defaultAssessId: assessId,
      teamName: null,
      assessInfo: {}
    };
  },

  componentDidMount: function() {
    var self = this;
    api.loadTeam(self.state.defaultTeamId)
      .then(function(teamDetail) {
        // console.log('AssessmentSummaryInfo componentDidMount teamDetail:',teamDetail)
        if (teamDetail !== undefined && teamDetail._id !== undefined) {
          self.setState({teamName: teamDetail.name});
          return api.getTeamAssessments(self.state.defaultTeamId, self.state.defaultAssessId);
        }
      })
      .then(function(assessResult) {
        console.log('AssessmentSummaryInfo [componentDidMount] assessResult:',assessResult[0]);
        var assessInfo = {
          assessmentStatus: assessResult[0].assessmentStatus,
          createDate: assessResult[0].createDate,
          assessorStatus: assessResult[0].assessorStatus,
          assessedDate: assessResult[0].assessedDate,
          assessorUserId: assessResult[0].assessorUserId
        }
        self.setState({assessInfo: assessInfo});
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
    var assessmentDt = utils.showDateDDMMYYYY(self.state.assessInfo['submittedDate']);
    var indDt = self.state.assessInfo['assessedDate'];

    console.log('AssessmentSummaryInfo [render] assessmentDt:', assessmentDt)
    console.log('AssessmentSummaryInfo [render] assessorUserId:', assessorUserId)

    if (assessorUserId !== null) {
      displayType = {'display': 'block'};
    } else {
      displayType = {'display': 'none'};
    }

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
