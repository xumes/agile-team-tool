var fs = require('fs');

render = function(req, res, file, json) {
  //can add stuff to json here if needed
  return res.render(file, json);
};

module.exports = function(app, passport) {
  var includes = {
    passport: passport,
    render: render
  };
  fs.readdirSync("./routes/server").forEach(function(file) {
    require("./server/" + file)(app, includes);
  });
  fs.readdirSync("./routes/api").forEach(function(file) {
    require("./api/" + file)(app, includes);
  });
};
