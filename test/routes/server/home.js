var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /home', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/home')
      .expect(200, done);
  });
});
