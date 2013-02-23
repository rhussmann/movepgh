var fs  = require("fs")
var csv = require("csv")

// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var hood_model = require("../model/neighborhood_model");

// Connect to mongo
mongoose.connect(MONGO_URL);

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Neighborhoods.csv"))
.transform( function(row, index){
	if (index === 0) return
	var neighborhood = {}
	neighborhood.id = row[0]
	neighborhood.name = row[1]
	neighborhood.description = row[2]
  console.log(JSON.stringify(neighborhood))

  hood_model.findOneAndUpdate({id: neighborhood.id}, neighborhood, {upsert: true}, function updateHandler(err) {
    if (err) {
      console.log("Unable to update neighborhood. " + err);
      retun;
    } else {
      console.log("neighborhood " + neighborhood.id + " updated");
    }
  })
});

