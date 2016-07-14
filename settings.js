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
	    cloudantUsername: process.env['cloudantDbAccount'] || 'wiltinkingedgazedinglant',
	    cloudantPassword: process.env['cloudantDbPassword'] || '494ff4d4a882423ce77a3f5838150d343e3bbe51',
	    cloudantDbName: process.env['cloudantDbName'] || 'agildash_prod_may13'
  }
};