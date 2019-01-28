
//Global variables:

const CTABusStopURL = "https://data.cityofchicago.org/api/views/qs84-j7wh/rows.json";
var googleAPILoaded = false;
var localDB = null;
var busStopData = null;
var trackBusNum = null;
var trackBusStopNum = null;
var showSingleBus = false;
var myPosition = null;
var openTracker = false;
var trackeraIntervalID = null;
var offlineMode = false;

$.ajaxSetup({
  cache: true
});

// Run only if document is completely loaded:
$(document).ready(function() {
    
    // Initializr Indexed DB:
    localDB = new Dexie('thebigproject');
    localDB.version(1).stores( {
        settings: '++id,name, radius, refresh',
        favorites: '++id, stopID'
    });
    localDB.open();

    localDB.settings.count().then(function(c) { 
        if (c == 0) {
            localDB.settings.put({name: 'Unknown', radius: 1, refresh: 5});
        }
    });

    // Update user's name:
    localDB.settings.toArray().then(function(settings){
        $('.mdc-drawer__subtitle').text(settings[0].name);
    });

    // Install service worker:
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }

    if(!navigator.onLine) { 
        offlineMode = true;
    } 

    // Load default page:
    $("#app-content").load("search.html", function() {
        $.getScript("js/search.js");
    });

    // Initialize menu and event handler:
    const appTopBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector("#app-top-bar"));
    const appTopBarMenu = mdc.drawer.MDCDrawer.attachTo(document.querySelector("#app-top-bar-menu"));
    const appTopBarMenuItems = document.querySelector("#app-top-bar-menu .mdc-list");

    appTopBar.listen('MDCTopAppBar:nav', function() {
        appTopBarMenu.open = !appTopBarMenu.open;
    });

    appTopBarMenuItems.addEventListener('click', function(event) {
        appTopBarMenu.open = false;
    });

    $(".mdc-list-item").on("click", function(event) { 
        var data = $(this).attr("data-file");
        $("#app-content").load(data + ".html", function() {
            $.getScript("js/" + data + ".js");
            
        });
    });

});