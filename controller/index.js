
var Controller = function( ShapezipUrl, BaseController ){

  // inherit from the base controller to share some logic 
  var controller = {};
  controller.__proto__ = BaseController();

  // respond to the root route
  controller.index = function(req, res){
    res.send('This is a JSON URL provider. ');
  };

  // Registers a host with the given id 
  controller.register = function(req, res){
    if ( !req.body.host ){
      res.status(400).send('Must provide a host to register'); 
    } else { 
      ShapezipUrl.register( req.body.id, req.body.host, function(err, id){
        if (err) {
          res.status(400).send( err );
        } else {
          res.json({ 'serviceId': id });
        }
      });
    }
  };
  
  controller.getData = function(req,res){
	   ShapezipUrl.find(req.params.id, req.params.file, req.query, function(err, data){
	   if ( err ){
          res.json( err, 500 );
		  return
	   }
	   else {
		res.json( data );
	  }
	  });
  };
  
  // use the shared code in the BaseController to create a feature service
  controller.featureserver = function(req, res){
    var callback = req.query.callback, self = this;
    delete req.query.callback;
	req.query.layer = req.params.layer;

    ShapezipUrl.find(req.params.id, req.params.file, req.query, function(err, data){
      if (err) {
        res.send(err, 500);
      } else {
        // we remove the geometry if the "find" method already handles geo selection in the cache
        delete req.query.geometry;
        // inherited logic for processing feature service requests 
        try{
			controller.processFeatureServer( req, res, err, data, callback);
		}
		catch(e){console.log(JSON.stringify(e))}
      }
    });
  };

  // render templates and views 
  controller.preview = function(req, res){
    res.render(__dirname + '/../views/demo', { locals:{ id: req.params.id } });
  }
  
  // return the controller so it can be used by koop
  return controller;

};

module.exports = Controller;

