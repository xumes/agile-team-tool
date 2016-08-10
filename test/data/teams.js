// dummy data
var crypto = require('crypto');
var teamsData = {
  user : {
    details : {
      shortEmail: 'Yanliang.Gu1@ibm.com',
      ldap:
        {
          serialNumber: '4G2830',
          hrFirstName: 'Yanliang',
          hrLastName: 'Gu'
        }
    }
  },
  teams : {
    validDoc : {
      name : 'Team document-' + crypto.randomBytes(20).toString('hex'),
      desc : 'team document description',
      squadteam : 'No'
    },
    invalidDoc : {
      name : '',
      desc : '',
      squadteam : 'YesNo'
    },
    validUpdateDoc : function(){
      return {
        name : 'Team document-' + crypto.randomBytes(20).toString('hex'),
        desc : 'Updated Team Description',
        squadteam : 'No',
        created_user : teamsData.user.details['shortEmail']
      };
    }
  },
  userDetails :{
    valid : function(){
      return {
        shortEmail: 'Yanliang.Gu1@ibm.com',
        ldap:
          {
            serialNumber: '4G2830',
            hrFirstName: 'Yanliang',
            hrLastName: 'Gu'
          }
      };
    },
    invalid : function(){
      return {
        shortEmail: 'invalid-user@ibm.com',
        ldap:
          {
            serialNumber: '123456PH1',
            hrFirstName: 'John',
            hrLastName: 'Doe'
          }
      };
    }
  },
  associate : {
    invalidUser : function(){
      return 'invalid-user@ibm.com';
    },
    validUser : function(){
      return teamsData.user.details.shortEmail;
    },
    validDoc : function(){
        return {
          name : 'Team document-' + crypto.randomBytes(20).toString('hex'),
          desc : 'team document description',
          squadteam : 'No'
        };
    }
  }
};

module.exports = teamsData;
