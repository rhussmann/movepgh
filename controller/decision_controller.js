var facet_model = require("../model/facet_model")
var neighborhood_model = require("../model/neighborhood_model")


var DecisionController =  {
  getNeighborhoodsForRequest: function(req, resp) {
    if(req.query.facets==null || req.query.facets==undefined || req.query.facets=='') {
      return resp.send(400)
    }
    fids = req.query.facets.split(",")
    this.getNeighborhoodsForFacets(fids, function(results) {
      resp.send(results)
    })
  },
  getNeighborhoodsForFacets: function(fids, callback) {
    facet_model.find({}, function(err, facets) {
      facet_map = {}
      facets.forEach(function(facet) {
        facet_map[facet.id] = facet
      })
        
      scores = {}
      fids.forEach(function(fid, rank) {
        for(var hood in facet_map[fid].neighborhood_scores) {
          if(!facet_map[fid].neighborhood_scores.hasOwnProperty(hood)) {
            continue
          }
          if(scores[hood] === undefined) {
            scores[hood] = 0
          }
          val = (fids.length - rank) * facet_map[fid].neighborhood_scores[hood]
          scores[hood] = scores[hood] + val
        }
      })
        
      results = []
      max_score = 0
      for(var hood in scores) {
        if(!scores.hasOwnProperty(hood)) continue
        results.push({hood: hood, score: scores[hood]})
        if(scores[hood] > max_score) {
          max_score = scores[hood]
        }
      }
        
      results.sort(function(a,b) {return b.score-a.score});
        
      neighborhood_model.find({}, {_id : 0}, function(err, hoods) {
        hoods.forEach(function(hood) {
          results.forEach(function(result) {
            if(result.hood === hood.id) {
              result.hood_metadata = hood
              result.score = result.score / max_score
              result.facet_scores = {}
              facets.forEach(function(facet) {
                result.facet_scores[facet.id] = facet.neighborhood_scores[hood.id]
              })
            }
          })
        })
      
        callback(results)
      })
    })
  }
}


module.exports = DecisionController