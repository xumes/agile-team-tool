// dummy data
var crypto = require('crypto');
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
      squadteam : 'No',
      testdata : 'Yes'
    },
    validSquadDoc : {
      name : 'Team document-' + crypto.randomBytes(20).toString('hex'),
      desc : 'team document description',
      squadteam : 'Yes'
    },
    invalidDoc : {
      name : '',
      desc : '',
      squadteam : 'YesNo'
    },
    invalidId : function(){
      return 'id_' + crypto.randomBytes(20).toString('hex');
    },
    validUpdateDoc : function(){
      return {
        name : 'Team document-' + new Date().getTime(),
        desc : 'Updated Team Description',
        squadteam : 'No',
        created_user : dummy.user.details['shortEmail'],
        testdata : 'Yes'
      };
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
      return dummy.user.details.shortEmail;
    },
    validDoc : function(){
        return {
          name : 'Team document-' + new Date().getTime(),
          desc : 'team document description',
          squadteam : 'No',
          testdata : 'Yes'
        };
    }
  },
  index: {
    indexDocument : {
      lookup: [
        {
          _id : 'teamZZZ',
          name: 'Team ZZZ',
          squadteam: 'No',
          parents: [],
          children: []
        }
      ]
    },
    teamAssociations : [
      {
        _id : 'teamA',
        name: 'Team A',
        squadteam: 'No',
        doc_status: '',
        newParentId: '',
        oldParentId: ''
      },
      {
        _id : 'teamB',
        name: 'Team B',
        squadteam: 'No',
        doc_status: '',
        newParentId: '',
        oldParentId: ''
      },
      {
        _id : 'teamC',
        name: 'Team C',
        squadteam: 'No',
        doc_status: '',
        newParentId: '',
        oldParentId: ''
      },
      {
        _id : 'teamD',
        name: 'Team D',
        squadteam: 'No',
        doc_status: '',
        newParentId: '',
        oldParentId: ''
      },
      {
        _id : 'teamE',
        name: 'Team E',
        squadteam: 'No',
        doc_status: '',
        newParentId: '',
        oldParentId: ''
      }
    ]
  }
};

module.exports = dummy;
