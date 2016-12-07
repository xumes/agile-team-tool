var React = require('react');
var api = require('../api.jsx');
var ActionItem = require('./ActionItem.jsx');

var btnState = {
  'addDisabled': true,
  'deleteDisabled': true,
  'saveDisabled': true,
  'cancelDisabled': true,
};

var defaultItem = {
  'actionPlanId' : null,
  'isUserCreated': true,
  'componentName': '',
  'principleId':  null,
  'practiceName': '',
  'improveDescription': '',
  'currentLevel': '',
  'targetLevel': '',
  'progressComment': '',
  'keyMetric': '',
  'reviewDate': null,
  'actionStatus': 'Open'};

var itemParameter = {
  'allowEdit': false,
  'practices':[],
  'principles':[]
};

var ActionPlanComponent = React.createClass({
  getInitialState: function() {
    return {
      assessment: {},
      btnState: btnState,
      allowEdit: false,
      principles: [],
      practices: [],
      itemParameter: itemParameter
    }
  },

  addEmptyRow: function(){
    var copy = _.clone(this.state.assessment);
    var newItem = _.clone(defaultItem);
    var id = 0;
    if (copy != null && copy.actionPlans != null){
      if (copy.actionPlans.length > 0){
        id = copy.actionPlans[copy.actionPlans.length-1].actionPlanId+1;
      }
      newItem.actionPlanId = id;
      copy.actionPlans.push(newItem);
      this.setState({assessment: copy});
    }
  },

  componentDidMount: function() {
    var self = this;
    var userAllowed = false;
    api.isUserAllowed(this.props.teamId)
    .then(function(allowed){
      userAllowed = allowed;
      return api.getAssessmentDetails(self.props.assessId);
    })
    .then(function(assessResult) {
        var btnStateCopy = _.clone(btnState);
        if (assessResult != null && userAllowed){
          btnStateCopy.addDisabled = false;
          if (assessResult.actionPlans.length > 0){
            btnStateCopy.saveDisabled = false;
            btnStateCopy.cancelDisabled = false;
          }
        }
        self.filterData(assessResult);
        var parameter = _.clone(self.state.itemParameter);
        parameter.allowEdit = userAllowed;

        self.setState({assessment: assessResult, btnState: btnStateCopy, itemParameter: parameter});
    })
    .catch(function(err) {
      return console.log(JSON.stringify(err));
    });
  },

  resetActionPlan: function(){
    var self = this;
    api.getAssessmentDetails(self.props.assessId)
      .then(function(data){
        if (confirm('Any unsaved data will be lost. Please confirm that you want to proceed with the reset.')){
          self.executeReset(data);
        }
      })
      .catch(function(err){
        console.log(JSON.stringify(err));
      })
  },

  executeReset: function (actionPlan) {
    var btnStateCopy = _.clone(btnState);
    btnStateCopy.addDisabled = false;
    this.setState({assessment: actionPlan, btnState:btnStateCopy});
  },

  processActionPlan: function () {
    var selected = this.state.assessment;
    if (selected != null && selected != undefined) {
      var invalid = this.validateAction(selected);
      if (!invalid) {
        this.submitActionPlan(selected, 'Action Plan item(s) saved successfully.');
      }
    }
  },

  validateAction: function (actions) {
    var hasError = false;
    var error = _.filter(this.state.assessment.actionPlans, function(item){
      if (_.isNull(item.practiceId) || _.isEmpty(item.practiceId)){
        return item;
      }
    });

    if (error.length > 0) {
      hasError = true;
      this.showMessagePopup('Please select principle.');
    }
    return hasError;
  },

  submitActionPlan: function (data, msg) {
    var self = this;
    api.updateAssessment(data)
    .then(function(result){
      self.setState({assessment:result});
      if (msg != null && msg != '')
        self.showMessagePopup(msg);
    })
    .catch(function(err){
      self.validationHandler(err);
    });
  },

  showMessagePopup: function(message) {
    alert(message);
  },

  validationHandler:function (errorResponse, operation) {
    var self = this;
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){        
        var popupMsg = '';
        if (_.isObject(errors)) {
          _.each(errors, function(err, attr) {
            popupMsg += err.message + '<br>';
          });
        } else {
          popupMsg = errors;
        }
        if (!_.isEmpty(popupMsg)) {
          self.showMessagePopup(popupMsg);
        }
      }
    }
  },

  deleteActionItems: function () {
    var deleteList = [];
    var selected = this.state.assessment;
    
    $("input[id^='select_item_']").filter(':checked').each(function(){
      deleteList.push(this.id.replace('select_item_',''));
    })

    if (deleteList.length > 0) {
      if (confirm('You have requested to delete the selected action item(s). Please confirm that you want to proceed with the deletion.')){
        this.executeDelete(selected, deleteList);
      }
    }
  },

  executeDelete: function (selected, deleteList) {
    var deleteItems = _.clone(this.state.assessment);
    var actions = deleteItems.actionPlans;
    var deleted = _.filter(actions, function(action){
      var result = false;
      for (x=0; x<deleteList.length;x++){
        if (action.actionPlanId == deleteList[x]){
          result = true;
          break;
        }
      }
      if(!result)
        return action;
    });
    deleteItems.actionPlans = deleted;
    
    this.submitActionPlan(deleteItems, 'Actions item(s) deleted successfully.');
    var btnStateCopy = _.clone(this.state.btnState);;
    btnStateCopy.deleteDisabled = true;
    this.setState({btnState: btnStateCopy});
  },

  getSelectedAssessment: function (assessmentList) {
    var selectedAssessment = '';
    if (assessmentList != null && assessmentList != undefined) {
      for (var y = 0; y < assessmentList.length; y++) {
        var assessmt = assessmentList[y];
        if (assessmt._id == assessId) {
          selectedAssessment = assessmt;
          break;
        }
      }
    }
    return selectedAssessment;
  },

  deleteBtnControl: function () {
    var btnStateCopy = _.clone(this.state.btnState);
    if ($("input[id^='select_item_']").filter(':checked').length > 0) {
      btnStateCopy.deleteDisabled = false;
    } else {
      btnStateCopy.deleteDisabled = true;
    }
    this.setState({btnState: btnStateCopy});
  },

  filterData: function(assessment){
    var self = this;
    if(assessment != null){
      var practicesCnt=0;
      var principles = _.clone(this.state.principles);
      _.each(assessment.componentResults, function(result, index){
        var assessedComponent = result.assessedComponents;
        _.each(assessedComponent, function(component){
          var obj = {};
          obj.index = practicesCnt;
          obj.assessedComponent = component;
          obj.componentName = result.componentName;
          practicesCnt++;
          principles.push(obj);
          return obj;
        });
      });
      this.setState({principles: principles});
      self.storePractices();
    };
  },

  storePractices: function () {
    var list = [];
    var principles = this.state.principles;
    var practices = [];
    if (principles != null) {
      for (var x = 0; x < principles.length; x++) {
        var practice = {};
        practice.index = principles[x].index;
        practice.practiceName = principles[x].assessedComponent.practiceName;
        practices.push(practice);
      }
      var parameter = _.clone(this.state.itemParameter);
      parameter.practices = practices;
      parameter.principles = principles;
      this.setState({practices: practices, itemParameter: parameter});
    }
  },

  prepopulate: function(itemId, practiceId){
    var assessment = _.clone(this.state.assessment);
    var item = _.find(assessment.actionPlans, function(item){
      if( item.actionPlanId === itemId)
        return item;
    });
    
    var principle = _.find(this.state.principles, function(item){
      if( item.index == practiceId)
        return item;
    });

    item.practiceId = practiceId;
    item.practiceName = principle.assessedComponent.practiceName;
    item.principleId = principle.assessedComponent.principleId;
    item.principleName = principle.assessedComponent.principleName;
    item.currentScore = principle.assessedComponent.currentScore;        
    item.targetScore = principle.assessedComponent.targetScore;

    var btnState = _.clone(this.state.btnState);
    btnState.saveDisabled = false;
    btnState.cancelDisabled = false;
    this.setState({assessment: assessment, btnState: btnState});
  },

  updateFields: function(id, result){
    var copy = _.clone(this.state.assessment);
    var action = _.find(copy.actionPlans, function(item){
      if( item.actionPlanId === id)
        return item;
    });

    _.each(result, function(value, key){
      action[key] = value;
    });
    
    this.setState({assessment:copy});
  },

  render: function() {
    var items = [];
    var self = this;
    if (!_.isEmpty(this.state.assessment)){
      items = this.state.assessment.actionPlans.map(function(item) {
        return (
          <ActionItem action={item} key={item.actionPlanId} checkHandling={self.deleteBtnControl} parameter={self.state.itemParameter} 
           prepopulate={self.prepopulate} updateFields={self.updateFields}/>
        )
      });
    }
    return (
      <div data-widget="showhide" data-type="panel" class="ibm-show-hide" id="actPlanContainer">
        <h2 class="agile-summary" data-open="true">Action Plan</h2>
        <div class="ibm-container-body">
          <div class="auto-container">
            <table class="ibm-data-table ibm-altrows ibm-col-1-1 action datatable-margin" summary="__REPLACE_ME__">
              <thead>
                <tr>
                  <th id="selectCol"></th>
                  <th>Related Practice</th>
                  <th>Principle</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>How do we get better?</th>
                  <th>Progress Summary</th>
                  <th>Key Metric</th>
                  <th>Review Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="actionPlan">
                {items}
              </tbody>
            </table>
          </div>
          <div class="ibm-btn-row btnRow">
            <h3 class="floatLeft">*Note: there is a 350 character limit on entered text</h3>
            <input type="button" className="ibm-btn-sec ibm-btn-small" id="addActEntryBtn" value="Add action item"  disabled={this.state.btnState.addDisabled} onClick={this.addEmptyRow} />
            <input type="button" className="ibm-btn-sec ibm-btn-small" id="deleteActPlanBtn" value="Delete action item"  disabled={this.state.btnState.deleteDisabled} onClick={this.deleteActionItems}/>
            <input type="button" className="ibm-btn-pri ibm-btn-small" id="saveActPlanBtn" value="Save action plan"  disabled={this.state.btnState.saveDisabled} onClick={this.processActionPlan}/>
            <input type="button" className="ibm-btn-sec ibm-btn-small" id="cancelActPlanBtn" value="Reset action plan"  disabled={this.state.btnState.cancelDisabled} onClick={this.resetActionPlan}/>
          </div>
          <div id="dialog" title="Confirmation Required" />
        </div>
      </div>
    );
  }
});

module.exports = ActionPlanComponent;
