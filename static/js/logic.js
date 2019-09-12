function markerSize(feature) {
    return Math.sqrt(Math.abs(feature.properties.mag))*10;
}
// function to assign colors
var colors=["green","lightgreen","yellow","orange","gold","red"];
function choosecolor(feature){
    var mag= feature.properties.mag;
    if (mag>=5) {return colors[5]}
    else if (mag>4) {return colors[4]}
    else if (mag>3) {return colors[3]}
    else if (mag>2) {return colors[2]}
    else if (mag>1) {return colors[1]}
    else {return colors[0]} 
 } 

// Base Layers

var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken:"pk.eyJ1IjoibXJ1bm1heWVlayIsImEiOiJjanhobGp2dWIxMXhkM3RsaTdzZHVoYTlsIn0.o17Oj6y-xDk8C5BVs68uxg",
});
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken:"pk.eyJ1IjoibXJ1bm1heWVlayIsImEiOiJjanhobGp2dWIxMXhkM3RsaTdzZHVoYTlsIn0.o17Oj6y-xDk8C5BVs68uxg",
});
var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken:"pk.eyJ1IjoibXJ1bm1heWVlayIsImEiOiJjanhobGp2dWIxMXhkM3RsaTdzZHVoYTlsIn0.o17Oj6y-xDk8C5BVs68uxg",
});

//map object

var map=L.map("map",{
    center:[37.09,-95.71],
    zoom:3,
    layers:[satelliteMap,outdoorsMap,lightMap]
 });

var baseMaps={
    Satellite: satelliteMap,
    Grayscale: lightMap,
    Outdoors : outdoorsMap
};
lightMap.addTo(map);

var APILink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesAPILINK="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// var geoJson;

//get request on both urls

d3.json(APILink, function (data) {
    d3.json(platesAPILINK,function(platesdata){
        console.log(data.features);
        console.log(platesdata);
    
    //Earthquake layer
    var earthquakes=L.geoJson(data,{
       
        pointToLayer: function(feature,latlng){
            var geojsonMarkers={
               
                   radius:8,
                   stroke: false,
                   radius:markerSize(feature),
                   fillColor:choosecolor(feature),
                   fillOpacity:0.75,
                   weight:5,
                   opacity: .5,
                   fillOpacity: .5
               };
               return L.circleMarker(latlng,geojsonMarkers)
        },
        //pop-ups for makers
        onEachFeature: function(feature,layer){
            return layer.bindPopup(`<strong>Place:</strong>${feature.properties.place}
            <br><strong>Magnitude:</strong>${feature.properties.mag}`)
        }
}).addTo(map);

//Tectonic plates layer
var platestyle={
    color:"white",
    weight:2,
    opacity:1,
    fillOpacity:0
};
var plates=L.geoJson(platesdata,{
    style:platestyle
});

//Overlay object
var overlayMaps={
    faultlines:plates,
    Earthquakes:earthquakes
};

//Layer control to the map
L.control.layers(baseMaps,overlayMaps).addTo(map);

var legend=L.control({position: 'bottomright'});
legend.onAdd = function() {
    var div=L.DomUtil.create("div","info legend");
        var limits=["0-1","1-2","2-3","3-4","4-5","5+"];
        var labelcolor=[];
        var labeltext=[];

// min and max
limits.forEach(function(limit,index){
    labelcolor.push(`<li style="background-color: ${colors[index]};list-style-type:none;"><span class="legend-label">${limits[index]}</span></li>`);
    labeltext.push(`<span class="legend-label">${limits[index]}</span>`);
});

var labellayout="<ul>" + labelcolor.join("") + "</ul>";
//var labeltextstyle=`<div id="labels-text">${labeltext.join("<br>")}</div>`;
var legendInfo = "<h4>Earthquake<br>Magnitude</h4>" +
          "<div class=\"labels\">" + labellayout //+ labeltextstyle
          "</div>";
        div.innerHTML = legendInfo;
  
        return div;
      }; 
      legend.addTo(map);  
    
    }) 
});


