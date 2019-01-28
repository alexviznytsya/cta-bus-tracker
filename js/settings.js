// Initialize MC text fields:
var settings_full_name = new mdc.textField.MDCTextField(document.querySelector("#settings-full-name"));
var settings_radius = new mdc.textField.MDCTextField(document.querySelector("#settings-search-radius"));
var settings_refresh = new mdc.textField.MDCTextField(document.querySelector("#settings-search-refresh"));

// Populate settings fields from DB:
localDB.settings.toArray().then(function(settings){
    settings_full_name.value = settings[0].name;
    settings_radius.value = settings[0].radius;
    settings_refresh.value = settings[0].refresh;
});

// Upadate settings to DB:
var settingsSaveButton = new mdc.ripple.MDCRipple(document.querySelector("#settings-save"));
$('#settings-save').on('click', function(event) {
    localDB.settings.update(1, {name: settings_full_name.value, radius: settings_radius.value, refresh: settings_refresh.value}).then(function(updated) {
        $('.mdc-drawer__subtitle').text(settings_full_name.value);
        searchRadius = settings_radius.value;
        refreshTimer = settings_refresh.value;
    });
});


