var request = require('supertest');
var app     = require('../../../app');

describe('GET /assessment', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/assessment')
      .expect(200, done);
  });
});
