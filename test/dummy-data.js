// dummy data

var dummy = {
  user : {
    details : {
      shortEmail: 'john.doe@ph.ibm.com',
      ldap:
        { 
          serialNumber: '123456PH1',
          hrFirstName: 'John',
          hrLastName: 'Doe'
        } 
    }
  },
  teams : {
    validDoc : {
      name : 'Team document-' + new Date().getTime(),
      desc : 'team document description',
      squadteam : 'No'
    },
    invalidDoc : {
      name : '',
      desc : '',
      squadteam : 'YesNo'
    }
  },
  userDetails :{
    valid : function(){
      return {
        shortEmail: 'john.doe@ph.ibm.com',
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
      return dummy.user.details.shortEmail;
    },
    validDoc : function(){
      return {
        name : 'Team document-' + new Date().getTime(),
        desc : 'team document description',
        squadteam : 'No'
      };
    }
  }
};

module.exports = dummy;