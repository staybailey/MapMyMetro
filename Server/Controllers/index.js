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
      models.routes.put(req, res);
    }
  }
}