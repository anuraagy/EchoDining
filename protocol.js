module.exports = Protocol;
var https = require('https');

function Protocol(date, diningHall) {
  this.date = date;
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

Protocol.prototype.getOpenDiningHalls = function(callback) {

    var openDiningHalls = [];
    var date = new Date();
    var weekday = new Array(7);
    var currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    currentTime = "12:01:00";

    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    https.get({
	host: 'api.hfs.purdue.edu',
	path: '/menus/v2/locations'
    }, function(response) {
	// Continuously update stream with data
	var body = '';
	response.on('data', function(d) {
	    body += d;
	});
	response.on('error', function(e) {
	    console.log("got error: " + e.message);
	});
	response.on('end', function() {
	    if(!(body.localeCompare('') == 0)) {
		var json = JSON.parse(body);

		json["Location"].forEach(function(hall) {
		    hall["NormalHours"][0]["Days"].forEach(function(eatingTime) {
			if(weekday[date.getDay()] == eatingTime["Name"]) {
			    eatingTime["Meals"].forEach(function(time) {
				if(time["Hours"] != null) {
				    if(time["Hours"]["StartTime"] < currentTime && time["Hours"]["EndTime"] > currentTime){
					    openDiningHalls.push(hall["Name"]);
				    }
				}
			    });
			}
		    });
		});
    console.log(openDiningHalls)
		 callback(openDiningHalls);
	    }
	});
    });
}

Protocol.prototype.getDeserts = function(time, diningHall) {
    var deserts = []
    request({
	uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ diningHall + "/" + this.date,
    method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	},
    }, function (error, response, body) {
	if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
	    var meals = json["Meals"]
	    meals.forEach(function(period) {
		if(period["Name"] == time) {
		    period["Stations"].forEach(function(place) {
			p = place["Name"]
			if(p == "Devonshire Way" || p == "Sugar Hill" || p == "The Pastry Shop" || p == "Delectables" || p == "Temptations") {
			    place["Items"].forEach(function(item) {
				deserts.push(item["Name"])
			    })
			}
		    });
		}
	    })
	    console.log(deserts)
	}
    })
}

Protocol.prototype.getVegetarian = function(time, diningHall) {
    var food = []
    request({
	uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ diningHall + "/" + this.date,
	method: 'GET',
	headers: {
      'Content-Type': 'application/json'
	},
    }, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    var json = JSON.parse(body);
	    var meals = json["Meals"]
	    meals.forEach(function(period) {
		if(period["Name"] == time) {
		    period["Stations"].forEach(function(place) {
			place["Items"].forEach(function(item) {
			    if(item["IsVegetarian"] == true) {
				food.push(item["Name"]);
			    }
			})
		    });
		}
	    })
	    console.log(food)
	}
    })
}

Protocol.prototype.getNonVegetarian = function(time, diningHall) {
    var food = []
    request({
    uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ diningHall + "/" + this.date,
	method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	},
    }, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    var json = JSON.parse(body);
	    var meals = json["Meals"]
	    meals.forEach(function(period) {
		if(period["Name"] == time) {
		    period["Stations"].forEach(function(place) {
			place["Items"].forEach(function(item) {
			    if(item["IsVegetarian"] == false) {
				food.push(item["Name"]);
			    }
			})
		    });
		}
	    })
	    console.log(food)
	}
    })
}
