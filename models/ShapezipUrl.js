var request = require('request');
var fs      = require('fs');
var exec = require('child_process').exec;
var config = require('./config.js');

var ShapezipUrl = function( koop ){

  var shapezipurl = {};
  shapezipurl.__proto__ = koop.BaseModel( koop );
  var datadir = koop.files.localDir + "/ShapezipUrl";
  fs.stat(datadir, function(err, stats){
	  if (err){
		  fs.mkdirSync(datadir);
	  }
  });
  
  
  // adds a service to the Cache.db
  // needs a host, generates an id 
  shapezipurl.register = function (id, host, callback) {
    var type = 'shapezipurl:url';
    koop.Cache.db.serviceCount( type, function (error, count) {
      id = id || count++;
      koop.Cache.db.serviceRegister( type, {'id': id, 'host': host},  function (err, success) {
        callback( err, id );
      });
    });
  };
  // get service by id, no id == return all
  shapezipurl.find = function( id, file, options,callBack ){
	  var options = options;
	  var callback = callBack;
    koop.Cache.db.serviceGet( 'shapezipurl:url', parseInt(id) || id, function(err, res){
		
      if (err){
        callback('No service table found for that id. Try POSTing {"id":"arcgis", "host":"http://www.arcgis.com"} to /jsonurl', null);
      } else {
        var type = 'ShapezipUrl';
		var dbId = id+":"+file;
		var host = res.host;
		// check the cache for data with this type & id 
		koop.Cache.get( type, dbId, options, function(err, entry ){
			
		  if ( err&& err!=='Not Found'){
			// if we get an err then get the data and insert it 
			var url = host + file; // <-- change this to point to a real URL
			console.log(url);
			request.get({url: url, encoding: 'binary'}, function (err, response, body) {
		      var workDir = [datadir, new Date().getTime() ].join('/')
			  fs.mkdirSync(workDir);
			  var fileName = [workDir, 'shape.zip'].join('/');
			  fs.writeFile(fileName, body, 'binary', function(err) {
				if(err)
				  console.log(err);
				else
				  console.log("The file was saved!");
			      var cmd = ['unzip', '-j', '"' + fileName + '"','-d ' + workDir].join(' ');
				  console.log(cmd);
				  exec(cmd, function (err) {
					if (err){ console.log(err); if (callback){ callback(err, null)}}
						else{
							fs.readdir(workDir, function(err, files){
								if (err){callback(err)}
								else{
									var filename = "";
									//only one shp supported per zip
									for (var i in files){
										console.log(files[i] +"_"+files[i].indexOf(".shp"));										
										if (files[i].indexOf(".shp")>1){
											filename = files[i];
											break;
										}										
									}
									if (filename===""){callback( "No shapefile found in zip", null);}
									else{									
										var shapefile = [workDir, filename].join('/');
										var geojson = shapefile+".geojson";										
										shapezipurl.convert(shapefile, geojson,type, dbId, 0, function(features){
											callback( null, [features] );
											shapezipurl.cleandir(workDir);
										});
									}
								}
							});
						}
				  });
			  }); 
			});
		  }
		  else {
				if (!entry && err==='Not Found'){entry = [{type: 'FeatureCollection',features: []}];}
				callback( null, entry );
			}
		});
      }
    });
  };
  shapezipurl.convert = function(shapefile, geojson, type, dbId, layerId, callback){
	var ogrcmd = ['ogr2ogr','-f "GeoJSON"', '-t_srs EPSG:4326', geojson, shapefile].join(' ');
	console.log(ogrcmd);
	exec(ogrcmd, function (err) {
		if (err){console.log(err); callback({type: 'FeatureCollection',features: []});}
			else{
				fs.readFile(geojson, 'utf8', function (err, data) {
					
				  if (err && (data ===undefined || data===null || data.length ===0) ) {console.log(err); callback({type: 'FeatureCollection',features: []});}
				  else{
					  var fs = JSON.parse(data);
					  console.log(fs.features.length);					  
						callback( fs );
						koop.Cache.insert( type, dbId, fs, layerId, function( err, success){
					  if (err){
						  console.log(err);
					  }
				  });
				  }
				  
				});
				
			}
	});
  }
  shapezipurl.cleandir = function(workdir){
	  fs.readdir(workdir, function(err, files){
		  for (var i  in files){
			fs.unlinkSync([workdir, files[i]].join('/'));
		  }
		  fs.rmdirSync(workdir);
	  });
	  
  }
  

  
  
  return shapezipurl;

};

module.exports = ShapezipUrl;
