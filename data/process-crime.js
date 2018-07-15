var csv = require("csv-parser");
var fs = require("fs");
var turf = require("turf");
const Json2csvParser = require("json2csv").Parser;

const coded = [];

const categories = {
  0: {
    values: [
      "§ 47 proti verejnému porádku",
      "§ 48 proti verejnému porádku",
      "§ 47b proti verejnému porádku",
      "§ 47a proti verejnému porádku"
    ],
    label: "against public order"
  },

  1: {
    values: ["§ 50 proti majetku", "proti majetku (hlava V)"],
    label: "against property"
  },
  2: {
    values: ["§ 49 proti obcanskému soužití"],
    label: "against peaceful co-existence"
  },
  3: {
    values: ["proti porádku ve vecech verejných (hlava X)"],
    label: "against public administration"
  },
  4: {
    values: ["proti životu a zdraví (hlava I)"],
    label: "against the life and health"
  },
  5: {
    values: ["§ 30 na úseku ochrany pred alkoholismem a jinými toxikomaniemi"],
    label: "alcohol and toxico"
  }
};
let di = 0;

fs.createReadStream("./data/crime.csv")
  .pipe(csv())
  .on("data", data => {
    di = di + 1;
    if (data["x"]) {
      const categoryValue = data["category"];

      cIndex = Object.keys(categories).find(categoryKey => {
        let c = categories[categoryKey];
        return c.values.indexOf(categoryValue) > -1;
      });
      console.log(cIndex);

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
      "./data/crime.js",
      "var crime = " + JSON.stringify(collection),
      () => {
        console.log("crime.js output saved");
      }
    );
  });

var parseCoordinate = function(coord) {
  return parseFloat(parseFloat(coord).toPrecision(6));
};
