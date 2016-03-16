var models = require('../Models');

module.exports = {
  'routes': {
    get: function (req, res) {
      models.routes.get(req, res);
    },
    post: function (req, res) {
      models.routes.post(req.body, res);
    },
    delete: function (req, res) {
      models.routes['delete'](req.body, res);
    },
    put: function (req, res) {
      models.routes.put(req.body, res);
    }
  },
  'shapes': {
    get: function (req, res) {
      models.shapes.get(req.params.shape_id, res);
    },
    post: function (req, res) {
      models.shapes.post(req.body, res);
    },
    put: function (req, res) {
      models.shapes.put(req.body, res);
    },
    delete: function (req, res) {
      
    },
  },
  'roads': {
    get: function (req, res) {
      console.log('here');
      models.roads.get(req, res);
    },
    post: function (req, res) {
      models.roads.post(req.body, res);
    },
    put: function (req, res) {
      models.roads.put(req.body, res);
    },
    delete: function (req, res) {
      
    }
  }
}