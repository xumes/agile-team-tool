var chai = require('chai');
var expect = chai.expect;
var eamilApi = require('../../../routes/api/email');
var app = require('../../../app');
var request = require('supertest');
var timeout = 30000;
// 
// describe('Email API: send a feedback',function(){
//   it('it will return a successfully info for sending a feedback', function(done){
//     request(app)
//       .post('/email/feedback')
//       .expect(200,":( There was a problem sending your feedback. Kindly contact the system administrator: agileteamtool@ibm.com",done);
//   });
// });
