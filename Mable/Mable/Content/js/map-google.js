var sensor_markers = [];
var toilet_markers = [];
var park_markers = [];
var wifi_markers = [];
var quiet_markers = [];

var map;

var directionsDisplay;

var markerCluster_sensor;
var markerCluster_wifi;

var infowindow_parking;
var infowindow_toilet;
var infowindow_wifi
var infowindow_quiet;

var locInfoWindow;

var current_location = [];
var currentLatLng;

var icon5;

var distance_toilet = [];
var cloest_toilet = -1;



function initMap() {
    var centre = { lat: -37.8136, lng: 144.9631 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: centre
    });

    /**
     * Begin Search function inside the map
     */
    // Create a search box and link it to the UI element
    var input = document.getElementById('input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    locInfoWindow = new google.maps.InfoWindow({ map: map });

    

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            current_location.push(position.coords.latitude);
            current_location.push(position.coords.longitude);
            currentLatLng = new google.maps.LatLng(current_location[0], current_location[1]);
            //locInfoWindow.setPosition(pos);
            //locInfoWindow.setContent('Your current location');
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, locInfoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, locInfoWindow, map.getCenter());
    }

    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    })

    var search_markers = [];
    searchBox.addListener('places_changed', function () {
        for (var i = 0; i < search_markers.length; i++) {
            search_markers[i].setVisible(false);
        }
        search_markers = [];

        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }

        //For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place
            search_markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            }
            else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
    /**
     * End Search function inside the map
     */


    /**
     * Start on-street parking markers
     */
    var icon1 = {
        url: "../Content/images/on-street-parking.png", // url
        scaledSize: new google.maps.Size(20, 37.57), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    // Create marker for showing real time on-street parking status
    $.getJSON("https://data.melbourne.vic.gov.au/resource/dtpv-d4pf.json",
        function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].status == "Present") {
                    continue;
                }
                var coor = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lon) };

                var sensor_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: false,
                    icon: icon1,
                    title: "Click for details"
                });

                var content = '<div>' + 'Parking status: ' + data[i].status + '</div>' +
                    '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                    + current_location[0] + ',' + current_location[1]
                    + '&destination=' + data[i].lat + ',' + data[i].lon + '">Navigate Me</a>' + '</div>';

                infowindow_parking = new google.maps.InfoWindow();
                sensor_marker.content = content;
                google.maps.event.addListener(sensor_marker, 'click', function () {
                    infowindow_parking.setContent(this.content);
                    infowindow_parking.open(this.getMap(), this);
                })
                sensor_markers.push(sensor_marker);
            }

        });
    /**
     * End on-street parking markers
     */


    /**
     * Start toilet markers
     */
    var icon2 = {
        url: "../Content/images/public-toilets.png", // url
        scaledSize: new google.maps.Size(20, 37.57), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    // Create marker for showing toilet accessibility
    $.ajax({
        cache: false,
        url: "https://data.melbourne.vic.gov.au/resource/dsec-5y6t.json",
        dataType: "json",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].wheelchair == "U" || data[i].wheelchair == "no") {
                    continue;
                }
                var coor = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lon) };
                var latlng = new google.maps.LatLng(parseFloat(data[i].lat), parseFloat(data[i].lon));

                var toilet_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: false,
                    icon: icon2,
                    title: "Click for details"
                });
                var content = '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                    + current_location[0] + ',' + current_location[1]
                    + '&destination=' + data[i].lat + ',' + data[i].lon + '">Navigate Me</a>' + '</div>';
                infowindow_toilet = new google.maps.InfoWindow();
                toilet_marker.content = content;
                google.maps.event.addListener(toilet_marker, 'click', function () {
                    infowindow_toilet.setContent(this.content);
                    infowindow_toilet.open(this.getMap(), this);
                });
                toilet_markers.push(toilet_marker);

                while (true) {
                    if (typeof currentLatLng != 'undefined') {
                        break;
                    }
                }

                var dist = google.maps.geometry.spherical.computeDistanceBetween(currentLatLng, latlng);
                distance_toilet.push(dist);
                if (cloest_toilet == -1 || dist < distance_toilet[cloest_toilet]) {
                    cloest_toilet = distance_toilet.indexOf(dist);
                }
            }
            //alert(distance_toilet[cloest_toilet]/1000 + 'km');
            
        }

    });

    /**
     * Off street parking markers
     */
    var icon3 = {
        url: "../Content/images/off-street-parking.png", // url
        scaledSize: new google.maps.Size(20, 37.57), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    // Create marker for showing parking type and parking spaces
    $.getJSON("https://data.melbourne.vic.gov.au/resource/9xmh-yeh2.json",
        function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].parking_type == "Residential") {
                    continue;
                }
                if (data[i].parking_type == "Commercial") {
                    data[i].parking_type = "Pay & Park";
                }
                if (data[i].parking_type == "Private") {
                    data[i].parking_type = "Parking for staff,visitors or customers";
                }
                var coor = { lat: parseFloat(data[i].y_coordinate), lng: parseFloat(data[i].x_coordinate_2) };
                var park_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: false,
                    icon: icon3,
                    title: "Click for details"
                });
                var content = '<div>' + 'Parking Type: ' + data[i].parking_type + '</div>' +
                    '<div>' + 'Parking Spaces: ' + data[i].parking_spaces + '</div>' +
                    '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                    + current_location[0] + ',' + current_location[1]
                    + '&destination=' + data[i].y_coordinate + ',' + data[i].x_coordinate_2 + '">Navigate Me</a>' + '</div>';
                park_marker.content = content;
                infowindow_parking = new google.maps.InfoWindow();
                google.maps.event.addListener(park_marker, 'click', function () {
                    infowindow_parking.setContent(this.content);
                    infowindow_parking.open(this.getMap(), this);
                })
                park_markers.push(park_marker);
            }
        });
    /**
    * Quite Place icon
    */
    icon5 = {
        url: "../Content/images/marker3.png", // url
        scaledSize: new google.maps.Size(20, 37.57), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
    /**
     * Wifi Access Points
     */

    var icon4 = {
        url: "../Content/images/marker2.png", // url
        scaledSize: new google.maps.Size(20, 37.57), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
    var wifi_data = {
        resource_id: '1922597e-c989-4ebd-bec9-afcc284e5b2c', // the resource id
        limit: 999, // if limit is not set, max 100 results returned by default
        q: 'MEL' // query for 'MEL'
    };
    $.ajax({
        cache: false,
        url: 'https://www.data.vic.gov.au/data/api/action/datastore_search',
        data: wifi_data,
        dataType: 'jsonp',
        success: function (data) {
            var records = data.result.records;
            for (var i = 0; i < records.length; i++) {
                var coor = { lat: parseFloat(records[i].Latitude), lng: parseFloat(records[i].Longitude) };
                var wifi_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: false,
                    icon: icon4,
                    title: "Click for details"
                });
                var content = '<div>' + records[i]['Long Name'] + '</div>' +
                    '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                    + current_location[0] + ',' + current_location[1]
                    + '&destination=' + records[i].Latitude + ',' + records[i].Longitude + '">Navigate Me</a>' + '</div>';
                wifi_marker.content = content;
                infowindow_wifi = new google.maps.InfoWindow();
                google.maps.event.addListener(wifi_marker, 'click', function () {
                    infowindow_wifi.setContent(this.content);
                    infowindow_wifi.open(this.getMap(), this);
                })

                wifi_markers.push(wifi_marker);
            }
        }
    });

    showQuietPlaces();
}

