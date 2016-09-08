# MongoDB Migration Work

### Domain models
- users
- iterations
- teams
- assessments
- snapshots (roll-up data)

### Proposed work
* Have alternate versions of assessment.js, iteration.js, snapshot.js, teams.js and users.js
* Use Mongoose
* Move validation from validate.js -> mongoose (?)
* Once a model has been rewritten, ensure migration scripts are written as well

#### Cloudant <-> MongoDB schema mapping
TODO

##### References
* <https://docs.mongodb.com/manual/applications/data-models-tree-structures/> Modelling tree structures