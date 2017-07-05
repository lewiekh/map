//global variables
var map;
var infoWindow;
var client_id = "IZMXFYMANN4XGZMEJLBMUVPW3PUAF4S2JHR5R4ZTX4AYEYF4";
var secret_id = "KA1ONJQUJ41MMINCM10KANYOSVICAQ3UPNR0VNTKBAQPLKLT";
var foursquare = "https://api.foursquare.com/v2/venues/";
//JSON location data
var initialMarkers = [{
        title: "Jumeirah Beach",
        lat: 25.221157,
        lng: 55.255015,
        locationId: "4e69bde418a83989ec28ec99",
        ytVidId: "CLrbtDGv2-g"
    },
    {
        title: "Burj Khalifa",
        lat: 25.197197,
        lng: 55.274376,
        locationId: "4b94f4f8f964a5204b8934e3",
        ytVidId: "cn7AFhVEI5o"
    },
    {
        title: "Burj Al Arab",
        lat: 25.141069,
        lng: 55.185313,
        locationId: "4bebf8d661aca593759c8500",
        ytVidId: "yvUbza_QQ2c"
    },
    {
        title: "Dubai Creek Golf Club",
        lat: 25.228596,
        lng: 55.293267,
        locationId: "4b0587f3f964a520e5a822e3",
        ytVidId: "cqBPziUJW0A"
    },
    {
        title: "Rixos The Palm Dubai",
        lat: 25.008462,
        lng: 54.987946,
        locationId: "501d9192e4b03fc922a9422a",
        ytVidId: "wdTltCwp8cw"
    },
    {
        title: "Wild Wadi Water Park",
        lat: 25.138701,
        lng: 55.188521,
        locationId: "4b0587eff964a520fea722e3",
        ytVidId: "8ZfcZtg7_Jc"
    },
    {
        title: "Dubai Marina Walk",
        lat: 25.080542,
        lng: 55.140343,
        locationId: "4b55699ef964a520b6e327e3",
        ytVidId: "eGOI-IzvXac"
    },
    {
        title: "Dubai Aquarium",
        lat: 25.197642,
        lng: 55.278710,
        locationId: "4b602959f964a520f7d729e3",
        ytVidId: "uMUgGaWRX1o"
    },
    {
        title: "Jumeirah Golf Estates",
        lat: 25.263233,
        lng: 55.297219,
        locationId: "4b0587f3f964a520eda822e3",
        ytVidId: "lkwi10fiu9k"
    },
    {
        title: "The World Islands",
        lat: 25.227829,
        lng: 55.165193,
        locationId: "4e8e96d1cc21c15fa2c2b85d",
        ytVidId: "y4D6RApfVCI"
    }
];
//location class template to create all locations from the initialMarkers JSON and AJAX request.
var Location = function(data) {
    var self = this;
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.locationId = ko.observable(data.locationId);
    this.youTube = ko.observable(data.ytVidId);
    this.showLocation = ko.observable(true);
    this.infoWindow = new google.maps.InfoWindow({
        content: ""
    });
    this.loadContent = function() {
        self.infoWindow.setContent(self.iwContent);
    };
    //ajax request to foursquare for location data based on the location id provided in the JSON
    $.ajax({
        url: foursquare + self.locationId() + '?v=20131016&client_id=' + client_id + '&client_secret=' + secret_id,
        type: "GET",
        dataType: "json",
        //upon a successful request the data is retreived and placed in the infowindow of markers
        success: function(data) {
            resData = data.response.venue;
            self.photo = resData.tips.groups[0].items[0].photourl;
            self.tip = resData.tips.groups[0].items[0].text;
            self.rating = resData.rating;
            self.name = resData.name;
            self.iwContent = '<div>' + self.name + '</div>' + '<div>' + self.rating + '</div>' +
                '<div>' + self.tip + '</div>' + '<img src="' + self.photo +
                '" alt="' + self.name + '"style="width:304px;height:228px;">' +
                '<iframe width="560" height="315" src="https://www.youtube.com/embed/' +
                self.youTube() + '"frameborder="0" allowfullscreen></iframe>';
            self.loadContent();
        },
        //upon a error response an error messeage will be placed in the infowindow
        error: function(e) {
            self.iwContent = '<div><h3>OH NO! Something went wrong! Please try again later!</h3></div>' +
                '<img src="giphy.gif" alt="Not working error">';
            self.loadContent();
        }
    });
    //Initialize a new marker on the map with data provided from the JSON
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        animation: google.maps.Animation.DROP,
    });
    //A method to check to show the marker on the map or not based on the showlocation boolean
    this.showMarker = ko.computed(function() {
        if (this.showLocation() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);
    //opens the infowindow when the marker is clicked
    this.marker.addListener('click', function() {
        self.infoWindow.open(map, this);
    });

    //closes the infowindow
    this.marker.addListener('closeclick', function() {
        self.infoWindow.close(map, this);
    });
};
//the ViewModel
function ViewModel() {
    var self = this;
    //takes keystrokes from users using the search field in the View and stores them in an array.
    this.filter = ko.observable('');
    //stores created markers
    this.locationList = ko.observableArray([]);
    //Initializes the google map with center lcoation on dubai
    var latlng = new google.maps.LatLng(25.197197, 55.274376);
    map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 11,
        mapTypeId: 'satellite'
    });
    //loop to create all the markers using the Location class and stores them in the array mention above
    initialMarkers.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });
    //determines the currently cliked nav link from the view
    this.currentLocation = ko.observable(this.locationList()[0]);
    //sets the currently clicked nav link to the correct marker and trigger a open infowindow event.
    this.setLocation = function(clickedLocation) {
        self.currentLocation(clickedLocation);
        google.maps.event.trigger(clickedLocation.marker, 'click');
    };
    //uses the keystorkes from users to filter the nav links & markers on the view
    this.filteredLocations = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        //if the search//filter on the view is blank or text is deleted - makes markers and nav links visible in the view
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.showLocation(true);
            });
            return self.locationList();
        } else {
            //if any keystorke is not found in the names of the location make them not visible
            return ko.utils.arrayFilter(self.locationList(), function(item) {
                return item.showLocation((item.name.toLowerCase().indexOf(filter) !== -1));
            });
        }
    }, self);

}
//initilize and apply knockout binding using the map callback function
function initMap() {
    ko.applyBindings(new ViewModel());
}
// opens the side nav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}
//closes the side nav
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}
