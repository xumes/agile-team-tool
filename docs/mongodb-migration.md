# MongoDB Migration Work

## database models and Cloudant <-> MongoDB schema mapping


### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) string. for IBM it's CNUM or perhaps shortEmail? | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string; for IBM it's pref. ID | n/a
| name  | string' first and last name of person | n/a
| lastLogin | JS Date Object| n/a


### iterations
| Fields        | Details      | cloudant field | cloudant value ex (if not obv.)
| ------------- |:-------------:|------------- | -------------
|name | string | iteration_name |
|teamId | objectId of team | team_id |
|type | use: ??not sure | type  | "iterationinfo"
|status| 'completed' or 'in progress' | iterationinfo_status |"Not complete", "Completed"
|createDate|JS Date Object | created_dt | "2016-04-12 08:58:50 EDT"
|createdById| string of userId | created_user |
|createdBy| string of name or email | created_user |
|updateDate| JS Date Object | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById| string of userId | last_updt_user |
|updatedBy| string of name or email | last_updt_user |
|startDate| JS Date Object|iteration_start_dt | "01/15/2016"
|endDate| JS Date Object|iteration_end_dt | "01/16/2016"
|committedStories| integer | nbr_committed_stories |
|deliveredStories| integer | nbr_stories_dlvrd |
|locationScore | used for pizza chart i think ?? | fte_cnt | 0.0 or 0.5 
|deployments | integer | nbr_dplymnts | "" or 1
|defects | integer | nbr_defects | "" or 2
|clientSatisfaction| integer | client_sat | 1.0
|teamSatisfaction| integer | team_sat | 4
|comment| string | iteration_comments |
|memberChanged| boolean, use: ?? | team_mbr_change | "No"


### teams (bottom up tree structure)
Possible tree structure pattern to explore:
* [Model Tree Structures with an Array of Ancestors]
* [Model Tree Structures with Parent References]



| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
| parent(mongoDB field)| ObjectId| |parent_team_id|
| members       | array of objects| [{userId:'5G22944', name:'billy bob', allocation:'100', role:"Developer"}] | members | [{key,id,name,allocation,role}]
|type           | string | "", "squad", "domain", "tribe", "subDomain", "potato" | squadteam     | "Yes" or "No"
|createDate     | JS Date Object | |created_dt | "2016-04-12 08:58:50 EDT"
|createdById      | string of userId | | created_user |
|createdBy        | string of name or email | | created_user |
|updateDate       | JS Date Object | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById      | string of userId | |last_updt_user |
|updatedBy      | string of name or email | |last_updt_user |

### assessments
| Fields        | Details           
| ------------- |:-------------:
|

### snapshots (roll-up data)
| Fields        | Details           
| ------------- |:-------------:
|

## Proposed work
* Use Mongoose
* Have alternate versions of assessment.js, iteration.js, snapshot.js, teams.js and users.js in a new model directory
* Move validation from validate.js -> [using mongoose schema validation]
* Use mongoose default fields and remove the various default data spread throughout the project (e.x public/index.js ~L5->114)

###Steps
1. Migrate data
2. Develop models 

## References

 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
[Model Tree Structures with an Array of Ancestors]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/>
[Model Tree Structures with Parent References]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-parent-references/>
