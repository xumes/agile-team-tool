var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /progress', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/progress')
      .expect(200, done);
  });
});
