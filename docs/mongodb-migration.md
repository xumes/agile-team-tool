# MongoDB Migration Work

## Things to consider:

* build index based off common queries. writes will have bad performance if there are many indexes 
* timestamps are in UTC and EST/EDT so need to convert them to unix timestamp when we do the mapping

I think these doc types are not needed
* doc.type :'ref_matassessment'
* doc.type : 'asc'


## database models and Cloudant <-> MongoDB schema mapping


### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) string. for IBM it's CNUM or perhaps shortEmail? | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string; for IBM it's pref. ID | n/a
| name  | string' first and last name of person | n/a
| lastLogin | unix timestamp; integer| n/a


### iterations

"type": "iterationinfo"

| Fields        | Details      | cloudant field | cloudant value ex (if not obv.)
| ------------- |:-------------:|------------- | -------------
|name | string | iteration_name |
|teamId | objectId of team | team_id |
|status| copy as is? | iterationinfo_status |"Not complete", "Completed"
|createDate|unix timestamp; integer | created_dt | "2016-04-12 08:58:50 EDT"
|createdById| string of userId | created_user |
|createdBy| string of name or email | created_user |
|updateDate| unix timestamp; integer | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById| string of userId | last_updt_user |
|updatedBy| string of name or email | last_updt_user |
|startDate| unix timestamp; integer|iteration_start_dt | "01/15/2016"
|endDate| unix timestamp; integer|iteration_end_dt | "01/16/2016"
|memberCount| integer | team_mbr_cnt |
|committedStories| integer | nbr_committed_stories |
|deliveredStories| integer | nbr_stories_dlvrd |
|commitedStoryPoints| integer | nbr_committed_story_pts |
|storyPointsDelivered | integer | nbr_story_pts_dlvrd |
|locationScore | used for pizza chart i think ?? | fte_cnt | 0.0 or 0.5 
|deployments | integer | nbr_dplymnts | "" or 1
|defects | integer | nbr_defects | "" or 2
|clientSatisfaction| integer | client_sat | 1.0
|teamSatisfaction| integer | team_sat | 4
|comment| string | iteration_comments |
|memberChanged| boolean, use: ?? | team_mbr_change | "No" or "Yes"

dont port this field:
doc_status ?

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


"type": "team"

| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
|_id | should we set this ? |ObjectId("ag_team_AcquisitionCustomerMatching_1463146469675")|doc._id| ag_team_AcquisitionCustomerMatching_1463146469675
|path | string | ",CIO,Agile Team," | * get the path from ag_ref_team_index * | under ag_ref_team_index.. parents: ["CIO", "Agile Team"]
|members       | array of objects, copy over as is| 
|type           | string | "", "squad", "domain", "tribe", "subDomain", "potato" | squadteam     | "Yes" or "No"
|description | string |  | desc |
|createDate     | unix timestamp; integer | |created_dt | "2016-04-12 08:58:50 EDT"
|createdById    | string of userId | | created_user |
|createdBy      | string of name or email | | created_user |
|updateDate     | unix timestamp; integer | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById    | string of userId | |last_updt_user |
|updatedBy      | string of name or email | |last_updt_user |

don't port these fields: child_team_id, parent_team_id


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


| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
|_id | should we set this ? |ObjectId("ag_mar_12323")|doc._id| ag_mar_12323
|teamId | objectId of team |
|assessmentVersion | | | assessmt_version |
|createdBy | | | submitter_id |
| ? | | | team_proj_ops |
| ? | boolean | | team_dlvr_software | "Yes" / "No"
|assessmentStatus | | | assessmt_status | "Submitted"
|?| ?| | self-assessmt_dt | 

ex cloudant assessment doc

