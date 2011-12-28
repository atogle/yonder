var Yonder = Yonder || {};

(function(Y) {
  Y.GeocoderView = Backbone.View.extend({

    template: _.template($('#geocoder-result-template').html()),

    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    
    render: function() {
      $('.geocoder-result', '#'+this.model.get('type')).append(
        _.template( $("#geocoder-result-template").html(), this.model.toJSON() )
      );
      return this;
    }
  });

  Y.GeocoderListView = Backbone.View.extend({
    // The context of this view
    el: $('.container'),

    template: _.template($('#geocoder-list-template').html()),

    events: {
      // Bind geocode button click
      'click button#geocode-submit': 'geocode'
    },

    initialize: function() {
      this.geocoders = new Y.GeocoderCollection();

      // Init and add each geocoder model
      _.each(Y.geocoderList, function(g) {
        var geocoder = new g();

        // Init the view
        new Y.GeocoderView({ model: geocoder});

        this.geocoders.add(geocoder);

        // Render the context for each geocoder result
        this.render(geocoder);
      }, this);
    },

    // Render the context for each  geocoder result
    render: function(geocoder) {
      $('#geocoder-results', this.el).append(_.template( $("#geocoder-list-template").html(), geocoder.toJSON() ));
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
})(Yonder);