var pickupMap = L.map('pickup').setView([41.881832, -87.623177], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(pickupMap);

var pickupInfo = L.control();

pickupInfo.onAdd = function (pickupMap) {
  this._div = L.DomUtil.create('div', 'pickupInfo');
  this.update();
  return this._div;
};

pickupInfo.update = function (props) {
  this._div.innerHTML =  (props ?
    '<div class="map-container"><div class="map-title">Total Trips By Pickup Location</div><div class="map-value">' + props.count.toLocaleString() + ' Trips </div><div class="map-subvalue">Tract ' + props.tract_name + '</div>'
    : '<div class="map-container"><div class="map-title">Total Trips By Pickup Location</div><div class="map-subvalue">Hover over a census tract</div></div>');
};

pickupInfo.addTo(pickupMap);

var pickupRanges = [0, 10, 100, 1000, 10000, 100000];

function getPickupColor(d) {
    return d > pickupRanges[5] ? '#E31A1C' :
           d > pickupRanges[4] ? '#FC4E2A' :
           d > pickupRanges[3] ? '#FD8D3C' :
           d > pickupRanges[2] ? '#FEB24C' :
           d > pickupRanges[1] ? '#FED976' :
                                 '#FFEDA0';
}

function pickupStyle(feature) {
    return {
        fillColor: getPickupColor(feature.properties.count),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var pickupGeoJson;

function highlightPickupFeature(e) {
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

    pickupInfo.update(layer.feature.properties);
}

function resetPickupHighlight(e) {
    pickupGeoJson.resetStyle(e.target);
    pickupInfo.update();
}

function onEachPickupFeature(feature, layer) {
    layer.on({
        mouseover: highlightPickupFeature,
        mouseout: resetPickupHighlight,
        click: highlightPickupFeature
    });
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'pickupInfo legend');
    for (var i = 0; i < pickupRanges.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getPickupColor(pickupRanges[i] + 1) + '"></i>' +
            pickupRanges[i].toLocaleString() + (pickupRanges[i + 1] ? '&ndash;' + pickupRanges[i + 1].toLocaleString() + '<br>' : '+');
    }

    return div;
};

legend.addTo(pickupMap);

var url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/trip_by_pickup.geojson';
fetch(url).then(r => {
	return r.json();
}).then(data => {
  pickupGeoJson = L.geoJSON(data, {style: pickupStyle, onEachFeature: onEachPickupFeature}).addTo(pickupMap);
});


