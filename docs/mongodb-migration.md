# MongoDB Migration Work

## Things to consider:

* build index based off common queries. writes will have bad performance if there are many indexes
* timestamps are in <string> UTC and <string>EST/EDT so need to convert them to JS Date Object UTC when we do the mapping

I think these doc types are not needed
* doc.type : 'asc'


## database models and Cloudant <-> MongoDB schema mapping

* not porting over docs with 'delete' docStatus

### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) for IBM it's CNUM | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string; for IBM it's pref. ID | n/a
| name  | string' first and last name of person | n/a
| lastLogin | JS Date Object UTC| n/a

### apiKeys
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) for IBM it's CNUM | n/a
| email | string; for IBM it's pref. ID | n/a
| key | string; UUID | n/a
| createDate | JS Date Object UTC| n/a

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
|createdByUserId| string of userId | created_user |
|createdBy| string of email | created_user |
|updateDate| JS Date Object UTC | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedByUserId| string of userId | last_updt_user |
|updatedBy| string of email | last_updt_user |
|startDate| JS Date Object UTC|iteration_start_dt | "01/15/2016"
|endDate| JS Date Object UTC|iteration_end_dt | "01/16/2016"
|memberCount| number | team_mbr_cnt |
|memberFte | number | fte_cnt | Full-time equivalent (member allocation %)
|committedStories| number | nbr_committed_stories |
|deliveredStories| number | nbr_stories_dlvrd |
|commitedStoryPoints| number | nbr_committed_story_pts |
|storyPointsDelivered | number | nbr_story_pts_dlvrd |
|deployments | number | nbr_dplymnts | "" or 1
|teamSatisfaction| number | team_sat | 4
|clientSatisfaction| number | client_sat | 1.0
|comment| string | iteration_comments |
|memberChanged| map to a boolean | team_mbr_change | "No" or "Yes"
|defectsStartBal | number | nbr_defects_start_bal |
|defects | number | nbr_defects | "" or 2
|defectsClosed | number | nbr_defects_closed |
|defectsEndBal | number | nbr_defects_end_bal |
|cycleTimeWIP | number | nbr_cycletime_WIP |
|cycleTimeInBacklog | number | nbr_cycletime_in_backlog |


