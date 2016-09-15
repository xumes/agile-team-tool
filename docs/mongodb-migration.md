# MongoDB Migration Work

## Things to consider:

* build index based off common queries. writes will have bad performance if there are many indexes 
* timestamps are in <string> UTC and <string>EST/EDT so need to convert them to JS Date Object UTC when we do the mapping

I think these doc types are not needed
* doc.type :'ref_matassessment'
* doc.type : 'asc'


## database models and Cloudant <-> MongoDB schema mapping

* not porting over docs with 'delete' docStatus

### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| _id | (UNIQUE ID) ObjectId. for IBM it's CNUM | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string; for IBM it's pref. ID | n/a
| name  | string' first and last name of person | n/a
| lastLogin | JS Date Object UTC| n/a


### iterations

"type": "iterationinfo"

* can probably combine status and docStatus


| Fields        | Details      | cloudant field | cloudant value ex (if not obv.)
| ------------- |:-------------:|------------- | -------------
|cloudantId | string | doc.id |
| docStatus |     |   doc_status  | "" , "delete"
|name | string | iteration_name |
|teamId | objectId of team | team_id |
|status| copy as is | iterationinfo_status |"Not complete", "Completed"
|createDate|JS Date Object UTC | created_dt | "2016-04-12 08:58:50 EDT"
|createdById| string of userId | created_user |
|createdBy| string of name or email | created_user |
|updateDate| JS Date Object UTC | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById| string of userId | last_updt_user |
|updatedBy| string of name or email | last_updt_user |
|startDate| JS Date Object UTC|iteration_start_dt | "01/15/2016"
|endDate| JS Date Object UTC|iteration_end_dt | "01/16/2016"
|memberCount| number | team_mbr_cnt |
|committedStories| number | nbr_committed_stories |
|deliveredStories| number | nbr_stories_dlvrd |
|commitedStoryPoints| number | nbr_committed_story_pts |
|storyPointsDelivered | number | nbr_story_pts_dlvrd |
|locationScore | used for pizza chart i think ? | fte_cnt | 0.0 or 0.5 
|deployments | number | nbr_dplymnts | "" or 1
|defects | number | nbr_defects | "" or 2
|clientSatisfaction| number | client_sat | 1.0
|teamSatisfaction| number | team_sat | 4
|comment| string | iteration_comments |
|memberChanged| map to a boolean | team_mbr_change | "No" or "Yes"


example cloudant iteration doc:
```
{
	"id": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
	"key": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
	"value": {
		"rev": "4-12c99709f81848bf191b76a20aff4261"
	},
	"doc": {
		"_id": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
		"_rev": "4-12c99709f81848bf191b76a20aff4261",
		"type": "iterationinfo",
		"team_id": "ag_team_AA-Tools-Operations_1470775340042",
		"iteration_name": "Q3 Iteration 4",
		"iteration_start_dt": "08/03/2016",
		"iteration_end_dt": "08/09/2016",
		"iterationinfo_status": "Completed",
		"team_mbr_cnt": "8",
		"nbr_committed_stories": "23",
		"nbr_stories_dlvrd": "18",
		"nbr_committed_story_pts": "50",
		"nbr_story_pts_dlvrd": "41",
		"iteration_comments": "Committed users stories is derived by adding 25% of what we delivered.  Additionally, 2 resources were on vacation.",
		"team_mbr_change": "No",
		"last_updt_user": "slindber@us.ibm.com",
		"fte_cnt": "7.0",
		"nbr_dplymnts": "",
		"nbr_defects": "",
		"client_sat": "3.0",
		"team_sat": "3.0",
		"last_updt_dt": "2016-08-26 14:54:04 UTC",
		"created_user": "slindber@us.ibm.com",
		"created_dt": "2016-08-26 14:32:50 UTC",
		"doc_status": ""
	}
}
```

### teams (bottom up tree structure)
Possible tree structure pattern to explore:
* [Model Tree Structures with an Array of Ancestors]
* [Model Tree Structures with Materialized Paths] <- use this one
* [Model Tree Structures with Parent References]

