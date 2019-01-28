var myPosition = null;
var map = null;
var markers = [];

if (offlineMode) {
  $("#app-content").html('<div style="position: absolute; top: 50%; left: 20%; right: 20%; border: 3px solid #FF0000; padding: 10px; text-align: center;">Live bus data is not available because you have no internet connection.</div>');
}

if(!googleAPILoaded) {
  $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyC0AYqlElZGiHkz47mxYTzfAqJd9kiiyak", function(data, textStatus, jqxhr){
    googleAPILoaded = true;
    init();
  });
} else {
  init();
}


function init() {
  if (showSingleBus) {
    showSingleBus = false;
    $.each(busStopData.data, function(k, v) {
      if(v[8] == trackBusStopNum) {
        myPosition = {lat: parseFloat(v[21]), lng: parseFloat(v[20])};
      }
    });

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 17,
      center: myPosition
    });
    var marker = new google.maps.Marker({
      position: myPosition,
      map: map,
      icon: 'images/position.jpg'
    });
    openTracker = true;
    trackeraIntervalID = setInterval(showMarkers, refreshTimer*1000);
  } else {
    var list = [];
    var objList = [];
    $("#app-content").load("search-results.html", function() {
      localDB.favorites.each(function(record) {
        list.push(record);
      }).then(function() {
        $.each(busStopData.data, function(k, v) {
          $.each(list, function(k1, v1) {
            if (v[8] == v1.stopID) {
              objList.push(v);
            }
          });        
        });
      }).then(function() {
        if (list.length == 0) {
          $("#app-content").html('<div style="position: absolute; top: 50%; left: 20%; right: 20%; border: 3px solid #FF0000; padding: 10px; text-align: center;">You don not have any favorites bus stops to display them on map. Please select some bus stops from Search page.</div>');
        } else {
          createList(objList);
        }
      });
    }); 
  }
}

function showMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  // Trick to get data from http, because service worker does not want 
  // process not https requests:
  // !!! ANY API KEYS IN THIS APPLICATION IS FOR APP EVALUATION ONLY!!!
  var request = "http://ctabustracker.com/bustime/api/v2/getvehicles?key=f7y2aMfeLjan2MrQ3xGQMnwh8&rt=" + trackBusNum + "&tmres=s&format=json";
  var proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  $.get(proxyUrl + request, function(data) {
    $.each(data["bustime-response"].vehicle, function(k, v) {
        var marker = new google.maps.Marker({
          position: {lat: parseFloat(v.lat), lng: parseFloat(v.lon)},
          map: map,
          icon: 'images/bus.png'
        });
        markers.push(marker);
    });
  });
}