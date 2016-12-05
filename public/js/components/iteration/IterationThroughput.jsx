var React = require('react');

var IterationCommitment = React.createClass({
  getInitialState: function() {
    return {
      unitCostStoriesFTE: '',
    }
  },

  componentWillReceiveProps: function(nextProps){
    var data = nextProps.iteration;
    if (data != undefined && data != null){
      var fte = this.floatDefault(data.memberFte);
      if (fte > 0){
        var storiesFTE = (this.numericValue(data.deliveredStories) / fte).toFixed(1);
        this.setState({unitCostStoriesFTE: storiesFTE});
      }
      else {
        this.setState({unitCostStoriesFTE: ''});
      }
    }
  },

  componentWillMount: function() {
    var data = this.props.iteration;
    if (data != undefined && data != null){
      var fte = this.floatDefault(data.memberFte);
      if (fte > 0){
        var storiesFTE = (this.numericValue(data.deliveredStories) / fte).toFixed(1);
        this.setState({unitCostStoriesFTE: storiesFTE});
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

  commPointsChange: function(e){
    this.props.updateField('commitedStoryPoints',e.target.value);
  },

  calculateMetrics: function(commStoriesDel) {
    var fte = this.props.iteration.memberFte;
    if (fte != null && !isNaN(parseFloat(fte))){      
      var storiesFTE = (this.numericValue(commStoriesDel) / fte).toFixed(1);
      this.setState({unitCostStoriesFTE:storiesFTE});
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
        <h2 className='ibm-bold ibm-h4'>Throughput data (for Operations work)</h2>
        <div className='iteration'>
          <div className='iteration-sm'>
            <label for='commStories' style={labelStyle}>Stories/Cards/Tickets-Committed:<span className='ibm-required'></span></label>
            <span>
              <input type='text' name='commStories' id='commStories' size='8' value={this.props.iteration.committedStories != null ? this.props.iteration.committedStories:''} placeholder='0' className='inputCustom' onChange={this.commStoriesChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            </span>
          </div>
          <div>
            <label for='commStoriesDel' style={labelStyle2}>Stories/Cards/Tickets-Delivered:<span className='ibm-required'></span></label>
              <span>
                <input type='text' name='commStoriesDel' id='commStoriesDel' size='8' value={this.props.iteration.deliveredStories != null?this.props.iteration.deliveredStories:''} placeholder='0' className='inputCustom' onChange={this.commStoriesDelChange} disabled={!this.props.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
              </span>
          </div>
        </div>
        <div className='iteration'>
          <div>
          <label for='unitCostStoriesFTE' style={labelStyle}>Stories per FTE (calculated):<span className='ibm-required'></span></label>
          <span>
            <input type='text' id='unitCostStoriesFTE' size='21' value={this.state.unitCostStoriesFTE} placeholder='0.0' disabled className='inputCustom'/>
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
