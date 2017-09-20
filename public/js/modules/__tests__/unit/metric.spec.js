import metrics from './../../metrics';

// TODO: need to test for the dispatched action along with a state,
// rather than testing the reducer by itself.
xdescribe('Reducer: metric', () => {
  const mockMetric = {
    metricType: 'throughput',
    value: 100,
  };

  it('should be able to update the metric type', () => {
    const action = { metricType: 'stories', type: 'UPDATE_METRIC_TYPE' };
    const newState = metrics(mockMetric, action);
    expect(newState.metricType).toEqual('stories');
  });

  it('should be able to update the value', () => {
    const action = { value: 50, type: 'UPDATE_VALUE' };
    const newState = metrics(mockMetric, action);
    expect(newState.value).toEqual(50);
  });
});
