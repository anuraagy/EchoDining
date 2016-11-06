module.exports = Protocol;
var request = require('request');
var prettyjson = require('prettyjson');


function Protocol(date, diningHall) {
  this.date = date;
  this.diningHall = diningHall;
  this.vegetarian = [];
}

Protocol.prototype.getData = function() {
  request({
    uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ this.diningHall + "/" + this.date,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return body;
    }
  })
}

Protocol.prototype.getDeserts = function() {

}

Protocol.prototype.getVegetarian = function(time) {
  request({
    uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ this.diningHall + "/" + this.date,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      var meals = json["Meals"]
      if(time == "Breakfast") {
        meals = meals[0]["Stations"];
      } else if(time == "Lunch") {
        meals = meals[1]["Stations"];
      } else if(time == "Dinner") {
        meals = meals[2]["Stations"];
      } else {

      }

      meals.forEach(function(place) {
        place["Items"].forEach(function(item) {
          if(item["IsVegetarian"] == true) {
            console.log(item["Name"]);
          }
        })
      });
    }
  })
}

Protocol.prototype.getNonVegetarian = function(time) {
  request({
    uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ this.diningHall + "/" + this.date,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      var meals = json["Meals"]
      if(time == "Breakfast") {
        meals = meals[0]["Stations"];
      } else if(time == "Lunch") {
        meals = meals[1]["Stations"];
      } else if(time == "Dinner") {
        meals = meals[2]["Stations"];
      } else {
        
      }

      meals.forEach(function(place) {
        place["Items"].forEach(function(item) {
          if(item["IsVegetarian"] == false) {
            console.log(item["Name"]);
          }
        })
      });
      console.log("-")
    }
  })
}
