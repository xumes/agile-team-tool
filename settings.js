module.exports = {
  dbUrl: process.env.dbUrl || 'test.cloudant.com',
  ldapAuthURL: process.env.ldapAuthURL || 'http://ifundit-dp.tap.ibm.com:3004/auth',
  redisDb: {
    url: process.env.redisURL || 'redis://localhost:6379',
    prefix: process.env.redisPrefix || 'agileteamtool:'
  },
  secret: process.env.secret || 'thisshouldberandom',
  authType: process.env.authType || 'ldap-login',
  cloudant: {
	    userName: process.env['cloudantUserName'],
	    password: process.env['cloudantPassword'],
	    dbName: process.env['cloudantDbName']
  },
  email:{
    SMTP_HOST: "host",
    PORT     : 3000,
    DOMAIN   : "domain",
    FROM     : "from@domain.com",
    EMAIL_APPKEY : "key"
  }
};