
const fs = require('fs');
const auth = require('../middleware/auth');

const middleware = {
  auth,
};

const render = (req, res, file, json) => {
  const resJson = json;
  // can add stuff to json here if needed
  resJson.siteTitle = 'Agile Team Tool';
  resJson.user = req.session.user;
  resJson.userEmail = req.user;
  return res.render(file, resJson);
};

module.exports = (app, passport) => {
  const includes = {
    passport,
    render,
    middleware,
  };
  fs.readdirSync('./routes/server').forEach((file) => {
    require(`./server/${file}`)(app, includes);// eslint-disable-line
  });
  fs.readdirSync('./routes/api').forEach((file) => {
    require(`./api/${file}`)(app, includes);// eslint-disable-line
  });
  fs.readdirSync('./routes/v1').forEach((file) => {
    require(`./v1/${file}`)(app, includes);// eslint-disable-line
  });
};
