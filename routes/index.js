// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

module.exports = {
  // route : handler
  'post /shapezipurl': 'register',
  'get /shapezipurl': 'index',
  'get /shapezipurl/:id/:file': 'getData',
  'get /shapezipurl/:id/:file/FeatureServer': 'featureserver',
  'get /shapezipurl/:id/:file/FeatureServer/:layer': 'featureserver',
  'get /shapezipurl/:id/:file/FeatureServer/:layer/:method': 'featureserver',
  
}
