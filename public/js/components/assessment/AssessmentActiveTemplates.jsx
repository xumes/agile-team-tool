var React = require('react');
var api = require('../api.jsx');

var AssessmentActiveTemplates = React.createClass({
  getInitialState: function() {
    return {
      selectedTeam: 'new',
      teamNames: []
    }
  },

  componentDidMount: function() {
    var self = this;
    api.getSquadTeams({name:1})
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });
    // Use IBM's bundled select2 package
    $('select[name="teamSelectList"]').select2();
    $('select[name="teamSelectList"]').change(this.props.clickAction);
  },
  render: function() {
    return (<div id="assessmentContainer" class="agile-maturity">
        <ul class="ibm-twisty agile-assessment ibm-widget-processed" id="atma_ver_006" data-widget="twisty">
        <li data-open="true" class="" id="atma_ver_006_0">
            <a class="ibm-twisty-trigger" href="#toggle">Team Agile Leadership and Collaboration - Projects</a>
        </li>
        </ul>
        </div>)
  }
});

module.exports = AssessmentActiveTemplates;
