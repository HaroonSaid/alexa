#!/bin/bash
rm alexa.zip 
zip -rq alexa.zip . -x *.git*
aws lambda update-function-code --function-name serverlessrepo-alexa-skil-alexaskillskitnodejsfact-1AWP4AAIP8EB6 --zip-file fileb://alexa.zip