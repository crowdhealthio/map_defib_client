///<reference path="jquery.d.ts"/>
declare var $:JQueryStatic;

interface GeoJsonPoint {
	name: string;
	description: string;
	coordinates: string;
}

$(function() {
	
	function geolocSuccess(position:Position) {
		$('#search').val(position.coords.latitude +","+ position.coords.longitude);
	}
	
	function geolocError(err:PositionError) {
		console.log("error", err);
	}
	
	if (navigator.geolocation)
		$('button.dogeoloc').removeAttr('disabled');
	
	$('button.dogeoloc').click(function() {
		navigator.geolocation.getCurrentPosition(geolocSuccess, geolocError);
	});
	
	$('button.dosearch').click(function() {
		$('button.dosearch').html('&#9203;').attr('disabled');  //wait cursor
		$.ajax("http://crowdhealth.herokuapp.com/api/v1/types/Defibrillator").done(function(data) {
			$('button.dosearch').html('&#128269;').removeAttr('disabled');  //search icon
			$('#results').empty();
			maximum = 5;
			addResultsFromGeoJson(data);
		})
	});
	
	var maximum:number;
	
	function addResult(point:Array<number>, title:string, description:string) {
		if (maximum < 0) return;
		maximum--;
		var result:JQuery = $($('#TMPL_RESULT').html());
		var latlon:string = point[1]+','+point[0];
		result.find('.title').html(title);
		result.find('.description').html(description);
		result.find('img').attr('src','https://maps.googleapis.com/maps/api/staticmap?center='+latlon+'&zoom=17&size=200x200&markers='+latlon);
		$('#results').append(result);
	}
	
	function addResultsFromGeoJson(geojson:any) {
		//console.log(geojson);
		if (geojson.type == "FeatureCollection")
			geojson.features.forEach(addResultsFromGeoJson);
		else if ((geojson.type == "Feature") && (geojson.geometry.type == "Point")) {
			addResult(geojson.geometry.coordinates, geojson.properties.name, geojson.properties.description);
		}
	}
	
});