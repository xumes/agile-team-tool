var React = require('react');
var Dropdown = require('./Dropdown.jsx');
var Defect = require('./IterationDefect.jsx');
var Tooltip = require('react-tooltip');
var dropList = [];
dropList.push({id:true, name: 'Yes'});
dropList.push({id:false, name: 'No'});

var teamChangeListTT = 'Indicate if there was a change to the team\'s makeup during this iteration.  Changes might include adding/replacing/removing members or member allocation percentage updates that you feel are significant.  Indicating that a team change occurred might help to explain higher/lower team productivity when compared to other iterations.';

var clientSatisfactionTT = 'Please indicate the satisfaction level of your client(s) with the results of this iteration using the following scale:' +
    '<br/>4 - Very satisfied' +
    '<br/>3 - Satisfied' +
    '<br/>2 - Dissatisfied' +
    '<br/>1 - Very dissatisfied';

var teamSatisfactionTT = 'Please indicate how happy your team was during the course of this iteration using the following scale:' +
    '<br />4 - Very happy' +
    '<br />3 - Happy' +
    '<br />2 - Unhappy' +
    '<br />1 - Very unhappy';

var IterationResult = React.createClass({

  commStoriesDelChange: function(e){
    var delStories = e.target.value;
    this.props.updateField('deliveredStories', delStories);
    this.calculateMetrics(delStories, this.props.iteration.storyPointsDelivered);
  },

  commPointsDelChange: function(e){
    var delPoints = e.target.value;
    this.props.updateField('storyPointsDelivered', delPoints);
    this.calculateMetrics(this.props.iteration.deliveredStories, delPoints);
  },

  deploythisIterationChange: function(e){
    this.props.updateField('deployments', e.target.value);
  },

  defectsIterationChange: function(e){
    this.props.updateField('defects', e.target.value);
  },

  cycleTimeWIPChange: function(e){
    this.props.updateField('cycleTimeWIP', e.target.value);
  },

  cycleTimeInBacklogChange: function(e){
    this.props.updateField('cycleTimeInBacklog', e.target.value);
  },

  clientSatisfactionChange: function(e){
    this.props.updateField('clientSatisfaction', e.target.value);
  },

  teamSatisfactionChange: function(e){
    this.props.updateField('teamSatisfaction', e.target.value);
  },

  commentIterChange: function(e){
    this.props.updateField('comment', e.target.value);
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

  roundOff:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      e.target.value = value.toFixed(1);
    }
  },

  statisfactionCheck:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      value = value.toFixed(1);
      if (value == 0 || (value >= 1 && value <= 4)) {
        e.target.value = value;
      }
    }
  },

  numericValue:function(num) {
    var value = parseInt(num);
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
      return '0.0';
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  calculateMetrics: function(commStoriesDel, commPointsDel) {
    var fte = this.props.iteration.memberFte;
    if (fte != null && !isNaN(parseFloat(fte))){      
      var storiesFTE = (this.numericValue(commStoriesDel) / fte).toFixed(1);
      this.props.updateMetrics('unitCostStoriesFTE', storiesFTE);

      var strPointsFTE = (this.numericValue(commPointsDel) / fte).toFixed(1);
      this.props.updateMetrics('unitCostStoryPointsFTE', strPointsFTE);
    }
  },

  getDefectsStartBalance: function(){
    this.refs.defect.getDefectsStartBalance();
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '470px'
    };
    var linkStyle1 = {
      'position': 'relative',
      'top': '-5px',
      'left': '10px',
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
      'left': '-290px',
      'display': 'inline'
    };

    var spacing = {
      'marginBottom':'10px'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Iteration results</h2>
        <Tooltip html={true}/>
        <div style={spacing}>
          <label for='commStoriesDel' style={labelStyle}>Throughput - Stories/tickets/cards delivered:<span className='ibm-required'></span></label>
            <span>
              <input type='text' name='commStoriesDel' id='commStoriesDel' size='8' value={this.props.iteration.deliveredStories != null?this.props.iteration.deliveredStories:''} placeholder='0' className='inputCustom' onChange={this.commStoriesDelChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
        </div>
        <div style={spacing}>
          <label for='commPointsDel' style={labelStyle}>Velocity - Story points delivered:<span className='ibm-required'></span></label>
          <span>
            <input type='text' name='commPointsDel' id='commPointsDel' size='8' value={this.props.iteration.storyPointsDelivered != null ?
            this.props.iteration.storyPointsDelivered:''} placeholder='0' className='inputCustom' onChange={this.commPointsDelChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='deploythisIteration' style={labelStyle}>Deployments this iteration:</label>
          <span>
            <input type='text' name='deploythisIteration' id='deploythisIteration' size='8' value={this.props.iteration.deployments != null?this.props.iteration.deployments:''} placeholder='0' className='inputCustom' onChange={this.deploythisIterationChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div class='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
        <Defect enableFields={this.props.enableFields} ref='defect' iteration={this.props.iteration} updateDefectBal={this.props.updateDefectBal}/>
        <div style={spacing}>
          <label for='cycleTimeWIP' style={labelStyle}>Cycle time in WIP (days):<span className='ibm-required'></span></label>
          <span>
            <input type='text' name='cycleTimeWIP' id='cycleTimeWIP' size='21' value={this.props.iteration.cycleTimeWIP != null ?this.props.iteration.cycleTimeWIP:''} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeWIPChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
          <div className='agile-static-helptip-WIP' id='helpWIP' alt='How to calculate WIP: For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.'>
            <strong>How to calculate WIP</strong><br/>
              For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.
          </div>
        </div>
        <div style={spacing}>
          <label for='cycleTimeInBacklog' style={labelStyle}>Cycle time in backlog (days):<span className='ibm-required'></span></label>
          <span>
            <input type='text' name='cycleTimeInBacklog' id='cycleTimeInBacklog' size='21' value={this.props.iteration.cycleTimeInBacklog != null ? this.props.iteration.cycleTimeInBacklog:''} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeInBacklogChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
          <div className='agile-static-helptip-backlog' id='helpBacklog' alt='How to calculate backlog time: For each story delivered in this iteration how long was it in your backlog before it was planned for this iteration? Put the average number of days in this field.'>
            <strong>How to calculate backlog time</strong><br/>
              For each story delivered in this iteration how long was it in your backlog before it was planned for this iteration? Put the average number of days in this field.
          </div>
        </div>
        <div style={spacing}>
          <label for='teamChangeList' style={labelStyle}>Was there a team change?
            <a className='ibm-information-link' id='teamChangeListTT' style={linkStyle1} data-tip={teamChangeListTT}></a>
          </label>
          <span>
           <Dropdown selectionList={dropList} id='teamChangeList' name='teamChangeList' enableFields={this.props.enableFields} iteration={this.props.iteration} updateField={this.props.updateField}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='clientSatisfaction' style={labelStyle}>Client satisfaction:
            <a className='ibm-information-link' id='clientSatisfactionTT' style={linkStyle1} data-tip={clientSatisfactionTT}></a>
          </label>
          <span>
            <input type='text' name='clientSatisfaction' id='clientSatisfaction' size='21' value={this.props.iteration.clientSatisfaction != null ? this.props.iteration.clientSatisfaction:''} placeholder='0.0' className='inputCustom' onChange={this.clientSatisfactionChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.statisfactionCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='teamSatisfaction' style={labelStyle}>Team satisfaction:
            <a className='ibm-information-link' id='teamSatisfactionTT' style={linkStyle1} data-tip={teamSatisfactionTT}></a>
          </label>
          <span>
            <input type='text' name='teamSatisfaction' id='teamSatisfaction' size='21' value={this.props.iteration.teamSatisfaction != null ? this.props.iteration.teamSatisfaction:''} placeholder='0.0' className='inputCustom' onChange={this.teamSatisfactionChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.statisfactionCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='commentIter' style={labelStyle}>Comment about this iteration:<span className='ibm-required'></span></label>
          <span>
            <textarea rows='4' cols='53' name='commentIter' id='commentIter' value={this.props.iteration.comment != null ? this.props.iteration.comment:''} onChange={this.commentIterChange} disabled={!this.props.enableFields}/>
          </span>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationResult;
