# Agile Team Tool [![Build Status](https://travis.ibm.com/AgileAcademy/agile-team-tool-nodejs.svg?token=GEQPqR4dViSH8CpMeuaS&branch=master)](https://travis.ibm.com/AgileAcademy/agile-team-tool-nodejs)

A web app enabling teams to track and analyze progress on their journey of maturing as an Agile team. You can visit the tool [here](https://ibm.biz/AgileTeamTool).

## Overview

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Getting Started
In order to run this project on your local machine, you have a couple of options. You can either run [Node.js](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/) and [Redis](https://redis.io/) on your machine, or you can use Docker to run everything for you.

If you use the Docker instructions below, then you only have to have [Node.js] and [npm] installed.

Make sure to execute `npm install` first for module dependencies

### [Node.js](https://nodejs.org/en/)
This project uses Node.js version 6.x. We recommend installing Node.js via [nvm](https://github.com/creationix/nvm). With nvm, you can install the correct version of Node.js using `nvm use node`, which installs the latest version.

### [Redis](https://redis.io/)
Redis is used for session management.

### [MongoDB](https://www.mongodb.com/)
Data are stored in JSON-like documents using MongoDB.

### [ReactJS](https://facebook.github.io/react/)
Application UI is built using the ReactJS framework.

#### [IBM v18 Northstar](http://ibmdev.webmaster.ibm.com/resources/index.php?filter=v18)
Along with the custom styling used to implement the current UI, most of the default styling is based on IBM's v18 Northstar framework. [jQuery](https://jquery.com/) is also packaged as part of the framework.

#### [Highcharts](https://www.highcharts.com/)
Highcharts is used to graph metrics relevant to the tool.

#### Environment Variables

| Variable            | Description                                                                                                                         |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| authType            | `ldap-login` or `saml`                                                                                                              |
| ldapAuthURL         | LDAP authentication API end point when `authType: ldap-login`                                                                       |
| saml                | SAML configuration used for authentication with [w3 SSO](https://w3.innovate.ibm.com/tools/sso/home.html) when `authType: saml`.    |
| redisDb             | Redis related setup for session management                                                                                          |
| sentry              | Sentry related setup for tracking possible applicaiton exceptions.                                                                  |
| mongoURL            | Connection setup for MongoDB.                                                                                                       |
| bluepagesURL        | Bluepages API end point used by job that validates team member profiles                                                             |
| facesURL            | Faces API endpoint.                                                                                                                 |
| email               | SMTP related configuration.                                                                                                         |
| ibmNPSKey           | Net Promoter Score (NPS) related configuration.                                                                                     |
| environment         | `development` or `production`                                                                                                       |
| googleAnalyticsKey  | API key for Google analytics.                                                                                                       |

#### Starting the Development Server
The most simple setup, using default environment variable values:

```
npm install
npm start
```
A bit of a better setup might be something like the following, where you can change environment variables:

```
npm install
logColors=true redisHost=172.17.0.2 redisPort=6379 NODE_ENV=production nodemon ./bin/www
```

#### Using Docker in your local environment
In order to run the application and the associated MongoDB and Redis processes in Docker containers in your local environment, do the following. Please note that the `mongodb` container doesn't start quickly enough to bring all the containers up at the same time, and causes the `app` to fail. So you'll need to do them in two batches, with `mongodb` and `redis` first.
```
npm install
docker-compose up mongodb redis
docker-compose up app
```

In order to load the MongoDB with existing data, do the following with a file that was dumped from a running database.
```
docker cp <path_to_file>/agiletool_stage.tar.gz agileteamtoolnodejs_mongodb_1:/tmp
docker exec -it agileteamtoolnodejs_mongodb_1 bash
```
Then the following from the bash shell:
```
cd /tmp
tar -xzf agiletool_stage.tar.gz
mongorestore -h localhost:27017 --db agiletool_stage agiletool_stage
```

#### Testing Locally
```
gulp test
```

## Deployment

* [Jenkins](https://jenkins.io/)

### Jobs

There are 3 jobs running on separate deployments using the same base code.  These are to:
1. Rollup squad iteration data to their parents.  Currently scheduled to run every 3 minutes.
2. Mark iteration as `Complete` if it is past end date. Currently scheduled to run daily.
3. Mark member information if they no longer exist in Bluepages. Currently scheduled to run weekly.
4. Replicate DB to another instance for reporting purposes.  Intended for users who need to access and extract data.  Currently scheduled to run daily.
