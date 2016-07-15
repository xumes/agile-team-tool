var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /help', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/help')
      .expect(200, done);
  });
});
