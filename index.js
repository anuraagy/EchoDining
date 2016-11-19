var Alexa = require('alexa-sdk');
var Protocol = require("./protocol");
var https = require('https');

const skillName = "EchoDining";

var handlers = {
  "GetOpenDiningHalls": function () {
    var protocol = new Protocol();
    var speechOutput = "";
    console.log("hello")
    var that = this;
    protocol.getOpenDiningHalls(function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
  },

  "GetDeserts": function() {
    var protocol = new Protocol();
    var diningHall = this.event.request.intent.slots.DiningHall.value
    var that = this;
    protocol.getDeserts("Lunch",diningHall, function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
  },

  "GetVegetarian": function() {
    var protocol = new Protocol();
    var diningHall = this.event.request.intent.slots.DiningHall.value
    var that = this;
    protocol.getVegetarian("Lunch", diningHall, function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
  },

  "GetNonVegetarian": function() {
    var protocol = new Protocol();
    var diningHall = this.event.request.intent.slots.DiningHall.value
    console.log(diningHall)
    var that = this;
    protocol.getNonVegetarian("Lunch", diningHall, function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
  },

  "GetFood": function() {
    var protocol = new Protocol();
    var food = this.event.request.intent.slots.Food.value
    console.log(food)
    var that = this;
    protocol.getFoodOptionsMultiple("Lunch", food, function(speechOutput) {
      that.emit(':tell', speechOutput);
    });
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
