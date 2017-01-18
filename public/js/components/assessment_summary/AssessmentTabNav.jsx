var React = require('react');
var utils = require('../utils.jsx');

var AssessmentTabNav = React.createClass({
  setAssessmentLink: function(teamId, assessId) {
    console.log('setAssessmentLink teamId:',teamId,' assessId:',assessId);
    var assessmentPage = 'assessment';
    if (teamId != '' && assessId != '') {
      assessmentPage = assessmentPage + '?id=' + teamId;
      assessmentPage = assessmentPage + '&assessId=' + assessId;
      $('#assessmentLink').attr('href', assessmentPage);
    } else {
      $('#assessmentLink').attr('href', assessmentPage);
    }
  },

  componentDidMount: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    if (urlParameters != undefined) {
      var teamId = urlParameters.id;
      var assessId = urlParameters.assessId;
      this.setAssessmentLink(teamId, assessId);
    }
  },

  render: function() {
    return (
      <div>
        <h2 class="ibm-bold ibm-h3">
          <a id="assessmentLink" href="#">Team Maturity Assessment</a> <span style={{padding: '5px'}}></span>|<span style={{padding: '5px'}}></span> Team Assessment Summary
        </h2>
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </div>
    );
  }
});

module.exports = AssessmentTabNav;
