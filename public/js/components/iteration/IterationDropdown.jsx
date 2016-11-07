var React = require('react');
var api = require('../api.jsx');

var IterationDropdown = React.createClass({
  getInitialState: function() {
    return {
      selectedIteration: this.props.iteration._id,
      iterations: []
    }
  },

  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $('select[name="iterationSelectList"]').select2();
    $('select[name="iterationSelectList"]').change(this.handleChange);
  },

  handleChange: function(e) {
    var result;
    var self = this;
    var selected = e.target.value;
    if (selected != '' && selected != 'new'){
      result = api.getIterationInfo(selected)
        .then(function(result) {
          self.props.updateForm(result);
        });
    }
    else {
      self.props.updateForm(result);
    }
    this.props.iteration._id = selected;
    this.setState({selectedIteration: selected});
  },

  retrieveIterations: function(teamId){
    var self = this;
    if (teamId != undefined && teamId != ''){
      api.getIterations(teamId)
        .then(function(result) {
          self.setState({
            iterations: result
          });
        });
    }
    this.setState({selectedIteration: 'new'});
    this.props.iteration._id = '';
    self.props.updateForm(null);
  },

  render: function() {
    var populateIteratNames = this.state.iterations.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <select name='iterationSelectList' disabled={!this.props.enableFields} value={this.state.selectedIteration} className='iterationField'>
        <option value='new' key='new'>Create new..</option>
        {populateIteratNames}
      </select>
    )
  }

});

module.exports = IterationDropdown;
