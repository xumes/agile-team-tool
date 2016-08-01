var settings = require("../../settings.js");
var _ = require("underscore");
var request = require("request");
var logger = require("../../middleware/logger.js")

SMTP_HOST    = settings.email.smtpHost;
EMAIL_APPKEY = settings.email.smtpApplicationKey;

var sendRequest = function(emailObj, cb) {
  var params = emailObj;
  options = {
    url: SMTP_HOST,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: params,
    json: true,
    agentOptions: {
      rejectUnauthorized: false
    }
  };
  logger.get('api').info('Sending email');

  return request(options, function(error, response, body) {
    var obj;
    /* istanbul ignore else  */
    if (_.isEmpty(error)){
      logger.get('api').info('%s, Email sent to: %s', response.statusCode, emailObj.sendTo);
      cb(null, "Email sent to: " + emailObj.sendTo);
    }
    else {
      logger.get('api').error('Email failure: %s', JSON.stringify(error));
      cb(JSON.stringify(error), null);
    }
  });
};

var processFeedbackRequest = function(req, res) {
  emailObj = {
    body: "Regarding page: "+ req.body.feedback_page + 
          "\nTeam:"+req.body.feedback_teamName+
          "\n\n" + req.body.feedback,
    from: req.body.feedback_sender,
    sendTo: req.body.feedback_recipient,
    subject: "Feedback for the Agile Team Tool",
    applicationKey: EMAIL_APPKEY
  };  
  sendRequest(emailObj, function(error, result){
    /* istanbul ignore else  */
    if(_.isEmpty(error))
      res.status(200).send("Thank you! \n Your feedback has been sent successfully.");
    else
      res.status(500).send(":( There was a problem sending your feedback. Kindly contact the system administrator: agileteamtool@ibm.com");
  });
};

module.exports = function(app, includes) {
  app.post("/email/feedback", [includes.middleware.auth.requireLogin], processFeedbackRequest);
};
