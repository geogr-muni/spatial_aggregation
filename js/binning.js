var map;
var grid;
var gridGambling;
var gridCrime;

var extent = [[49.98, 15.7], [50.08, 15.85]];

var elementValue = (id, parse = false) => {
  const value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

var crimePoints = [];
var gamblingPoints = [];

console.log(crime);

document.addEventListener("DOMContentLoaded", function(event) {
  console.log("dom loaded");

  Object.keys(crime.properties.categories).map(crimeKey => {
    const category = crime.properties.categories[crimeKey];
    document
      .getElementById("category-filter")
      .insertAdjacentHTML(
        "beforeend",
        '<input type="checkbox" class="render-on-change crime-filter" name="crime" value="' +
          crimeKey +
          '" checked>' +
          category.label +
          "<br>"
      );
  });
  prepareData();

  // setting map
  map = L.map("map-content", { maxZoom: 15 });
  map.fitBounds(extent);

  var CartoDB_Positron = L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: "abcd",
      maxZoom: 19
    }
  );
  CartoDB_Positron.addTo(map);

  const selects = [].slice.call(
    document.getElementsByClassName("render-on-change"),
    0
  );
  selects.map(select => {
    if (select.addEventListener) {
      select.addEventListener("change", () => {
        if (
          vt(elementValue("select-time-from")) > elementValue("select-time-to")
        ) {
          document.getElementById("select-time-from").value = "00:00";
        }
        render();
      });
    }
  });

  render();
});

const prepareData = () => {
  crimePoints = crime.points.map(point => {
    return {
      marker: L.circleMarker(point["c"], circleStyle(point, "#b10026", 1.2)),
      properties: point
    };
  });
  gamblingPoints = gambling.map(point => {
    return {
      marker: L.circleMarker(point["c"], circleStyle(point, "green", 4)),
      properties: point
    };
  });
};

const parseTextAreaValue = textAreaId => {
  const textAreaValue = document.getElementById(textAreaId).value;
  const textAreaObjectValue = "{" + textAreaValue + "}";

  try {
    return JSON.parse(textAreaObjectValue);
  } catch (err) {
    console.log(err);
    alert("bad input " + textAreaId + ", " + err);
    return {};
  }
};

const circleStyle = (props, color, radius) => {
  return {
    //fillColor: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"][
    //  props.cid
    //],
    fillColor: color,
    color: "black",
    weight: 0.5,
    fillOpacity: 1,
    radius: radius
  };
};

var render = () => {
  const checkedCategories = [];
  Array.prototype.forEach.call(
    document.getElementsByClassName("crime-filter"),
    el => {
      if (el.checked) {
        checkedCategories.push(el.value);
      }
    }
  );

  console.log("rendering");
  if (map.hasLayer(gridCrime)) {
    gridCrime.unregister();
    map.removeLayer(gridCrime);
    gridGambling.unregister();
    map.removeLayer(gridGambling);
  }

  gridOptions = {
    rules: {
      cells: {
        fillColor: {
          method: "count",
          scale: "quantile",
          range: [
            "#ffffcc",
            "#ffeda0",
            "#fed976",
            "#feb24c",
            "#fd8d3c",
            "#fc4e2a",
            "#e31a1c"
          ]
        },
        color: "white",
        fillOpacity: 1,
        weight: 1.5
      },
      markers: {
        color: "white",
        weight: 1.5,
        fillOpacity: 1,
        fillColor: "black",
        radius: {
          method: "count",
          attribute: "",
          scale: "continuous",
          range: [3, elementValue("select-zone-size", true) / 500]
        }
      }
    },
    zoomShowElements: false,
    zoomHideGrid: 20,
    zoneSize: elementValue("select-zone-size", true),
    gridMode: elementValue("select-grid-mode"),
    showMarkers: false,
    showCells: false,
    showEmptyCells: true, //elementValue("select-show-empty-cells") === "1",
    gridOrigin: { lat: extent[0][0], lng: extent[0][1] },
    gridEnd: { lat: extent[1][0], lng: extent[1][1] },
    emptyCellOptions: {
      color: "white",
      fillColor: "white"
    }
  };

  // define RegularGridCluster instance
  gridCrime = L.regularGridCluster(
    Object.assign({}, gridOptions, {
      zoomShowElements:
        elementValue("select-show-points-crime") === "1" ? 5 : 20,
      showCells: elementValue("select-show-cells") === "1"
    })
  );

  gridGambling = L.regularGridCluster(
    Object.assign({}, gridOptions, {
      zoomShowElements:
        elementValue("select-show-points-gambling") === "1" ? 5 : 20,
      showMarkers: elementValue("select-show-markers") === "1"
    })
  );

  gridCrime.addLayers(
    crimePoints.filter(function(point) {
      return (
        inTimeInterval(
          point.properties.t,
          elementValue("select-time-from"),
          elementValue("select-time-to")
        ) && checkedCategories.indexOf(point.properties.cid) > -1
      );
    })
  );
  gridCrime.addTo(map);

  gridGambling.addLayers(gamblingPoints);
  gridGambling.addTo(map);
};

/* processing time */
var h = function(t) {
  return parseInt(t.split(":")[0], 10);
};
var m = function(t) {
  return parseInt(t.split(":")[1], 10);
};
var vt = function(t) {
  return h(t) + m(t) / 60;
};

var inTimeInterval = function(value, from, to) {
  return vt(value) > vt(from) && vt(value) < vt(to);
};
