var React = require('react');

var Dropdown = React.createClass({
  getInitialState: function() {
    return {
      selections: this.props.selectionList
    }
  },

  componentDidMount: function() {
    $('select[name="selectionList"]').select2();
    $('select[name="selectionList"]').change(this.handleChange);
  },

  componentDidUpdate: function() {
    $('select[name="selectionList"]').select2();
  },

  handleChange: function(e) {
    var teamChanged = e.target.value;
    this.props.updateField('memberChanged', teamChanged);
  },
  
  render: function() {
    var populateSelection = this.state.selections.map(function(item) {
      return (<option key={item.id} value={item.id}>{item.name}</option>);
      });
    return (
      <select name="selectionList" className='inputCustom' disabled={!this.props.enableFields} value={this.props.iteration.memberChanged}  onChange={this.handleChange}>
        {populateSelection}
      </select>
    )
  }

});

Dropdown.propTypes = {
  selections: React.PropTypes.arrayOf(React.PropTypes.object)
};

module.exports = Dropdown;
