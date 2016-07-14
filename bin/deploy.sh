#!/bin/bash
curl -sLO http://go-cli.s3-website-us-east-1.amazonaws.com/releases/v6.9.0/cf-linux-amd64.tgz
tar -xf cf-linux-amd64.tgz
./cf login -a api.ng.bluemix.net -u $bluemixID -p $bluemixPassword -o "CIO Lab iFundIT" -s "AgileTeamTool"
curl -sLO $agileManifestURL
curl -sLO $agileManifestGreenURL
./cf push agile-tool-nodejs-green-stage -f agile-team-tool-green-manifest.yml
./cf map-route agile-tool-nodejs-green-stage mybluemix.net -n agile-tool-nodejs-stage
./cf unmap-route agile-tool-nodejs-stage mybluemix.net -n agile-tool-nodejs-stage
./cf stop agile-tool-nodejs-stage
./cf rename agile-tool-nodejs-green-stage agile-tool-nodejs-stage-temp
./cf rename agile-tool-nodejs-stage agile-tool-nodejs-green-stage
./cf rename agile-tool-nodejs-stage-temp agile-tool-nodejs-stage
