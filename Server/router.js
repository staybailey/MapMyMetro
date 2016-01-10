var router = require('express').Router();
var controllers = require('./Controllers');

for (var route in controllers) {
  router.route('/' + route)
    .get(controllers[route].get) // On get request the router will call this function for the route
    .post(controllers[route].post)
    .put(controllers[route].put)
    ['delete'](controllers[route]['delete'])
}

module.exports = router;