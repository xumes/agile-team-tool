import teams, * as teamOptions from './../../teams';

describe('Reducer: teams', () => {
  const teamsList = [];
  const mockTeam = {
    name: 'My Team',
    role: 'Squad',
    allocation: 1,
    userId: 'elmo',
    email: 'elmo@sesame.street.org',
    workTime: 50,
  };

  it('should be able to create a new team in the team list', () => {
    const action = { ...mockTeam, type: teamOptions.ADD_TEAM };
    expect(teams(teamsList, action)).toEqual([mockTeam]);
  });

  it('should be able to remove a team from the team list', () => {
    teamsList.push(mockTeam);

    const action = { name: 'My Team', type: teamOptions.REMOVE_TEAM };
    const newList = teams(teamsList, action);

    expect(newList.find(team => team.name === action.name)).toBeUndefined();
  });
});
