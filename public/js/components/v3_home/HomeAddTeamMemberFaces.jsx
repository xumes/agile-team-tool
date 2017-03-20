var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamMemberFaces = React.createClass({

  componentDidMount: function() {
    var self = this;
    FacesTypeAhead.init(
      $('#txtTeamMemberName'), {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            self.props.updateFacesObj(person);
            self.props.addTeamMember();
            // return person['name'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: false
        }
      });
  },

  render: function() {
    var self = this;
    return (
      <div>
        <label for='txtTeamMemberName' class='frmlabel'>Add Team Members manually</label>
        <input type='text' name='txtTeamMemberName' id='txtTeamMemberName' size='32' placeholder='Search then select a name to add them' onChange={self.props.changeHandlerFacesFullname} />
        <span id='txtTeamMemberNameError' class='ibm-item-note'></span>
      </div>
    );
  }
});

module.exports = HomeAddTeamMemberFaces;
