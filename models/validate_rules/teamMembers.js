/*
 {
  key: "531994897",
  id: "bfouts@us.ibm.com",
  name: "Victor B. Fouts",
  allocation: 100,
  role: "Team Lead"
  }
*/

exports.teamMemberRules = {
  key: {
    presence: {
      presence: true,
      message: '^Employee serial number is required.'
    }
  },
  id: {
    presence: {
      presence: true,
      message: '^Employee email address is required.'
    },
    email: true
  },
  name: {
    presence: {
      presence: true,
      message: '^Employee name is required.'
    }
  },
  allocation: {
    presence: {
      presence: true,
      message: '^Allocation must be between 0 to 100.'
    },
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 100
    }
  },
  role: {
    presence: {
      presence: true,
      message: '^Employee serial number is required.'
    }
  }
};

