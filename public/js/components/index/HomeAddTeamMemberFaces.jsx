var React = require('react');

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
        <label for='txtTeamMemberName' class='frmlabel'>To add a member, search and select them</label>
        <input type='text' name='txtTeamMemberName' id='txtTeamMemberName' size='32' placeholder='ex. John Smith or smith@xx.ibm.com' onChange={self.props.changeHandlerFacesFullname} />
        <span id='txtTeamMemberNameError' class='ibm-item-note'></span>
      </div>
    );
  }
});

module.exports = HomeAddTeamMemberFaces;
