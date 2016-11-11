var React = require('react');
var Header = require('../Header.jsx');
var TeamSquadForm = require('./AssessmentTeamSquad.jsx');
var api = require('../api.jsx');
var _ = require('underscore');
var moment = require('moment');

var extractDetails = function(obj){
  var details = [];
  _.each(obj, function(v,i){
    details.push({
      '_id' : v['_id'],
      'submittedDate' : moment(v['submittedDate']).format('D MMM YYYY')
    });
  });
  return details;
};

var AssessmentPageFormOne = React.createClass({
  getInitialState: function() {
    return {
      assessmentLists: []
    }
  },

  componentDidMount: function(){
    $('select[name="assessmentSelectList"]').select2();
    $('select[name="assessmentSelectList"]').change(this.props.assessmentSelected);
  },

  clickAction: function(e){
   var self = this;
   var teamId = e.target.value;
   api.getSquadAssessments(teamId)
   .then(function(result){
      self.setState({
        assessmentLists: extractDetails(result)
      })
   })
   .then(function(){
    api.isUserAllowed(teamId)
     .then(function(allowed){
        console.log('is login user allowed: ', allowed);
        self.props.setUIState(allowed);
     });
   })
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamSelectListStyle = {
      'width': '300px'
    };
    
    var assessmentListsOption = this.state.assessmentLists.map(function(item) {
      return (<option key={item._id} value={item._id}>{item.submittedDate}</option>);
    });
    
    return ( <div>
                <Header title="Team Maturity Assessment" />
                <TeamSquadForm  clickAction={this.clickAction}/>
                <div class="agile-read-only-status ibm-item-note-alternate" id="userEditMsg" style={this.props.showInfoDisplayStyle}>You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team).</div>
                <p>
                <label for="assessmentSelectList">Create new or select an existing assessment:<span class="ibm-required">*</span></label>
                  <span>
                    <select name="assessmentSelectList" style={teamSelectListStyle}>
                    <option value="">Create new assessment...</option>
                    {assessmentListsOption}
                  </select>
                 </span>
               </p>
                <div class="ibm-rule ibm-alternate"><hr/></div>
               </div>
               )
  }
});

module.exports = AssessmentPageFormOne;
