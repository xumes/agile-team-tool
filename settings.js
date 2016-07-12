module.exports = {
  dbUrl: process.env.dbUrl || 'test.cloudant.com',
  ldapAuthURL: process.env.ldapAuthURL || '',
  redisDb: {
    url: process.env.redisURL || 'redis://localhost:6379',
    prefix: process.env.redisPrefix || 'agileteamtool:'
  },
  secret: process.env.secret || 'thisshouldberandom',
  authType: process.env.authType || 'ldap-login'
};