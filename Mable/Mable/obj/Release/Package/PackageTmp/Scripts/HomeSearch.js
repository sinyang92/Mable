$(document).ready(function () {
    $('#SearchButton').click(function Search() {
        var map;
        var service;
        var infowindow;

        function initialize() {
            var pyrmont = new google.maps.LatLng(-33.8665433, 151.1956316);

            map = new google.maps.Map(document.getElementById('map'), {
                center: pyrmont,
                zoom: 15
            });

            var request = {
                location: pyrmont,
                radius: '500',
                query: 'restaurant'
            };

            infowindow = new google.maps.InfoWindow()
            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, callback);
        }

        function callback(result, status) {
            if (status == google.maps.places.PlacesService.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    createMarker(results[i]);
                }
            }
        }

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
            });
        }
    })
})