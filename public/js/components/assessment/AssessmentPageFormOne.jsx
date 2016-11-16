var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('./AssessmentTeamSquad.jsx');
var api = require('../api.jsx');
var _ = require('underscore');
var moment = require('moment');

var AssessmentPageFormOne = React.createClass({
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
    if (this.props.squadAssessments.access) {
      var accessStyle = {
        'display': 'none'
      };
    } else {
      accessStyle = {
        'display': 'block'
      };
    }
    if (this.props.squadAssessments.assessments.length > 0) {
      var assessmentListsOption = this.props.squadAssessments.assessments.map(function(item) {
        var submittedDate = moment(item.submittedDate).format('D MMM YYYY');
        return (
          <option key={item._id} value={item._id}>{submittedDate}</option>
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
              <select name='assessmentSelectList' style={teamSelectListStyle} disabled={!this.props.squadAssessments.access}>
                <option value=''>Create new assessment...</option>
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