in cloudant it currently looks like each team has all it's ancestors. Also each team knows about all it's immediate children.
This seems problematic when it comes to updating tree structure and removing subtrees.

use team name in string path to make the data readable. enforce no duplicate team name case insensitive, trim leading/trailing whitespace.
and update to a team name might be expensive if its high up in the tree.


* _id is going to be a transformation of team name ```str.toLowerCase().replace(/[^a-z1-9]/g, ‘')```. its going to be the value that is used in path 

"type": "team"

| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
|cloudantId | string |  "ag_team_AcquisitionCust ..."| doc._id | "ag_team_AcquisitionCust"
|pathId |  normalizeString(doc.name) | acquisitioncustomermatching | n/a | n/a
|docStatus | | | doc_status | "" , "delete"
|path | string  | ",cio,agileteamtool," | * get the path from ag_ref_team_index * | under ag_ref_team_index.. parents: ["CIO", "Agile Team"]
|name | string  | | name |Acquisition Customer Matching |
|members        | array of objects, copy over as is| 
|type           | map to a diff. string | "squad" or null | squadteam  | "Yes" or "No"
|description    | string |  | desc |
|createDate     | JS Date Object UTC | |created_dt | "2016-04-12 08:58:50 EDT"
|createdById    | string of userId | | created_user |
|createdBy      | string of name or email | | created_user |
|updateDate     | JS Date Object UTC | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById    | string of userId | |last_updt_user |
|updatedBy      | string of name or email | |last_updt_user |

don't port these fields: child_team_id, parent_team_id

nested struct:
members[*].key -> .cnum
members[*].id -> .email

ex cloudant team doc:
```
{
	"id": "ag_team_AcquisitionCustomerMatching_1463146469675",
	"key": "ag_team_AcquisitionCustomerMatching_1463146469675",
	"value": {
		"rev": "2-eae4f4a22969d1a4f16fc054a4afbeb1"
	},
	"doc": {
		"_id": "ag_team_AcquisitionCustomerMatching_1463146469675",
		"_rev": "2-eae4f4a22969d1a4f16fc054a4afbeb1",
		"type": "team",
		"name": "Acquisition Customer Matching",
		"desc": "",
		"squadteam": "Yes",
		"last_updt_dt": "2016-05-13 21:34:29 SGT",
		"last_updt_user": "batch",
		"created_dt": "2016-05-13 21:34:29 SGT",
		"created_user": "batch",
		"parent_team_id": "ag_team_Acquisitions",
		"members": [{
			"key": "024313672",
			"id": "Syeda.IqanZahera.Naqvi@in.ibm.com",
			"name": "SYEDA I (SYEDA) NAQVI",
			"allocation": 100,
			"role": "Developer"
		}, {
			"key": "042424781",
			"id": "KUTUKAKE@jp.ibm.com",
			"name": "Masaki Kutsukake",
			"allocation": 100,
			"role": "Analyst"
		}],
		"child_team_id": []
	}
},
```


### assessments

doc.type : 'matassessmtrslt' 

* can probably combine assessmentStatus and docStatus into a "status" field

| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
|cloudantId       | string; "ag_mar_12323 | doc._id | ag_mar_12323
|teamId           | cloudantId of team doc (for first phase) |
|type             | | | team_proj_ops | "Operations" / "Project"
|version          | string | | assessmt_version |
|deliversSoftware | map to a boolean | | team_dlvr_software | "Yes" / "No"
|assessmentStatus | copy values as is | | assessmt_status | "Submitted" / "Draft"
|submittedDate    | JS Date Object UTC| | self-assessmt_dt | 
|assessorId       | person who reviews the assessment | | ind_assessor_id |
|assessorStatus   | ? | | ind_assessmt_status |
|assessedDate     | date which an Independent Assessor submits/completes their assessment | | ind_assessmt_dt |
|docStatus       | | | doc_status | "" , "delete"
|see below       | nested struct |  | assessmt_cmpnt_rslts     | see below
|see below       | nested struct |  | assessmt_action_plan_tbl | see below
|createDate     | JS Date Object UTC | |created_dt | "2016-04-12 08:58:50 EDT"
|createdById    | string of userId | | created_user |
|createdBy      | string of name or email | | created_user |
|updateDate     | JS Date Object UTC | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById    | string of userId | |last_updt_user |
|updatedBy      | string of name or email | |last_updt_user |