// Filter for real-time on-street parking
function showSensor(sensor) {
    if (document.getElementById("toilet").checked) {
        document.getElementById("toilet").checked = false;
        unshowToilet();
    }
    if (document.getElementById("park").checked) {
        document.getElementById("park").checked = false;
        unshowPark();
    }
    if (document.getElementById("wifi").checked) {
        document.getElementById("wifi").checked = false;
        unshowWifi();
    }
    if (document.getElementById("quite").checked) {
        document.getElementById("quite").checked = false;
        unshowQuiet();
    }

    if (document.getElementById("sensor").checked == true) {
        for (var i = 0; i < sensor_markers.length; i++) {
            sensor_markers[i].setVisible(true);
        }
        markerCluster_sensor = new MarkerClusterer(map, sensor_markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        });

        //document.getElementById("").style.visibility = "hidden";
        //document.getElementById("").style.visibility = "hidden";
        //document.getElementById("").style.visibility = "hidden";
        //document.getElementById("").style.visibility = "hidden";
        //document.getElementById("").style.visibility = "visible";
    }
    else {
        unshowSensor();
    }
}

function unshowSensor() {
    for (var i = 0; i < sensor_markers.length; i++) {
        sensor_markers[i].setVisible(false);
    }
    markerCluster_sensor.clearMarkers();
    infowindow_parking.close();
}

// Filter for public toilet
function showToilet(toilet) {
    if (document.getElementById("sensor").checked) {
        document.getElementById("sensor").checked = false;
        unshowSensor();
    }
    if (document.getElementById("park").checked) {
        document.getElementById("park").checked = false;
        unshowPark();
    }
    if (document.getElementById("wifi").checked) {
        document.getElementById("wifi").checked = false;
        unshowWifi();
    }
    if (document.getElementById("quite").checked) {
        document.getElementById("quite").checked = false;
        unshowQuiet();
    }
    if (document.getElementById("toilet").checked == true) {
        for (var i = 0; i < toilet_markers.length; i++) {
            toilet_markers[i].setVisible(true);
        }
        console.log("toilet_markers.length: " + toilet_markers.length);
        console.log("distance_toilet.length: " + distance_toilet.length);
        console.log("cloest_toilet: " + cloest_toilet);
        var request = {
            origin: currentLatLng,
            destination: toilet_markers[cloest_toilet].position,
            travelMode: 'DRIVING'
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {
                directionsDisplay = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: true
                });
                directionsDisplay.setDirections(result);
            }
        })
    }
    else {
        unshowToilet();
    }
}

