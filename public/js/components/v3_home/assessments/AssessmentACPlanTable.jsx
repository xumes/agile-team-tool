var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var DatePicker = require('react-datepicker');
var AssessmentDatePicker = require('./AssessmentDatePicker.jsx');

var AssessmentACPlanTable = React.createClass({
  componentDidMount: function() {
    var self = this;
    if (self.props.loadDetailTeam.access) {
      $('.assessment-acplan-table > .table-block').hover(function(){
        var id = $(this)[0].id;
        $('#' + id + ' .action-plan-delete').css('display', 'block');
      },function(){
        var id = $(this)[0].id;
        $('#' + id + ' .action-plan-delete').css('display', 'none');
      })
    }
  },
  render: function(){
    var self = this;
    if (self.props.tempAssess) {
      if (self.props.loadDetailTeam.access) {
        var haveAccess = true;
      } else {
        haveAccess = false;
      }
      var tableBlocks = self.props.tempAssess.actionPlans.map(function(ap, idx){
        var reviewDate = ap.reviewDate==null?'Override':moment.utc(ap.reviewDate).format('DD MMM YYYY');
        var reviewDeteStyle = {
          color: ap.reviewDate==null?'#4178BE':'#323232',
          cursor: haveAccess?'pointer':'none'
        }
        var readOnlyStyle = {
          cursor: haveAccess&&ap.isUserCreated?'auto':'not-allowed',
          color: haveAccess&&ap.isUserCreated?'#323232':'#777677'
        }
        return (
          <div key={'actionPlan_' + idx} id={'actionPlan_' + idx} class='table-block'>
            <div style={{'width':'10%'}}>
              <h1>{ap.practiceName}</h1>
            </div>
            <div style={{'width':'10%'}}>
              <h1>{ap.principleName}</h1>
            </div>
            <div style={{'width':'6%'}}>
              <h1>{ap.currentScore}</h1>
            </div>
            <div style={{'width':'6%'}}>
              <h1>{ap.targetScore}</h1>
            </div>
            <div style={{'width':'15%'}}>
              <textarea readOnly={!haveAccess||!ap.isUserCreated} style={readOnlyStyle} maxLength='350' defaultValue={ap.improveDescription}/>
            </div>
            <div style={{'width':'15%','marginLeft':'1%'}}>
              <textarea readOnly={!haveAccess} maxLength='350' defaultValue={ap.progressSummary}/>
            </div>
            <div style={{'width':'15%','marginLeft':'1%'}}>
              <textarea readOnly={!haveAccess} maxLength='350' defaultValue={ap.keyMetric} />
            </div>
            <div style={{'width':'8%','marginLeft':'1%'}}>
              <h1 style={reviewDeteStyle}>{reviewDate}</h1>
            </div>
            <div style={{'width':'8%'}}>
              <div>
                <select id={'actionPlanSelect_' + idx} defaultValue={ap.actionStatus}>
                  <option value='Open'>{'open'}</option>
                  <option value='In-progress'>{'In-progress'}</option>
                  <option value='Closed'>{'Closed'}</option>
                </select>
              </div>
            </div>
            <div style={{'width':'4%','display':haveAccess?'block':'none'}}>
              <div class='action-plan-delete' style={{'cursor':'pointer','display':'none'}}>
                <InlineSVG src={require('../../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
              </div>
            </div>
          </div>
        );
      });
    }
    return (
      <div class='assessment-acplan-table' id={'assessmentContainer' + self.props.componentId}>
        <div class='header-title'>
          <div style={{'width':'10%'}}>
            <h1>{'Related Practice'}</h1>
          </div>
          <div style={{'width':'10%'}}>
            <h1>{'Principle'}</h1>
          </div>
          <div style={{'width':'6%'}}>
            <h1>{'Current'}</h1>
          </div>
          <div style={{'width':'6%'}}>
            <h1>{'Target'}</h1>
          </div>
          <div style={{'width':'15%'}}>
            <h1>{'How do we get better?'}</h1>
          </div>
          <div style={{'width':'15%','marginLeft':'1%'}}>
            <h1>{'Progress Summary'}</h1>
          </div>
          <div style={{'width':'15%','marginLeft':'1%'}}>
            <h1>{'Key Metric'}</h1>
          </div>
          <div style={{'width':'8%','marginLeft':'1%'}}>
            <h1>{'Review Date'}</h1>
          </div>
          <div style={{'width':'8%'}}>
            <h1>{'Status'}</h1>
          </div>
        </div>
        {tableBlocks}
        <div class='action-plan-add'>
          <button type='button' id='addActionPlan' class='ibm-btn-sec ibm-btn-blue-50'>{'Add Action Item'}</button>
        </div>
      </div>
    );
  }
});
module.exports = AssessmentACPlanTable;
