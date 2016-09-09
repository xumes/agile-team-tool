# MongoDB Migration Work

## database models and Cloudant <-> MongoDB schema mapping


### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) string. for IBM it's CNUM or perhaps shortEmail? | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string | n/a


### iterations
| Fields        | Details      | cloudant field | cloudant value ex (if not obv.)
| ------------- |:-------------:|------------- | -------------
|name | string | iteration_name |
|teamId | objectId of team | team_id |
|type | use: ??not sure | type  | "iterationinfo"
|status| 'completed' or 'in progress' | iterationinfo_status |"Not complete", "Completed"
|createDate|JS Date Object | created_dt | "2016-04-12 08:58:50 EDT"
|createdBy| string of userId | created_user |
|updateDate| JS Date Object | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedBy| string of userId | last_updt_user |
|startDate| JS Date Object|iteration_start_dt | "01/15/2016"
|endDate| JS Date Object|iteration_end_dt | "01/16/2016"
|committedStories| integer | nbr_committed_stories |
|deliveredStories| integer | nbr_stories_dlvrd |
|locationScore | ( ex 0.5 .. used for pizza chart i think) | fte_cnt | 0.0
|deployments | integer | nbr_dplymnts | "" or 1
|defects | integer | nbr_defects | "" or 2
|clientSatisfaction| integer, use: ? | client_sat | 1.0
|teamSatisfaction| integer, use: ? | team_sat | 4
|comment| string | iteration_comments |
|memberChanged| boolean, use: ?? | team_mbr_change | "No"


### teams (bottom up tree structure)

| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
| parent(mongoDB field)| ObjectId| |parent_team_id|
| members       | array of objects| [{userId:'5G22944', name:'billy bob'}] | members | [{key,id,name,allocation,role}]
| isSquad       | boolean       | true or false| squadteam     | "Yes" or "No"
|createDate     | JS Date Object | |created_dt | "2016-04-12 08:58:50 EDT"
|createdBy      | string of userId | | created_user |
|updateDate     | JS Date Object | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedBy      | string of userId | |last_updt_user |

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
* Once a model has been rewritten, ensure migration scripts are written as well

## References

 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
