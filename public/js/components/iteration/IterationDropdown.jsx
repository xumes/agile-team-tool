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
    var self = this;
    if (this.props.iteration.teamId != undefined && this.props.iteration.teamId != ''){
    api.getIterations(this.props.iteration.teamId)
      .then(function(result) {
        self.setState({iterations: result, selectedIteration: self.props.iteration._id
        });
        self.loadSelected(self.props.iteration._id);
      });
    }
    // Use IBM's bundled select2 package
    $(this.refs.selectDropDown).select2();
    $(this.refs.selectDropDown).change(this.handleChange);
  },

  handleChange: function(e) {
    this.loadSelected(e.target.value);
  },

  loadSelected: function(id) {
    var self = this;
    if (id != '' && id != 'new'){
      var iteration;
      api.getIterationInfo(id)
        .then(function(result) {
          iteration = result;
          
          return api.isUserAllowed(self.props.iteration.teamId);
        })
        .then(function(result){
          self.props.updateForm(iteration, result);
        });
    }
    else {
      self.props.updateForm(null, false);
    }
    self.setState({selectedIteration: id});
  },

  retrieveIterations: function(teamId, selected){
    var self = this;
    if (teamId != undefined && teamId != ''){
      var promiseArray = [];
      if (selected != undefined && selected != null){
        var iterations;
        api.getIterations(teamId)
          .then(function(result) {
            iterations = result;
            promiseArray.push(api.getIterationInfo(selected));
            promiseArray.push(api.isUserAllowed(teamId));
            return Promise.all(promiseArray);
          })
          .then(function(result) {
            self.setState({
              iterations: iterations
            });
            self.props.updateForm(result[0], result[1]);
          });
      }
      else {
        api.getIterations(teamId)
          .then(function(result) {
            self.setState({
              iterations: result
            });
          });
        self.setState({selectedIteration: 'new'});
        self.props.iteration._id = '';
        self.props.updateForm(null, false);
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
      <select name='iterationSelectList' disabled={!this.props.enableFields} defaultValue={this.state.selectedIteration} className='iterationField' onChange={this.handleChange} ref='selectDropDown'>
        <option value='new' key='new'>Create new..</option>
        {populateIteratNames}
      </select>
    )
  }

});

module.exports = IterationDropdown;
