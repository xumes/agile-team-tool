var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /iteration', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/iteration')
      .expect(200, done);
  });
});
