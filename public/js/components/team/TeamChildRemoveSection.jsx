var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var Promise = require('bluebird');
var removeAssociationArray = [];

var TeamChildRemoveSection = React.createClass({
  componentDidUpdate: function() {
    removeAssociationArray = [];
    $('#childrenAction').val('actions');
    $('#childrenAction').text('Actions...');
    $('#childrenAction').val('actions').change();
    $('input[name="child"]').each(function(){
      $(this).prop('checked', false);
    });
    $(this.refs.selectDropDown).select2();
  },
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.selectDropDown).select2();
    $(this.refs.selectDropDown).change(this.removeAssociation);
  },
  removeAssociation: function(event) {
    var self = this;
    if (event.target.value == 'remove' && removeAssociationArray.length > 0) {
      var promiseArray = [];
      _.each(removeAssociationArray, function(teamId){
        promiseArray.push(api.removeAssociation(teamId));
      });
      Promise.all(promiseArray)
        .then(function(result){
          alert('Child team(s) has been removed successfully.');
          self.props.childTeamsUpdateHandler();
          return result;
        })
        .catch(function(err){
          return err;
        })
    }
  },
  selectedChild: function(id) {
    if (removeAssociationArray.indexOf(id) < 0) {
      removeAssociationArray.push(id);
    } else {
      removeAssociationArray.splice(removeAssociationArray.indexOf(id), 1);
    }
    if (removeAssociationArray.length != 0) {
      $('#childrenAction').val('actions(' + removeAssociationArray.length + ')');
      $('#childrenAction').text('Actions...(' + removeAssociationArray.length + ')');
    } else {
      $('#childrenAction').val('actions');
      $('#childrenAction').text('Actions...');
    }
    $(this.refs.selectDropDown).select2();
  },
  render: function() {
    var self = this;
    if (self.props.childTeams.children.length > 0) {
      var count = 0;
      var childTeams = self.props.childTeams.children.map(function(team){
        var trid = 'crow_' + count;
        var childid = 'child_' + count;
        var teamid = 'ref_id_' + team._id;
        var squadid = 'ref_squadteam_' + count;
        if (team.type == 'squad') {
          var issquad = 'Yes';
        } else {
          issquad = 'No';
        }
        var desid = 'ref_des_' + count;
        count++;
        return (
          <tr key={trid} id={trid}>
            <td scope='row' class='ibm-table-row'>
              <input name='child' id={childid} type='checkbox' value={count-1} disabled={!self.props.childTeams.access} onClick={()=>self.selectedChild(team._id)}/>
              <label for={childid} class='ibm-access'>Select {team.name}</label>
            </td>
            <td id={teamid}>{team.name}</td>
            <td id={squadid}>{issquad}</td>
            <td id={desid}>{team.description}</td>
          </tr>
        )
      });
    } else {
      childTeams = null;
    }
    return (
      <div id='childRemoveSection'>
        <div style={{'fontSize':'14px', 'width':'100%'}} class='tcaption'>
          <em id='childrenNameTitle' class='ibm-bold'>Child team association for CIO</em>
            <p style={{'float': 'right', 'width': '400px'}}>
              <span id='spinner' style={{'display': 'none'}} class='ibm-spinner'></span>
              <span style={{'width': '350px'}}>
                <label aria-label='childrenListAction' class='ibm-access'>Action</label>
                  <select id='childrenListAction' name='childrenListAction' style={{'width': '170px'}} aria-label='childrenListAction' ref={'selectDropDown'} disabled={!self.props.childTeams.access}>
                    <option id='childrenAction' value='actions'>Actions...</option>
                    <option value='remove'>Remove</option>
                  </select>
              </span>
            </p>
        </div>
        <table class='ibm-data-table' data-tablerowselector='enable' id='childrenMemberTable' summary='List of children team' style={{'fontSize': '90%', 'width': '100%'}}>
          <thead>
            <tr>
              <th scope='col' width='1%'></th>
              <th scope='col' width='25%'>Team name</th>
              <th scope='col' width='10%'>Squad team</th>
              <th scope='col' width='64%'>Description</th>
            </tr>
          </thead>
          <tbody id='childrenList'>
            {childTeams}
          </tbody>
        </table>
      </div>
    )
  }
});

module.exports = TeamChildRemoveSection;
