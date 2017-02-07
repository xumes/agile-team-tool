var React = require('react');
var Tooltip = require('react-tooltip');
var memberCountTT = "Number of unique team members supporting this iteration.  The default is derived based on the team's current makeup and can be overridden by user input. This count is used to compute the iteration's FTE value and the 2 Pizza Rule metric results.";

var fteThisiterationTT = "FTE (Full-time Equivalent) is sum of all Team Member allocation percentages divided by number of unique Team Members.  The default is derived based on the current team's makeup and can be overridden by user input.  This value is used to compute the iteration's Unit Cost values";

var refreshFTETT = 'Clicking this ICON will replace the team member count and the FTE value with current values from the Team Information area on the Home page.';

var IterationCommitment = React.createClass({
  commStoriesChange: function(e){
    this.props.updateField('committedStories',e.target.value);
  },

  commPointsChange: function(e){
    this.props.updateField('committedStoryPoints',e.target.value);
  },

  memberCountChange: function(e){
    this.props.updateField('memberCount',e.target.value);
  },

  fteThisiterationChange: function(e){
    this.props.updateField('memberFte',e.target.value);
  },

  fteThisiterationUpdate: function(e){
    var ftes = this.floatDefault(e.target.value).toFixed(1);
    this.props.updateField('memberFte',ftes);
    this.calculateMetrics(ftes);
  },

  calculateMetrics: function(fte) {
    if (!isNaN(parseFloat(fte)) && parseFloat(fte) > 0) {
      var commStoriesDel = this.numericValue(this.props.iteration.deliveredStories);
      var storiesFTE = (commStoriesDel / fte).toFixed(1);
      this.props.updateMetrics('unitCostStoriesFTE', storiesFTE);

      var commPointsDel = this.numericValue(this.props.iteration.storyPointsDelivered);
      var strPointsFTE = (commPointsDel / fte).toFixed(1);
      this.props.updateMetrics('unitCostStoryPointsFTE', strPointsFTE);
    }
  },

  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  decimalNumCheck:function(e) {
    var pattern = /^\d*[.]?\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(e.target.value + String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  teamMemCount: function () {
    var count = 0;
    var tmArr = [];
    var currentTeam = this.props.selectedTeamInfo();
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      $.each(currentTeam.members, function(key, member) {
        if (tmArr.indexOf(member.userId) == -1) {
          count++;
          tmArr.push(member.userId);
        }
      });
    }
    return count;
  },

  teamMemFTE: function () {
    var fte = 0.0;
    var currentTeam = this.props.selectedTeamInfo();
    if (!_.isEmpty(currentTeam) && currentTeam.members) {
      var teamCount = 0;
      var self = this;
      _.each(currentTeam.members, function(member) {
        teamCount += self.numericValue(member.allocation);
      });
      fte = parseFloat(teamCount / 100).toFixed(1);
    }
    return fte;
  },

  refreshFTE: function () {
    var tmc = this.teamMemCount();
    var fte = this.teamMemFTE();
    if (confirm('You are about to overwrite the contents of these fields with ' + tmc + ' and ' + fte + ' respectively.  Do you want to continue?')){
      this.refFTECount(tmc, fte);
    }
  },

  refFTECount: function (tmc, fte) {
    this.props.updateAllocation();
    this.props.addIteration('update');
  },

  numericValue:function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  floatDefault:function(num) {
    var value = parseFloat(num);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '470px'
    };
    var linkStyle1 = {
      'position': 'relative',
      'top': '-5px',
      'left': '-260px',
      'display': 'inline'
    };
    var linkStyle2 = {
      'position': 'relative',
      'top': '-5px',
      'left': '10px',
      'display': 'inline',
      'pointer': 'pointer'
    };
    var linkStyle3 = {
      'position': 'relative',
      'top': '-5px',
      'left': '-340px',
      'display': 'inline'
    };
    var spacing = {
      'marginBottom':'10px'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Iteration commitments</h2>
        <Tooltip id='commTT'/>
        <div style={spacing}>
          <label for='commStories' style={labelStyle}>Committed stories:<span className='ibm-required'></span></label>
          <span>
            <input type='text' name='commStories' id='commStories' size='8' value={this.props.iteration.committedStories != null ? this.props.iteration.committedStories:''} placeholder='0' className='inputCustom' onChange={this.commStoriesChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='commPoints' style={labelStyle}>Committed story points:<span className='ibm-required'></span></label>
          <span>
            <input type='text' name='commPoints' id='commPoints' size='8' value={this.props.iteration.committedStoryPoints!=null ? this.props.iteration.committedStoryPoints:''} placeholder='0' className='inputCustom' onChange={this.commPointsChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='memberCount' style={labelStyle}>Team members this iteration:<span className='ibm-required'></span></label>
          <a className='ibm-information-link' style={linkStyle1} data-tip={memberCountTT}/>
          <span>
            <input type='text' name='memberCount' id='memberCount' size='8' value={this.props.iteration.memberCount != null ?this.props.iteration.memberCount:''} placeholder='0' className='inputCustom' onChange={this.memberCountChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            <a className='ibm-refresh-link' style={linkStyle2} role='button' onClick={this.refreshFTE} data-tip={refreshFTETT}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='fteThisiteration' style={labelStyle}>FTE this iteration:<span className='ibm-required'></span></label>
          <a className='ibm-information-link' style={linkStyle3} data-tip={fteThisiterationTT}/>
          <span>
            <input type='text' name='fteThisiteration' id='fteThisiteration' min='0' size='21' value={this.props.iteration.memberFte != null?this.props.iteration.memberFte:''} placeholder='0.0' className='inputCustom' onChange={this.fteThisiterationChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.fteThisiterationUpdate} onPaste={this.paste}/>
          </span>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationCommitment;
