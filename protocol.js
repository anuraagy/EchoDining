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
					openDiningHalls.push([hall["Name"], time["Name"], timeData]);
				    }
				}
			    });
			}
		    });
		});

		var speechOutput = 'Currently';

		if(openDiningHalls.length != 0) {
		    var finalDiningHalls = [openDiningHalls[0]];
		    finalDiningHalls[0].push(0);
		    
		    for(i = 1; i < openDiningHalls.length; i++) {
			var data = openDiningHalls[i];
			data.push(0);
			
			var successful = false;
			
			for(j = 0; j < finalDiningHalls.length; j++) {

			    var finalData = finalDiningHalls[j];
			    
			    if(successful = (data[1] == finalData[1] && data[2] == finalData[2])) {
				finalDiningHalls[j][0] += ', ' + data[0];
				finalDiningHalls[j][3]++;
				break;
			    }
			}

			if(!successful) {
			    finalDiningHalls.push(data);
			}
		    }

		    finalDiningHalls.forEach(function(data) {
			speechOutput += ' ' + data[0];

			if(data[3] != 0) {
			    speechOutput += ' are open for ';
			} else {
			    speechOutput += ' is open for ';
			}

			speechOutput += data[1] + ' until ' + data[2] + '.';
		    });
		    
		} else {
		    speechOutput += ' no dining halls are open.';
		}
				
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

Protocol.prototype.getFoodOptions = function(time, court, foodType, callback) {
    
    this.getFood(time, court, foodType, function(availableFood) {

	var speechOutput = Protocol.prototype.convertFoodsToSpeech(court, foodType, availableFood);
	console.log(speechOutput);
	callback(speechOutput);
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
    
    var speechOutput = court + ' offers';
    var i;
    
    for(i = 0; i < availableFood.length; i++) {
	if(availableFood.length - 1 == i && i != 0)
	    speechOutput += ', and ' + availableFood[i] + '.';
	else if(availableFood.length - 1 == i && i == 0)
	    speechOutput += ' ' + availableFood[i] + '.';
	else
	    speechOutput += (i == 0 ? ' ' : ', ') + availableFood[i];
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
            callback(Protocol.prototype.multGen(foods));
	}
    });
    
    this.getFood(time, "Windsor", foodType, function(availableFood) {
	
	foods.push(Protocol.prototype.convertFoodsToSpeech('Windsor', foodType, availableFood));
		   
	windsor = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
	    callback(Protocol.prototype.multGen(foods));
	}
    });
    
    this.getFood(time, "Wiley", foodType, function(availableFood) {
	
	foods.push(Protocol.prototype.convertFoodsToSpeech('Wiley', foodType, availableFood));
	
	wiley = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            callback(Protocol.prototype.multGen(foods));
	}
	
    });
    
    this.getFood(time, "Earhart", foodType, function(availableFood) {

	foods.push(Protocol.prototype.convertFoodsToSpeech('Earhart', foodType, availableFood));
	
	earhart = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
            callback(Protocol.prototype.multGen(foods));
	}
    });
    
    this.getFood(time, "Hillenbrand", foodType, function(availableFood) {

	foods.push(Protocol.prototype.convertFoodsToSpeech('Hillenbrand', foodType, availableFood));
	
	hillenbrand = true;
	
	if(hillenbrand && earhart && wiley && windsor && ford) {
	    callback(Protocol.prototype.multGen(foods));
	}
    });
}

Protocol.prototype.multGen = function(foods) {

    var speechOutput = '';
    
    foods.forEach(function(data) {
	speechOutput += data + ' ';
    });
    
    return speechOutput;
}