```
{
	"id": "ag_mar_12323",
	"key": "ag_mar_12323",
	"value": {
		"rev": "8-779488fad0974c102782b57acc7e778c"
	},
	"doc": {
		"_id": "ag_mar_12323",
		"_rev": "8-779488fad0974c102782b57acc7e778c",
		"type": "matassessmtrslt",
		"team_id": "ag_team_JM_002_1466170971836",
		"assessmt_version": "ag_ref_atma_components_v06",
		"team_proj_ops": "Project",
		"team_dlvr_software": "Yes",
		"assessmt_status": "Submitted",
		"submitter_id": "mondigjd@ph.ibm.com",
		"self-assessmt_dt": "2016-07-11 00:00:01 EDT",
		"ind_assessor_id": "",
		"ind_assessmt_status": "",
		"ind_assessmt_dt": "",
		"created_dt": "2016-07-19 17:47:28 SGT",
		"created_user": "mondigjd@ph.ibm.com",
		"last_updt_dt": "2016-07-19 17:47:28 SGT",
		"last_updt_user": "mondigjd@ph.ibm.com",
		"doc_status": "",
		"assessmt_cmpnt_rslts": [{
			"assessed_cmpnt_name": "Team Agile Leadership and Collaboration - Projects",
			"assessed_cmpnt_tbl": [{
				"principle_id": "1",
				"principle_name": "Collaboration and Teamwork",
				"practice_id": "1",
				"practice_name": "Standups",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "1",
				"principle_name": "Collaboration and Teamwork",
				"practice_id": "2",
				"practice_name": "Walls of Work",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "2",
				"principle_name": "Focus on the Customer and Business Value",
				"practice_id": "3",
				"practice_name": "Engaging the Product Owner",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "2",
				"principle_name": "Focus on the Customer and Business Value",
				"practice_id": "4",
				"practice_name": "Backlog Refinement",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "3",
				"principle_name": "Flexible, Adaptive and Continuously Improving",
				"practice_id": "5",
				"practice_name": "Release and Iteration Planning",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "3",
				"principle_name": "Flexible, Adaptive and Continuously Improving",
				"practice_id": "6",
				"practice_name": "Retrospectives",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "3",
				"principle_name": "Flexible, Adaptive and Continuously Improving",
				"practice_id": "7",
				"practice_name": "Work Estimation (Relative Estimates)",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "4",
				"principle_name": "Iterative and Fast",
				"practice_id": "8",
				"practice_name": "Story Cards",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "5",
				"principle_name": "Empowered and Self Directed Teams",
				"practice_id": "9",
				"practice_name": "Stable Cross-Functional Teams",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "5",
				"principle_name": "Empowered and Self Directed Teams",
				"practice_id": "10",
				"practice_name": "Social Contract",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "5",
				"principle_name": "Empowered and Self Directed Teams",
				"practice_id": "11",
				"practice_name": "Risk and Issue Management",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}],
			"ovralcur_assessmt_score": "2.4",
			"ovraltar_assessmt_score": "3.4"
		}, {
			"assessed_cmpnt_name": "Team Delivery",
			"assessed_cmpnt_tbl": [{
				"principle_id": "1",
				"principle_name": "Continuous Development",
				"practice_id": "1",
				"practice_name": "Automated builds & Continuous Integration",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "1",
				"principle_name": "Continuous Development",
				"practice_id": "2",
				"practice_name": "Managing Technical Debt",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "1",
				"principle_name": "Continuous Development",
				"practice_id": "3",
				"practice_name": "Dev & Ops Collaboration / Shared Understanding",
				"cur_mat_lvl_achieved": "Transforming",
				"cur_mat_lvl_score": 3,
				"tar_mat_lvl_achieved": "Scaling",
				"tar_mat_lvl_score": 4,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "1",
				"principle_name": "Continuous Development",
				"practice_id": "4",
				"practice_name": "Infrastructure Automation / Provisioning",
				"cur_mat_lvl_achieved": "Initiating",
				"cur_mat_lvl_score": 1,
				"tar_mat_lvl_achieved": "Practicing",
				"tar_mat_lvl_score": 2,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "2",
				"principle_name": "Continuous Testing",
				"practice_id": "5",
				"practice_name": "Automated Testing",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "3",
				"principle_name": "Continuous Release & Deployment",
				"practice_id": "6",
				"practice_name": "Automated Deployments",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "4",
				"principle_name": "Continuous Feedback & Optimization",
				"practice_id": "7",
				"practice_name": "Customer Feedback",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}, {
				"principle_id": "5",
				"principle_name": "Continuous Monitoring",
				"practice_id": "8",
				"practice_name": "Monitoring of Environments",
				"cur_mat_lvl_achieved": "Practicing",
				"cur_mat_lvl_score": 2,
				"tar_mat_lvl_achieved": "Transforming",
				"tar_mat_lvl_score": 3,
				"ind_mat_lvl_achieved": "",
				"ind_target_mat_lvl_score": 0,
				"how_better_action_item": "",
				"ind_assessor_cmnt": ""
			}],
			"ovralcur_assessmt_score": "2.1",
			"ovraltar_assessmt_score": "3.1"
		}],
		"assessmt_action_plan_tbl": []
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
1. Migrate data
  1. ```$ curl http://admin:pass@domain/dbName/_all_docs?include_docs=true > docs.json  ``` get all docs
  2. run scripts using a mongo driver over docs differentiate the docs using  "type" field. save mapping into compose
2. Develop models with migrated data

## References

 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
[Model Tree Structures with Materialized Paths]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-materialized-paths/>
[Model Tree Structures with an Array of Ancestors]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/>
[Model Tree Structures with Parent References]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-parent-references/>
