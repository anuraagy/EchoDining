var Protocol = require("./protocol");
var protocol = new Protocol("11-10-2016");
protocol.getFoodOptionsMultiple("Lunch", "Chicken", function(speechOutput) {
  console.log(speechOutput)
});
