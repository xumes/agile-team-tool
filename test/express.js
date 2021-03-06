var request = require('supertest');
var app = require('../app');

describe('GET /', function() {
  it('should be redirected', function(done) {
    request(app)
      .get('/')
      .expect(302, done);
  });
});

describe('GET /login', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /logout', function() {
  it('should redirect to /login', function(done) {
    request(app)
      .get('/logout')
      .expect(302, done);
  });
});

describe('GET /undefined-none-existing-route', function() {
  it('should respond with 404', function(done) {
    request(app)
      .get('/undefined-none-existing-route')
      .expect(404, done);
  });
});
