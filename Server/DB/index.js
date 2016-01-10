var mysql = require('mysql');

module.exports = function (query, callback) {
  var dbConnection;
  dbConnection = mysql.createConnection({
    user: "root",  // Consider fixing for better db safety
    password: "bernie",
    database: "kcm"
  });
  dbConnection.connect(function (err) {
    if (err) {
      console.log('NO CONNECTIN', err);
    } else {
      dbConnection.query(query, function (err, results) {
        if (err) {
          console.log('Query fail',err);
          // db will not do call back if the query was bad. For now cannot expect errors in querying
        } else {
          callback(results);
        }
        dbConnection.end();
      });
    }
  });
}