const _ = require('underscore');
const request = require('request');
const logger = require('../../middleware/logger.js');
const settings = require('../../settings.js');
const moment = require('moment');
const async = require('async');

const SMTP_HOST = settings.email.smtpHost;
const EMAIL_APPKEY = settings.email.smtpApplicationKey;
const FEEDBACK_FROM = 'noreply@agile-team-tool.ibm.com';
const FEEDBACK_RECIPIENTS = 'esumner@us.ibm.com,chunge@us.ibm.com,jarias@us.ibm.com';

const sendRequest = (emailObj, cb) => {
  const params = emailObj;
  const options = {
    url: SMTP_HOST,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: params,
    json: true,
    agentOptions: {
      rejectUnauthorized: false,
    },
  };
  logger.get('api').verbose('Sending email');

  return request(options, (error, response) => {
    /* istanbul ignore else  */
    if (_.isEmpty(error)) {
      logger.get('api').verbose('%s, Email sent to: %s', response.statusCode, emailObj.sendTo);
      cb(null, `Email sent to: ${emailObj.sendTo}`);
    } else {
      logger.get('api').error('Email failure: %s', JSON.stringify(error));
      cb(JSON.stringify(error), null);
    }
  });
};

const processFeedbackRequest = (req, res) => {
  const emails = [];
  // admin email
  emails.push({
    html: `<b>Sent by:</b> ${req.body.feedback_senderName} &lt;${req.body.feedback_sender}&gt;\
    <br><b>Date submitted:</b> ${moment.utc().format('MMMM Do YYYY, h:mm a')} GMT\
    <br><b>Area:</b> ${req.body.feedback_page}\
    <br><b>Team name:</b> ${req.body.feedback_teamName}\
    <br><br><b>Text of feedback:</b> \
    <br>${req.body.feedback}`,
    from: FEEDBACK_FROM,
    // test_recipient will override the sendTo for unit tests
    sendTo: req.body.test_recipient || FEEDBACK_RECIPIENTS,
    subject: 'Agile Team Tool Feedback',
    applicationKey: EMAIL_APPKEY,
  });
  // user email
  emails.push({
    html: `Thank you for your feedback about the Agile Team Tool, submitted on: ${moment.utc().format('MMMM Do YYYY, h:mm a')} GMT. We appreciate your comments! \
    <br><br>As a reminder, here is what you told us:\
    <br><b>Area:</b> ${req.body.feedback_page}\
    <br><b>Team name:</b> ${req.body.feedback_teamName}\
    <br><br><b>Message:</b>\
    <br>${req.body.feedback}\
    <br><br>From, <br> The Agile Academy<br> Have more to tell us? Please visit our <a href='https://w3-connections.ibm.com/forums/html/forum?id=d0e31d40-ff11-4691-bc65-c0d95bc0c426'>forum</a>.`,
    from: FEEDBACK_FROM,
    // test_recipient will override the sendTo for unit tests
    sendTo: req.body.test_recipient || req.body.feedback_sender,
    subject: 'Agile Team Tool Feedback',
    applicationKey: EMAIL_APPKEY,
  });

  async.each(emails, (email, callback) => {
    sendRequest(email, (error) => {
      /* istanbul ignore else  */
      if (_.isEmpty(error)) { callback(); } else { callback(error); }
    });
  }, (error) => {
    if (_.isEmpty(error)) { res.status(200).send("<h3 class='ibm-bold'>Thank you for your feedback!</h3> Your input helps us improve the Agile Team Tool."); } else {
      /* istanbul ignore next  */
      logger.get('api').verbose(`ERROR: ${JSON.stringify(error)}`);
      /* istanbul ignore next  */
      res.status(500).send('There was a problem sending your feedback. Please visit our forum: https://w3-connections.ibm.com/forums/html/forum?id=d0e31d40-ff11-4691-bc65-c0d95bc0c426');
    }
  });
};

module.exports = (app, includes) => {
  app.post('/email/feedback', [includes.middleware.auth.requireLogin], processFeedbackRequest);
};
