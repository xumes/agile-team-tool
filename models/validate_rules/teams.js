exports.teamDocRules = {
  name : {
    presence : {
      presence: true,
      message: "^Team name cannot be blank.  Please enter a team name."
    }
  },
  desc : {
    presence : false,
    length : {
      maximum : 200
    }
  },
  squadteam : {
    presence : {
      presence: true ,
      message: "^Indicate if this is a squad team or not."
    },
    inclusion: {
      within: ["Yes", "No"],
      message: "^Indicate 'Yes' if this is a squad team, 'No' if otherwise."
    }
  },
  created_user : {
    presence : true,
    email : true
  },
  doc_status : {
    inclusion : ['delete', '']
  }};