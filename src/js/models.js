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
        this.set(this.parse({foo: addr+'bar'}));
      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        return res;
      }
    }),
    
    //Yahoo! PlaceFinder
    Y.GeocoderModel.extend({
      //Include a unique geocoder name for display
      defaults: {
        type: 'yahoo',
        name: 'Yahoo! PlaceFinder'
      },
      // Geocode the address and call success or error when complete
      geocode: function(addr) {
        this.set(this.parse({foo: addr+'bar2'}));
      },
      // Override parse to set normalized attributes for display.
      // The res param is the raw respsone from the geocoder
      parse: function(res) {
        return res;
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