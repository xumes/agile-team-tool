var React = require('react');

var IterationCommitment = React.createClass({
  getInitialState: function() {
    return {
      unitCostStoryPointsFTE: ''
    }
  },

  componentWillReceiveProps: function(nextProps){
    var data = nextProps.iteration;
    if (data != undefined && data != null){
      var fte = this.floatDefault(data.memberFte);
      if (fte > 0){
        var strPointsFTE = (this.numericValue(data.storyPointsDelivered) / fte).toFixed(1);
        this.setState({unitCostStoryPointsFTE: strPointsFTE});
      }
      else {
        this.setState({unitCostStoryPointsFTE: ''});
      }
    }
  },

  componentWillMount: function() {
    var data = this.props.iteration;
    if (data != undefined && data != null){
      var fte = this.floatDefault(data.memberFte);
      if (fte > 0){
        var strPointsFTE = (this.numericValue(data.storyPointsDelivered) / fte).toFixed(1);
        this.setState({unitCostStoryPointsFTE: strPointsFTE});
      }
    }
  },

  commStoriesChange: function(e){
    this.props.updateField('committedStories',e.target.value);
  },

  commStoriesDelChange: function(e){
    var delStories = e.target.value;
    this.props.updateField('deliveredStories', delStories);
    this.calculateMetrics(delStories);
  },

  commPointsDelChange: function(e){
    var delPoints = e.target.value;
    this.props.updateField('storyPointsDelivered', delPoints);
    this.calculateMetrics(delPoints);
  },

  commPointsChange: function(e){
    this.props.updateField('commitedStoryPoints',e.target.value);
  },

  deploythisIterationChange: function(e){
    this.props.updateField('deployments', e.target.value);
  },

  calculateMetrics: function(commPointsDel) {
    var fte = this.props.iteration.memberFte;
    if (fte != null && !isNaN(parseFloat(fte))){
      var strPointsFTE = (this.numericValue(commPointsDel) / fte).toFixed(1);
      this.setState({unitCostStoryPointsFTE:strPointsFTE});
    }
  },

  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  paste:function(e) {
    e.preventDefault();
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
      'width': '218px'
    };
    var labelStyle2 = {
      'width': '170px'
    };

    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Velocity data (for Development work)</h2>
        <div className='iteration'>
          <div className='iteration-sm'>
            <label for='commPoints' style={labelStyle}>Story points - Committed:<span className='ibm-required'></span></label>
            <span>
              <input type='text' name='commPoints' id='commPoints' size='6' value={this.props.iteration.commitedStoryPoints!=null ? this.props.iteration.commitedStoryPoints:''} placeholder='0' className='inputCustom' onChange={this.commPointsChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
          </div>
          <div>
            <label for='commPointsDel' style={labelStyle2}>Story points delivered:<span className='ibm-required'></span></label>
            <span>
              <input type='text' name='commPointsDel' id='commPointsDel' size='6' value={this.props.iteration.storyPointsDelivered != null ?
              this.props.iteration.storyPointsDelivered:''} placeholder='0' className='inputCustom' onChange={this.commPointsDelChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
          </div>
        </div>
        <div className='iteration'>
          <div>
            <label for='deploythisIteration' style={labelStyle}>Deployments this iteration:</label>
            <span>
              <input type='text' name='deploythisIteration' id='deploythisIteration' size='6' value={this.props.iteration.deployments != null?this.props.iteration.deployments:''} placeholder='0' className='inputCustom' onChange={this.deploythisIterationChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
          </div>
        </div>
        <div className='iteration'>
          <div>
          <label for='unitCostStoryPointsFTE' style={labelStyle}>Story points per FTE(calculated):<span className='ibm-required'></span></label>
          <span>
            <input type='text' id='unitCostStoryPointsFTE' size='6' value={this.state.unitCostStoryPointsFTE} className='inputCustom' placeholder='0.0' disabled/>
          </span>
          </div>
        </div>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationCommitment;
