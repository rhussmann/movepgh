var fs  = require("fs")
var csv = require("csv")

// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var facet_model = require("../model/facet_model");

// Connect to mongo
mongoose.connect(MONGO_URL);

var header = []
csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Scores.csv"))
.transform( function(row, index){
	if (index === 0) {
		header = row
		return
	}
	
	var facet_id = row[0]
	var scores = {}
	row.forEach(function(hood_score, index){
		if (index === 0) return
		scores[header[index]] = parseFloat(hood_score)
  })
	console.log(JSON.stringify({id: facet_id, neighborhood_scores: scores}))
  
  facet_model.findOneAndUpdate({id: facet_id}, {neighborhood_scores: scores}, {upsert: true}, function updateHandler(err) {
    if (err) {
      console.log("Unable to update neighborhood scores for facet. " + err);
      retun;
    } else {
      console.log("Neighborhood scores for " + facet_id + " updated");
    }
  })
});