var React = require('react');

var IterationMetrics = React.createClass({
  getInitialState: function() {
    return {
      unitCostStoriesFTE: '',
      unitCostStoryPointsFTE: ''
    }
  },

  populateForm: function(data){
    var storiesFTE = '';
    var strPointsFTE = '';
    if (data != undefined && data != null){
      var fte = this.floatDefault(data.memberFte);
      if (fte > 0){
        storiesFTE = (this.numericValue(data.deliveredStories) / this.floatDefault(data.memberFte)).toFixed(1);

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
      return 0;
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
            <input type='text' id='unitCostStoriesFTE' size='21' value={this.state.unitCostStoriesFTE} placeholder='0.0' disabled className='inputCustom' />
          </span>
        </p>
        <p>
          <label for='unitCostStoryPointsFTE' style={labelStyle}>Unit cost - Story points per FTE:<span className='ibm-required'></span></label>
          <span>
            <input type='text' id='unitCostStoryPointsFTE' size='21' value={this.state.unitCostStoryPointsFTE} placeholder='0.0' disabled className='inputCustom' />
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
