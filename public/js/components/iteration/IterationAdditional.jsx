var React = require('react');
var Defect = require('./IterationDefect.jsx');
var Tooltip = require('react-tooltip');


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
  componentDidUpdate: function(prevProps, prevState) {
    var value = this.floatDefault(this.props.iteration.cycleTimeInBacklog);
    if (value > 0) {
      this.refs.cycleTimeInBacklog.value = value;
    }

    value = this.floatDefault(this.props.iteration.cycleTimeWIP);
    if (value > 0) {
      this.refs.cycleTimeWIP.value = value;
    }

    value = this.floatDefault(this.props.iteration.clientSatisfaction);
    if (value > 0) {
      this.refs.clientSatisfaction.value = value;
    }

    value = this.floatDefault(this.props.iteration.teamSatisfaction);
    if (value > 0) {
      this.refs.teamSatisfaction.value = value;
    }
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
      value = value.toFixed(1);
      e.target.value = value;
      this.props.updateField(e.target.id, value);
    }
  },

  statisfactionCheck:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      value = value.toFixed(1);
      if (value == 0 || (value >= 1 && value <= 4)) {
        e.target.value = value;
        this.props.clearError(e.target.id);
        this.props.updateField(e.target.id, value);
      }
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  floatDefault:function(num) {
    var value = parseFloat(num);
    if (!isNaN(value)) {
      return value.toFixed(1);
    }
    else {
      return 0;
    }
  },

  render: function() {
    var labelStyle = {
      'width': '218px'
    };
    var linkStyle1 = {
      'position': 'relative',
      'top': '-5px',
      'left': '10px',
      'display': 'inline'
    };

    return (
      <div>
        <Tooltip html={true}/>
        <div>
          <div className='iteration'>
            <div>
              <label for='cycleTimeWIP' style={labelStyle}>Cycle time in WIP (days):<span className='ibm-required'></span></label>
              <span>
                <input type='text' name='cycleTimeWIP' id='cycleTimeWIP' size='21' value={this.props.iteration.cycleTimeWIP != null ?this.props.iteration.cycleTimeWIP:''} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeWIPChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste} ref='cycleTimeWIP'/>
              </span>
            </div>
            <div className='agile-static-helptip-WIP iteration-right-column' id='helpWIP' alt='How to calculate WIP: For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.'>
              <strong>How to calculate WIP</strong><br/>
                For each story delivered in this iteration, how long did it take to go from being worked on (planned for this iteration) to production delivery? Put the average number of days in this field.
            </div>
          </div>
        </div>
        <div>
          <div className='iteration'>
            <div>
              <label for='cycleTimeInBacklog' style={labelStyle}>Cycle time in backlog (days):<span className='ibm-required'></span></label>
              <span>
                <input type='text' name='cycleTimeInBacklog' id='cycleTimeInBacklog' size='21' value={this.props.iteration.cycleTimeInBacklog != null ? this.props.iteration.cycleTimeInBacklog:''} placeholder='0.0' className='inputCustom' onChange={this.cycleTimeInBacklogChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste} ref='cycleTimeInBacklog'/>
              </span>
            </div>
            <div className='agile-static-helptip-backlog iteration-right-column' id='helpBacklog' alt='How to calculate backlog time: For each story delivered in this iteration how long was it in your backlog before it was planned for this iteration? Put the average number of days in this field.'>
              <strong>How to calculate backlog time</strong><br/>
                For each story delivered in this iteration how long was it in your backlog before it was planned for this iteration? Put the average number of days in this field.
            </div>
          </div>
        </div>
        
        <div className='iteration'>
          <div>
            <label for='clientSatisfaction' style={labelStyle}>Client satisfaction:
              <a className='ibm-iteration-link' id='clientSatisfactionTT' style={linkStyle1} data-tip={clientSatisfactionTT}></a>
            </label>
            <span>
              <input type='text' name='clientSatisfaction' id='clientSatisfaction' size='21' value={this.props.iteration.clientSatisfaction != null ? this.props.iteration.clientSatisfaction:''} placeholder='0.0' className='inputCustom' onChange={this.clientSatisfactionChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.statisfactionCheck} onPaste={this.paste} ref='clientSatisfaction'/>
            </span>
          </div>
        </div>
        <div className='iteration'>
          <div>
            <label for='teamSatisfaction' style={labelStyle}>Team satisfaction:
              <a className='ibm-iteration-link' id='teamSatisfactionTT' style={linkStyle1} data-tip={teamSatisfactionTT}></a>
            </label>
            <span>
              <input type='text' name='teamSatisfaction' id='teamSatisfaction' size='21' value={this.props.iteration.teamSatisfaction != null ? this.props.iteration.teamSatisfaction:''} placeholder='0.0' className='inputCustom' onChange={this.teamSatisfactionChange} disabled={!this.props.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.statisfactionCheck} onPaste={this.paste} ref='teamSatisfaction'/>
            </span>
          </div>
        </div>
        <div className='iteration'>
          <div>
            <label for='commentIter' style={labelStyle}>Comment about this iteration:<span className='ibm-required'></span></label>
            <span>
              <textarea rows='4' cols='86' name='commentIter' id='commentIter' value={this.props.iteration.comment != null ? this.props.iteration.comment:''} onChange={this.commentIterChange} disabled={!this.props.enableFields}/>
            </span>
          </div>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
}); 

module.exports = IterationResult;
