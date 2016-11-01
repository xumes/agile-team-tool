var React = require('react');
var _ = require('underscore');
var moment = require('moment');

var TeamAssessment = React.createClass({
  showMoreAssessments: function() {

  },
  render: function() {
    var self = this;
    var overallStyle = {
      'display': self.props.visible == false ? 'none': 'block'
    };

    if (self.props.selectedTeam.team == undefined) {
      return null;
    } else {
      var teamName = self.props.selectedTeam.team.name;
      if (self.props.selectedTeam.access) {
        var createAccess = '';
      } else {
        createAccess = 'disabled';
      }
      if (self.props.selectedTeam.type != 'squad') {
        return (
          <div class='ibm-container-body' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>Assessment information</h2>
            <div id='nonSquadAssessmentPageSection' style={{'display': 'block'}}>
              <p>Non squad team does not manage assessment information.</p>
            </div>
          </div>
        )
      } else {
        var count = 0;
        if (self.props.selectedTeam.assessments != undefined && !_.isEmpty(self.props.selectedTeam.assessments)) {
          var assessments = self.props.selectedTeam.assessments.map(function(assessment){
            var assessmentId = 'asmntrow_'+count;
            var status = assessment.assessmentStatus;
            var updateTime = moment(assessment.updateDate).format('DDMMMYYYY');
            var updateBy = assessment.updatedBy;
            if (count < 5) {
              count++;
              return (
                <tr key={assessmentId} id={assessmentId} style={{'display':'block'}}>
                  <td></td>
                  <td>
                    <a style={{'textDescription': 'underline', 'color': 'black'}}>{updateTime}</a>
                  </td>
                  <td>{status}</td>
                  <td>{updateBy}</td>
                </tr>
              )
            } else {
              count++;
              return (
                <tr key={assessmentId} id={assessmentId} style={{'display':'none'}}>
                  <td></td>
                  <td>
                    <a style={{'textDescription': 'underline', 'color': 'black'}}>{updateTime}</a>
                  </td>
                  <td>{status}</td>
                  <td>{updateBy}</td>
                </tr>
              )
            }
          })
        } else {
          var assessments = null;
        }
        var assessmentLink = 'https://agile-tool-nodejs-stage.mybluemix.net/maturityTrends?id='+self.props.selectedTeam.team._id;
        return (
          <div class='ibm-container-body' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>Assessment information</h2>
              <div id='squadAssessmentPageSection' style={{'display': 'block', 'marginTop': '15px'}}>
                <div style={{'float':'left', 'fontSize':'14px', 'width':'100%'}} class='tcaption'>
                  <em id='assessmentTitle' class='ibm-bold'>Last 5 Assessments for {teamName}</em>
                  <p style={{'float': 'right'}} class='ibm-button-link'>
                    <input type='button' class='ibm-btn-pri ibm-btn-small' id='assessBtn' value='Create assessment' onclick='' disabled={createAccess}/>
                  </p>
                </div>
                <table class='ibm-data-table' id='assessmentTable' summary='List of assessment information' style={{'fontSize': '90%'}}>
                  <thead>
                    <tr>
                      <th scope='col' width='1%'></th>
                      <th scope='col' width='30%'>Assessment/Creation Date</th>
                      <th scope='col' width='35%'>Status</th>
                      <th scope='col' width='35%'>Last Update User</th>
                    </tr>
                  </thead>
                  <tbody id='assessmentList'>
                    {assessments}
                  </tbody>
                </table>
                <div id='moreAssessments' style={{'display': 'none'}}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link' onClick={self.showMoreAssessments}>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; More..</a> </label>
                  </p>
                </div>
                <div id='lessAssessments' style={{'display': 'none'}}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link'onClick={self.showLessAssessments}>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Less..</a> </label>
                  </p>
                </div>
                <div id='maturityTrend' style={{'paddingTop': '25px', 'paddingBottom': '15px'}}>
                    <span style={{'fontSize': '10pt', 'fontWeight': 'bold', 'paddingLeft': '20px'}}>Link to maturity trend graph:&nbsp;</span>
                    <span style={{'fontSize': '10pt'}} id='maturityTrendLink'>{assessmentLink}</span>
                    <button class='button' id='copy-button' data-clipboard-target='#maturityTrendLink' style={{'fontSize': '10pt', 'fontWeight': 'bold', 'marginLeft': '15px'}} onclick='return false;'>Copy Link</button>
                </div>
              </div>
          </div>
        )
      }
    }
  }



});

module.exports = TeamAssessment;
