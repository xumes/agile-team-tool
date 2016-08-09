{
  "_id": "_design/erl_design",
  "_rev": "71-deadc2bfa5c28a929b9cce4b2710225d",
  "views": {
    "team doc dump": {
      "map": "function (doc) {\n    if (doc.type == 'team') {\n    emit(doc);\n    }\n}"
    },
    "iter doc dump": {
      "map": "function (doc) {\n    if (doc.type == 'iterationinfo') {\n    emit(doc);\n    }\n}"
    },
    "iter list": {
      "map": "function (doc) {\n    if (doc.type == 'iterationinfo') {\n    emit(doc.team_id,doc.iteration_name);\n    }\n}"
    },
    "team last update baseline": {
      "map": "function (doc) {\n    if (doc.type == 'team' && doc.last_updt_dt == '1/30/2016') {\n    emit(doc);\n    }\n}"
    },
    "team last update not baseline": {
      "map": "function (doc) {\n    if (doc.type == 'team' && doc.last_updt_dt != '1/30/2016') {\n    emit(doc);\n    }\n}"
    },
    "ma comp list": {
      "map": "function (doc) {\n  if (doc.type == 'ref_matassessment')\n      emit(doc.atma_version,doc.atma_status);\n}"
    },
    "ma rslt list": {
      "map": "function (doc) {\n  if (doc.type == 'matassessmtrslt')\n    emit(doc.team_id, doc.assessmt_version, doc.team_proj_ops,doc.team_dlvr_software,doc.assessmt_status);\n}"
    },
    "ma rslt proj-ops list": {
      "map": "function (doc) {\n  if (doc.type == 'matassessmtrslt')\n    emit(doc.team_proj_ops, doc.assessmt_version, doc.team_dlvr_software, doc.assessmt_status, doc.team_id);\n}"
    },
    "child teams": {
      "map": "function (doc) {\n  if (doc.type == \"team\") {\n    if (doc.child_team_id !== undefined && doc.child_team_id.length > 0) {\n       for(i=0; i<doc.child_team_id.length; i++)\n          emit(doc.child_team_id[i]);   \n}}}\n\n      \n      \n      /* \n    if (doc.members !== undefined && doc.members.length > 0) {\n      for(i=0; i<doc.members.length; i++)\n          emit(doc.members[i].id, doc);\n    */\n    \n          /* \n           \"parent_team_id\": \"ag_team_LiaMultipleChild_1454677297936\",\n             \"child_team_id\": [\n   \"ag_team_Process Policy Compliance Simplification\",\n   \"ag_team_CIO Services EMEA\"\n \n    }\n  }\n  \n}\n*/"
    },
    "parent child list": {
      "map": "function (doc) {\n  if (doc.type == \"team\") {\n    if (doc.child_team_id !== undefined && doc.child_team_id.length > 0) {\n       for(i=0; i<doc.child_team_id.length; i++)\n          emit(doc.child_team_id[i],doc.parent_team_id);   \n}}}"
    },
    "parent child list all": {
      "map": "function (doc) {\n  if (doc.type == \"team\") {\n    /* if (doc.child_team_id !== undefined && doc.child_team_id.length > 0) { */\n       for(i=0; i<=doc.child_team_id.length; i++)\n          emit(doc.child_team_id[i],doc.parent_team_id);   \n}}"
    },
    "team list name id": {
      "map": "function (doc) {\n    if (doc.type == 'team') {\n    emit({name: doc.name}, {parent: doc.parent_team_id});\n }\n}"
    },
    "teams qual names": {
      "map": "function (doc) {\n    if (doc.name == 'Info') {\n    emit(doc.name,doc.parent_team_id);\n    }\n}"
    },
    "getteambyname": {
      "map": "function (doc) {\n  if (doc.name.indexOf('test') > -1){\n    emit(doc.name, doc.parent_team_id);\n  }\n}"
    },
    "getteambyid": {
      "map": "function (doc) {\n  if (doc._id.indexOf('SWC') > -1){\n    emit(doc.name, doc.parent_team_id);\n  }\n}"
    },
    "iter list qual": {
      "map": "function (doc) {\n    if ((doc.type == 'iterationinfo') && (doc.team_id == 'iERP')) {\n    emit(doc.team_id,doc.iteration_name);\n    }\n}"
    },
    "getimpactsbyid": {
      "map": "function (doc) {\n  if (doc._id.indexOf('iERPFINFIRE') > -1){\n    emit(doc.team_id, doc.name);\n  }\n}"
    },
    "getimpactsbyidfulldoc": {
      "map": "function (doc) {\n  if (doc._id.indexOf('iERPFINFIRE') > -1){\n    emit(doc.team_id, doc);\n  }\n}"
    },
    "deleted docs": {
      "map": "function (doc) {\n  if (doc.doc_status == 'delete') {\n    emit(doc.name, doc.last_updt_user);\n  }\n}"
    },
    "ma rslts complete assmt list": {
      "map": "function (doc) {\n  if ((doc.type == 'matassessmtrslt') && (doc.assessmt_status == 'Submitted'))\n    emit(doc.team_proj_ops, doc.assessmt_version, doc.team_dlvr_software, doc.assessmt_status, doc.team_id);\n}"
    },
    "list ref": {
      "map": "function (doc) {\n  if (doc._id.indexOf('ag_ref_') > -1)\n    emit(doc._id); \n}"
    },
    "team list id name": {
      "map": "function (doc) {\n    if (doc.type == 'team') {\n    emit({id: doc._id}, {name: doc.name});\n }\n}"
    }
  }
}