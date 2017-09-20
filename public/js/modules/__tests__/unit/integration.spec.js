import integration from './../../integration';

// TODO: need to test for the dispatched action along with a state,
// rather than testing the reducer by itself.
describe('Reducer: integration', () => {
  const mockIntegration = {
    tool: 'RTC',
    server: 'myServer',
    teamName: 'myTeam',
    metrics: [],
  };

  it('should be able to update the tool name', () => {
    const action = { tool: 'Jira', type: 'UPDATE_TOOL' };
    const newState = integration.updateTool(mockIntegration, action);
    expect(newState.tool).toEqual('Jira');
  });

  it('should be able to update the server name', () => {
    const action = { server: 'foo', type: 'UPDATE_SERVER' };
    const newState = integration(mockIntegration, action);
    expect(newState.server).toEqual('foo');
  });

  it('should be able to update the team name', () => {
    const action = { teamName: 'bar', type: 'UPDATE_TEAM_NAME' };
    const newState = integration(mockIntegration, action);
    expect(newState.teamName).toEqual('bar');
  });

  it('should be able to add a metric to the metrics list', () => {
    const action = {
      metric: { metricType: 'foo', value: 100 },
      type: 'ADD_METRIC',
    };
    const newState = integration(mockIntegration, action);
    expect(newState.metrics.length).toBe(1);
  });

  it('should be able to remove a metric from the metrics list', () => {
    const createAction = {
      metric: { metricType: 'foo', value: 100 },
      type: 'ADD_METRIC',
    };
    const newState = integration(mockIntegration, createAction);

    const removeAction = {
      metricType: { metricType: 'foo' },
      type: 'REMOVE_METRIC',
    };

    const removed = integration(newState, removeAction);
    expect(removed.metrics).toBeUndefined();
  });
});
