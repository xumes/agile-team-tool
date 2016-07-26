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
  saml: {
    path: '/auth/sso/callback',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    issuer: 'https://w3id.sso.ibm.com/auth/sps/samlidp/saml20',
    entryPoint: process.env['samlEntrypoint'],
    cert: process.env['samlCert']
  },
  email: {
    SMTP_HOST: "host",
    PORT     : 3000,
    DOMAIN   : "domain",
    FROM     : "from@domain.com",
    EMAIL_APPKEY : "key"
  },
  prefixes: {
    team : 'ag_team_',
    iteration : 'ag_iterationinfo_',
    assessment : 'ag_mar_'
  },
  environment: process.env.deploy || 'SIT'
};