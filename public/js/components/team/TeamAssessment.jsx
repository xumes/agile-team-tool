var React = require('react');
var _ = require('underscore');
var moment = require('moment');
var clipboard = null;
var TeamAssessment = React.createClass({
  componentDidUpdate: function() {
    if (clipboard) clipboard.destroy();
    clipboard = new Clipboard('#copy-button');
    var self = this;
    if (!_.isEmpty(self.props.selectedTeam)) {
      if (!_.isUndefined(self.refs.assessBtn)) {
        self.refs.assessBtn.disabled = !self.props.selectedTeam.access;
        if (!_.isEmpty(self.props.selectedTeam) && !_.isEmpty(self.props.selectedTeam.assessments)) {
          _.each(self.props.selectedTeam.assessments, function(assessment) {
            if (_.isEqual(assessment.assessmentStatus, 'Draft'))
              self.refs.assessBtn.disabled = true;
          });
        }
      }
    } else {
      if (!_.isUndefined(self.refs.assessBtn))
        self.refs.assessBtn.disabled = true;
    }
  },
  showMoreAssessments: function() {
    var assessmentsBlocks = $('tr[id^=asmntrow_]');
    $('#assessmentTitle').html('Assessments for' + this.props.selectedTeam.team.name);
    $('#moreAssessments').hide();
    $('#lessAssessments').show();
    _.each(assessmentsBlocks, function(assessmentBlock){
      $('#'+assessmentBlock.id).show();
    });
  },
  showLessAssessments: function() {
    var assessmentsBlocks = $('tr[id^=asmntrow_]');
    $('#assessmentTitle').html('Last 5 Assessments for' + this.props.selectedTeam.team.name);
    $('#moreAssessments').show();
    $('#lessAssessments').hide();
    _.each(assessmentsBlocks, function(assessmentBlock){
      if (parseInt(assessmentBlock.id.subString(8,assessmentBlock.id.length)) >= 5) {
        $('#'+assessmentBlock.id).hide();
      }
    });
  },
  createAssessment: function() {
    window.location = 'assessment?id=' + encodeURIComponent(this.props.selectedTeam.team._id);
  },
  render: function() {
    var self = this;

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
          <div class='ibm-show-hide ibm-widget-processed' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>
              <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={()=>self.props.showHideSection('assessmentPageSection')}>
                Assessment information
              </a>
            </h2>
            <div class='ibm-container-body' id='nonSquadAssessmentPageSection' style={{'display': 'none', 'marginTop': '15px'}}>
              <p>Non squad team does not manage assessment information.</p>
            </div>
          </div>
        )
      } else {
        var count = 0;
        if (self.props.selectedTeam.assessments != undefined && !_.isEmpty(self.props.selectedTeam.assessments)) {
          var assessments = _.sortBy(self.props.selectedTeam.assessments, function(assess){
            if (assess.assessmentStatus == 'Submitted') {
              return 'aaa'+new Date(assess.submittedDate);
            } else
              return 'zzz'+new Date(assess.createDate);
          });
          assessments = assessments.reverse();
          assessments = assessments.map(function(assessment){
            var assessmentId = 'asmntrow_'+count;
            var status = assessment.assessmentStatus;
            var displayDate = _.isEqual(status,'Submitted') ? moment(assessment.submittedDate).format('DDMMMYYYY') : moment(assessment.createDate).format('DDMMMYYYY');
            var updateBy = assessment.updatedBy;
            if (count < 5) {
              count++;
              return (
                <tr key={assessmentId} id={assessmentId}>
                  <td></td>
                  <td>
                    <a style={{'textDescription': 'underline', 'color': 'black'}} href={`/assessment?id=${self.props.selectedTeam.team._id}&assessId=${assessment._id}`}>{displayDate}</a>
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
                    <a style={{'textDescription': 'underline', 'color': 'black'}} href={`/assessment?id=${self.props.selectedTeam.team._id}&assessId=${assessment._id}`}>{displayDate}</a>
                  </td>
                  <td>{status}</td>
                  <td>{updateBy}</td>
                </tr>
              )
            }
          })
        } else {
          var assessments = (
            <tr class='odd'>
              <td colSpan='4' class='dataTables_empty'>No data available</td>
            </tr>
          );
        }
        var assessmentLink = location.origin+'/maturityTrends?id='+self.props.selectedTeam.team._id;
        if (count >= 5) {
          var showMoreBtnStyle = {
            'display': 'block'
          }
        } else {
          var showMoreBtnStyle = {
            'display': 'none'
          }
        }
        return (
          <div class='ibm-show-hide ibm-widget-processed' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>
              <a class='' title='Expand/Collapse' style={{'cursor':'pointer'}} onClick={()=>self.props.showHideSection('assessmentPageSection')}>
                Assessment information
              </a>
            </h2>
            <div class='ibm-container-body' id='squadAssessmentPageSection' style={{'display': 'none', 'marginTop': '15px'}}>
              <div style={{'float':'left', 'fontSize':'14px', 'width':'100%'}} class='tcaption'>
                <em id='assessmentTitle' class='ibm-bold'>Last 5 Assessments for {teamName}</em>
                <p style={{'float': 'right'}} class='ibm-button-link'>
                  <input type='button' class='ibm-btn-pri ibm-btn-small' id='assessBtn' ref='assessBtn' value='Create assessment' onClick={this.createAssessment}/>
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
              <div id='moreAssessments' style={showMoreBtnStyle}>
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
                  <input type='button' class='ibm-btn-sec ibm-btn-small clipboardBtn' id='copy-button' data-clipboard-target='#maturityTrendLink' value='Copy link' style={{'fontSize': '10pt', 'padding': '3px', 'marginLeft': '15px'}}/>
              </div>
            </div>
          </div>
        )
      }
    }
  }
});

module.exports = TeamAssessment;
