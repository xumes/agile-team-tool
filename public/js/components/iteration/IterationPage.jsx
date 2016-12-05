var React = require('react');
var Header = require('../Header.jsx');
var IterationForm = require('./IterationForm.jsx');

var IterationPage = React.createClass({
  componentWillMount: function() {
    this.initPageAction();
  },

  initPageAction: function() {
    var urlParameters = this.getJsonParametersFromUrl();
    if (urlParameters != undefined && urlParameters.id != undefined) {
      this.setState({selectedTeam: urlParameters.id});
      if (urlParameters != undefined && urlParameters.iter != undefined && urlParameters.iter != '')
        this.setState({selectedIteration: urlParameters.iter});
      else
        this.setState({selectedIteration: 'new'});
    } else {
      this.setState({selectedTeam: '', selectedIteration: ''});
    }
  },

  getJsonParametersFromUrl: function() {
    var query = location.search.substr(1);
    var result = {};
    query.split('&').forEach(function(part) {
      var item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  },

  render: function() {
    return (
      <div>
        <Header title='Iteration information' />
        <IterationForm selectedTeam={this.state.selectedTeam} selectedIteration={this.state.selectedIteration} />
      </div>
    )
  }
});

module.exports = IterationPage;