function unshowToilet() {
    for (var i = 0; i < toilet_markers.length; i++) {
        toilet_markers[i].setVisible(false);
    }
    infowindow_toilet.close();

    if (typeof directionsDisplay != 'undefined') {
        directionsDisplay.setMap(null);
    }
    
}

// Filter for parking space
function showPark(park) {
    if (document.getElementById("sensor").checked) {
        document.getElementById("sensor").checked = false;
        unshowSensor();

    }
    if (document.getElementById("toilet").checked) {
        document.getElementById("toilet").checked = false;
        unshowToilet();
    }
    if (document.getElementById("wifi").checked) {
        document.getElementById("wifi").checked = false;
        unshowWifi();
    }
    if (document.getElementById("quite").checked) {
        document.getElementById("quite").checked = false;
        unshowQuiet();
    }
    if (document.getElementById("park").checked == true) {
        for (var i = 0; i < park_markers.length; i++) {
            park_markers[i].setVisible(true);
        }
    }
    else {
        unshowPark();
    }
}

function unshowPark() {
    for (var i = 0; i < park_markers.length; i++) {
        park_markers[i].setVisible(false);
    }
    infowindow_parking.close();
}

function showWifi(wifi) {
    if (document.getElementById("sensor").checked) {
        document.getElementById("sensor").checked = false;
        unshowSensor();

    }
    if (document.getElementById("toilet").checked) {
        document.getElementById("toilet").checked = false;
        unshowToilet();
    }
    if (document.getElementById("park").checked) {
        document.getElementById("park").checked = false;
        unshowPark();
    }
    if (document.getElementById("quite").checked) {
        document.getElementById("quite").checked = false;
        unshowQuiet();
    }
    if (document.getElementById("wifi").checked == true) {
        for (var i = 0; i < wifi_markers.length; i++) {
            wifi_markers[i].setVisible(true);
        }
        markerCluster_wifi = new MarkerClusterer(map, wifi_markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        });
    }
    else {
        unshowWifi();
    }
}

function unshowWifi() {
    for (var i = 0; i < wifi_markers.length; i++) {
        wifi_markers[i].setVisible(false);
    }
    markerCluster_wifi.clearMarkers();
    infowindow_wifi.close();
}

function showQuiet(quite) {
    if (document.getElementById("sensor").checked) {
        document.getElementById("sensor").checked = false;
        unshowSensor();

    }
    if (document.getElementById("toilet").checked) {
        document.getElementById("toilet").checked = false;
        unshowToilet();
    }
    if (document.getElementById("park").checked) {
        document.getElementById("park").checked = false;
        unshowPark();
    }
    if (document.getElementById("wifi").checked) {
        document.getElementById("wifi").checked = false;
        unshowWifi();
    }
    if (document.getElementById("quite").checked == true) {
        for (var i = 0; i < quiet_markers.length; i++) {
            quiet_markers[i].setVisible(true);
        }
    }
    else {
        unshowQuiet();
    }
}

function unshowQuiet() {
    for (var i = 0; i < quiet_markers.length; i++) {
        quiet_markers[i].setVisible(false);
    }
    infowindow_quiet.close();
}
//Filter function
//function applyFilter() {
//    showSensor(sensor);
//    showToilet(toilet);
//    showPark(park);
//}

function handleLocationError(browserHasGeolocation, infowindow, pos) {
    //infowindow.setPosition(pos);
    //infowindow.setContent(browserHasGeolocation ? 'Error:You need to enable location' : 'Error:Your browser doesn\'t support geolocation.');
    alert("We can't get your current location. Please make sure you enable location in browser.");
}


/**
 * Get the quiet places using Google Nearby Search
 */
function showQuietPlaces() {
    var service = new google.maps.places.PlacesService(map);
    var location = new google.maps.LatLng(-37.8136, 144.9631);
    service.nearbySearch({
        location: location,
        radius: '1000',
        types: ['library', 'park']
    }, callback);
}

/**
 * Callback function to do with the data return from Google Nearby Search
 * Create the markers
 */
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var quiet_marker = new google.maps.Marker({
                position: results[i].geometry.location,
                map: map,
                visible: false,
                icon: icon5,
                title: "Click for details"
            });
            var content = '<div>' + results[i].name + '</div>' +
                '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                + current_location[0] + ',' + current_location[1]
                + '&destination=' + results[i].geometry.location.lat() + ',' + results[i].geometry.location.lng() + '">Navigate Me</a>' + '</div>';
            quiet_marker.content = content;
            infowindow_quiet = new google.maps.InfoWindow();
            google.maps.event.addListener(quiet_marker, 'click', function () {
                infowindow_quiet.setContent(this.content);
                infowindow_quiet.open(this.getMap(), this);
            })

            quiet_markers.push(quiet_marker);
        }
    }
}

function requestFullscreen() {
    $('#map div.gm-style button[title="Toggle fullscreen view"]').trigger('click');
}

function centerTocurrent() {
    map.setCenter(currentLatLng);
    var currentLoc_marker = new google.maps.Marker({
        position: currentLatLng,
        map: map,
        visible: true,
        title: "Your current position"
    });
}