example cloudant iteration doc:
```
{
	"id": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
	"key": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
	"value": {
		"_rev": "5-f94599d9b630a2ee7dd89d154c15741a",
	},
	"doc": {
		"_id": "ag_iterationinfo_ag_team_AA-Tools-Operations_1470775340042Q3Iteration4_1472221969959",
  	"_rev": "5-f94599d9b630a2ee7dd89d154c15741a",
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
  	"last_updt_user": "jeanlam@us.ibm.com",
  	"fte_cnt": "7.0",
  	"nbr_dplymnts": "",
  	"nbr_defects_start_bal": "",
  	"nbr_defects": "",
  	"nbr_defects_closed": "",
  	"nbr_defects_end_bal": "",
  	"nbr_cycletime_WIP": "",
  	"nbr_cycletime_in_backlog": "",
  	"client_sat": "3.0",
  	"team_sat": "3.0",
  	"last_updt_dt": "2016-10-18 17:27:40 UTC",
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
|links          | array of objects, copy over as is|
|createDate     | JS Date Object UTC | |created_dt | "2016-04-12 08:58:50 EDT"
|createdByUserId    | string of userId | | created_user |
|createdBy      | string of email | | created_user |
|updateDate     | JS Date Object UTC | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedByUserId    | string of userId | |last_updt_user |
|updatedBy      | string of email | |last_updt_user |

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
    "links": [{
      "id": "0561939c68b30b8cd8fe85fb5c641fff",
      "linkLabel": "Wall of work",
      "linkUrl": "https://agile-tool-nodejs-stage.mybluemix.net/team"
    }, {
      "id": "fa054d05bca1450cc8ae424fcb3149ac",
      "linkLabel": "Other label",
      "linkUrl": "https://agile-tool-nodejs-stage.mybluemix.net/team"
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
|submittedByUserId | submitter_id converted to cnum |"GH0112778"| |
|submittedBy | |"tushar@my.ibm.com"| | submitter_id
|assessorUserId       | person who reviews the assessment | | ind_assessor_id |
|assessorStatus   | ? | | ind_assessmt_status |
|assessedDate     | date which an Independent Assessor submits/completes their assessment | | ind_assessmt_dt |
|docStatus       | | | doc_status | "" , "delete"
|see below       | nested struct |  | assessmt_cmpnt_rslts     | see below
|see below       | nested struct |  | assessmt_action_plan_tbl | see below
|createDate     | JS Date Object UTC | |created_dt | "2016-04-12 08:58:50 EDT"
|createdByUserId    | string of userId | | created_user |
|createdBy      | string of email | | created_user |
|updateDate     | JS Date Object UTC | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedByUserId    | string of userId | |last_updt_user |
|updatedBy      | string of email | |last_updt_user |

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


### assessment templates

doc.type : 'ref_matassessment'

* note: this table is a flattened view of the mapping

| mongo field   | cloudant field |
| ------------- |:-------------:|
|cloudantId      | _id
|version         | atma_version
|effectiveDate   | atma_eff_dt
|status          | atma_status
|components      | atma_cmpnt_tbl
|name            | atma_name
|principles      | principle_tbl
|id              | principle_id
|name            | principle_name
|practices       | practice_tbl
|id              | practice_id
|name            | practice_name
|description     | practice_desc
|levels          | mat_criteria_tbl
|name            | mat_lvl_name
|score           | mat_lvl_score
|criteria        | mat_lvl_criteria


example cloudant template:
```
{
	"_id": "ag_ref_atma_components_v01",
	"_rev": "4-5052763fd11318a3e5ae049174d9a2b7",
	"type": "ref_matassessment",
	"atma_version": "001",
	"atma_eff_dt": "2016-02-24 00:00:01 EST",
	"atma_status": "inactive",
	"atma_cmpnt_tbl": [{
		"atma_name": "Agile Leadership and Collaboration",
		"principle_tbl": [{
			"principle_id": "1",
			"principle_name": "Collaboration and Teamwork",
			"practice_tbl": [{
				"practice_id": "1",
				"practice_name": "Standups",
				"practice_desc": "A regular team collaboration opportunity for sharing progress, identifying risks and resolving issues",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["No regular team opportunity for sharing progress on work", "Typically meetings maybe long and have limited engagement from attendees", "Meeting attendees are forced or feel obliged to attend rather than recognizing the value of the meeting and voluntarily attending", "Team members are unclear what work is happening or issues blocking progress", "Team members typically perform additional reporting to highlight work completed"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Standup meetings happen but are irregular", "Core team attendance maybe intermittent", "Team member updates are focus only on status with limited insight into risks or issues"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Standup meetings occur regularly but are usually initiated by the Iteration Manager/Project Manager or another facilitator", "At each meeting, all of the core team members answer the three questions 'What I have done since we last met', 'What I plan to do before we next meet', 'What is blocking me or may block me'", "Geographically remote team members are involved in Standup meetings through telephone"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Standup meetings are rarely missed by any core team member and still occur regardless of attendance", "Core team members use the visual wall and point to the work they are doing while answering the 3 questions", "Standups are completed in under 15mins", "Project stakeholders regularly attend standups and other team collaboration events", "Geographically remote team members feel properly included in Standups and are able to see and hear progress updates", "Blockers and challenges identified during the standup are assigned an owner, so that the impediment can be removed"]
				}]
			}, {
				"practice_id": "2",
				"practice_name": "Track & Visualize Progress (Walls)",
				"practice_desc": "Tracking progress of work and visualizing to create transparency and shared understanding ",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Project information is stored in locations with restricted access", "Not all stakeholders have access to project information", "Information is either not maintained or accurate"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["A basic wall exists representing project information and is accessible to all team members and stakeholders", "Information is intermittently maintained"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Information is maintained and accurate and is sufficient to describe current work, backlog, risks, issues and overall progress", "All work activities are represented on a wall, i.e.. greater than 4 hrs", "The team is proud to show visitors the visual management tools used, which also explain what the team does", "The team collaborate around the 'wall' regularly"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Priority, size, current state and ownership of the work is a true reflection of reality", "Information is kept regularly updated and team members hold each other accountable for their work", "The work backlog is displayed for at least one month of upcoming work", "Team members remotely located are able to view and update project wall"]
				}]
			}]
		}, {
			"principle_id": "2",
			"principle_name": "Focus on the Customer and Business Value",
			"practice_tbl": [{
				"practice_id": "3",
				"practice_name": "Engaging the Product Owner",
				"practice_desc": "through showcases, planning, progress and team meetings to support definition and prioritization",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Team has no understanding of who the Product Owner is", "Product Owner is not involved in work planning"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Product Owner has been identified", "Product Owner involved in initial definition of work", "Product Owner reviews work post-delivery or during an acceptance testing phase"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Product Owner is involved in verifying the definition of work", "Product Owner may not always be available to team but makes time to answer questions and provides direction as required", "Product Owner attends the majority of showcases"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Minimum viable product/scope is defined and agreed with Product Owner(s)", "All work is prioritized weekly into a single backlog by value and risk across all Product Owners for your team", "Release plan is visible to all Product Owner(s) and is regularly updated based on evidence of progress"]
				}]
			}, {
				"practice_id": "4",
				"practice_name": "Work Prioritization",
				"practice_desc": "Effective work prioritization ensures that the greatest business value is always being delivered thereby maximizing return on investment.",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Pipeline / Backlog of work is non-existent", "Some backlog exists but there are no standards or processes in place to prioritize and manage the backlog"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["A backlog of work exists", "A process is in place to estimate the backlog items based on time/effort", "Planning is done on a regular basis, using the backlog item estimates", "There is no shared understanding of what is to be traded-off between scope, time, cost, or quality (no trade-off sliders)"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Backlog items are estimated using a relative scale", "The backlog is prioritized by value and risk, as well as effort", "Dependencies with other work outside the team are recognized and some effort is made to include this in setting priorities", "The delivery rate is tracked as velocity or cycle time"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Trade-off sliders are understood by all and used to guide decisions relating to Time, Cost, Scope and Quality", "Dependencies with other work outside the team are prioritized and included in planning"]
				}]
			}]
		}, {
			"principle_id": "3",
			"principle_name": "Flexible, Adaptive and Continuously Improving",
			"practice_tbl": [{
				"practice_id": "5",
				"practice_name": "Adaptive Planning (Release and Iteration Planning)",
				"practice_desc": "The collaborative identification, definition and planning of work and deliverables",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["No plans exist (release or iteration)", "Plans are created without input from team before delivery", "Plans are based upon one major release without consideration of smaller incremental releases."]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Release Plans and Iteration Plans are defined by the Project Manager/Iteration Manager with limited involvement from the core team and with limited consideration of business priority or involvement of stakeholders", "Release Plans and Iterations Plans are not adjusted to reflect changing priorities.", "Variations in planned vs. delivered are not consistently measured or reported."]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Key stakeholders (sponsors, business owners and steering committee members) attend some project ceremonies (showcases and planning sessions)", "Release Plans and Iterations Plans are visible to the team", "Variations in planned vs. delivered are measured and reported.", "Release Plans and Iterations Plans are not adjusted due to variations in planned vs. delivered work."]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Key stakeholders (sponsors, business owners and steering committee members) attend most project ceremonies (showcases and planning sessions)", "Release and iteration planning produces an achievable plan that the team is confident to deliver", "Work planned is regularly achieved with only small variations in progress", "An overall (long-term) plan is maintained and accurately reflects the team's understanding of work, timing, resources, dependencies, etc.", "Sliders are used to inform planning"]
				}]
			}, {
				"practice_id": "6",
				"practice_name": "Retrospectives",
				"practice_desc": "A team activity used for problem identification and solution forming the basis for continuous improvement",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["No continuous improvement practices are being used to evolve work practices", "Decisions are made on the fly and lack factual basis", "Solutions are implemented without an understanding of the problem", "Post implementation reviews are used as the only source of feedback"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Retrospectives happen but are irregular", "Retrospectives have poorly defined actions", "Actions are not followed through or are ineffective"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Retrospectives are regular with actions being generated", "Retrospectives are generally facilitated by the same person", "Retrospective attendance is inconsistent", "Decisions are taken using root-cause analysis but decisions are often revisited"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Retrospectives are consistently attended by the core team who actively contribute to concrete adaptions/actions", "Actions are reliability completed", "Decisions are fact-based, addressing the root-cause of the problems and rarely need to be revisited"]
				}]
			}, {
				"practice_id": "7",
				"practice_name": "Work Estimation (Relative Estimates)",
				"practice_desc": "Relative estimations of work (both effort and cost) are essential for planning",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Time and Effort to complete work is not understood", "Customer commitments cannot be guaranteed"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["The unit of estimation is elapsed time", "The amount of work committed to an iteration is not compared with the actual work completed", "Core team members participate in the estimation techniques"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Over the last 3 months, work committed to an iteration has been accurate to within 50% of the work actually completed", "Estimates are compared against similar work items during the iteration planning cycle", "Estimates are reviewed at every release planning cycle", "Extended team participate in estimation techniques"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["The unit of estimation is relative effort", "Over the last 4 months, work committed to an iteration has been accurate to within 30% of the work actually completed", "Estimates for stories planned for future iterations are changed based on past progress", "Estimates are used to control the amount of work pulled into an iteration"]
				}]
			}]
		}, {
			"principle_id": "4",
			"principle_name": "Iterative and Fast",
			"practice_tbl": [{
				"practice_id": "8",
				"practice_name": "Work Break Down (Stories)",
				"practice_desc": "Features and Stories capture and communicate the work that is needed in small well defined pieces",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Work is not well defined or structured", "Work is captured using detailed specification documents", "No consideration or attempt to decompose work into meaningful pieces"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Project Scope is mapped onto Features", "Features are used to describe the work from a high level that can be used for planning and progress tracking purposes", "Features are prioritized into a Release Plan"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["For the current release", "Features are broken into Stories.", "Stories are used to describe all work activities using language/words that the customer understands", "Features and Stories are recorded in a manner that is readily accessible by all team members and regularly maintained", "For future releases", "Features are described using language/words that the customer understands", "Features are recorded in a manner that is readily accessible by the project team"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["For the current release", "All Stories describe the business outcome (i.e. value), have an estimate and a priority", "The Product Owner reviews and priorities Stories prior to work commencing", "Relevant stakeholders (Analyst, Developer, Tester, Subject Matter Expert) are involved in defining and elaborating stories", "Acceptance Criteria are defined and agreed for each Story", "A Story should be able to be delivered within half an Iteration of effort"]
				}]
			}]
		}, {
			"principle_id": "5",
			"principle_name": "Empowered and Self Directed Teams",
			"practice_tbl": [{
				"practice_id": "9",
				"practice_name": "Stable Cross-Functional Teams",
				"practice_desc": "Cross-functional teams have all competencies needed to accomplish the work without depending on others not part of the team. The team is designed to optimize flexibility, creativity, and productivity",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Team members work ONLY within defined roles", "Balance of team skills is inappropriate"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["The team is composed of staff that represent all of the required roles and skills", "The appropriate proportion of skills available within the team"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["The team is able to recruit new members easily", "The team is involved in the recruitment and selection process"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["The team is able to easily transition from current work to work of a different type"]
				}]
			}, {
				"practice_id": "10",
				"practice_name": "Social Contract",
				"practice_desc": "A living document, with the mutual expectations and agreements of the team and is prominently posted in the team area (if the team is co-located) or in a wiki, which is easily accessible",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Agile values are NOT understood or respected", "Team is ambivalent towards continuous improvement and self-development"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["All team members understand and exhibit Agile values"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Team values are agreed and represented by visible social contract and non-compliant behaviors are called out by team members"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["The whole team recognize quality issues and prioritizes remediation activities"]
				}]
			}, {
				"practice_id": "11",
				"practice_name": "Risk and Issue Management",
				"practice_desc": "Risk and Issue management addresses uncertainty and increases the likelihood of successful outcomes",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["There is NO awareness of current risks or issues"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Risks and Issues have been identified and are captured using an appropriate artifacts such as a Risk Story Walls, Big Visual Charts (BVC), Risk Register, etc.", "Risks and Issue are identified by an appropriate group of stakeholders (i.e. not just the project manager or the team leader in isolation)", "Risk artifacts are 'owned' by the team and team members have no reservations in making contributions or changes"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Risk management is embedded into day-to-day operations or project activities", "Risks, issues and blockers are discussed in appropriate detail as part of all sessions (stand-ups; iteration planning; showcases; steering committee meetings; etc).", "Risk mitigations and action plans are treated like any other activity or feature; they are represented by individual story cards, included in iteration planning and tracked and completed during the iteration."]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Risk mitigations and action plans take into consideration the source and cause of a risk", "Risks, assumptions, issues, dependencies, constraints (etc) identified previously are periodically revisited, discussed, reviewed and updated", "Risk Management is used to identify potential impacts on benefits, goals, objectives, strategies, problems, and success criteria.", "Mechanisms exist for reporting and escalating risks and issues which are beyond the capabilities or authority of the team"]
				}]
			}]
		}]
	}, {
		"atma_name": "Delivery",
		"principle_tbl": [{
			"principle_id": "1",
			"principle_name": "Continuous Development",
			"practice_tbl": [{
				"practice_id": "1",
				"practice_name": "Automated builds & Continuous Integration",
				"practice_desc": "Automated builds & Continuous Integration",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Builds require frequent manual intervention", "Build integrations are planned events", "Unit testing is done manually"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Code checked-in conforms to team coding standards", "Associated automated unit tests are also checked in", "Developers are automatically notified by the build system if their code breaks the build", "Some unit test cases exist, maybe created after development, and are periodically executed"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Any one of the following error conditions automatically results in a build break/failed build: automated unit test error, static code analysis error, build verification test error", "Production ready code (no error conditions in build/integration) is used as the primary measure of project progress", "Automated monitoring & reporting of automated test execution is in place", "Mixture of unit test cases written before and after development and the team is getting close to 80% code coverage for new code"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Agile Development (SCRUM, XP, other) is the only way the team works", "Continuous improvements in development, test, architecture, builds, automation are easily shown", "Test driven development is pervasively used by the team"]
				}]
			}, {
				"practice_id": "2",
				"practice_name": "Managing Technical Debt",
				"practice_desc": "coding decisions that work quickly, but might cause long-term problems",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Understand the need to manage and reduce technical debt", "Limited action to proactively reduce technical debt"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Business objectives include drastically reducing technical debt across one or more releases"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Manage technical debt at the appropriate level for the team"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Teams spend 20% or more of the iteration effort to reduce and prevent technical debt in a disciplined manner"]
				}]
			}, {
				"practice_id": "3",
				"practice_name": "Dev & Ops Collaboration / Shared Understanding",
				"practice_desc": "*Dev = all roles involved in development",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Dev and Ops work together but engagement is through cumbersome processes", "Delivery teams are engaged only at time of move-to-production", "Dev and Ops are not measured on the same outcomes"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Development and operations teams understand the need for close collaboration Early involvement of the operations team (prior to deployment) exists but is not pervasive"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Close collaboration exists across the whole team", "Everyone understands the current feature and how it is expected to behave in production", "Whole team completes all necessary work to deliver the feature", "Development and Operations review each other's metrics"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Whole team ownership beyond organizational boundaries", "Everyone is measured on deployment success", "Whole team supports production", "Ops creates automated test cases that support their acceptance criteria"]
				}]
			}, {
				"practice_id": "4",
				"practice_name": "Infrastructure Automation / Provisioning",
				"practice_desc": "Infrastructure Automation / Provisioning",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Environments manually built", "Environment builds, scaling, migrations, and failure recovery are time consuming", "Difficult to achieve environment consistency"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Tools are used to improve scaling", "Development and test environments are often consistent", "Only part of the environment is automatically provisioned"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Environments are predominantly consistent but require manual effort", "Automatically provision some environments"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Automatically provision ALL environments", "PaaS enables consistency across environments", "Infrastructure as code, enables developer self service via the structured and reliable management of configuration and provisioning scripts", "Environment scaling is automatic"]
				}]
			}]
		}, {
			"principle_id": "2",
			"principle_name": "Continuous Testing",
			"practice_tbl": [{
				"practice_id": "5",
				"practice_name": "Automated Testing",
				"practice_desc": "Automated Testing",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Testing occurs after development and unit test (DCUT)", "Test environments are set up manually", "Testing is manual", "Testing is done simply to ensure the functionality satisfies the specified requirements (i.e., minimal customer focus)"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Continuous integration with static code analysis (analyzing code when not running) and build verification testing", "Test cases align with the acceptance criteria for a given user story, epic, scenario, use-case, etc.", "Developers execute their own 'personal builds' and run their own tests prior to committing code"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Some funcational and acceptance testing is automated", "Test data created, under change control, and automatically deployed to appropriate test environments", "Automatically report failing tests against the build and log problems to owners"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Testing (regression, functional acceptence, unit test, system and integration) is automated and executed as needed", "Test environments are under change control", "Any version of a test environment can be recreated automatically", "Test failures can be reproduced by automation recreating the failure environment", "Teams monitor code coverage for tests and ensure it is appropriate for their application"]
				}]
			}]
		}, {
			"principle_id": "3",
			"principle_name": "Continuous Release & Deployment",
			"practice_tbl": [{
				"practice_id": "6",
				"practice_name": "Automated Deployments",
				"practice_desc": "Automated Deployments",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Deployment processes standardized and documented", "Deployments require significant manual effort and pre-planning"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Automated deployment for development and test environments only"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Automated deployment for all environments", "Automated deployments use pattern-based provisioning", "Version control is pervasive in deployment"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Compliance checks are fully automated", "Deployments are 'push-button' events", "No downtime is needed to deploy a new version", "Automatic rollback is available and requires no downtime", "Feature releases are decoupled from code deployments"]
				}]
			}]
		}, {
			"principle_id": "4",
			"principle_name": "Continuous Feedback & Optimization",
			"practice_tbl": [{
				"practice_id": "7",
				"practice_name": "Customer Feedback",
				"practice_desc": "Customer term means your end-user.",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Slow customer feedback", "Feedback does not get to developers", "Customer/End-User is not part of the whole team"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Feedback gets to developers but not directly from customers", "No tools to track feature usage"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Customer usage of features is tracked via a few tools", "Customer feedback and insight is used to plan future releases", "Customers provide direct feedback and request new features through dedicated channels"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["Customers provide feedback throughout the entire lifecycle", "Team is able to predict new features", "Customer is a part of the whole team", "Feedback is automated and integrated in the continuous delivery pipeline"]
				}]
			}]
		}, {
			"principle_id": "5",
			"principle_name": "Continuous Monitoring",
			"practice_tbl": [{
				"practice_id": "8",
				"practice_name": "Monitoring of Environments",
				"practice_desc": "Monitoring of Environments",
				"mat_criteria_tbl": [{
					"mat_lvl_name": "Initiating",
					"mat_lvl_score": "1",
					"mat_lvl_criteria": ["Manual availability and performance monitoring", "Operations personnel are notified manually when a problem occurs"]
				}, {
					"mat_lvl_name": "Practicing",
					"mat_lvl_score": "2",
					"mat_lvl_criteria": ["Few tools for performance and availability monitoring", "System provides reactive notification of problems"]
				}, {
					"mat_lvl_name": "Transforming",
					"mat_lvl_score": "3",
					"mat_lvl_criteria": ["Environments are instrumented to detect any problems (e.g., performance issues, network issues) and automatically send notifications"]
				}, {
					"mat_lvl_name": "Scaling",
					"mat_lvl_score": "4",
					"mat_lvl_criteria": ["A dashboard with performance and availability data is available to whole team", "Analytics are used to analyze trends and predict protential problems", "Production environment is automatically optimized to conform immediately to customer usage patterns"]
				}]
			}]
		}]
	}]
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
