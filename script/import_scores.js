var async = require("async")
var fs    = require("fs")
var csv   = require("csv")

// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var facet_model = require("../model/facet_model");

// Connect to mongo
mongoose.connect(MONGO_URL);

// Async task array
var scores_update_tasks = [];

var header = []
csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Scores.csv"))

// Parse out a score record
.on("record", function(row, index){
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
  scores_update_tasks.push(createAsyncMongooseUpdateFunction(facet_id, scores));
})

// Submit all the score records as mongo update tasks
.on ("end", function(count) {
  console.log("Parsed " + count + " scores, attempting to update mongo...")
  async.parallel(scores_update_tasks, function(err, results) {
    if (err) {
      console.log("Error updating scores: " + err);
    } else {
      console.log("Successfully updated scores in mongo");
    }
    disconnectMongoose();
  });
})

// Error reading the csv, bail
.on ("error", function(error){
  console.log("Error importing scores from CSV: " + error.message);
  disconnectMongoose();
});

function createAsyncMongooseUpdateFunction(facet_id, scores) {
  return function mongooseUpdateFacet(callback) {
    facet_model.findOneAndUpdate({id: facet_id}, {neighborhood_scores: scores}, {upsert: true}, function updateHandler(err) {
      if (err) {
        console.log("Unable to update neighborhood scores for facet. " + err);
        return callback(err);
      } else {
        return callback(null);
      }
    });
  }
}

function disconnectMongoose () {
  mongoose.disconnect();
}
