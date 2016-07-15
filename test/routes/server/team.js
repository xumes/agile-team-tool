var request = require('supertest');
var app     = require('../../../app');

describe('GET /team', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/team')
      .expect(200, done);
  });
});
