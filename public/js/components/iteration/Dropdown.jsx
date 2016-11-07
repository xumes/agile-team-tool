var React = require('react');
var api = require('../api.jsx');

var Dropdown = React.createClass({
  getInitialState: function() {
    return {
      selected: this.props.selected,
      selections: this.props.selectionList
    }
  },

  componentDidMount: function() {
    $('select[name="selectionList"]').select2();
    $('select[name="selectionList"]').change(this.handleChange);
  },

  handleChange: function(e) {
    this.props.iteration.memberChanged = e.target.value;
    this.setState({selected: e.target.value});
  },
  
  render: function() {
    var dropListStyle = {
      'width': '170px'
    };
    var populateSelection = this.state.selections.map(function(item) {
      return (<option key={item.id} value={item.id}>{item.name}</option>);
      });
    return (
      <select name="selectionList" style={dropListStyle} disabled={!this.props.enableFields} value={this.state.selected}>
        {populateSelection}
      </select>
    )
  }

});

Dropdown.propTypes = {
  selections: React.PropTypes.arrayOf(React.PropTypes.object)
};

module.exports = Dropdown;
