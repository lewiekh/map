//global variables
var map;
var infoWindow;
var client_id = "IZMXFYMANN4XGZMEJLBMUVPW3PUAF4S2JHR5R4ZTX4AYEYF4";
var secret_id = "KA1ONJQUJ41MMINCM10KANYOSVICAQ3UPNR0VNTKBAQPLKLT";
var foursquare = "https://api.foursquare.com/v2/venues/";
//location class template to create all locations from the initialMarkers JSON and AJAX request.
var Location = function(data) {
	var self = this;
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.locationId = ko.observable(data.locationId);
	this.youTube = ko.observable(data.ytVidId);
	this.showLocation = ko.observable(true);
	this.loadContent = function() {
		infoWindow.setContent(self.iwContent);
	};
	//ajax request to foursquare for location data based on the location id provided in the JSON
	$.ajax({
		url: foursquare + self.locationId() + '?v=20131016&client_id=' + client_id + '&client_secret=' + secret_id,
		type: "GET",
		dataType: "json",
		//upon a successful request the data is retreived and placed in the infowindow of markers
		success: function(data) {
			resData = data.response.venue;
			self.photo = resData.bestPhoto.prefix + "original" + resData.bestPhoto.suffix || "No photo provided";
			self.tip = resData.tips.groups[0].items[0].text || "No tips provided";
			self.rating = resData.rating || "Not yet rated!";
			self.name = resData.name || "No Name Provided";
			self.iwContent = '<div><h3>' + self.name + '</h3></div>' + '<div><h3>Guest Rating: ' + self.rating + '</h3></div>' + '<div><h3>Guest Tips: </h3>' + self.tip + '</div>' + '<img src="' + self.photo + '" alt="' + self.name + '"style="width:304px;height:228px;">' + '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + self.youTube() + '"frameborder="0" allowfullscreen></iframe>' + '<div>Powered by: <a href="https://foursquare.com/">FourSquare</a> & <a href="https://youtube.com/">Youtube</a> ';
			// self.loadContent();
		},
		//upon a error response an error messeage will be placed in the infowindow
		error: function(e) {
			self.iwContent = '<div><h3>OH NO! Something went wrong! Please try again later!</h3></div>' + '<img src="giphy.gif" alt="Not working error">';
			// self.loadContent();
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
	this.stopBounce = function() {
		setTimeout(function() {
			self.marker.setAnimation(null)
		}, 1500);
	};
	//opens the infowindow when the marker is clicked
	this.marker.addListener('click', function() {
		self.loadContent();
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		self.stopBounce();
		infoWindow.open(map, this);
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
	infoWindow = new google.maps.InfoWindow({
		content: ""
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
	this.openSideNav = ko.observable(false);
	this.expandSideNav = function() {
		self.openSideNav(!self.openSideNav());
	}
}
//initilize and apply knockout binding using the map callback function
function initMap() {
	ko.applyBindings(new ViewModel());
}

function mapError() {
	document.getElementById("map").innerHTML = "Something Went Wrong Loading Google map, Try again Later";
}
