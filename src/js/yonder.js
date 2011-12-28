$(function(){
	var initMap = function() {
		var map = new L.Map('map');
				
		var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/fa2b7d4057c846daa7691c7995240bd5/997/256/{z}/{x}/{y}.png',
			cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
			cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});

		map.setView(new L.LatLng(0, 0), 2).addLayer(cloudmade);
	};

	initMap();

	Yonder.listView = new Yonder.GeocoderListView();
});