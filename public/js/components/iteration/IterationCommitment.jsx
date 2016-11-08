var React = require('react');

var IterationCommitment = React.createClass({
  getInitialState: function() {
    return {
      enableFields: this.props.enableFields,
      commStories: '0',
      commPoints: '0',
      memberCount: '0',
      fteThisiteration: '0.0'
    }
  },

  commStoriesChange: function(e){
    this.props.iteration.committedStories = e.target.value;
    this.setState({commStories : e.target.value});    
  },

  commPointsChange: function(e){
    this.props.iteration.storyPointsDelivered = e.target.value;
    this.setState({commPoints : e.target.value});
  },
  memberCountChange: function(e){
    this.props.iteration.memberCount = e.target.value;
    this.setState({memberCount : e.target.value});
  },
  fteThisiterationChange: function(e){
    this.props.iteration.memberFte = e.target.value;
    this.setState({fteThisiteration : e.target.value});    
  },

  populateForm: function(data, state){
    if (data != undefined && data != null){
      var allocation;
      if (data.locationScore != '') {
        allocation = parseFloat(data.locationScore).toFixed(1);
      }
      this.setState({
        commStories: data.committedStories,
        commPoints: data.storyPointsDelivered,
        memberCount: data.memberCount,
        fteThisiteration: allocation,
        enableFields: state
      });
    }
    else {
      this.setState({
        commStories: 0,
        commPoints: 0,
        memberCount: 0,
        fteThisiteration: '0.0',
        enableFields: state
      });
    }
  },
  enableFormFields: function(state){
    this.setState({enableFields: state});
  },
  
  calculateMetrics: function() {
    if (!isNaN(parseFloat(this.state.fteThisiteration)) && parseFloat(this.state.fteThisiteration) > 0) {
      var commStoriesDel = this.props.iteration.deliveredStories;
      commStoriesDel = !isNaN(parseFloat(commStoriesDel)) ? commStoriesDel : 0;
      var storiesFTE = commStoriesDel / this.state.fteThisiteration;
      this.props.iteration.unitcostStoriesFTE = storiesFTE.toFixed(1);

      var commPointsDel = this.props.iteration.storyPointsDelivered;
      commPointsDel = !isNaN(parseFloat(commPointsDel)) ? commPointsDel : 0;
      var strPointsFTE = commPointsDel / this.state.fteThisiteration;
      this.props.iteration.unitcostStorypointsFTE = strPointsFTE.toFixed(1);
    }
  },

  enableFormFields: function(state){
    this.setState({enableFields: state});
  },

  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  decimalNumCheck:function(e) {
    var pattern = /^\d*[.]?\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(e.target.value + String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  roundOff:function(e) {
    var value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      e.target.value = value.toFixed(1);
    }
  },

  paste:function(e) {
    e.preventDefault();
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
      'width': '470px'
    };
    var linkStyle1 = {
      'position': 'relative',
      'top': '-5px',
      'left': '-290px',
      'display': 'inline'
    };
    var linkStyle2 = {
      'position': 'relative',
      'top': '-5px',
      'left': '10px',
      'display': 'inline',
      'pointer': 'pointer'
    };
    var linkStyle3 = {
      'position': 'relative',
      'top': '-5px',
      'left': '-355px',
      'display': 'inline'
    };
    return (
      <div>
        <h2 className='ibm-bold ibm-h4'>Iteration commitments</h2>
        <p>
          <label for='commStories' style={labelStyle}>Committed stories:<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='commStories' id='commStories' size='8' value={this.state.commStories} placeholder='0' min='0' className='inputCustom' onChange={this.commStoriesChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </p>
        <p>
          <label for='commPoints' style={labelStyle}>Committed story points:<span className='ibm-required'></span></label>
          <span>
            <input type='number' name='commPoints' id='commPoints' size='8' value={this.state.commPoints} placeholder='0' min='0' className='inputCustom' onChange={this.commPointsChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
          </span>
        </p>
        <p>
          <label for='memberCount' style={labelStyle}>Team members this iteration:<span className='ibm-required'></span></label>
          <a className='ibm-information-link' id='memberCountTT' style={linkStyle1}/>
          <span>
            <input type='number' name='memberCount' id='memberCount' size='8' value={this.state.memberCount} placeholder='0' min='0' className='inputCustom' onChange={this.memberCountChange} disabled={!this.state.enableFields} onKeyPress={this.wholeNumCheck} onPaste={this.paste}/>
            <a id='refreshFTE' className='ibm-refresh-link' style={linkStyle2} role='button'></a>
          </span>
        </p>
        <p>
          <label for='fteThisiteration' style={labelStyle}>FTE this iteration:<span className='ibm-required'></span></label>
          <a className='ibm-information-link' id='fteThisiterationTT' style={linkStyle3}/>
          <span>
            <input type='number' name='fteThisiteration' id='fteThisiteration' min='0' step='0.1' size='21' value={this.state.fteThisiteration} placeholder='0.0' className='inputCustom' onChange={this.fteThisiterationChange} disabled={!this.state.enableFields} onKeyPress={this.decimalNumCheck} onBlur={this.roundOff} onPaste={this.paste}/>
          </span>
        </p>
        <div className='ibm-rule ibm-gray-80'>
          <hr/>
        </div>
      </div>
    )
  }
});

module.exports = IterationCommitment;
