// dummy data
var crypto = require('crypto');
var teamsData = {
  user: {
    details: {
      shortEmail: 'Yanliang.Gu1@ibm.com',
      ldap: {
        serialNumber: '4G2830',
        hrFirstName: 'Yanliang',
        hrLastName: 'Gu'
      }
    }
  },
  teams: {
    validDoc: {
      name: 'Team document-' + crypto.randomBytes(20).toString('hex'),
      desc: 'team document description',
      squadteam: 'No'
    },
    invalidDoc: {
      name: '',
      desc: '',
      squadteam: 'YesNo'
    },
    validUpdateDoc: function() {
      return {
        name: 'Team document-' + crypto.randomBytes(20).toString('hex'),
        desc: 'Updated Team Description',
        squadteam: 'No',
        created_user: teamsData.user.details['shortEmail']
      };
    },
    validMembers : function(){
      return [
        {
          key: '678910PH1',
          id: 'jane.doe@ph.ibm.com',
          name: 'Jane Doe',
          role: 'Developer',
          allocation: 100
        }
      ];
    }
  },
  userDetails: {
    valid: function() {
      return {
        shortEmail: 'Yanliang.Gu1@ibm.com',
        ldap: {
          serialNumber: '4G2830',
          hrFirstName: 'Yanliang',
          hrLastName: 'Gu'
        }
      };
    },
    invalid: function() {
      return {
        shortEmail: 'invalid-user@ibm.com',
        ldap: {
          serialNumber: '123456PH1',
          hrFirstName: 'John',
          hrLastName: 'Doe'
        }
      };
    }
  },
  associate: {
    invalidUser: function() {
      return 'invalid-user@ibm.com';
    },
    validUser: function() {
      return teamsData.user.details.shortEmail;
    },
    validDoc: function() {
      return {
        name: 'Team document-' + crypto.randomBytes(20).toString('hex'),
        desc: 'team document description',
        squadteam: 'No'
      };
    }
  },
  indexDocument: {
    lookup: [{
      _id: 'teamZZZ',
      name: 'Team ZZZ',
      squadteam: 'No',
      parents: [],
      children: []
    }]
  },
  teamAssociations: [{
    _id: 'teamA',
    name: 'Team A',
    squadteam: 'No',
    doc_status: '',
    newParent: '',
    oldParent: ''
  }, {
    _id: 'teamB',
    name: 'Team B',
    squadteam: 'No',
    doc_status: '',
    newParent: '',
    oldParent: ''
  }, {
    _id: 'teamC',
    name: 'Team C',
    squadteam: 'No',
    doc_status: '',
    newParent: '',
    oldParent: ''
  }, {
    _id: 'teamD',
    name: 'Team D',
    squadteam: 'No',
    doc_status: '',
    newParent: '',
    oldParent: ''
  }, {
    _id: 'teamE',
    name: 'Team E',
    squadteam: 'No',
    doc_status: '',
    newParent: '',
    oldParent: ''
  }],
};

module.exports = teamsData;
