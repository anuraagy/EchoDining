var Alexa = require('alexa-sdk');
var Protocol = require("./protocol");
var https = require('https');

const skillName = "EchoDining";

var handlers = {
  "GetOpenDiningHalls": function () {
    var protocol = new Protocol("11-10-2016");
    var speechOutput = "";
    console.log("hello")
    var that = this;
    protocol.getOpenDiningHalls(function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
  },

  "GetDeserts": function() {
    var protocol = new Protocol("11-11-2016");
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getDeserts("Lunch",diningHall);
    var that = this;
    setTimeout(function() {
      that.emit(':tell', speechOutput);
    },3000);
  },

  "GetVegetarian": function() {
    var protocol = new Protocol("11-11-2016");
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getVegetarian("Lunch",diningHall);
    var that = this;
    setTimeout(function() {
      that.emit(':tell', speechOutput);
    },3000);
  },

  "GetNonVegetarian": function() {
    var protocol = new Protocol("11-11-2016");
    var diningHall = this.event.request.intent.slots.DiningHall
    var speechOutput = protocol.getNonVegetarian("Lunch",diningHall);
    var that = this;
    setTimeout(function() {
      that.emit(':tell', speechOutput);
    },3000);
  },

  "Unhandled": function() {
    this.emit(':tell', "I'm sorry, I didn't understand what you said. Please try again!");
  }
}

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.969e9338-68d0-43ff-ba67-bcfb273f7f9c";
    alexa.registerHandlers(handlers);
    alexa.execute();
};
