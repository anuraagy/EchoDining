var Protocol = require("./protocol");
var protocol = new Protocol("11-10-2016");

protocol.getFoodOptionsMultiple("Lunch", "Chicken", function(speechOutput) {
  console.log(speechOutput)
});

protocol.getOpenDiningHalls(function(data) {

});


protocol.getFoodOptions("Lunch", "Wiley", "Chicken", function(speechOutput) {

});
