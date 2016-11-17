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
  getInitialState: function() {
    return {
      enableFields: this.props.enableFields,
      commStoriesDel: '0',
      commPointsDel: '0',
      deploythisIteration: '0',
      defectsIteration: '0',
      cycleTimeWIP: '0.0',
      cycleTimeInBacklog: '0.0',
      memberChanged: false,
      clientSatisfaction: '0.0',
      teamSatisfaction: '0.0',
      commentIter: ''
    }
  },

  commStoriesDelChange: function(e){
    var delStories = e.target.value;
    this.props.updateField('deliveredStories', delStories);
    this.calculateMetrics(delStories, this.state.commPointsDel);
    this.setState({commStoriesDel : delStories});
  },
  commPointsDelChange: function(e){
    var delPoints = e.target.value;
    this.props.updateField('storyPointsDelivered', delPoints);
    this.calculateMetrics(this.state.commStoriesDel, delPoints);
    this.setState({commPointsDel : delPoints});
  },
  deploythisIterationChange: function(e){
    this.props.updateField('deployments', e.target.value);
    this.setState({deploythisIteration : e.target.value});
  },
  defectsIterationChange: function(e){
    this.props.updateField('defects', e.target.value);
    this.setState({defectsIteration : e.target.value});
  },
  cycleTimeWIPChange: function(e){
    this.props.updateField('cycleTimeWIP', e.target.value);
    this.setState({cycleTimeWIP : e.target.value});
  },
  cycleTimeInBacklogChange: function(e){
    this.props.updateField('cycleTimeInBacklog', e.target.value);
    this.setState({cycleTimeInBacklog : e.target.value});
  },
  memberChange: function(e){
    this.props.updateField('memberChanged', e.target.value);
    this.setState({memberChanged : e.target.value});    
  },
  clientSatisfactionChange: function(e){
    this.props.updateField('clientSatisfaction', e.target.value);
    this.setState({clientSatisfaction : e.target.value});
  },
  teamSatisfactionChange: function(e){
    this.props.updateField('teamSatisfaction', e.target.value);
    this.setState({teamSatisfaction : e.target.value});
  },
  commentIterChange: function(e){
    this.props.updateField('comment', e.target.value);
    this.setState({commentIter : e.target.value});
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

  populateForm: function(data, state){
    if (data != undefined && data != null){
      this.setState({
        commStoriesDel: this.numericValue(data.deliveredStories),
        commPointsDel: this.numericValue(data.storyPointsDelivered),
        deploythisIteration: this.numericValue(data.deployments),
        cycleTimeWIP: this.floatDefault(data.cycleTimeWIP),
        cycleTimeInBacklog: this.floatDefault(data.cycleTimeInBacklog),
        memberChanged: data.memberChanged,
        clientSatisfaction: this.floatDefault(data.clientSatisfaction),
        teamSatisfaction: this.floatDefault(data.teamSatisfaction),
        commentIter: data.comment != null?data.comment:'',
        enableFields: state
      });
      this.refs.defect.populateForm(data, state);
    }
    else {
      this.setState({
        commStoriesDel: 0,
        commPointsDel: 0,
        deploythisIteration: 0,
        cycleTimeWIP: '0.0',
        cycleTimeInBacklog:  '0.0',
        memberChanged: false,
        clientSatisfaction: '0.0',
        teamSatisfaction: '0.0',
        commentIter: '',
        enableFields: state
      });
      this.refs.defect.populateForm(data, state);
    }
    
  },

  enableFormFields: function(state){
    this.setState({enableFields: state});
    this.refs.defect.enableFormFields(state);
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
              <input type='number' name='commStoriesDel' id='commStoriesDel' size='8' value={this.state.commStoriesDel} placeholder='0' min='0' className='inputCustom' onChange={this.commStoriesDelChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
        </div>
        <div style={spacing}>
          <label for='commPointsDel' style={labelStyle}>Velocity - Story points delivered:<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='commPointsDel' id='commPointsDel' size='8' value={this.state.commPointsDel} placeholder='0' min='0' className='inputCustom' onChange={this.commPointsDelChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='deploythisIteration' style={labelStyle}>Deployments this iteration:</label>
          <span>
            <input type='number' name='deploythisIteration' id='deploythisIteration' size='8' value={this.state.deploythisIteration} placeholder='0' min='0' className='inputCustom' onChange={this.deploythisIterationChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </div>
        <div class='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
        <Defect enableFields={this.state.enableFields} ref='defect' iteration={this.props.iteration} />
        <div style={spacing}>
          <label for='cycleTimeWIP' style={labelStyle}>Cycle time in WIP (days):<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='cycleTimeWIP' id='cycleTimeWIP' min='0' step='0.1' size='21' value={this.state.cycleTimeWIP} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeWIPChange} disabled={!this.state.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
          <div className='agile-static-helptip-WIP' id='helpWIP' alt='How to calculate WIP: For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.'>
            <strong>How to calculate WIP</strong><br/>
              For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.
          </div>
        </div>
        <div style={spacing}>
          <label for='cycleTimeInBacklog' style={labelStyle}>Cycle time in backlog (days):<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='cycleTimeInBacklog' id='cycleTimeInBacklog' min='0' step='0.1' size='21' value={this.state.cycleTimeInBacklog} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeInBacklogChange} disabled={!this.state.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
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
           <Dropdown selectionList={dropList} selected={this.state.memberChanged} id='teamChangeList' name='teamChangeList' enableFields={this.state.enableFields} iteration={this.props.iteration}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='clientSatisfaction' style={labelStyle}>Client satisfaction:
            <a className='ibm-information-link' id='clientSatisfactionTT' style={linkStyle1} data-tip={clientSatisfactionTT}></a>
          </label>
          <span>
            <input type='number' name='clientSatisfaction' id='clientSatisfaction' min='0' max='4.0' step='0.1' size='21' value={this.state.clientSatisfaction} placeholder='0.0' className='inputCustom' onChange={this.clientSatisfactionChange} disabled={!this.state.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='teamSatisfaction' style={labelStyle}>Team satisfaction:
            <a className='ibm-information-link' id='teamSatisfactionTT' style={linkStyle1} data-tip={teamSatisfactionTT}></a>
          </label>
          <span>
            <input type='number' name='teamSatisfaction' id='teamSatisfaction' min='0' max='4.0' step='0.1' size='21' value={this.state.teamSatisfaction} placeholder='0.0' className='inputCustom' onChange={this.teamSatisfactionChange} disabled={!this.state.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
        </div>
        <div style={spacing}>
          <label for='commentIter' style={labelStyle}>Comment about this iteration:<span className='ibm-required'></span></label>
          <span>
            <textarea rows='4' cols='53' name='commentIter' id='commentIter' value={this.state.commentIter} onChange={this.commentIterChange} disabled={!this.state.enableFields}/>
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
