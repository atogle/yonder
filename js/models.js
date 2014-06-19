/*globals Backbone, google, jQuery */

var Yonder = Yonder || {};

(function(Y, $) {
  // Model colors: E41A1C, 377EB8, 4DAF4A, 984EA3, FF7F00, FFFF33, A65628, F781BF, 999999

  Y.GeocoderModel = Backbone.Model.extend({
    // Implement sync to call the geocode method
    sync: function(method, model, options) {
      if (method === 'read') {
        this.clear({silent: true});
        this.geocode(options.address);
      } else {
        throw new Error('Method [' + method + '] is not supported. Geocoders are read-only.');
      }
    }
  });

  Y.geocoderList = [
    // Google Maps
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'google',
      name: 'Google Maps',
      color: '#E41A1C',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var geocoder = new google.maps.Geocoder(),
          model = this;

        try {
          geocoder.geocode( { 'address': addr}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              model.set(model.parse(results[0]));
            } else {
              model.set({'Error': 'No results.'});
            }
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }
      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var normalRes = {
          'Address': res.formatted_address,
          'LatLng': [res.geometry.location.lat(), res.geometry.location.lng()],
          'Quality': res.geometry.location_type,
          'Raw': JSON.stringify(res, null, ' ')
        };

        return normalRes;
      }
    }),

    //MapQuest
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'mapquest',
      name: 'MapQuest',
      color: '#4DAF4A',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;

        try {
          $.ajax({
            dataType: 'jsonp',
            data: {
              location: addr
            },
            // Including key in the data object uri encoded the key
            url: 'http://www.mapquestapi.com/geocoding/v1/address?key=' + Y.config.mapquest_id,
            crossDomain: true,
            success: function (res) {
              if (res.results.length && res.results[0].locations.length) {
                model.set(model.parse(res.results[0].locations[0]));
              } else {
                model.set({'Error': 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }

      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var spacesRe = / {2,}/g,
          normalRes = {
            'Address': [res.street, (res.adminArea5 || res.adminArea4), res.adminArea3, res.postalCode, res.adminArea1].join(' ').replace(spacesRe, ' '),
            'LatLng': [parseFloat(res.displayLatLng.lat), parseFloat(res.displayLatLng.lng)],
            'Quality': res.geocodeQuality,
            'Raw': JSON.stringify(res, null, ' ')
          };

        return normalRes;
      }
    }),

    //Nominatim
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'nominatim',
      name: 'Nominatim',
      color: '#fd8d3c',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;

        try {
          $.ajax({
            dataType: 'jsonp',
            data: {
              q: addr,
              format: 'json',
              addressdetails: 1
            },
            jsonp: 'json_callback',
            // Including key in the data object uri encoded the key
            url: 'http://nominatim.openstreetmap.org/search',
            crossDomain: true,
            success: function (res) {
              if (res.length) {
                model.set(model.parse(res[0]));
              } else {
                model.set({'Error': 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }

      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var spacesRe = / {2,}/g,
          normalRes = {
            'Address': res.display_name,
            'LatLng': [parseFloat(res.lat), parseFloat(res.lon)],
            'Quality': res.importance,
            'Raw': JSON.stringify(res, null, ' ')
          };

        return normalRes;
      }
    }),

    //Esri
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'esri',
      name: 'Esri',
      color: '#444',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;

        try {
          $.ajax({
            dataType: 'jsonp',
            data: {
              text: addr,
              f: 'pjson'
            },
            // Including key in the data object uri encoded the key
            url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find',
            crossDomain: true,
            success: function (res) {
              if (res.locations.length) {
                model.set(model.parse(res.locations[0]));
              } else {
                model.set({'Error': 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }
      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(loc) {
        var feature = loc.feature;
        var spacesRe = / {2,}/g,
          normalRes = {
            'Address': loc.name,
            'LatLng': [parseFloat(feature.geometry.y), parseFloat(feature.geometry.x)],
            'Quality': feature.attributes.Score,
            'Raw': JSON.stringify(loc, null, ' ')
          };

        return normalRes;
      }
    }),

    //MapBox
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'mapbox',
      name: 'MapBox',
      color: 'purple',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;
        var encodedAddr = encodeURIComponent(addr);

        try {
          $.ajax({
            // snagged from their docs :)
            url: 'https://a.tiles.mapbox.com/v3/examples.map-i875kd35/geocode/'+encodedAddr+'.json',
            crossDomain: true,
            success: function (res) {
              if (res.results.length) {
                model.set(model.parse(res.results[0]));
              } else {
                model.set({'Error': 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }

      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(loc) {
        var address = [];
        loc.forEach(function(i){
          address.push(i.name);
        });

        var spacesRe = / {2,}/g,
          normalRes = {
            'Address': address.join(", "),
            'LatLng': [parseFloat(loc[0].lat), parseFloat(loc[0].lon)],
            'Raw': JSON.stringify(loc, null, ' ')
          };

        return normalRes;
      }
    }),

    //Yahoo! PlaceFinder
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      type: 'yahoo',
      name: 'Yahoo! Placefinder',
      color: '#377EB8',
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;

        try {
          $.ajax({
            dataType: 'jsonp',
            data: {
              q: 'select * from geo.placefinder where text="'+addr+'"',
              format: 'json',
              appid: Y.config.yahoo_id
            },
            url: 'http://query.yahooapis.com/v1/public/yql',
            success: function (res) {
              if (res.query.count || ($.isArray(res.query.results.Result) && res.query.results.Result.length > 0)) {
                // For some reason, this sometimes comes back as an array. Sad.
                if ($.isArray(res.query.results.Result)) {
                  model.set(model.parse(res.query.results.Result[0]));
                } else {
                  model.set(model.parse(res.query.results.Result));
                }
              } else {
                model.set({'Error': 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({'Error': 'Error parsing results.'});
        }

      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var spacesRe = / {2,}/g,
          normalRes = {
            'Address': [res.line1, res.line2, res.line3, res.line4].join(' ').replace(spacesRe, ' '),
            'LatLng': [parseFloat(res.latitude), parseFloat(res.longitude)],
            'Quality': res.quality,
            'Raw': JSON.stringify(res, null, ' ')
          };

        return normalRes;
      }
    })



  ];

  Y.GeocoderCollection = Backbone.Collection.extend({
    model: Y.GeocoderModel,
    // Override fetch to delegate to the models
    fetch: function(options) {
      this.each(function(model) {
        model.fetch(options);
      });
    }
  });
}(Yonder, jQuery));
