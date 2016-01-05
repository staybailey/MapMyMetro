var models = require('../Models');

module.exports = {
  routes: {
    get: function (req, res) {
      models.routes.get(req, res);
    }
    post: function (req, res) {
      models.routes.post(req.data, res);
    }
    delete: function (req, res) {
      models.routes['delete'](req.data, res);
    }
    put: function (req, res) {
      models.routes.put(req, res);
    }
  }
}