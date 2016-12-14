var moment = require('moment');
var React = require('react');
var api = require('../api.jsx');
var currentIterId = '';
var currentTeamId = '';
var currentStartDate = '';
var Tooltip = require('react-tooltip');
var refreshDefectsStartBalTT = 'Click to recalculate the opening balance of defects, based on the previous iteration, overwriting the value currently in this field.';

var IterationDefect = React.createClass({
  defectsStartBalChange: function(e){
    var obj = {};
    var defStartBal = e.target.value;

    var openDefects = this.numericValue(e.target.value);
    var newDefects = this.numericValue(this.props.iteration.defects);
    var closedDefects = this.numericValue(this.props.iteration.defectsClosed);
    var defEndBal = openDefects + newDefects - closedDefects;

    obj.defectsStartBal = openDefects;
    obj.defectsEndBal = defEndBal;
    this.props.updateDefectBal(obj);
  },

  defectsIterationChange: function(e){
    var obj = {};

    var openDefects = this.numericValue(this.props.iteration.defectsStartBal);
    var newDefects = this.numericValue(e.target.value);
    var closedDefects = this.numericValue(this.props.iteration.defectsClosed);
    var defEndBal = openDefects + newDefects - closedDefects;

    obj.defects = newDefects;
    obj.defectsEndBal = defEndBal;
    this.props.updateDefectBal(obj);
  },

  defectsClosedChange: function(e){
    var obj = {};

    var openDefects = this.numericValue(this.props.iteration.defectsStartBal);
    var newDefects = this.numericValue(this.props.iteration.defects);
    var closedDefects = this.numericValue(e.target.value);
    var defEndBal = openDefects + newDefects - closedDefects;

    obj.defectsClosed = closedDefects;
    obj.defectsEndBal = defEndBal;
    this.props.updateDefectBal(obj);
  },

  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
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

  componentDidUpdate: function() {
    this.refs.defectsStartBal.value = this.props.iteration.defectsStartBal;
    this.refs.defects.value = this.props.iteration.defects;
    this.refs.defectsClosed.value = this.props.iteration.defectsClosed;
    this.refs.defectsEndBal.value = this.props.iteration.defectsEndBal;
    var newStartDate = moment(this.props.iteration.startDate).format('YYYY-MM-DD');
    if (currentTeamId != this.props.iteration.teamId || (currentStartDate != newStartDate && !_.isEqual(newStartDate, 'Invalid date'))) {
      currentIterId = this.props.iteration._id
      currentTeamId = this.props.iteration.teamId;
      currentStartDate = moment(this.props.iteration.startDate).format('YYYY-MM-DD');
      if (_.isEmpty(currentIterId))
        this.getDefectsStartBalance();
    }
  },

  getDefectsStartBalance: function () {
    var self = this;
    if(!_.isEmpty(currentTeamId) && !_.isEqual(currentStartDate, 'Invalid date')){
      api.searchTeamIteration(currentTeamId, null, currentStartDate, 1)
        .then(function(iterations){
          return self.defectStartBalanceHandler(iterations);
        })
        .catch(function(err){
          //TODO error  handling
          console.log('[getDefectsStartBalance] '+JSON.stringify(err), err);
        });
    }
  },

  refreshDefectsStartBalance: function() {
    var self = this;
    var currentStartBalance = self.numericValue(self.props.iteration.defectsStartBal);
    var newStartBalance = 0;
    if(!_.isEmpty(currentTeamId) && !_.isEqual(currentStartDate, 'Invalid date')) {
      api.searchTeamIteration(currentTeamId, null, currentStartDate, 1)
        .then(function(iterations){
          if (!_.isEmpty(iterations) && !_.isUndefined(iterations[0].defectsEndBal) & !isNaN(parseInt(iterations[0].defectsEndBal))){
            newStartBalance = self.numericValue(iterations[0].defectsEndBal);
          }
          if (currentStartBalance == 0 || _.isEqual(currentStartBalance, newStartBalance)) {
            self.defectStartBalanceHandler(iterations);
          } else {
            if (confirm('You are about to overwrite the defect opening balance from ' + currentStartBalance + ' to ' + newStartBalance + '.  Do you want to continue?')){
              self.defectStartBalanceHandler(iterations);
            }
          }
        })
        .catch(function(err){
          //TODO error  handling
          console.log('[refreshDefectsStartBalance] '+JSON.stringify(err), err);
        });
    }
  },

  defectStartBalanceHandler:function (iterations) {
    var startBalance = 0;
    var obj = {};
    if (iterations != undefined && !_.isNull(iterations[0].defectsEndBal) && !isNaN(this.numericValue(iterations[0].defectsEndBal)))
      startBalance = iterations[0].defectsEndBal;

    var openDefects = this.numericValue(startBalance);
    var newDefects = this.numericValue(this.props.iteration.defects);
    var closedDefects = this.numericValue(this.props.iteration.defectsClosed);
    var defEndBal = openDefects + newDefects - closedDefects;

    obj.defectsStartBal = startBalance;
    obj.defectsEndBal = defEndBal;
    this.props.updateDefectBal(obj);
  },

  render: function() {
    var helpStyle = {
      'color': 'grey'
    };

    var linkStyle = {
      'position': 'relative',
      'top': '3px',
      'left': '5px',
      'display': (!this.props.isReadOnly && !_.isEmpty(this.props.iteration.teamId)) ? 'inline':'none',
      'cursor': 'pointer'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Defects</h2>
        <Tooltip id='defTT'/>
        {(!this.props.isReadOnly && !_.isEmpty(this.props.iteration.teamId)) ?
          <span id='defectHelp' style={helpStyle}>
            Capture the defects that are added and resolved in your production environment during this iteration. The opening and closing balance values are calculated, but you can change the opening balance if you need to. Once you make changes to that field, the data will not be recalculated unless you explicitly click to recalculate it.
          </span>:null}
          <div className='defectsSection'>
            <div>
              <label for='defectsStartBal'>Opening balance:</label>
              <input type='text' name='defectsStartBal' id='defectsStartBal' ref='defectsStartBal' placeholder='0' size='6' onChange={this.defectsStartBalChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste} />
              <a id='refreshDefectsStartBal' className='ibm-refresh-link' style={linkStyle} role='button' onClick={this.refreshDefectsStartBalance} data-tip={refreshDefectsStartBalTT} />
            </div>
            <div>
              <label for='defects'>New this iteration:</label>
              <input type='text' name='defects' id='defects' ref='defects' placeholder='0' size='6' onChange={this.defectsIterationChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </div>
            <div>
              <label for='defectsClosed'>Resolved this iteration:</label>
              <input type='text' name='defectsClosed' id='defectsClosed' ref='defectsClosed' placeholder='0' size='6' onChange={this.defectsClosedChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </div>
            <div>
              <label for='defectsEndBal'>Closing balance:</label>
              <input type='text' name='defectsEndBal' id='defectsEndBal' ref='defectsEndBal' placeholder='0' size='6' disabled />
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
