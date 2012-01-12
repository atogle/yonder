# About #
Yonder is a tool for comparing geocoder results. Enter your string once and compare the results on a single map.

Yonder is a JavaScript application that has no server-side dependencies. As such, all geocoders must have a JavaScript API or JSONP support. I also used this as an opportunity to play with [Backbone.js](http://documentcloud.github.com/backbone/) for the first time. Please let me know how I can make improvements.

# Supported Geocoders #

* [Google Maps](http://code.google.com/apis/maps/documentation/geocoding/)
* [Yahoo! Placefinder](http://developer.yahoo.com/geo/placefinder/)
* [Mapquest](http://www.mapquestapi.com/geocoding/)

## How do I add a geocoder? ##
Geocoder support is done via a Backbone.js model. Simply add a new model to add support for another geocoder. The short version is:

1.  Open `js/models.js`
2.  Add a new model to `geocoderList` that extends `GeocoderModel`
3.  Set the `type`, `name`, and `color` properties for displaying results
4.  Implement the `geocode` method to fetch the geocoder results
5.  Implement the `parse` method to normalize the results to display