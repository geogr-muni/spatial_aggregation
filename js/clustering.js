var map;
var grid;
var gridGambling;
var clusters;

var extent = [[49.98, 15.7], [50.08, 15.85]];

var elementValue = (id, parse = false) => {
  const value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

var crimePoints = [];
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
    return L.circleMarker(
      point["c"],
      Object.assign({}, point, circleStyle(point, "#b10026", 5))
    ).bindPopup(
      "<div><h4>crime id: " +
        point.id +
        "</h4>" +
        "<div class='tooltip-line'>date: " +
        point.d +
        ".</div>" +
        "<div class='tooltip-line'>time: " +
        point.t +
        "</div>" +
        "<div class='tooltip-line'>category: " +
        crime.properties.categories[point.cid].label +
        "</div></div>"
    );
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
  console.log("rendering");

  // cleaning
  if (map.hasLayer(clusters)) {
    clusters.clearLayers();
  }

  const checkedCategories = [];
  Array.prototype.forEach.call(
    document.getElementsByClassName("crime-filter"),
    el => {
      if (el.checked) {
        checkedCategories.push(el.value);
      }
    }
  );

  clusters = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      var childCount = cluster.getChildCount();

      return new L.DivIcon({
        html: "<div><span>" + childCount + "</span></div>",
        className: "marker-cluster",
        iconSize: new L.Point(40, 40)
      });
    },
    spiderLegPolylineOptions: { weight: 0 },
    clockHelpingCircleOptions: {
      weight: 0.7,
      opacity: 1,
      color: "black",
      fillOpacity: 0,
      dashArray: "10 5"
    },

    maxClusterRadius: elementValue("select-zone-size", true),

    elementsPlacementStrategy: "clock",
    helpingCircles: true,

    spiderfyDistanceSurplus: 25,
    spiderfyDistanceMultiplier: 1,

    elementsMultiplier: 1.4,
    firstCircleElements: 8
  });

  console.log(crimePoints);

  clusters.addLayers(
    crimePoints.filter(function(point) {
      return (
        inTimeInterval(
          point.options.t,
          elementValue("select-time-from"),
          elementValue("select-time-to")
        ) && checkedCategories.indexOf(point.options.cid) > -1
      );
    })
  );
  clusters.addTo(map);
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
