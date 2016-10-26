var React = require('react');
var api = require('../api.jsx');

var HomeFallBox = React.createClass({
  render: function() {
    return (
      <div style={{'display':'none'}} class='agile-section-nav' id={this.props.component.id}>
        <label aria-label={this.props.component.selectId}>{this.props.component.label}</label>
        <select id={this.props.component.selectId} aria-labelledby='agile-section-title'><option value=''>Select one</option></select>
        <input style={{'padding':'3px','border': '1px solid #323232'}} type='button' class='ibm-btn-sec ibm-btn-small' id={this.props.component.goBtnId} value='Go' />
        <input style={{'padding': '3px', 'border': '1px solid #323232', 'width': '130px'}} type='button' class='ibm-btn-sec ibm-btn-small' id={this.props.component.createBtnId}  value={this.props.component.createBtnTitle}  />
      </div>
    )
  }
});

module.exports = HomeFallBox;