dont think we need to include this:
submitter_id

nested mappings:

(1.)
```
assessmt_cmpnt_rslts: -> componentResults
[{
  assessed_cmpnt_name: -> componentName
  ovralcur_assessmt_score": -> currentScore
  ovraltar_assessmt_score": -> targetScore
  assessed_cmpnt_tbl: -> assessedComponents
    [{
      principle_id: -> principleId
      principle_name: -> principleName
      practice_id: -> practiceId
      practice_name: -> practiceName
      cur_mat_lvl_achieved: -> currentLevelName
      cur_mat_lvl_score: -> currentScore
      tar_mat_lvl_achieved: -> targetLevelName
      tar_mat_lvl_score: -> targetScore
      ind_mat_lvl_achieved: -> assessorLevel  //delete
      ind_target_mat_lvl_score: -> assessorTarget //delete
      how_better_action_item: -> improveDescription
      ind_assessor_cmnt:  -> assessorComment
    }]
}]
```
these two fields seem to be empty for every document in production, i don't think they are used so not going to set the fields in mongo.
* assessmt_cmpnt_rslts.assessed_cmpnt_tbl.ind_mat_lvl_achieved
* assessmt_cmpnt_rslts.assessed_cmpnt_tbl.ind_target_mat_lvl_score

(2.) 
```
assessmt_action_plan_tbl: -> actionPlans
[{
  action_plan_entry_id": -> id : number
  user_created": "Yes"/"No", -> isUserCreated : boolean
  assessmt_cmpnt_name": -> componentName
  principle_id": -> principleId
  principle_name": -> principleName
  practice_id": -> practiceId
  practice_name": -> practiceName
  how_better_action_item": -> improveDescription  (cloudant ex: "We use a SmartCloud and review RTC as our virtual wall.  ")
  cur_mat_lvl_score": -> currentLevel
  tar_mat_lvl_score": -> targetLevel
  progress_summ": -> progressComment
  key_metric": -> keyMetric
  review_dt": -> reviewDate
  action_item_status": -> actionStatus
}]
```

ex cloudant assessment doc

