##UPDATE
When updating a design doc, increase it's version number +1

##ADD 
When adding a design doc, make sure you add a version number attribute and set it to 0.
Don't save the _rev field.

##DELETE
Just delete the doc from the source code. Note: the server won't remove it from the cloudant DB on startup.
