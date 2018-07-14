var csv = require("csv-parser");
var fs = require("fs");
var turf = require("turf");
const Json2csvParser = require("json2csv").Parser;

const coded = [];

const categories = [];
let di = 0;

fs.createReadStream("./data/crime.csv")
  .pipe(csv())
  .on("data", data => {
    di = di + 1;
    if (data["x"]) {
      const category = data["category"];

      let cIndex = categories.indexOf(category);
      if (cIndex < 0) {
        categories.push(category);
        cIndex = categories.length - 1;
      }

      const point = {
        c: [parseCoordinate(data["y"]), parseCoordinate(data["x"])],
        id: di,
        cid: cIndex,
        d: data["date"].split(".")[0] + "." + data["date"].split(".")[1],
        t: data["time"].split(":")[0] + ":" + data["time"].split(":")[1]
      };

      coded.push(point);
    }
  })
  .on("end", () => {
    console.log(categories);
    var collection = {
      points: coded,
      properties: {
        categories: categories
      }
    };
    fs.writeFile(
      "./data/data.js",
      "var data = " + JSON.stringify(collection),
      () => {
        console.log("data.js output saved");
      }
    );
  });

var parseCoordinate = function(coord) {
  return parseFloat(parseFloat(coord).toPrecision(6));
};
