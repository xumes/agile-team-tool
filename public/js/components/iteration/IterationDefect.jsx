var React = require('react');

var IterationDefect = React.createClass({
  getInitialState: function() {
    return {
      enableFields: this.props.enableFields,
      defectsStartBal: 0,
      defectsIteration: 0,
      defectsClosed: 0,
      defectsEndBal: 0
    }
  },

  defectsStartBalChange: function(e){
    this.setState({defectsStartBal : e.target.value});
    this.setState({defectsEndBal: this.computeDefectsEndBalance()});
    this.props.iteration.defectsStartBal = this.state.defectsStartBal;
    this.props.iteration.defectsEndBal = this.state.defectsEndBal;
  },

  defectsIterationChange: function(e){
    this.setState({defectsIteration : e.target.value});
    this.setState({defectsEndBal: this.computeDefectsEndBalance()});
    this.props.iteration.defects = this.state.defectsIteration;
    this.props.iteration.defectsEndBal = this.state.defectsEndBal;
  },

  defectsClosedChange: function(e){
    this.setState({defectsClosed : e.target.value});
    this.setState({defectsEndBal: this.computeDefectsEndBalance()});
    this.props.iteration.defectsClosed = this.state.defectsClosed;
    this.props.iteration.defectsEndBal = this.state.defectsEndBal;
  },
  
  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
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

  isNum:function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  populateForm: function(data, state){
    if (data != undefined && data != null){
      this.setState({
        defectsStartBal: this.isNum(data.defectsStartBal),
        defectsIteration: this.isNum(data.defects),
        defectsClosed: this.isNum(data.defectsClosed),
        defectsEndBal: this.isNum(data.defectsEndBal),
        enableFields: state
      });
    }
    else {
      this.setState({
        defectsStartBal: 0,
        defectsIteration: 0,
        defectsClosed: 0,
        defectsEndBal: 0,
        enableFields: state
      });
    }
    
  },

  enableFormFields: function(state){
    this.setState({enableFields: state});
  },

  computeDefectsEndBalance: function() {
    var openDefects = parseInt(this.state.defectsStartBal);
    var newDefects = parseInt(this.state.defectsIteration);
    var closedDefects = parseInt(this.state.defectsClosed);
    openDefects = isNaN(openDefects) ? 0 : openDefects;
    newDefects = isNaN(newDefects) ? 0 : newDefects;
    closedDefects = isNaN(closedDefects) ? 0 : closedDefects;
    return openDefects + newDefects - closedDefects;
  },

  render: function() {
    var helpStyle = {
      'color': 'grey'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Defects</h2>
          <span id='defectHelp' style={helpStyle}>
            Capture the defects that are added and resolved in your production environment during this iteration. The opening and closing balance values are calculated, but you can change the opening balance if you need to. Once you make changes to that field, the data will not be recalculated unless you explicitly click to recalculate it.
          </span>
          <div className='defectsSection'>
            <div>
              <label for='defectsStartBal'>Opening balance:</label>
              <input type='number' name='defectsStartBal' id='defectsStartBal' value={this.state.defectsStartBal} placeholder='0' size='6' onChange={this.defectsStartBalChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste} />
              <a id='refreshDefectsStartBal' className='ibm-refresh-link' role='button'></a>
            </div>
            <div>
              <label for='defectsIteration'>New this iteration:</label>
              <input type='number' name='defectsIteration' id='defectsIteration' value={this.state.defectsIteration} placeholder='0' size='6' onChange={this.defectsIterationChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>                      
            </div>
            <div>
              <label for='defectsClosed'>Resolved this iteration:</label>
              <input type='number' name='defectsClosed' id='defectsClosed' value={this.state.defectsClosed} placeholder='0' size='6' onChange={this.defectsClosedChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>                      
            </div>
            <div>
              <label for='defectsEndBal'>Closing balance:</label>
              <input type='number' name='defectsEndBal' id='defectsEndBal' value={this.state.defectsEndBal} placeholder='0' size='6' onKeyPress={this.wholeNumCheck} onPaste={this.paste} disabled />
            </div>
          </div>
          <div className='ibm-rule ibm-gray-80'>
            <hr/>
          </div>
      </div>
    )
  }
});

module.exports = IterationDefect;
