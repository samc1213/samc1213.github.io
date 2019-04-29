var map = L.map('pickup').setView([41.881832, -87.623177], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getColor(d) {
    return d > .07 ? '#800026' :
           d > .06 ? '#BD0026' :
           d > .05 ? '#E31A1C' :
           d > .04 ? '#FC4E2A' :
           d > .03 ? '#FD8D3C' :
           d > .02 ? '#FEB24C' :
           d > .01 ? '#FED976' :
                     '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.avg),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML =  (props ?
    '<h3>total trips by pickup location</h3><b>$' + props.avg + ' </b><br>Tract ' + props.tract_name
    : 'Hover over a census tract');
};

info.addTo(map);

function getColor(d) {
    return d > 700 ? '#800026' :
           d > 600 ? '#BD0026' :
           d > 500 ? '#E31A1C' :
           d > 400 ? '#FC4E2A' :
           d > 300 ? '#FD8D3C' :
           d > 200 ? '#FEB24C' :
           d > 100 ? '#FED976' :
                     '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.avg),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var geojson;

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: highlightFeature
    });
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07],
        labels = [];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> $' +
            grades[i] + (grades[i + 1] ? '&ndash;$' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

let url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/trip_by_pickup.geojson';
fetch(url).then(r => {
	return r.json();
}).then(data => {
	geojson = L.geoJSON(data, {style: style, onEachFeature: onEachFeature}).addTo(map);
});


