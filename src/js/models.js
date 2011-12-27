var GeocoderModel = Backbone.Model.extend({
  // Defaults for required display values
  defaults: {
    name: 'Please set [name] in this Geocoder model.',
    geocodedAddress: 'Please set [geocodedAddress] in this Geocoder model.',
    lon: 'Please set [lon] in this Geocoder model.',
    lat: 'Please set [lat] in this Geocoder model.',
    quality: 'Please set [quality] in this Geocoder model.'
  },
  // Implement sync to call the geocode method
  sync: function(method, model, options) {
    alert('syncing ' + this.get('name'));
    if (method === 'read') {
      this.geocode(options.addr, options.success, options.error); 
    } else {
      throw new Error('Method [' + method + '] is not supported. Geocoders are read-only.');
    }
  }
});

var geocoders = [
  // Google Maps
  GeocoderModel.extend({
    //Include a unique geocoder name for display
    defaults: {
      name: 'Google Maps'
    },
    // Geocode the address and call success or error when complete
    geocode: function(addr, success, error) {
      alert('geocoding ' + addr + ' with ' + this.get('name'));
    },
    // Override parse to set normalized attributes for display.
    // The res param is the raw respsone from the 
    parse: function(res) {
      return res;
    }
  }),
  
  //Yahoo! PlaceFinder
  GeocoderModel.extend({
    //Include a unique geocoder name for display
    defaults: {
      name: 'Yahoo! PlaceFinder'
    },
    // Geocode the address and call success or error when complete
    geocode: function(addr, success, error) {
      alert('geocoding ' + addr + ' with ' + this.get('name'));
    },
    // Override parse to set normalized attributes for display.
    // The res param is the raw respsone from the 
    parse: function(res) {
      return res;
    }
  })
];

var GeocoderCollection = Backbone.Collection.extend({
  model: GeocoderModel,
  // Override fetch to delegate to the models
  fetch: function(options) {
    this.each(function(model) {
      model.fetch(options);
    });
  }
});