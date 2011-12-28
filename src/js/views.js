var Yonder = Yonder || {};

(function(Y) {
  Y.GeocoderListView = Backbone.View.extend({
    // The context of this view
    el: $('.container'),

    events: {
      // Bind geocode button click
      'click button#geocode-submit': 'geocode'
    },

    initialize: function() {
      this.geocoders = new Y.GeocoderCollection();

      // Init and add each geocoder model
      _.each(Y.geocoderList, function(g) {
        var geocoder = new g();
        this.geocoders.add(geocoder);

        // Render the context for each  geocoder result
        this.render(geocoder);
      }, this);
    },

    // Render the context for each  geocoder result
    render: function(geocoder) {
      $('#geocoder-results', this.el).append('<div id="'+geocoder.get('type')+'" class="span5"> \
        <h2>'+geocoder.get('name')+'</h2> \
        <div class="geocoder-result"></div></div>');
    },

    // Call geocode for the collection, triggering updates for every model
    geocode: function() {
      var addr = $('input#geocode-address').val();

      if (addr) {
        // Triggers a fetch for each model in the collection
        this.geocoders.fetch( { 'address': addr });  
      }
    }
  });


  Y.GeocoderView = Backbone.View.extend({

  });
})(Yonder);