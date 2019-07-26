const { getStatus } = require('./systemstatus');


const launchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'hi, you can ask, whats the system status or what is the status of a service or Whats the status of all services, for example, what is the status of unified <say-as interpret-as="interjection">a p i</say-as>. Which one would you like to try?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('Do you want to know status of a service, just say, What is the status of unified a p i')
            .getResponse();
    }
};
// System Status
const systemStatusIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'systemstatus';
    },
    async handle(handlerInput) {
        let speechText = "<emphasis level=\"strong\">its all good!</emphasis>" +
        "<say-as interpret-as=\"interjection\">woo hoo</say-as>!" ;
        const response = await getStatus();
        if (response === 'unhealthy') {
            speechText = "<emphasis level=\"strong\">Huston! we have a problem</emphasis>, to find out which service has a problem, just say 'Whats the status of all services?'";
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
// Specific Service Status by Slot
const serviceStatusIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'servicestatus';
    },
    handle(handlerInput) {
        console.log('service status - handle');

        const responseBuilder = handlerInput.responseBuilder;
        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);
        console.log(`slot:${JSON.stringify(slotValues)}`);
        let speechText = "Sorry, I can't find the service";
        if (slotValues.servicename.isValidated) {
            // TODO add code to check for specfic status of a service 
            speechText = `The system status of ${slotValues.servicename.resolved} is <emphasis level="strong">healthy</emphasis>`;
        }
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
}
// All Services 
const allServicesStatusIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'allstatus';
    },
    async handle(handlerInput) {
        console.log('all services - handle');
        const response = await getStatus();
        if (response === 'unhealthy') {
            const speechText = "<emphasis level=\"strong\">Huston! we have a problem</emphasis> standby!'";
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }
        const checks = response.healthcheck.checks;
        let statusText = '';
        for(var i=0;i< checks.length;i++) {
            //statusText+= `${checks[i].keys}`;
            const data = checks[i];
            const keys = Object.keys(data);
            for (const key of keys) {
                console.log(`key:${key} -- ${data[key].message}`);
                if (data[key].message !== undefined) {
                    statusText+= `${key} is ${data[key].message} <break strength="strong"/> `;
                }
                
            }
        }
        console.log(`txt:${statusText}`);
        return handlerInput.responseBuilder
            .speak(statusText)
            .getResponse();
    }
}
// Helper Function
function getSlotValues(filledSlots) {
    const slotValues = {};
  
    console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
    Object.keys(filledSlots).forEach((item) => {
      const name = filledSlots[item].name;
  
      if (filledSlots[item] &&
        filledSlots[item].resolutions &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
          case 'ER_SUCCESS_MATCH':
            slotValues[name] = {
              synonym: filledSlots[item].value,
              resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
              isValidated: true,
            };
            break;
          case 'ER_SUCCESS_NO_MATCH':
            slotValues[name] = {
              synonym: filledSlots[item].value,
              resolved: filledSlots[item].value,
              isValidated: false,
            };
            break;
          default:
            break;
        }
      } else {
        slotValues[name] = {
          synonym: filledSlots[item].value,
          resolved: filledSlots[item].value,
          isValidated: false,
        };
      }
    }, this);
  
    return slotValues;
  }
module.exports.Ops = {
    launchRequestHandler, 
    systemStatusIntentHandler,
    serviceStatusIntentHandler,
    allServicesStatusIntentHandler
}
