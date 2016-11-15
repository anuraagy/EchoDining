var Protocol = require("./protocol");
var protocol = new Protocol();

protocol.getFoodOptionsMultiple("Lunch", "Chicken", function(speechOutput) {
  // console.log(speechOutput)
});

protocol.getOpenDiningHalls(function(data) {

});
