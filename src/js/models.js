var Yonder = Yonder || {};

(function(Y) {
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
          'Longitude': res.geometry.location.lng(),
          'Latitude': res.geometry.location.lat(),
          'Quality': res.geometry.location_type,
          'Raw': JSON.stringify(res, null, ' ')
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
            'Longitude': parseFloat(res.longitude),
            'Latitude': parseFloat(res.latitude),
            'Quality': res.quality,
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
            'Longitude': parseFloat(res.displayLatLng.lng),
            'Latitude': parseFloat(res.displayLatLng.lat),
            'Quality': res.geocodeQuality,
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
})(Yonder);