```
{
	"id": "ag_mar_ag_team_IBMCertifiedPreOwnedEquipmt_1463886071579_1468607362513",
	"key": "ag_mar_ag_team_IBMCertifiedPreOwnedEquipmt_1463886071579_1468607362513",
	"value": {
		"rev": "1-483be213f342e067a014ccd741e65c28"
	},
	"doc": {
		"_id": "ag_mar_ag_team_IBMCertifiedPreOwnedEquipmt_1463886071579_1468607362513",
		"_rev": "1-483be213f342e067a014ccd741e65c28",
		"type": "matassessmtrslt",
		"team_id": "ag_team_IBMCertifiedPreOwnedEquipmt_1463886071579",
		"assessmt_version": "ag_ref_atma_components_v06",
		"team_proj_ops": "Project",
		"team_dlvr_software": "Yes",
		"assessmt_status": "Submitted",
		"submitter_id": "spenc@us.ibm.com",
		"self-assessmt_dt": "2016-07-15 00:00:01 EDT",
		"ind_assessor_id": "",
		"ind_assessmt_status": "",
		"ind_assessmt_dt": "",
		"created_dt": "2016-07-15 14:29:24 EDT",
		"created_user": "spenc@us.ibm.com",
		"last_updt_dt": "2016-07-15 14:29:24 EDT",
		"last_updt_user": "spenc@us.ibm.com",
		"doc_status": "",
		"assessmt_cmpnt_rslts": [{
			"assessed_cmpnt_name": "Team Agile Leadership and Collaboration - Projects",
			"assessed_cmpnt_tbl": [{
				"principle_id": "1",
				"principle_name": "Collaboration and Teamwork",
				"practice_id": "1",
				"practice_name": "Standups",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "We use a SmartCloud and review RTC as our virtual wall.  ",
				"ind_assessor_cmnt": ""
			},{
				"principle_id": "5",
				"principle_name": "Empowered and Self Directed Teams",
				"practice_id": "11",
				"practice_name": "Risk and Issue Management",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "Squad discusses blockers in our daily standup, but sometimes reactive in addressing an issue or blocker instead of being proactive in forward risk thinking, and using collaborating tools (RTC and Slack).  ",
				"ind_assessor_cmnt": ""
			}],
			"ovralcur_assessmt_score": "2.4",
			"ovraltar_assessmt_score": "2.7"
		}, {
			"assessed_cmpnt_name": "Team Delivery",
			"assessed_cmpnt_tbl": [{
				"principle_id": "1",
				"principle_name": "Continuous Development",
				"practice_id": "1",
				"practice_name": "Automated builds & Continuous Integration",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Practicing",
				"tar_mat_lvl_score": 2,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "Squad is creating automated test cases to help with regression testing, but relies upon manual function testing during a sprint.  Squad is addressing version control thru merge and checkin processes to avoid file conflicts.  Squad will need to take on more CoC efforts in relying heavily upon the tribe technical lead to complete build/deploy. ",
				"ind_assessor_cmnt": ""
			},{
				"principle_id": "5",
				"principle_name": "Continuous Monitoring",
				"practice_id": "8",
				"practice_name": "Monitoring of Environments",
				"cur_mat_lvl_achieved": "Initiating",
				"cur_mat_lvl_score": 1,
				"tar_mat_lvl_achieved": "Initiating",
				"tar_mat_lvl_score": 1,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "Need to initiate",
				"ind_assessor_cmnt": ""
			}],
			"ovralcur_assessmt_score": "1.1",
			"ovraltar_assessmt_score": "1.1"
		}],
		"assessmt_action_plan_tbl": [{
			"action_plan_entry_id": "0",
			"user_created": "No",
			"assessmt_cmpnt_name": "Team Agile Leadership and Collaboration - Projects",
			"principle_id": "1",
			"principle_name": "Collaboration and Teamwork",
			"practice_id": "1",
			"practice_name": "Standups",
			"how_better_action_item": "We use a SmartCloud and review RTC as our virtual wall.  ",
			"cur_mat_lvl_score": 3,
			"tar_mat_lvl_score": 3,
			"progress_summ": "",
			"key_metric": "",
			"review_dt": "",
			"action_item_status": "Open"
		}, {
			"action_plan_entry_id": "1",
			"user_created": "No",
			"assessmt_cmpnt_name": "Team Agile Leadership and Collaboration - Projects",
			"principle_id": "1",
			"principle_name": "Collaboration and Teamwork",
			"practice_id": "2",
			"practice_name": "Walls of Work",
			"how_better_action_item": "We have a mix of physical walls and rely upon RTC as our virtual wall for stories and work associated to a sprint.Our",
			"cur_mat_lvl_score": 2,
			"tar_mat_lvl_score": 2,
			"progress_summ": "",
			"key_metric": "",
			"review_dt": "",
			"action_item_status": "Open"
		}]
	}
}
```

### snapshots (roll-up data)

* don't need to port data; create new schema w/ mongoose

## Proposed work
* Use Mongoose
* Have alternate versions of assessment.js, iteration.js, snapshot.js, teams.js and users.js in a new model directory
* Move validation from validate.js -> [using mongoose schema validation]
* Use mongoose default fields and remove the various default data spread throughout the project (e.x public/index.js ~L5->114)

###Steps

####First Phase

1. Migrate data
  1. ```$ curl http://admin:pass@domain/dbName/_all_docs?include_docs=true > docs.json  ``` get all docs
  2. run scripts using a mongo driver over docs differentiate the docs using  "type" field. save mapping into compose
2. Develop models with migrated data

####Second Phase
1. run scripts to convert cloudantIds to mongo's objectId


* develop and test in a seperate app and branch. once we have working model & scripts, we turn off prod for maintenance for as long as it takes to port prod



## References

 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
[Model Tree Structures with Materialized Paths]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-materialized-paths/>
[Model Tree Structures with an Array of Ancestors]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/>
[Model Tree Structures with Parent References]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-parent-references/>
