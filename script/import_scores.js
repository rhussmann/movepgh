var fs  = require("fs")
var csv = require("csv")

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
	
	console.log(JSON.stringify({facet_id: facet_id, scores: scores}))
});