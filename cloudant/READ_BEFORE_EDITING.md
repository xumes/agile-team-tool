# Design Documents
##UPDATE
When updating a design doc, increase it's version number +1

##ADD 
When adding a design doc, make sure you add a version number attribute and set it to 0.
Don't save the _rev field.

##DELETE
Just delete the doc from the source code. Note: the server won't remove it from the cloudant DB on restart.



# Indexes
##UPDATE
Apply changes to the index.json file and restart server.

##ADD
Create a new .json file in the indexes folder

##DELETE
Delete the indexes/<name>.json file from the source code. Note: the server won't remove the index from the cloudant DB on restart.
