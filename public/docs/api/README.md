# API Work

### High level stuff to consider:

* We will be considering a self-service onboarding API, users that want to push data into the system can request
for API keys
* Proof-of-concept will initially consider pushing iteration data
* API keys will be linked to a user - meaning we enforce existing access control on that user
and the teams he or she is a member
* Swagger definition files would be used and the APIs will be RESTful by design
* 2 main routes will be provided
  * /teams - for getting list of teams that the user has access
  * /iterations - for pushing iteration data
* Integrations would be developed as external systems interfacing with the tool
  * If we want to push data from RTC, Jira or Trello, different applications should be developed
  * Each application will talk to existing track and plan apps, get data and use the iteration APIs to push data
  * We can develop this integrations ourselves or offload it to other teams willing to do it

### Viewing the API

1. Go to the [Swagger Editor]: <http://editor.swagger.io/>
2. Locate the File menu -> Import the agile-team-tool-api.yaml file