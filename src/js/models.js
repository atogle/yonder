var Yonder = Yonder || {};

(function(Y) {
  // Model colors: E41A1C, 377EB8, 4DAF4A, 984EA3, FF7F00, FFFF33, A65628, F781BF, 999999

  Y.GeocoderModel = Backbone.Model.extend({
    // Implement sync to call the geocode method
    sync: function(method, model, options) {
      if (method === 'read') {
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
      defaults: {
        type: 'google',
        name: 'Google Maps',
        color: '#E41A1C'
      },
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var geocoder = new google.maps.Geocoder(),
          model = this;

        try {
          geocoder.geocode( { 'address': addr}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              model.set(model.parse(results[0]));
            } else {
              model.set({error: 'No results.'});
            }
          });
        } catch (e) {
          model.set({error: 'Error parsing results.'});
        }
      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var normalRes = {
          geocodedAddress: res.formatted_address,
          lon: res.geometry.location.lng(),
          lat: res.geometry.location.lat(),
          quality: res.geometry.location_type,
          raw: JSON.stringify(res, null, ' ')
        };

        return normalRes;
      }
    }),
    
    //Yahoo! PlaceFinder
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      defaults: {
        type: 'yahoo',
        name: 'Yahoo! Placefinder',
        color: '#377EB8'
      },
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var model = this;

        try {
          $.ajax({
            dataType: 'jsonp',
            data: {
              q: 'select * from geo.placefinder where text="'+addr+'"',
              format: 'json',
              appid: 'test', //TODO: config value
            },
            url: 'http://query.yahooapis.com/v1/public/yql',
            success: function (res) {
              if (res.query.count) {
                model.set(model.parse(res.query.results.Result));  
              } else {
                model.set({error: 'No results.'});
              }
            },
          });
        } catch (e) {
          model.set({error: 'Error parsing results.'});
        }

      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        var normalRes = {
          geocodedAddress: [res.line1, res.line2, res.line3, res.line4].join(' '),
          lon: parseFloat(res.longitude),
          lat: parseFloat(res.latitude),
          quality: res.quality,
          raw: JSON.stringify(res, null, ' '),
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