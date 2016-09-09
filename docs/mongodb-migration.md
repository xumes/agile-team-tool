# MongoDB Migration Work

## database models and Cloudant <-> MongoDB schema mapping


### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId      | ['cjscotta@us.ibm.com']              | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a

### iterations
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
|_id| objectId | n/a
|name | memes | iteration_name
|teamId | objectId of team | team_id 
|type | ?? | type (ex:  "iterationinfo")
|status| 'completed' or 'in progress'
|creationDate|epoc time | created_dt
|createdBy| string of userId | created_user
|lastedUpdated| epoc time | last_updt_dt
|updatedBy| string of userId | last_updt_user
|startDate| epoc time|iteration_start_dt
|endDate| epoc time|iteration_end_dt
|committedStories| integer | nbr_committed_stories
|deliveredStories| integer | nbr_stories_dlvrd
|locationScore | ( ex 0.5 .. used for pizza chart i think) | fte_cnt
|deployments | 1 | nbr_dplymnts
|defects | 2 | nbr_defects
|clientSatisfaction| ? | client_sat
|teamSatisfaction| ? | team_sat
|comment| string | iteration_comments
|memberChanged| boolean | team_mbr_change ('Yes' or 'No')


### teams (top down tree structure)


| Fields        | Details           
| ------------- |:-------------:
| ??siblings      | []      
| children      | []
| members       | ['bill','bob']
| squad          | true or false


### assessments
| Fields        | Details           
| ------------- |:-------------:
|       |       
### snapshots (roll-up data)
| Fields        | Details           
| ------------- |:-------------:
|       |       
## Proposed work
* Use Mongoose
* Have alternate versions of assessment.js, iteration.js, snapshot.js, teams.js and users.js in a new model directory
* Move validation from validate.js -> [using mongoose schema validation]
* Use mongoose default fields and remove the various default data spread throughout the project (e.x public/index.js ~L5->114)
* Once a model has been rewritten, ensure migration scripts are written as well

## Structure
* Top down; parent nodes have pointers to children.


### Cloudant <-> MongoDB schema mapping
TODO


## References

### Terminologies used in Trees.


 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
