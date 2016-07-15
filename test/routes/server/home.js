var request = require('supertest');
var app     = require('../../../app');

describe('GET /home', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/home')
      .expect(200, done);
  });
});
