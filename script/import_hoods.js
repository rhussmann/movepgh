var async = require("async")
var fs    = require("fs")
var csv   = require("csv")

// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var hood_model = require("../model/neighborhood_model");

// Connect to mongo
mongoose.connect(MONGO_URL);

var hood_update_tasks = [];

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Neighborhoods.csv"))

.on("record", function(row, index){
  if (index === 0) return
  var neighborhood = {}
  neighborhood.id = row[0]
  neighborhood.name = row[1]
  neighborhood.description = row[2]

  // Add an async task for upserting this facet
  hood_update_tasks.push(createAsyncMongooseUpdateFunction(neighborhood));
})

.on("end", function(count){
  console.log("Parsed " + count + " neighborhoods, attempting to update mongo...")
  async.parallel(hood_update_tasks, function(err, results) {
    if (err) {
      console.log("Error updating neighborhoods: " + err);
    } else {
      console.log("Successfully updated neighborhoods in mongo");
    }
    disconnectMongoose();
  });
})

.on("error", function() {
  console.log("Error importing neighborhoods");
  disconnectMongoose();
});

function createAsyncMongooseUpdateFunction(neighborhood) {
  return function mongooseUpdateFacet(callback) {
    hood_model.findOneAndUpdate({id: neighborhood.id}, neighborhood, {upsert: true}, function updateHandler(err) {
      if (err) {
        console.log("Unable to update neighborhood. " + err);
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
