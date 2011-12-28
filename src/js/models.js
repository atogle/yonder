var Yonder = Yonder || {};

(function(Y) {
  Y.GeocoderModel = Backbone.Model.extend({
    // Defaults for required display values
    defaults: {
      type: 'Please set [type] in this Geocoder model.',
      name: 'Please set [name] in this Geocoder model.',
      geocodedAddress: 'Please set [geocodedAddress] in this Geocoder model.',
      lon: 'Please set [lon] in this Geocoder model.',
      lat: 'Please set [lat] in this Geocoder model.',
      quality: 'Please set [quality] in this Geocoder model.'
    },
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
        name: 'Google Maps'
      },
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        var geocoder = new google.maps.Geocoder(),
          model = this;

        geocoder.geocode( { 'address': addr}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            model.set(model.parse(results[0]));
          }
        });
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
    })
    
    // //Yahoo! PlaceFinder
    // Y.GeocoderModel.extend({
    //   //Include a unique geocoder name for display
    //   defaults: {
    //     type: 'yahoo',
    //     name: 'Yahoo! PlaceFinder'
    //   },
    //   // Geocode the address and call success or error when complete
    //   geocode: function(addr) {
    //     this.set(this.parse({}));
    //   },
    //   // Override parse to set normalized attributes for display.
    //   // The res param is the raw respsone from the geocoder
    //   parse: function(res) {
    //     var normalRes = {
    //       geocodedAddress: 1,
    //       lon: 2,
    //       lat: 3,
    //       quality: 4,
    //       raw: 5,
    //     };

    //     return normalRes;
    //   }
    // })
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