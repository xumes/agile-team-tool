var request = require('supertest');
var app     = require('../../../app');

xdescribe('GET /maturityTrends', function() {
  it('should respond with HTML', function(done) {
    request(app)
      .get('/maturityTrends')
      .expect(200, done);
  });
});
