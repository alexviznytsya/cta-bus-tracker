if (busStopData == null) {
    $.get(CTABusStopURL, function(data) {
        busStopData = data;
    });
}

if (openTracker) {
    clearInterval(trackeraIntervalID);
    openTracker = false;
}

var searchRadius = null;
var refreshTimer = null;
localDB.settings.get(1).then(function(data) {
    searchRadius = data.radius;
    refreshTimer = data.refresh;
});

var search_street1 = new mdc.textField.MDCTextField(document.querySelector("#search-street-1"));
var search_street2 = new mdc.textField.MDCTextField(document.querySelector("#search-street-2"));
var stops_by_bus_num = new mdc.textField.MDCTextField(document.querySelector("#search-stops-by-number"));
var search_crossing = new mdc.ripple.MDCRipple(document.querySelector("#search-crossing"));

var search_by_bus = new mdc.ripple.MDCRipple(document.querySelector("#search-by-bus"));
var search_locate = new mdc.ripple.MDCRipple(document.querySelector("#search-locate"));


$('#search-crossing').on('click', function(event) {
    $("#app-content").load("search-results.html", function() {
        var list = [];
        $.each(busStopData.data, function(k, v) {
            if ((v[19].toLowerCase().indexOf(search_street1.value.toLowerCase()) >= 0) &&
            (v[19].toLowerCase().indexOf(search_street2.value.toLowerCase()) >= 0 ))
             { 
                list.push(v);
             }
        });
        createList(list);
    });
});


$('#search-by-bus').on('click', function(event) {
    $("#app-content").load("search-results.html", function() {
        var list = [];
        $.each(busStopData.data, function(k, v) {
            if (stops_by_bus_num.value == v[15]) {
                list.push(v);
            }
        });
        createList(list);
    });
});


$('#search-locate').on('click', function(event) {
    if (offlineMode) {
        $("#app-content").html('<div style="position: absolute; top: 50%; left: 20%; right: 20%; border: 3px solid #FF0000; padding: 10px; text-align: center;">Data for this seach is not available because you have no internet connection.</div>');
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(findBusStopsNearMe);
    } else {
        $("#locate-error").text("Geolocation is not supported by this browser.");
    }	
});

function findBusStopsNearMe(geoData) {
    var list = [];
    myPosition = geoData;
    var myLatitude = geoData.coords.latitude;
    var myLongitude = geoData.coords.longitude;
    $.each(busStopData.data, function(k, v) {
        var d = Math.round(distance(myLatitude, myLongitude, v[21], v[20]));
        if (d <= searchRadius) {
            list.push(v);
        }
    });
    createList(list);
}


function createList(newList) {
    $("#app-content").load("search-results.html", function() {
        $.each(newList, function(k, v) {
            const listItem = $(".list_template").clone();
            listItem.removeClass("list_template");
            listItem.addClass("mdc-list-item");
            listItem.find(".mdc-list-item__primary-text").text( v[19] + " - " + v[13]);
            listItem.find(".mdc-list-item__secondary-text").text("Bus# " + v[15]);
            listItem.attr("data-bus", v[15]);
            listItem.attr("data-bus-stop", v[8]);
            localDB.favorites.where("stopID").equals(v[8]).first().then(function(data) {
                if (data) {
                    listItem.find(".mdc-list-item__meta").addClass("star_icon_full");
                    listItem.find(".mdc-list-item__meta").text("star");
                }
            });
            listItem.on('click', function(event) {
                trackBusNum = ($(this).attr("data-bus"));
                trackBusStopNum = $(this).attr("data-bus-stop");
                showSingleBus = true;
                $("#app-content").load("tracker.html", function() {
                    $.getScript("js/tracker.js");
                });
            });
            $("#search-container").append(listItem);
        });
        $(".mdc-list-item__meta").on("click", function(event) {
            event.stopPropagation();
            const listItem = $(this);
            if (listItem.hasClass("star_icon_full")) {
                listItem.removeClass("star_icon_full");
                listItem.text("star_border");
                localDB.favorites.where("stopID").equals(listItem.parent().attr("data-bus-stop")).delete();
            } else {
                listItem.addClass("star_icon_full");
                listItem.text("star");
                $.each(busStopData.data, function(k, v) {
                    if (v[8] == listItem.parent().attr("data-bus-stop")) {
                        localDB.favorites.put({
                            stopID: v[8],
                            street: v[19],
                            busNum: v[15],
                            direction: v[13]
                        });
                        return;
                    }
                });
            }
        });
    });
}


function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}
