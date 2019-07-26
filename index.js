/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const { getStatus } = require('./systemstatus');


const LaunchRequestHandler = {
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
const incidentHistoryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'history';
    },
    handle(handlerInput) {
        const speechText = 'The last incident was 10 days ago';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
}
const incidentStatusHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'currentincident';
    },
    handle(handlerInput) {
        const speechText = 'There are no open incidents';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
}
const systemStatusHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'systemstatus';
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
const allStatusHandler = {
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

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say whats the current status or whats the status of flash seats';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        systemStatusIntentHandler,
        incidentStatusHandler,
        incidentHistoryHandler,
        systemStatusHandler,
        allStatusHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
    
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
