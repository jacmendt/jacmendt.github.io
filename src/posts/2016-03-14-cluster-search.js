/**
 * Initialize the map for showing the need of clustering
 */
function initMapToMuchPoints() {
    // create map
    var map = L.map('map-to-much-points').setView([50.958, 10.833], 6);

    // add base layer to map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add markers to map
    $.ajax({
        'url':'/assets/data/sensors_germany_2000.json'
    }).done(function(data) {
        var features = data.hits.hits;

        for (var i = 0; i < features.length; i++) {
            var geometry = features[i]._source.geometry;
            L.marker([geometry.lat, geometry.lon]).addTo(map)
        };
    });
};

/**
 * Initialize cluster map
 */
function initMapClusterPoints() {
    // create map
    var map = L.map('map-cluster-points').setView([50.958, 10.833], 6);

    // add base layer to map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add marker cluster to map
    var markers = L.markerClusterGroup();
    $.ajax({
        'url':'/assets/data/sensors_germany_2000.json'
    }).done(function(data) {
        var features = data.hits.hits,
            clusterMarker = [];

        for (var i = 0; i < features.length; i++) {
            var geometry = features[i]._source.geometry;
            clusterMarker.push(L.marker([geometry.lat, geometry.lon]));
        };
        markers.addLayers(clusterMarker);
        map.addLayer(markers);
    });
};

initMapToMuchPoints();
initMapClusterPoints();


