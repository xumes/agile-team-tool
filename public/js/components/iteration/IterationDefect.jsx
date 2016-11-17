var React = require('react');
var api = require('../api.jsx');
var Tooltip = require('react-tooltip');
var refreshDefectsStartBalTT = 'Click to recalculate the opening balance of defects, based on the previous iteration, overwriting the value currently in this field.';

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
    var defStartBal = e.target.value;
    this.setState({defectsStartBal : defStartBal});

    var defEndBal = this.computeDefectsEndBalance();
    this.setState({defectsEndBal: defEndBal});

    this.props.iteration.defectsStartBal = defStartBal;
    this.props.iteration.defectsEndBal = defEndBal;
  },

  defectsIterationChange: function(e){
    var defIteration = e.target.value;
    this.setState({defectsIteration : defIteration});

    var defEndBal = this.computeDefectsEndBalance();
    this.setState({defectsEndBal: defEndBal});

    this.props.iteration.defects = defIteration;
    this.props.iteration.defectsEndBal = defEndBal;
  },

  defectsClosedChange: function(e){
    var defClosed = e.target.value;
    this.setState({defectsClosed : defClosed});

    var defEndBal = this.computeDefectsEndBalance();
    this.setState({defectsEndBal: defEndBal});

    this.props.iteration.defectsClosed = defClosed;
    this.props.iteration.defectsEndBal = defEndBal;
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

  numericValue:function(data) {
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
        defectsStartBal: this.numericValue(data.defectsStartBal),
        defectsIteration: this.numericValue(data.defects),
        defectsClosed: this.numericValue(data.defectsClosed),
        defectsEndBal: this.numericValue(data.defectsEndBal),
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
    var openDefects = this.numericValue(this.state.defectsStartBal);
    var newDefects = this.numericValue(this.state.defectsIteration);
    var closedDefects = this.numericValue(this.state.defectsClosed);
    return openDefects + newDefects - closedDefects;
  },

  refreshDefectsStartBalance: function() {
    var self = this;
    var currentStartBalance = self.numericValue(this.props.iteration.defectsStartBal);
    var newStartBalance = 0;
    api.searchTeamIteration(self.props.iteration.teamId, self.props.iteration.startDate)
    .then(function(iterations){
      if (!_.isEmpty(iterations) && !_.isUndefined(iterations[0].defectsEndBal) & !isNaN(parseInt(iterations[0].defectsEndBal))){
        newStartBalance = self.numericValue(iterations[0].defectsEndBal);
      }
      if (isNaN(parseInt(currentStartBalance)) || currentStartBalance == 0 || _.isEqual(currentStartBalance, newStartBalance)) {
        self.defectStartBalanceHandler(iterations);
      } else {
        if (confirm('You are about to overwrite the defect opening balance from ' + currentStartBalance + ' to ' + newStartBalance + '.  Do you want to continue?')){
          self.defectStartBalanceHandler(iterations);
        }
      }
    })
    .catch(function(err){
      //TODO error  handling
      console.log('[refreshDefectsStartBalance] '+JSON.stringify(err));
    });

  },

  defectStartBalanceHandler:function (iterations) {
    var startBalance = 0;
    if (iterations != undefined && !_.isNull(iterations[0].defectsEndBal) && !isNaN(this.numericValue(iterations[0].defectsEndBal)))
      startBalance = iterations[0].defectsEndBal;

    this.setState({defectsStartBal : startBalance});
    this.setState({defectsEndBal: this.computeDefectsEndBalance()});
    this.props.iteration.defectsStartBal = this.state.defectsStartBal;
    this.props.iteration.defectsEndBal = this.state.defectsEndBal;
  },

  render: function() {
    var helpStyle = {
      'color': 'grey'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Defects</h2>
        <Tooltip id='defTT'/>
          <span id='defectHelp' style={helpStyle}>
            Capture the defects that are added and resolved in your production environment during this iteration. The opening and closing balance values are calculated, but you can change the opening balance if you need to. Once you make changes to that field, the data will not be recalculated unless you explicitly click to recalculate it.
          </span>
          <div className='defectsSection'>
            <div>
              <label for='defectsStartBal'>Opening balance:</label>
              <input type='number' name='defectsStartBal' id='defectsStartBal' value={this.state.defectsStartBal} placeholder='0' size='6' onChange={this.defectsStartBalChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste} />
              <a id='refreshDefectsStartBal' className='ibm-refresh-link' role='button' onClick={this.refreshDefectsStartBalance} data-tip={refreshDefectsStartBalTT}></a>
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
