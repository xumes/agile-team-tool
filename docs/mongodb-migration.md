# MongoDB Migration Work

## database models and mapping

### admins
| Fields        | Details           
| ------------- |:-------------:
| userId         | ['cjscotta@us.ibm.com']      
| permission     | 'full' or 'read' or 'write'

### iterations
| Fields        | Details       | cloudant field    
| ------------- |:-------------:|-------------
|_id| objectId| n/a
|name| Dank Memes|iteration_name
|teamId| objectId of team|
|type| ?
|status| 'completed' or 'in progress'
|creationDate|epoc time
|createdBy| ibm email
|lastedUpdated| epoc time
|startDate| epoc time|iteration_start_dt
|endDate| epoc time|iteration_end_dt
|committedStories| num
|deliveredStories| num
|locationScore| ( 'fte_cnt' .. used for pizza chart i think)
|deployments|1
|defects|2
|clientSatisfaction| ?
|teamSatisfaction| ?


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
