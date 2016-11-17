var React = require('react');

var IterationMetrics = React.createClass({
  getInitialState: function() {
    return {
      unitCostStoriesFTE: '0.0',
      unitCostStoryPointsFTE: '0.0'
    }
  },

  populateForm: function(data, state){
    var storiesFTE = '0.0';
    var strPointsFTE = '0.0';
    if (data != undefined && data != null){
      if (data.memberFte != null && data.deliveredStories != null) {
        storiesFTE = (this.numericValue(data.deliveredStories) / this.floatDefault(data.memberFte)).toFixed(1);
      }
      if (data.storyPointsDelivered != null && data.memberFte != null) {
        strPointsFTE = (this.numericValue(data.storyPointsDelivered) / this.floatDefault(data.memberFte)).toFixed(1);
      }
    }

    this.setState({
        unitCostStoriesFTE: storiesFTE,
        unitCostStoryPointsFTE: strPointsFTE
      });
  },

  updateField: function(field, value){
    if (field === 'unitCostStoriesFTE'){
      this.setState({unitCostStoriesFTE: this.floatDefault(value).toFixed(1)});
    }
    else if (field == 'unitCostStoryPointsFTE'){
      this.setState({unitCostStoryPointsFTE: this.floatDefault(value).toFixed(1)});
    }
  },

  numericValue:function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  },

  floatDefault:function(num) {
    var value = parseFloat(num);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return '0.0';
    }
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '470px'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Iteration metrics (calculated values)</h2>
        <p>
          <label for='unitCostStoriesFTE' style={labelStyle}>Unit cost - Stories per FTE:<span className='ibm-required'></span></label>
          <span>
            <input id='unitCostStoriesFTE' size='21' value={this.state.unitCostStoriesFTE} placeholder='0.0' disabled className='inputCustom' />
          </span>
        </p>
        <p>
          <label for='unitCostStoryPointsFTE' style={labelStyle}>Unit cost - Story points per FTE:<span className='ibm-required'></span></label>
          <span>
            <input id='unitCostStoryPointsFTE' size='21' value={this.state.unitCostStoryPointsFTE} placeholder='0.0' disabled className='inputCustom' />
          </span>
        </p>
        <div className='ibm-rule ibm-alternate-1'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationMetrics;
