var Alexa = require('alexa-sdk');
var Protocol = require("./protocol")

const skillName = "EchoDining"

var handlers = {
  "GetOpeningDiningHalls": function () {
    var speechOutput = "";
    speechOutput = protocol.getOpenDiningHalls();
    this.emit(:tell, speechOutput);
  }
  "GetDeserts": function() {
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getDeserts("Lunch",diningHall);
    this.emit(:tell, speechOutput);
  }
  "GetVegetarian": function() {
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getVegetarian("Lunch",diningHall);
    this.emit(:tell, speechOutput);
  }
  "GetNonVegetarian": function() {
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getNonVegetarian("Lunch",diningHall);
    this.emit(:tell, speechOutput);
  }
}

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.969e9338-68d0-43ff-ba67-bcfb273f7f9c";
    alexa.registerHandlers(handlers);
    alexa.execute();
};
