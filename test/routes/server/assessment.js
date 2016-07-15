var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /assessment', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/assessment')
      .expect(200, done);
  });
});
