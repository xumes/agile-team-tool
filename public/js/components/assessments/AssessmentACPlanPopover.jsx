var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var AssessmentSummaryTable = require('./AssessmentSummaryTable.jsx');
var AssessmentACPlanTable = require('./AssessmentACPlanTable.jsx');

var AssessmentACPlanPopover = React.createClass({
  componentDidMount: function() {
    var self = this;
    var submitCount = 0
    _.find(self.props.loadDetailTeam.assessments, function(assess){
      if (assess.assessmentStatus != 'Draft') {
        submitCount ++;
        if (assess._id.toString() == self.props.tempAssess._id.toString()) {
          return true;
        }
      }
    });
    if (submitCount == 1) {
      self.hideBlock(1);
      self.hideBlock(2);
    } else {
      self.showBlock(1);
      self.showBlock(2);
    }
    // if (self.props.loadDetailTeam.assessments.length == 1 || (self.props.loadDetailTeam.assessments.length == 2 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft')) {
    //   self.showBlock(1);
    //   self.showBlock(2);
    // } else {
    //   self.hideBlock(1);
    //   self.hideBlock(2);
    // }
  },
  showBlock: function(id) {
    $('#showBlockBtn' + id).hide();
    $('#hideBlockBtn' + id).show();
    $('#assessmentContainer' + id).show();
  },
  hideBlock: function(id) {
    $('#showBlockBtn' + id).show();
    $('#hideBlockBtn' + id).hide();
    $('#assessmentContainer' + id).hide();
  },
  render: function() {
    var self = this;
    var tempAssess = self.props.tempAssess;
    if (tempAssess.submittedDate == '') {
      submitDate = 'On Submisson';
    } else {
      submitDate = moment(tempAssess.submittedDate).format('DD MMM YYYY');
    }
    lastUpdatedBy = tempAssess.updatedBy;
    lastUpdated = ' (' + moment.utc(tempAssess.updateDate).format('DD MMM YYYY') + ')';
    assessType = tempAssess.type;
    deliversSoftware = tempAssess.deliversSoftware?'Yes':'No';
    var componentResultLC = {};
    var componentShow1 = 'none';
    var componentResultDD = {};
    var componentShow2 = 'none';
    if (tempAssess.componentResults[0]) {
      componentResultLC = tempAssess.componentResults[0];
      componentShow1 = 'block';
    }
    if (tempAssess.componentResults[1]) {
      componentResultDD = tempAssess.componentResults[1];
      componentShow2 = 'block';
    }
    if (self.props.tempAssess && !_.isEmpty(self.props.tempAssess)) {
      return (
        <div tabIndex='1' class='assessment-popover-block'>
          <div class='assessment-title'>
            <h1>{'Agile Maturity Team Summary'}</h1>
            <div onClick={self.props.hideAssessmentACPlanPopover}>
              <InlineSVG src={require(('../../../img/Att-icons/att-icons-close.svg'))}></InlineSVG>
            </div>
          </div>
          <div class='assessment-header'>
            <div class='header-title'>
              <h1>{self.props.loadDetailTeam.team.name}</h1>
            </div>
            <div class='assessment-status'>
              <div class='status-title'>
                <h1 style={{'width':'11%'}}>{'Team Type'}</h1>
                <h1 style={{'width':'17%','left':'10%'}}>{'Delivers Software'}</h1>
                <h1 style={{'width':'16%','left':'16%'}}>{'Submission Date'}</h1>
                <h1 style={{'width':'16%','left':'26%'}}>{'Last Updated By'}</h1>
              </div>
              <div class='status-selection'>
                <div class='team-type-selector'>
                  <h1 style={{'left':'4%'}}>{assessType}</h1>
                </div>
                <div class='team-type-selector' style={{'left':'2%'}}>
                  <h1>{deliversSoftware}</h1>
                </div>
                <div class='submit-date-selector' style={{'left':'6%'}}>
                  <h1 id='assessmentSubmitDateTitle'>{submitDate}</h1>
                </div>
                <div class='last-updated-by' style={{'left':'7%'}}>
                  <h1 id='lastUpdatedByEmail'>{lastUpdatedBy}</h1>
                  <h1 id='lastUpdatedByTime' style={{'marginTop':'-5%'}}>{lastUpdated}</h1>
                </div>
              </div>
            </div>
          </div>
          <div class='lc-header' style={{'display':componentShow1}}>
            <div class='header-title'>
              <h1>{'Leadership and Collaboration'}</h1>
            </div>
            <div class='hideBlock-btn' id='hideBlockBtn1' style={{'display':'block'}} onClick={self.hideBlock.bind(null, '1')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
            </div>
            <div class='showBlock-btn' id='showBlockBtn1' style={{'display':'none'}} onClick={self.showBlock.bind(null, '1')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
            </div>
          </div>
          <AssessmentSummaryTable loadDetailTeam={self.props.loadDetailTeam} componentResult={componentResultLC} assessType={assessType} componentId={'1'} assessTemplate={self.props.assessTemplate}/>
          <div class='lc-header' style={{'display':componentShow2}}>
            <div class='header-title'>
              <h1>{'Delivery and DevOps'}</h1>
            </div>
            <div class='hideBlock-btn' id='hideBlockBtn2' style={{'display':'block'}} onClick={self.hideBlock.bind(null, '2')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
            </div>
            <div class='showBlock-btn' id='showBlockBtn2' style={{'display':'none'}} onClick={self.showBlock.bind(null, '2')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
            </div>
          </div>
          <AssessmentSummaryTable loadDetailTeam={self.props.loadDetailTeam} componentResult={componentResultDD} assessType={assessType} componentId={'2'} assessTemplate={self.props.assessTemplate}/>
          <div class='lc-header'>
            <div class='header-title'>
              <h1>{'Action Plan'}</h1>
            </div>
            <div class='hideBlock-btn' id='hideBlockBtn3' style={{'display':'block'}} onClick={self.hideBlock.bind(null, '3')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
            </div>
            <div class='showBlock-btn' id='showBlockBtn3' style={{'display':'none'}} onClick={self.showBlock.bind(null, '3')}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
            </div>
          </div>
          <AssessmentACPlanTable updateAssessmentSummary={self.props.updateAssessmentSummary} loadDetailTeam={self.props.loadDetailTeam} tempAssess={self.props.tempAssess} componentId={'3'} assessTemplate={self.props.assessTemplate}/>
        </div>
      )
    } else {
      return null;
    }
  }
});

module.exports = AssessmentACPlanPopover;
