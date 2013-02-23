var fs  = require("fs")
var csv = require("csv")

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Neighborhoods.csv"))
.transform( function(row, index){
	if (index === 0) return
	var neighborhood = {}
	neighborhood.id = row[0]
	neighborhood.name = row[1]
	neighborhood.description = row[2]
	console.log(JSON.stringify(neighborhood))
});

