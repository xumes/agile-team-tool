var chai    = require('chai');
var expect  = chai.expect;
var app     = require('../../../app');
var request = require('supertest');
var _       = require('underscore');
var util    = require('../../../helpers/util')
var agent   = request.agent(app);

// do the login befre testing
before(function(done) {
  agent
    .get('/api/login/masquerade/john.doe@ph.ibm.com')
    .send()
    .end(function(err, res) {
      if (err) throw err;
      agent.saveCookies(res);
      done();
    })
});


describe('Email API Test [POST /email/feedback]: send email to winnuser@us.ibm.com', function(){
  it("send email to winnuser", function(done){
    var req = request(app).post('/email/feedback');
    agent.attachCookies(req);
    req.send({feedback_page: "test page", 
              feedback_teamName: "test team", 
              feedback: "test feedback text", 
              feedback_sender: "test@agiletool.ibm.com",
              feedback_senderName: "mr.tester",
              test_recipient: "winnuser@us.ibm.com"
            });
    req.expect(200)
    .end(function(err, res){
      expect(res.text).to.contain("Thank you for your feedback!");
      done();
    });
  });
});
