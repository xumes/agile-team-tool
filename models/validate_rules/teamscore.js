module.exports.addTeamSchema = {
  _id: null,
  password: null,
  type: 'team',
  team_members: {},
  score: 0
};

module.exports.addTeamConstrains = {
  teamId: {
    presence: true
  },
  password: {
    presence: true
  }
};

module.exports.teamDataConstrains = {
  sites: {
  },
  mainSite: {
    presence: true
  }
};

module.exports.teamUpdateConstrains = {
  teamId: {
    presence: true,

  },
  sites: {
    presence: true
  },
  mainSite: {
    presence: true
  },
  score: {
    presence: true
  },
  password: {
    presence: true
  }
};

module.exports.teamUpdateSchema = {
  _id: null,
  _rev: null,
  password: null,
  team_members: {},
  type: 'team',
  score: 0
};
