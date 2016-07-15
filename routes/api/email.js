var settings = require("../../settings.js");

SMTP_HOST    = settings.email.smtpHost;
PORT         = settings.email.smtpPort;
DOMAIN       = settings.email.domain;
FROM         = settings.email.from;
EMAIL_APPKEY = settings.email.applicationKey;

module.exports = function(app, includes) {

  var sendRequest = function(emailInfo, cb) {
    var cert, certFile, info, key, keyFile, options, params;
    info = emailInfo.emailInfo;
    params = JSON.parse(JSON.stringify(emailInfo.emailInfo));
    cert = config.getCertificate().cert;
    key = config.getCertificate().key;
    certFile = fs.readFileSync(path.resolve(cert));
    keyFile = fs.readFileSync(path.resolve(key));
    options = {
      url: SMTP_HOST,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: params,
      json: true,
      agentOptions: {
        cert: certFile,
        key: keyFile,
        rejectUnauthorized: false
      }
    };
    console.log(">>> sending an email now to " + info.title);
    return request(options, function(error, response, body) {
      var obj;
      if (!error && ((response != null ? response.statusCode : void 0) === 200 || (response != null ? response.statusCode : void 0) === 202)) {
        console.log('>>>', "Mail sent to " + info.title);
        obj = {
          data: JSON.stringify(emailInfo),
          module: 'email'
        };
        return cb(null, ">>> Mail sent to " + info.title);
      } else {
        if (info.sendTo != null) {
          console.log('>>>', "Cannot send email " + info.sendTo + " " + error + " " + (response != null ? response.statusCode : void 0) + "...requeuing again");
        }
        else {
          console.log('>>>', 'Cannot send email since sendTo is empty...dropping request');
        }
        cb("Cannot send email " + (JSON.stringify(info)) + "...error:" + error + "...code:" + (response != null ? response.statusCode : void 0) + "...body:" + body + "...options:" + (JSON.stringify(options)), null);
      }
    });
  };
  
  processFeedbackRequest = function(req, res) {
    console.log(JSON.stringify(req));
    
    var conf, info;
    if (!isEnabled) {
      return false;
    }
    emailInfo = emailInfo;
    emailInfo.title = emailInfo.sendTo + " : " + emailInfo.subject;
    emailInfo.tries = EMAIL_RETRIES;
    emailInfo.applicationKey = EMAIL_APPKEY;
    info = {
      emailInfo: emailInfo
    };
    
    sendRequest(emailInfo, function cb(){});
  };

  app.post("/email/feedback", [includes.middleware.auth.requireLogin], processFeedbackRequest);
};