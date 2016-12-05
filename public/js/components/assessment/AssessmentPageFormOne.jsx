var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('./AssessmentTeamSquad.jsx');
var api = require('../api.jsx');
var _ = require('underscore');
var moment = require('moment');

var AssessmentPageFormOne = React.createClass({
  componentDidUpdate: function() {
    $('select[name="assessmentSelectList"]').select2();
  },

  componentDidMount: function(){
    $('select[name="assessmentSelectList"]').select2();
    $('select[name="assessmentSelectList"]').change(this.props.assessmentChangeHandler);
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamSelectListStyle = {
      'width': '300px'
    };
    var optionTitle= 'Create new assessment...';
    var optionValue= 'n';
    if (this.props.assessment.access || this.props.assessment.teamId == '') {
      var accessStyle = {
        'display': 'none'
      };
    } else {
      accessStyle = {
        'display': 'block'
      };
      optionTitle= 'Select one';
      optionValue= 's';
    }
    if (this.props.assessment.squadAssessments.length > 0) {
      var assessments = _.sortBy(this.props.assessment.squadAssessments, function(assess){
        if (assess.assessmentStatus == 'Submitted') {
           return 'aaa'+new Date(assess.submittedDate);
        } else
          return 'zzz'+new Date(assess.createDate);
      });
      assessments = assessments.reverse();
      var assessmentListsOption = assessments.map(function(item) {
        var displayDate = moment(item.createDate).format('DDMMMYYYY');
        if (!_.isEqual(item.assessmentStatus, 'Submitted')) {
          displayDate = 'Created: ' + displayDate + ' (Draft)';
          optionTitle= 'Select one';
          optionValue= 's';
        } else {
          displayDate = moment(item.submittedDate).format('DDMMMYYYY');
        }
        return (
          <option key={item._id} value={item._id}>{displayDate}</option>
        );
      });
    } else {
      assessmentListsOption = null;
    }

    return (
      <div>
        <div class='agile-read-only-status ibm-item-note-alternate' id='userEditMsg' style={accessStyle}>You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team).</div>
        <p>
          <label for='assessmentSelectList'>Create new or select an existing assessment:<span class='ibm-required'>*</span></label>
            <span>
              <select name='assessmentSelectList' style={teamSelectListStyle}>
                <option value={optionValue}>{optionTitle}</option>
                {assessmentListsOption}
              </select>
            </span>
        </p>
        <div class='ibm-rule ibm-alternate'><hr/></div>
      </div>
    )
  }
});

module.exports = AssessmentPageFormOne;
