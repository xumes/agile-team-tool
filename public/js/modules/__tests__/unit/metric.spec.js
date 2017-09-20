import metric, * as metricOptions from './../../metric';

describe('Reducer: metric', () => {
  const mockMetric = {
    metricType: 'throughput',
    value: 100,
  };

  it('should be able to update the metric type', () => {
    const action = { metricType: 'stories', type: metricOptions.UPDATE_METRIC_TYPE };
    const newState = metric(mockMetric, action);
    expect(newState.metricType).toEqual('stories');
  });

  it('should be able to update the value', () => {
    const action = { value: 50, type: metricOptions.UPDATE_VALUE };
    const newState = metric(mockMetric, action);
    expect(newState.value).toEqual(50);
  });
});
