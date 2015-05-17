///<reference path="jquery.d.ts"/>
declare var $:JQueryStatic;

interface GeoJsonPoint {
	name: string;
	description: string;
	coordinates: string;
}

var EMOJI_SADFACE:string = '&#128542;';
var EMOJI_TARGET:string = '&#127919;';
var EMOJI_SEARCH:string = '&#128269;';

var currentPosition:Position;

$(function() {

	function geolocSuccess(position:Position) {
		$('#status').html(EMOJI_SEARCH);
		currentPosition = position;
		var queryParams:any = {lat:position.coords.latitude,lng:position.coords.longitude};
		$.ajax("http://crowdhealth.herokuapp.com/api/v1/nearest/4",{data:queryParams}).done(function(data) {
			$('#status').empty();
			$('#results').empty();
			maximum = 5;
			addResultsFromGeoJson(data);
		})
	}

	function geolocError(err:PositionError) {
		$('#status').html(EMOJI_SADFACE);
	}

	if (navigator.geolocation) {
		$('#status').html(EMOJI_TARGET);
		navigator.geolocation.getCurrentPosition(geolocSuccess, geolocError);
	}

	var maximum:number;

	function addResult(point:Array<number>, title:string, description:string) {
		if (maximum < 0) return;
		maximum--;
		var result:JQuery = $($('#TMPL_RESULT').html());
		var latLon:string = point[1]+','+point[0];
		var curLatLon:string = currentPosition.coords.latitude+','+currentPosition.coords.longitude;
		result.find('.title').html(title);
		result.find('.description').html(description);
		result.find('img').attr('src','https://maps.googleapis.com/maps/api/staticmap?center='+latLon+'&zoom=17&size=2000x2000&markers='+latLon);
		var uri:string = 'http://maps.apple.com/?daddr='+latLon+'&saddr='+curLatLon;
		if (navigator.userAgent.indexOf('(Android;') != -1)
			uri = 'geo:'+latLon+'?q='+latLon;
		result.find('a').prepend(EMOJI_TARGET).attr('href', uri);
		$('#results').append(result);
	}

	function addResultsFromGeoJson(geojson:any) {
		if (geojson.type == "FeatureCollection")
			geojson.features.forEach(addResultsFromGeoJson);
		else if ((geojson.type == "Feature") && (geojson.geometry.type == "Point")) {
			addResult(geojson.geometry.coordinates, geojson.properties.name, geojson.properties.description);
		}
	}

});
