exports.teamDocRules = {
  name : {
    presence : true
  },
  desc : {
    presence : true,
    length : {
      maximum : 200
    }
  },
  squadteam : {
    presence : true ,
    inclusion : [ 'Yes', 'No']
  },
  created_user : {
    presence : true,
    email : true
  },
  doc_status : {
    inclusion : ['delete', '']
  }};