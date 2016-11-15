var React = require('react');
var api = require('../api.jsx');

var IterationDropdown = React.createClass({
  getInitialState: function() {    
    return {
      selectedIteration: this.props.iteration._id,
      iterations: [],
      firstOption:  ['new', 'Create new...']
    }
  },

  componentWillMount: function() {
    var self = this;
    var teamId = this.props.iteration.teamId;
    if (teamId != undefined && !_.isEmpty(teamId)) {
      api.getIterations(teamId)
        .then(function(result) {
          self.setState({
            iterations: result,
            selectedIteration: self.props.iteration._id
          });
          self.loadSelected(self.props.iteration._id, self.props.enableFields);
        });
    }
  },
  
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.iterationSelectList).select2();
    $(this.refs.iterationSelectList).change(this.handleChange);
  },

  handleChange: function(e) {
    this.loadSelected(e.target.value, true);
  },

  loadSelected: function(id, state) {
    var self = this;
    if (!_.isEmpty(id) && id != 'new'){
      var iteration;
      api.getIterationInfo(id)
        .then(function(result) {
          iteration = result;          
          self.props.updateForm(result, state);
        });
    }
    else {
      self.props.updateForm(null, false);
    }
    self.setState({selectedIteration: id});
  },

  retrieveIterations: function(teamId, selected, state, firstOption){
    var self = this;
    if (teamId != undefined && !_.isEmpty(teamId)){
      if (selected != undefined && selected != null){
        var iterations;
        api.getIterations(teamId)
          .then(function(result) {
            iterations = result;
            return api.getIterationInfo(selected);
          })
          .then(function(result) {
            self.props.updateForm(result, state);
            self.setState({iterations: iterations, selectedIteration: selected, firstOption: firstOption});
          });
      }
      else {
        api.getIterations(teamId)
          .then(function(result) {
            self.setState({iterations: result});
          });
        self.setState({selectedIteration: firstOption[0], firstOption: firstOption});
        self.props.iteration._id = '';
        self.props.updateForm(null, state);
      }
    }
  },

  render: function() {
    var populateIteratNames = this.state.iterations.map(function(item) {
      return (
        <option key={item._id} value={item._id}>{item.name}</option>
      )
    });

    return (
      <select id='iterationSelectList' disabled={!this.props.enableFields} value={this.state.selectedIteration} className='iterationField' onChange={this.handleChange} ref='iterationSelectList'>
        <option value={this.state.firstOption[0]} key={this.state.firstOption[0]}>{this.state.firstOption[1]}</option>
        {populateIteratNames}
      </select>
    )
  }

});

module.exports = IterationDropdown;
