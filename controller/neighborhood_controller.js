var neighborhood_model = require("../model/neighborhood_model")

NeighborHoodController = {
  sendHello: function (req,res) {
    this.getNeighborHood(req.query.id, function(err, hood) {
      if (err) {
        return res.send(err);
      }
      
      return res.render('hood', {title: hood.name, hood: hood});
    })
  },

  getNeighborHood: function( neighborhood_id, callback ) {
    neighborhood_model.findOne({id: neighborhood_id}, function (err, hood) {
      if (err) {
        console.log("Couldn't find the specified neighborhood");
        callback(err);
      }

      callback(null, hood);
    })
  }
}

module.exports= NeighborHoodController