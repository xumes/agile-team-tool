var React = require('react');
var TeamErrorValidationHandler = require('./TeamErrorValidationHandler.jsx');
var teamApi = require('./TeamApi.jsx');
var _ = require('underscore');
var Promise = require('bluebird');
var removeAssociationArray = [];

var TeamChildRemoveSection = React.createClass({
  getInitialState: function() {
    return {
      formError: {
        error: {},
        map: [
          {field: 'path', id: 'childSelectList'}
        ]
      }
    }
  },
  componentDidUpdate: function() {
    removeAssociationArray = [];
    $('#childAction').text('Actions...');
    $('#childListAction').val('').change();
    $('input[name="child"]').each(function(){
      $(this).prop('checked', false);
    });
    this.refs.childListAction.disabled = true;
    $(this.refs.childListAction).select2();
  },
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.childListAction).select2();
    $(this.refs.childListAction).change(this.removeAssociation);
  },
  removeAssociation: function(event) {
    var self = this;
    if (event.target.value == 'remove' && removeAssociationArray.length > 0) {
      var promiseArray = [];
      _.each(removeAssociationArray, function(childId){
        promiseArray.push(teamApi.removeAssociation(childId));
      });
      Promise.all(promiseArray)
        .then(function(result){
          self.props.childTeamsUpdateHandler('Child team(s) has been removed successfully.');
          return result;
        })
        .catch(function(err){
          var map = self.state.formError.map;
          return self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        })
    }
  },
  childSelected: function(id) {
    if (removeAssociationArray.indexOf(id) < 0) {
      removeAssociationArray.push(id);
    } else {
      removeAssociationArray.splice(removeAssociationArray.indexOf(id), 1);
    }
    if (removeAssociationArray.length != 0) {
      $('#childAction').val('actions(' + removeAssociationArray.length + ')');
      $('#childAction').text('Actions...(' + removeAssociationArray.length + ')');
      this.refs.childListAction.disabled = false;
    } else {
      $('#childAction').val('actions');
      $('#childAction').text('Actions...');
      this.refs.childListAction.disabled = true;
    }
    $(this.refs.childListAction).select2();
  },
  showHideSection: function() {
    this.props.showHideSection('iterationPageSection');
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
              <input name='child' id={childid} type='checkbox' value={count-1} disabled={!self.props.childTeams.access} onClick={()=>self.childSelected(team._id)}/>
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
                <label aria-label='childListAction' class='ibm-access'>Action</label>
                  <select id='childListAction' name='childListAction' ref='childListAction' style={{'width': '170px'}} aria-label='childListAction'>
                    <option id='childAction' value=''>Actions...</option>
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
            {childTeams != null ? childTeams : <tr class='odd'><td colSpan='64' class='dataTables_empty'>No data available</td></tr>}
          </tbody>
        </table>
        <TeamErrorValidationHandler formError={this.state.formError} />
      </div>
    )
  }
});

module.exports = TeamChildRemoveSection;
