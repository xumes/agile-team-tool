var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /report', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/report')
      .expect(200, done);
  });
});
