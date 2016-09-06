var recordConstraints = {
  _id:{
    presence : {
      message: '^Record id is required.'
    }
  },
  type:{
    presence: true
  },
  team_id:{
    presence : {
      message: '^Team id is required.'
    }
  },
  assessmt_version:{
    presence : {
      message: '^Assessment version is required.'
    }
  },
  team_proj_ops: {
    presence : {
      message: '^Team primary type is required.'
    },
    inclusion: {
      within: ["Project", "Operations"]
    }
  },
  team_dlvr_software:{
    presence : {
      message: '^Team software delivery is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_status:{
    presence : {
      message: '^Assessment status is required.'
    },
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  created_dt:{
    presence : {
      message: '^Created date is required.'
    }
  },
  created_user: {
    presence : {
      message: '^Created user id is required.'
    }
  },
  last_updt_dt:{
    presence : {
      message: '^Last update date is required.'
    }
  },
  last_updt_user:{
    presence : {
      message: '^Last update user id is required.'
    }
  }
};

var assessmentConstraints = {
  _id:{
    presence : {
      message: '^Record id is required.'
    }
  },
  type:{
    presence: true
  },
  team_id:{
    presence : {
      message: '^Team id is required.'
    }
  },
  assessmt_version:{
    presence : {
      message: '^Assessment version is required.'
    }
  },
  team_proj_ops: {
    presence : {
      message: '^Team primary type is required.'
    },
    inclusion: {
      within: ["Project", "Operations"]
    }
  },
  team_dlvr_software:{
    presence : {
      message: '^Team software delivery is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_status:{
    presence : {
      message: '^Assessment status is required.'
    },
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  submitter_id:{
    presence : {
      message: '^Submitter id is required.'
    },
    email: true
  },  
  "self-assessmt_dt":{
    presence : {
      message: '^Self assessment date is required.'
    }
  },
  ind_assessor_id:{
    presence: false
  },
  ind_assessmt_status:{
    presence: false,
    inclusion: {
      within: ["Draft", "Submitted"]
    }
  },
  ind_assessmt_dt:{
    presence: false
  },
  created_dt:{
    presence : {
      message: '^Created date is required.'
    }
  },
  created_user: {
    presence : {
      message: '^Created user id is required.'
    },
    email: true
  },
  last_updt_dt:{
    presence : {
      message: '^Last update date is required.'
    }
  },
  last_updt_user:{
    presence : {
      message: '^Last update user id is required.'
    },
    email: true
  },  
  doc_status:{
    presence: false
  },
  assessmt_cmpnt_rslts:{
    presence : {
      message: '^Assessment component results is required.'
    },
    checkComponents: true
  },
  assessmt_action_plan_tbl:{
    checkActionTable: true
  }
};

var compTbl ={
  principle_id:{
    presence : {
      message: '^Principle id is required.'
    }
  },
  principle_name:{
    presence : {
      message: '^Principle name is required.'
    }
  },
  practice_id:{
    presence : {
      message: '^Practice id is required.'
    }
  },
  practice_name:{
    presence : {
      message: '^Practice name is required.'
    }
  },
  cur_mat_lvl_achieved:{
    presence : {
      message: '^All assessment maturity practices need to be answered.  See highlighted practices in yellow.'
    }
  },
  cur_mat_lvl_score :{
    presence : {
      message: '^Current maturity level achieved is required.'
    },
    numericality: {
      message: '^Current maturity level score must be numeric.'
    }
  },
  tar_mat_lvl_achieved:{
    presence : {
      message: '^All assessment maturity practices need to be answered.  See highlighted practices in yellow.'
    }
  },
  tar_mat_lvl_score:{
    presence : {
      message: '^Target maturity level achieved is required.'
    },
    numericality: {
      message: '^Target maturity level score must be numeric.'
    }
  },
  ind_mat_lvl_achieved:{
    presence : false
  },
  ind_target_mat_lvl_score:{
    presence : false,
    numericality: {
      message: '^Independent target maturity level score must be numeric.'
    }
  },
  how_better_action_item:{
    presence: false,
    length: {
      maximum: 350
    }
  },
  ind_assessor_cmnt:{
    presence: false
  }
};

var actionPlanTbl ={
  action_plan_entry_id:{
    presence : {
      message: '^Action plan entry id is required.'
    },
    numericality: {
      message: '^Action plan entry id must be numeric.'
    }
  },
  user_created:{
    presence : {
      message: '^User created is required.'
    },
    inclusion: {
      within: ["Yes", "No"]
    }
  },
  assessmt_cmpnt_name:{
    presence : {
      message: '^Assessment component name is required.'
    }
  },
  principle_id:{
    presence : {
      message: '^Principle id is required.'
    },
    numericality: {
      message: '^Principle id must be numeric.'
    }
  },
  principle_name:{
    presence : {
      message: '^Principle name is required.'
    }
  },
  practice_id:{
    presence : {
      message: '^Practice id is required.'
    },
    numericality: {
      message: '^Practice id must be numeric.'
    }
  },
  practice_name:{
    presence : {
      message: '^Practice name is required.'
    }
  },
  how_better_action_item:{
    presence : false,
    length: {
      maximum: 350
    }
  },
  cur_mat_lvl_score :{
    presence : {
      message: '^Current maturity level score is required.'
    },
    numericality: {
      message: '^Current maturity level score must be numeric.'
    }
  },
  tar_mat_lvl_score:{
    presence : {
      message: '^Target maturity level score is required.'
    },
    numericality: {
      message: '^Target maturity level score must be numeric.'
    }
  },
  progress_summ:{
    presence : false,
    length: {
      maximum: 350
    }
  },
  key_metric:{
    presence: false,
    length: {
      maximum: 350
    }
  },
  review_dt:{
    presence: false
  },
  action_item_status:{
    presence : {
      message: '^Action item status is required.'
    },
    inclusion: {
      within: ["Open", "In-progress", "Closed"]
    }
  }
};

var cmpnt_rslts = {
  assessed_cmpnt_name: {
    presence: { 
      message: '^Assessment component name is required.'
    }
  },
  assessed_cmpnt_tbl: {
    checkComponentsTable: true
  },
  ovralcur_assessmt_score: {
    presence: {
      message: '^Overall current assessment score is required.'
    },
    numericality: {
      message: '^Overall current assessment score must be numeric.'
    }
  },
  ovraltar_assessmt_score:{
    presence: {
      message: '^Overall target assessment score is required.'
    },
    numericality: {
      message: '^Overall target assessment score must be numeric.'
    }    
  }
};


exports.recordConstraints = recordConstraints;
exports.assessmentConstraints = assessmentConstraints;
exports.compTbl = compTbl;
exports.actionPlanTbl = actionPlanTbl;
exports.cmpnt_rslts = cmpnt_rslts;