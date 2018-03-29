var sensor_markers = [];
var toilet_markers = [];
var park_markers = [];

function initMap() {
    var centre = { lat: -37.8136, lng: 144.9631 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: centre
    });

    // Create a search box and link it to the UI element
    var input = document.getElementById('input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    })

    var search_markers = [];
    searchBox.addListener('places_changed', function () {
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
                var coor = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lon) };
                var parkStatus = 'Parking status: ' + data[i].status;
                var sensor_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: true,
                    icon: icon1,
                    title: "Click for details"
                });
                sensor_marker.content = parkStatus;
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(sensor_marker, 'click', function () {
                    infowindow.setContent(this.content);
                    infowindow.open(this.getMap(), this);
                })
                sensor_markers.push(sensor_marker);
            }
        });

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
                var coor = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lon) };
                var wheelchair = 'Wheelchair Accessible: ' + data[i].wheelchair;
                var toilet_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: true,
                    icon: icon2,
                    title: "Click for details"
                });
                toilet_marker.content = wheelchair;
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(toilet_marker, 'click', function () {
                    infowindow.setContent(this.content);
                    infowindow.open(this.getMap(), this);
                })
                toilet_markers.push(toilet_marker);
            }
        });

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
                var coor = { lat: parseFloat(data[i].y_coordinate), lng: parseFloat(data[i].x_coordinate_2) };
                var parkSpace = '<div>' +  'Parking Type: ' + data[i].parking_type + '</div>' +
                '<div>' +  'Parking Spaces: ' + data[i].parking_spaces + '</div>';
                var park_marker = new google.maps.Marker({
                    position: coor,
                    map: map,
                    visible: true,
                    icon: icon3,
                    title: "Click for details"
                });
                park_marker.content = parkSpace;
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(park_marker, 'click', function () {
                    infowindow.setContent(this.content);
                    infowindow.open(this.getMap(), this);
                })
                park_markers.push(park_marker);
            }
        });
}

// Filter for real-time on-street parking
function showSensor(sensor) {
    if (document.getElementById("sensor").checked == true) {
        for (var i = 0; i < sensor_markers.length; i++) {
            sensor_markers[i].setVisible(true);
        }
    }
    else {
        for (var i = 0; i < sensor_markers.length; i++) {
            sensor_markers[i].setVisible(false);
        }
    }
}

// Filter for public toilet
function showToilet(toilet) {
    if (document.getElementById("toilet").checked == true) {
        for (var i = 0; i < toilet_markers.length; i++) {
            toilet_markers[i].setVisible(true);
        }
    }
    else {
        for (var i = 0; i < toilet_markers.length; i++) {
            toilet_markers[i].setVisible(false);
        }
    }
}

// Filter for parking space
function showPark(park) {
    if (document.getElementById("park").checked == true) {
        for (var i = 0; i < park_markers.length; i++) {
            park_markers[i].setVisible(true);
        }
    }
    else {
        for (var i = 0; i < park_markers.length; i++) {
            park_markers[i].setVisible(false);
        }
    }
}

//Filter function
function applyFilter() {
    showSensor(sensor);
    showToilet(toilet);
    showPark(park);
}


