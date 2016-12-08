var React = require('react');
var DatePicker = require('react-datepicker');
require('react-datepicker/dist/react-datepicker.css');

var statusList = ['Open', 'In-progress', 'Closed'];

var ActionItem = React.createClass({

  improveDescriptionChange: function(event){
    var obj = {};
    obj.improveDescription = event.target.value;
    this.props.updateFields(this.props.action.actionPlanId, obj);
  },

  progressSummaryChange: function(event){
    var obj = {};
    obj.progressSummary = event.target.value;
    this.props.updateFields(this.props.action.actionPlanId, obj);
  },

  keyMetricChange: function(event){
    var obj = {};
    obj.keyMetric = event.target.value;
    this.props.updateFields(this.props.action.actionPlanId, obj);
  },

  reviewDateChange: function(date){
    var obj = {};
    obj.reviewDate = new Date(date);
    this.props.updateFields(this.props.action.actionPlanId, obj);
  },

  actionStatusChange: function(event){
    var obj = {};
    obj.actionStatus = event.target.value;
    this.props.updateFields(this.props.action.actionPlanId, obj);
  },

  replaceEmpty:function (input) {
    var result = '';
    if (input != undefined && input != null) {
      result = input;
    }
    return result;
  },

  prepopulate: function(e){
    this.props.prepopulate(this.props.action.actionPlanId, e.target.value);
  },

  render: function() {
    var defWidth ={
      'width': '100px',
      'fontSize': '9pt'
    };

    var defTextArea ={
      'resize': 'none',
      'fontSize': '9pt'
    };
    
    var status = statusList.map(function(item) {
      return (
        <option key={item} value={item}>{item}</option>
      )
    });

    var practices = this.props.parameter.practices.map(function(item) {
      return (
        <option key={item.index} value={item.index}>{item.practiceName}</option>
      )
    });
    
    return (
      <tr id = {'td_action_' + this.props.action.actionPlanId}>
        {this.props.action.isUserCreated ?
          <td>
            <input name={'select_item_' + this.props.action.actionPlanId} aria-label='Select action' id={'select_item_' + this.props.action.actionPlanId} type='checkbox' onClick={this.props.checkHandling} /> 
          </td>:
          <td style={{'minWidth': '15px'}}/>
        }
        {this.props.action.isUserCreated ?
        <td id={'td_practice_' + this.props.action.actionPlanId }>
          <span>
            <select aria-label='Practice list' id={'practice_' + this.props.action.actionPlanId} name={'practice_' + this.props.action.actionPlanId} style={defWidth} onChange={this.prepopulate} value={this.props.action.practiceId != null ? this.props.action.practiceId : ''}>
              <option value='' key=''></option>
              {practices}
            </select> 
          </span>
        </td>:
        <td id={'td_practice_'+ this.props.action.actionPlanId} style={defWidth}>
          {this.replaceEmpty(this.props.action.practiceName)}
        </td>
        }
      <td id={'td_principle_' + this.props.action.actionPlanId} style={defWidth}>
        {this.replaceEmpty(this.props.action.principleName)}
      </td>
      <td id={'td_curScore_' + this.props.action.actionPlanId} >
        {this.replaceEmpty(this.props.action.currentScore)}
      </td>
      <td id={'td_tarScore_' + this.props.action.actionPlanId}>
        {this.replaceEmpty(this.props.action.targetScore)}
      </td>
      <td>
        <span>
          <textarea aria-label='Action item' id={'action_item_' + this.props.action.actionPlanId} maxLength = '350' cols='28' 
          style={defTextArea} type='text' name={'action_item_' + this.props.action.actionPlanId} disabled={this.props.action.isUserCreated ? (this.props.parameter.allowEdit && _.isEmpty(this.props.action.practiceName)): true} 
          value={this.props.action.improveDescription} onChange={this.improveDescriptionChange}/>
        </span>
      </td>
      <td>
        <span>
          <textarea aria-label='Progress summary' id={'summary_' + this.props.action.actionPlanId } maxLength = '350' type='text' cols='28' 
          name={'summary_' + this.props.action.actionPlanId } style={defTextArea} disabled={this.props.parameter.allowEdit && _.isEmpty(this.props.action.practiceName)} 
          value={this.props.action.progressSummary} onChange={this.progressSummaryChange}/>
        </span>
      </td>
      <td>
        <span>
          <textarea aria-label='Key metric' id={'metric_' + this.props.action.actionPlanId } maxLength = '350' type='text' cols='28' 
          name={'metric_' + this.props.action.actionPlanId } style={defTextArea} disabled={this.props.parameter.allowEdit && _.isEmpty(this.props.action.practiceName)} 
          value={this.props.action.keyMetric} onChange={this.keyMetricChange}/>
        </span>
      </td>
      <td>
        <span>
          <DatePicker selected={this.props.action.reviewDate != null? moment(this.props.action.reviewDate):null} readOnly onChange={this.reviewDateChange} name={'revDate_' + this.props.action.actionPlanId}  id={'revDate_' + this.props.action.actionPlanId} 
          ref={'revDate_' + this.props.action.actionPlanId} className='action_plan' disabled={this.props.parameter.allowEdit && _.isEmpty(this.props.action.practiceName)}/>
        </span>
      </td>
      <td id={'td_status_' + this.props.action.actionPlanId}>
        <span>
          {this.props.parameter.allowEdit && _.isEmpty(this.props.action.practiceName)?
            <select aria-label='Action list' id={'status_' + this.props.action.actionPlanId } name={'status_' + this.props.action.actionPlanId} disabled={true} 
            value={this.props.action.actionStatus} style={{'fontSize': '9pt', 'width': '80px', 'color': 'grey'}} onChange={this.actionStatusChange}>
            {status}
            </select>:
            <select aria-label='Action list' id={'status_' + this.props.action.actionPlanId } name={'status_' + this.props.action.actionPlanId} disabled={false}
            value={this.props.action.actionStatus} style={{'fontSize': '9pt', 'width': '80px'}} onChange={this.actionStatusChange}>
            {status}
            </select>
          }
          
        </span>
      </td>
      </tr>
    );
  }
});
module.exports = ActionItem;