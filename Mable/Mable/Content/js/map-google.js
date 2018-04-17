var sensor_markers = [];
var toilet_markers = [];
var park_markers = [];
var wifi_markers = [];
var quiet_markers = [];

var map;

var markerCluster1;

var infowindow_parking;
var infowindow_toilet;
var infowindow_wifi
var infowindow_quiet;

var current_location = [];


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

    var locInfoWindow = new google.maps.InfoWindow({ map: map });
    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            current_location.push(position.coords.latitude);
            current_location.push(position.coords.longitude);
            locInfoWindow.setPosition(pos);
            locInfoWindow.setContent('Your current location');
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
    $.getJSON("https://data.melbourne.vic.gov.au/resource/dsec-5y6t.json",
        function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].wheelchair == "U") {
                    continue;
                }
                var coor = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lon) };
                
                var toilet_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: false,
                    icon: icon2,
                    title: "Click for details"
                });
                var content = '<div>' + 'Wheelchair Accessible: ' + data[i].wheelchair +
                    '</div>' + '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                    + current_location[0] + ',' + current_location[1]
                    + '&destination=' + data[i].lat + ',' + data[i].lon + '">Navigate Me</a>' + '</div>';;
                infowindow_toilet = new google.maps.InfoWindow();
                toilet_marker.content = content;
                google.maps.event.addListener(toilet_marker, 'click', function () {
                    infowindow_toilet.setContent(this.content);
                    infowindow_toilet.open(this.getMap(), this);
                })
                toilet_markers.push(toilet_marker);
            }
        });
    /** 
     * End toilet markers
     * /

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
     * Wifi Access Points
     */
    var wifi_data = {
        resource_id: '1922597e-c989-4ebd-bec9-afcc284e5b2c', // the resource id
        limit: 999, // if limit is not set, max 100 results returned by default
        q: 'MEL' // query for 'MEL'
    };
    $.ajax({
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
                    icon: icon3,
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

    //color the steepness of 0%-1% green---> totally accessible 
    //color the steepness of 1%-6% yellow ------->manageable steepness
    //color the steepness >6% --------> uncomfortable and challenging steepness

    //Status ---> Applied, Approved and Under Construction, and Complete.


    map.data.loadGeoJson('https://data.melbourne.vic.gov.au/api/geospatial/rpt3-2axt?method=export&format=GeoJSON');
  
    map.data.loadGeoJson(
        'https://data.melbourne.vic.gov.au/api/geospatial/def8-4wbt?method=export&format=GeoJSON');

    map.data.setStyle(function (feature) {
        var grade = feature.getProperty('gradepc');
        var status = feature.getProperty('status');
        if (grade > 0 && grade < 1) {
            return {
                fillColor: 'green',
                strokeWeight: 1
            };
        } else if (grade > 1 && grade < 6) {
            return {
                fillColor: 'yellow',
                strokeWeight: 1
            };
        } else if (grade > 6) {
            return {
                fillColor: 'red',
                strokeWeight: 1
            };
        }

        if (status == 'APPLIED') {
            return {
                fillColor: 'blue',
                strokeWeight: 1
            };
        } else if (status == 'APPROVED') {
            return {
                fillColor: 'orange',
                strokeWeight: 1
            };
        } else if (status == 'COMPLETED') {
            return {
                fillColor: 'black',
                strokeWeight: 1
            };
        } else {
            return {
                fillColor: 'purple',
                strokeWeight: 1
            };
        }
    });
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

    if (document.getElementById("sensor").checked == true) {
        for (var i = 0; i < sensor_markers.length; i++) {
            sensor_markers[i].setVisible(true);
        }
        markerCluster1 = new MarkerClusterer(map, sensor_markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        });
    }
    else {
        unshowSensor();
    }
}

function unshowSensor() {
    for (var i = 0; i < sensor_markers.length; i++) {
        sensor_markers[i].setVisible(false);
    }
    markerCluster1.clearMarkers();
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

    if (document.getElementById("toilet").checked == true) {
        for (var i = 0; i < toilet_markers.length; i++) {
            toilet_markers[i].setVisible(true);
        }
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
    if (document.getElementById("wifi").checked == true) {
        for (var i = 0; i < wifi_markers.length; i++) {
            wifi_markers[i].setVisible(true);
        }
    }
    else {
        unshowWifi();
    }
}

function unshowWifi() {
    for (var i = 0; i < wifi_markers.length; i++) {
        wifi_markers[i].setVisible(false);
    }
    infowindow_wifi.close();
}

function showQuiet(quiet) {
    if (document.getElementById("quiet").checked == true) {
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

function showQuietPlaces() {
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: { lat: current_location[0], lng: current_location[1] },
        radius: 1000,
        type: ['library', 'park']
    }, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var quiet_marker = new google.maps.Marker({
                position: results[i].geometry.location,
                map: map,
                visible: false,
                icon: icon3,
                title: "Click for details"
            });
            var content = '<div>' + results[i].name + '</div>' +
                '<div>' + '<a href="' + 'https://www.google.com/maps/dir/?api=1&origin='
                + current_location[0] + ',' + current_location[1]
                + '&destination=' + results[i].geometry.location.lat + ',' + results[i].geometry.location.lng + '">Navigate Me</a>' + '</div>';
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