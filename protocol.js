module.exports = Protocol;

var https = require('https');
var request = require('request')

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
    var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    currentTime = "12:00:00";
    
    https.get({
	host: 'api.hfs.purdue.edu',
	path: '/menus/v2/locations'
    }, function(response) {
	
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

				    var date = (time["Hours"]["EndTime"]).split(":");

				    var test = parseInt(date[0]);
				    var ampm;
				    
				    if(test > 12) {
					ampm = 'PM';
				    } else {
					ampm = 'AM';
				    }

				    if(test == 0) {
					test = 12;
				    } else if(test > 12) {
					test = test - 12
				    }
				    
				    var timeData = test + ':' + date[1] + ' ' + ampm;
				    
				    if(time["Hours"]["StartTime"] < currentTime && time["Hours"]["EndTime"] > currentTime){
					openDiningHalls.push(hall["Name"] + " is open for " + time["Name"]
							     + " until " + timeData);
				    }
				}
			    });
			}
		    });
		});

		var speechOutput = 'Currently';

		for(i = 0; i < openDiningHalls.length; i++) {
		    if(i == openDiningHalls.length - 1 && i != 0)
			speechOutput += ', and ' + openDiningHalls[i];
		    else
			speechOutput += ', ' + openDiningHalls[i];

		    if(i == openDiningHalls.length - 1)
			speechOutput += '.';
		}

		if(openDiningHalls.length == 0)
		    speechOutput += ' no dining halls are open.';
		
		console.log(speechOutput);
		callback(speechOutput);
	    }
	});
    });
}

Protocol.prototype.getDeserts = function(time, diningHall, callback) {

    var deserts = [];

    request({
	uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ diningHall + "/" + this.date,
	method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	},
    }, function (error, response, body) {

	if (!error && response.statusCode == 200) {

	    var json = JSON.parse(body);
	    var meals = json["Meals"];

	    meals.forEach(function(period) {
		if(period["Name"] == time) {
		    period["Stations"].forEach(function(place) {

			p = place["Name"];

			if(p == "Devonshire Way" || p == "Sugar Hill" || p == "The Pastry Shop" || p == "Delectables" || p == "Temptations") {
			    place["Items"].forEach(function(item) {
				deserts.push(item["Name"]);
			    });
			}
		    });
		}
	    });

	    console.log(deserts);
	    callback(deserts);
	}
    })
}

Protocol.prototype.getVegetarian = function(time, diningHall, callback) {

    var food = [];

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
			});
		    });
		}
	    });

	    callback(food);
	}
    });
}

Protocol.prototype.getNonVegetarian = function(time, diningHall, callback) {

    var food = [];
    
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
			});
		    });
		}
	    });

	    callback(food);
	}
    });
}

Protocol.prototype.getFood = function(time, diningHall, foodType, callback) {

    var food = [];

    request({
	uri:  'https://api.hfs.purdue.edu/menus/v2/locations/'+ diningHall + "/" + this.date,
	method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	},
    }, function(error, response, body) {

	if(!error && response.statusCode == 200) {

	    var json = JSON.parse(body);
	    var meals = json["Meals"];
	    
	    meals.forEach(function(period) {
		if(period["Name"] == time) {
		    period["Stations"].forEach(function(place) {
			place["Items"].forEach(function(item) {
			    if((item["Name"].toLowerCase()).includes((foodType.toLowerCase()))) {
				food.push(item["Name"]);
			    }
			});
		    });
		}
	    });
	    
	    return callback(food);
	} else {
	    return callback([]);
	}
    });
}

Protocol.prototype.getFoodOptions = function(time, court, foodType) {
    
    this.getFood(time, court, foodType, function(availableFood) {
	console.log(availableFood);
    });
}

Protocol.prototype.convertFoodValue = function(court, availableFood) {

    for(i = 0; i < availableFood.length; i++) {
	availableFood[i] = court + " - " + availableFood[i];
    }

    return availableFood;
}

Protocol.prototype.convertFoodsToSpeech = function(court, foodType, availableFood) {

    if(availableFood.length == 0) {
	return '';//court + ' does not have any ' + foodType + ' options.';
    }
    
    var speechOutput = court + ' ' + foodType + ' options include';

    for(i = 0; i < availableFood.length; i++) {
	if(availableFood.length - 1 == i && i != 0)
	    speechOutput += ', and ' + availableFood[i] + '.';
	else
	    speechOutput += ', ' + availableFood[i];
    }

    return speechOutput;
}

Protocol.prototype.getFoodOptionsMultiple = function(time, foodType, callback) {
    
    var foods = [];
    
    var ford = false;
    var earhart = false;
    var hillenbrand = false;
    var windsor = false;
    var wiley = false;
    
    this.getFood(time, "Ford", foodType, function(availableFood) {
	
	foods.push(Protocol.prototype.convertFoodsToSpeech('Ford', foodType, availableFood));
	
	ford = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            console.log(foods);

	    var speechOutput = '';

	    foods.forEach(function(data) {
		speechOutput += data + ' ';
	    });

	    callback(speechOutput);
	}
    });
    
    this.getFood(time, "Windsor", foodType, function(availableFood) {
	
	foods.push(Protocol.prototype.convertFoodsToSpeech('Windsor', foodType, availableFood));
		   
	windsor = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            console.log(foods);

	    var speechOutput = '';

	    foods.forEach(function(data) {
		speechOutput += data + ' ';
	    });

	    callback(speechOutput);
	}
    });
    
    this.getFood(time, "Wiley", foodType, function(availableFood) {
	
	foods.push(Protocol.prototype.convertFoodsToSpeech('Wiley', foodType, availableFood));
	
	wiley = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            console.log(foods);

	    var speechOutput = '';

	    foods.forEach(function(data) {
		speechOutput += data + ' ';
	    });

	    callback(speechOutput);
	}
	
    });
    
    this.getFood(time, "Earhart", foodType, function(availableFood) {

	foods.push(Protocol.prototype.convertFoodsToSpeech('Earhart', foodType, availableFood));
	
	earhart = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            console.log(foods);

	    var speechOutput = '';

	    foods.forEach(function(data) {
		speechOutput += data + ' ';
	    });

	    callback(speechOutput);
	}
    });
    
    this.getFood(time, "Hillenbrand", foodType, function(availableFood) {

	foods.push(Protocol.prototype.convertFoodsToSpeech('Hillenbrand', foodType, availableFood));
	
	hillenbrand = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
	    console.log(foods);

	    var speechOutput = '';

	    foods.forEach(function(data) {
		speechOutput += data + ' ';
	    });
	    
	    callback(speechOutput);
	}
    });
}
