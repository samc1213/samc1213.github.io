var dropoffMap = L.map('dropoff').setView([41.881832, -87.623177], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(dropoffMap);

var dropoffInfo = L.control();

dropoffInfo.onAdd = function (dropoffMap) {
  this._div = L.DomUtil.create('div', 'dropoffInfo');
  this.update();
  return this._div;
};

dropoffInfo.update = function (props) {
  this._div.innerHTML =  (props ?
    '<div class="map-container"><div class="map-title">Total Trips By Dropoff Location</div><div class="map-value">' + props.count.toLocaleString() + ' Trips </div><div class="map-subvalue">Tract ' + props.tract_name + '</div>'
    : '<div class="map-container"><div class="map-title">Total Trips By Dropoff Location</div><div class="map-subvalue">Hover over a census tract</div></div>');
};

dropoffInfo.addTo(dropoffMap);

var dropoffRanges = [0, 10, 100, 1000, 10000, 100000];

function getDropoffColor(d) {
    return d > dropoffRanges[5] ? '#E31A1C' :
           d > dropoffRanges[4] ? '#FC4E2A' :
           d > dropoffRanges[3] ? '#FD8D3C' :
           d > dropoffRanges[2] ? '#FEB24C' :
           d > dropoffRanges[1] ? '#FED976' :
                                 '#FFEDA0';
}

function dropoffStyle(feature) {
    return {
        fillColor: getDropoffColor(feature.properties.count),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var dropoffGeoJson;

function highlightDropoffFeature(e) {
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

    dropoffInfo.update(layer.feature.properties);
}

function resetDropoffHighlight(e) {
    dropoffGeoJson.resetStyle(e.target);
    dropoffInfo.update();
}

function onEachDropoffFeature(feature, layer) {
    layer.on({
        mouseover: highlightDropoffFeature,
        mouseout: resetDropoffHighlight,
        click: highlightDropoffFeature
    });
}

var dropoffLegend = L.control({position: 'bottomright'});

dropoffLegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'dropoffInfo legend');
    for (var i = 0; i < pickupRanges.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getDropoffColor(dropoffRanges[i] + 1) + '"></i>' +
            dropoffRanges[i].toLocaleString() + (dropoffRanges[i + 1] ? '&ndash;' + dropoffRanges[i + 1].toLocaleString() + '<br>' : '+');
    }

    return div;
};

dropoffLegend.addTo(dropoffMap);

var url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/trip_by_dropoff.geojson';
fetch(url).then(r => {
  return r.json();
}).then(data => {
  dropoffGeoJson = L.geoJSON(data, {style: dropoffStyle, onEachFeature: onEachDropoffFeature}).addTo(dropoffMap);
});


