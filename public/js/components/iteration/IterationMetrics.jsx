var React = require('react');

var IterationMetrics = React.createClass({
  getInitialState: function() {
    return {
      unitcostStoriesFTE: '0.0',
      unitcostStorypointsFTE: '0.0'
    }
  },

  populateForm: function(data){
    var storiesFTE = '0.0';
    var strPointsFTE = '0.0';
    if (data != undefined && data != null){
      var allocation;
      
      if (data.locationScore != null && data.locationScore != undefined && data.locationScore != '') {
        allocation = parseFloat(data.locationScore).toFixed(1);
        if (allocation != null && allocation != undefined && allocation.trim() != '0.0') {
          storiesFTE = (data.deliveredStories / allocation).toFixed(1);
          strPointsFTE = (data.storyPointsDelivered / allocation).toFixed(1);
        }
      }
    }

    this.setState({
        unitcostStoriesFTE: storiesFTE,
        unitcostStorypointsFTE: strPointsFTE
      });
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
          <label for='unitcostStoriesFTE' style={labelStyle}>Unit cost - Stories per FTE:<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='unitcostpercStories' id='unitcostStoriesFTE' size='21' min='0' value={this.state.unitcostStoriesFTE} placeholder='0.0' disabled className='inputCustom' step='0.1'/>
          </span>
        </p>
        <p>
          <label for='unitcostStorypointsFTE' style={labelStyle}>Unit cost - Story points per FTE:<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='unitcostpercStorypoints' id='unitcostStorypointsFTE' size='21' min='0' value={this.state.unitcostStorypointsFTE} placeholder='0.0' disabled className='inputCustom' step='0.1'/>
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
