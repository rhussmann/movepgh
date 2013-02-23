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

var facet_update_tasks = [];

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Facets.csv"))

// When parsing a record, create an async task to update the record
.on("record", function(row, index){
  if (index === 0) return
  var facet = {}
  facet.id = row[0]
  facet.name = row[1]
  facet.description = row[2]
  facet.category = row[3]

  // Add an async task for upserting this facet
  facet_update_tasks.push(createAsyncMongooseUpdateFunction(facet));
})

// Finished parsing the CSV, fire off the update tasks
.on("end", function executeUpdates(count) {
  console.log("Parsed " + count + " facets, attempting to update mongo...")
  async.parallel(facet_update_tasks, function(err, results) {
    if (err) {
      console.log("Error updating facets: " + err);
    } else {
      console.log("Successfully updated facets in mongo");
    }
    disconnectMongoose();
  });
})

// Error parsing CSV, bail
.on("error", disconnectMongoose);

function createAsyncMongooseUpdateFunction(facet) {
  return function mongooseUpdateFacet(callback) {
    facet_model.findOneAndUpdate({id: facet.id}, facet, {upsert: true}, function updateHandler(err) {
      if (err) {
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