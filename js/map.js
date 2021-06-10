var bounds = null;
function loadMap() {
    var options = {
        scrollwheel: false,
        center: new google.maps.LatLng(25.3272736, 40.8520381),
        styles: [{
            "elementType": "geometry",
            "stylers": [{
                "color": "#80c581"
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#1e560b"
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#f5f1e6"
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#1e560b"
            }]
        }, {
            "featureType": "administrative.land_parcel",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#dcd2be"
            }]
        }, {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#ae9e90"
            }]
        }, {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [{
                "color": "#80c581"
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        }, {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#93817c"
            }]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#a5b076"
            }]
        }, {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#447530"
            }]
        }, {
            "featureType": "road",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f1e6"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#fdfcf8"
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f8c967"
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#e9bc62"
            }]
        }, {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [{
                "color": "#e98d58"
            }]
        }, {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#db8555"
            }]
        }, {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#806b63"
            }]
        }, {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        }, {
            "featureType": "transit.line",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#8f7d77"
            }]
        }, {
            "featureType": "transit.line",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ebe3cd"
            }]
        }, {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        }, {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#c0e5b6"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#92998d"
            }]
        }]
    };
    mapObject = new google.maps.Map(document.getElementById('map'), options);

    bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng(62.280887, 94.533426)); // Russia
    bounds.extend(new google.maps.LatLng(64.005212, 15.705357)); // Swiden
    bounds.extend(new google.maps.LatLng(53.138031, -7.791947)); // Ireland
    bounds.extend(new google.maps.LatLng(-32.053173, 24.851419)); // South Africa

    mapObject.fitBounds(bounds, 0);
}

var circleSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4,
    strokeColor: 'black'
};

var app = angular.module("migratrac", []);
app.controller("birdsCtrl", function($scope) {
    $scope.years = [2017, 2018, 2019];
    $scope.year = 2017;
    $scope.months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    $scope.month = null;
    $scope.monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $scope.birdPath = null;
    $scope.circle = '';
    $scope.bird = null;

    database.ref('birds').once('value').then(function(snapshot) {
        $scope.$apply(function() {
            $scope.birds = snapshot.val();
        });
        $('.loading').hide();
    });

    $scope.startTrack = function(element) {
        $scope.bird = this.bird, paths = [];
        $('.bird-list ul li').removeClass('active');
        $(element).closest('li').addClass('active');

        if ($scope.birdPath){
            $scope.birdPath.setMap(null);
            clearInterval($scope.interval);
        }

        if ($scope.bird.migraPaths && $scope.bird.migraPaths[$scope.year]) {
            $scope.animate();
        } else {
            alert('No data for the year ' + $scope.year);
        }
    }
    $scope.animate = function() {
        clearInterval($scope.interval);

        var points = [];
        $scope.month = 0;

        points[0] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][0].lat, $scope.bird.migraPaths[$scope.year][0].lng);
        points[1] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][1].lat, $scope.bird.migraPaths[$scope.year][1].lng);
        $scope.birdPath = new google.maps.Polyline({
            path: [points[0], points[1]],
            strokeColor: '#0f0',
            strokeWeight: 0,
            icons: [{
                icon: circleSymbol,
                offset: '0%'
            }],
            map: mapObject,
            geodesic: false
        });
        // Create a polylines for the bird path

        //Get all days of the year
        var beginYear = new Date($scope.year, 0, 1);
        var endYear = new Date($scope.year, 11, 31);
        var daysOfYear = [];
        for (var d = beginYear; d <= endYear; d.setDate(d.getDate() + 1)) {
            daysOfYear[d.getMonth()] = daysOfYear[d.getMonth()] || [];

            daysOfYear[d.getMonth()].push(new Date(d));
        }
        var currentDateIndex = 0;

        $scope.interval = setInterval(function() {
            if (!$scope.bird.migraPaths[$scope.year]){
                clearInterval($scope.interval);
                return;
            }
            $scope.birdPath.icons[0].offset = Math.min(currentDateIndex * 100 / daysOfYear[$scope.month].length, 100) + '%';
            $scope.birdPath.setPath($scope.birdPath.getPath());

            var currentDate = daysOfYear[$scope.month][currentDateIndex];

            if (currentDateIndex < daysOfYear[$scope.month].length - 1) {
                currentDateIndex++;
            } else {
                $scope.$apply(function() {
                    if ($scope.month < 11){
                        $scope.month++;
                    }else{
                        $scope.month = 0;
                    }
                });

                currentDateIndex = 0;
                $scope.birdPath.setMap(null);

                if ($scope.month < 11){
                    points[0] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][$scope.month].lat, $scope.bird.migraPaths[$scope.year][$scope.month].lng);
                    points[1] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][$scope.month+1].lat, $scope.bird.migraPaths[$scope.year][$scope.month+1].lng);
                }else{
                    points[0] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][$scope.month].lat, $scope.bird.migraPaths[$scope.year][$scope.month].lng);
                    points[1] = new google.maps.LatLng($scope.bird.migraPaths[$scope.year][0].lat, $scope.bird.migraPaths[$scope.year][0].lng);
                }

                $scope.birdPath = new google.maps.Polyline({
                    path: [points[0], points[1]],
                    strokeColor: '#0f0',
                    strokeWeight: 0,
                    icons: [{
                        icon: circleSymbol,
                        offset: '0%'
                    }],
                    map: mapObject,
                    geodesic: false
                });
            }

        }, 150);
    }
    angular.element(document).ready(function() {
        loadMap();
    });
});
