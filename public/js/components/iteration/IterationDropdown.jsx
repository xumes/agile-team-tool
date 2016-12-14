var React = require('react');
var api = require('../api.jsx');

var IterationDropdown = React.createClass({
  getInitialState: function() {    
    return {
      iterations: [],
      firstOption:  ['new', 'Create new...']
    }
  },

  componentWillReceiveProps: function(nextProps){
    if (nextProps.iteration != undefined && nextProps.iteration != null){
      selectEnable = false;
      if(!_.isNull(nextProps.iteration.teamId) && !_.isEmpty(nextProps.iteration.teamId) &&
        !nextProps.isReadOnly){
        this.setState({
        firstOption: ['new', 'Create new...']
      });
      }
      else {
        this.setState({firstOption: ['', 'Select one']});
      }
    }
  },

  componentWillMount: function() {
    var self = this;
    var teamId = this.props.iteration.teamId;
    if (teamId != undefined && !_.isEmpty(teamId)) {
      api.getIterations(teamId)
        .then(function(result) {
          
          self.loadSelected(self.props.iteration._id);
          self.setState({iterations: result});
        })
        .catch(function(err){
          console.log('[iter-componentWillMount] error:'+JSON.stringify(err));
        });
    }
  },
  
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $('select[name="iterationSelectList"]').select2();
    $('select[name="iterationSelectList"]').change(this.handleChange);
  },

  componentDidUpdate: function() {
    $('select[name="iterationSelectList"]').select2();
  },

  handleChange: function(e) {
    this.loadSelected(e.target.value);
  },

  loadSelected: function(id) {
    var self = this;
    if (!_.isEmpty(id) && id != 'new'){
      api.getIterationInfo(id)
        .then(function(result) {
          return self.props.updateForm(result);
        })
        .catch(function(err){
          console.log('[loadSelected] error:'+JSON.stringify(err));
        });
    }
    else {
      var teamId = self.props.iteration.teamId;
      this.props.teamReset(teamId);
    }
  },

  retrieveIterations: function(teamId, selected){
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
            self.props.updateForm(result);
            self.setState({iterations: iterations});
          })
          .catch(function(err){
            console.log('[retrieveIterations] error:'+JSON.stringify(err));
          });
      }
      else {
        api.getIterations(teamId)
          .then(function(result) {
            self.setState({iterations: result});
          })
          .catch(function(err){
            console.log('[retrieveIterations] error:'+JSON.stringify(err));
          });
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
      <select id='iterationSelectList' name='iterationSelectList' disabled={_.isEmpty(this.props.iteration.teamId)?true:false} value={this.props.iteration._id} className='iterationField' onChange={this.handleChange}>
        <option value={this.state.firstOption[0]} key={this.state.firstOption[0]}>{this.state.firstOption[1]}</option>
        {populateIteratNames}
      </select>
    )
  }

});

module.exports = IterationDropdown;
