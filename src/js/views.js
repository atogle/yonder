var Yonder = Yonder || {};

(function(Y) {
  Y.MapView = Backbone.View.extend({
    initialize: function() {
      this.map = new L.Map('map');
      this.pointsUpdated = 0;
      this.layerGroup = new L.LayerGroup();
          
      var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/fa2b7d4057c846daa7691c7995240bd5/997/256/{z}/{x}/{y}.png',
        cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});

      this.map.addLayer(this.layerGroup);
      this.map.setView(new L.LatLng(0, 0), 2).addLayer(cloudmade);

      this.collection.bind('change', this.render, this);
    },

    render: function() {
      var view = this,
        bounds,
        hasResults = false;

      // Count updated models
      this.collection.each(function(model) {
        if (model.hasChanged()) {
         view.pointsUpdated++;
        }
      });

      // Only render if the points updated is same as the collection size
      if (this.pointsUpdated === _.size(this.collection)) {
        // Clear existing markers
        view.layerGroup.clearLayers();

        // Init bounds to contain the points
        bounds = new L.LatLngBounds();

        this.collection.each(function(model) {
          var pt;
          if (model.has('lat') && model.has('lon')) {
            pt = new L.LatLng(model.get('lat'), model.get('lon'));
            
            // Add markers to the map
            view.layerGroup.addLayer(new L.CircleMarker(pt, {
              color: model.get('color'),
              radius: 8,
              fillOpacity: 0.7,
              opacity: 1.0
            }));

            // Extend the bounds
            bounds.extend(pt);

            hasResults = true;
          }
        });

        if (hasResults) {
          this.map.fitBounds(bounds);  
        }

        // Reset the counter
        this.pointsUpdated = 0;
      }
    }
  });


  Y.GeocoderView = Backbone.View.extend({

    template: _.template($('#geocoder-result-template').html()),

    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    
    render: function() {
      var tmpl;
      if (this.model.has('error')) {
        tmpl = _.template( $("#geocoder-error-template").html(), this.model.toJSON() );
      } else {
        tmpl = _.template( $("#geocoder-result-template").html(), this.model.toJSON() );
      }

      $('.geocoder-result', '#'+this.model.get('type')).html(tmpl);
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