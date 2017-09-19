import teamIntegration, * as teamIntegrationOptions from './../../team-integration';

describe('Reducer: team-integration', () => {
  const mockIntegration = {
    tool: 'RTC',
    server: 'myServer',
    teamName: 'myTeam',
    metrics: [],
  };

  it('should be able to update the tool name', () => {
    const action = { tool: 'Jira', type: teamIntegrationOptions.UPDATE_TOOL };
    const newState = teamIntegration(mockIntegration, action);
    expect(newState.tool).toEqual('Jira');
  });

  it('should be able to update the server name', () => {
    const action = { server: 'foo', type: teamIntegrationOptions.UPDATE_SERVER };
    const newState = teamIntegration(mockIntegration, action);
    expect(newState.server).toEqual('foo');
  });

  it('should be able to update the team name', () => {
    const action = { teamName: 'bar', type: teamIntegrationOptions.UPDATE_TEAM_NAME };
    const newState = teamIntegration(mockIntegration, action);
    expect(newState.teamName).toEqual('bar');
  });

  it('should be able to add a metric to the metrics list', () => {
    const action = {
      metric: { metricType: 'foo', value: 100 },
      type: teamIntegrationOptions.ADD_METRIC,
    };
    const newState = teamIntegration(mockIntegration, action);
    expect(newState.metrics.length).toBe(1);
  });

  it('should be able to remove a metric from the metrics list', () => {
    const createAction = {
      metric: { metricType: 'foo', value: 100 },
      type: teamIntegrationOptions.ADD_METRIC,
    };
    const newState = teamIntegration(mockIntegration, createAction);

    const removeAction = {
      metricType: { metricType: 'foo' },
      type: teamIntegrationOptions.REMOVE_METRIC,
    };

    const removed = teamIntegration(newState, removeAction);
    expect(removed.metrics).toBeUndefined();
  });
});
