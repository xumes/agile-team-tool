var React = require('react');
var TeamErrorValidationHandler = require('./TeamErrorValidationHandler.jsx');
var teamApi = require('./TeamApi.jsx');

var TeamChildAddSection = React.createClass({
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
    $('#childSelectList').val('').change();
    this.refs.childSelectList.disabled = !this.props.childTeams.access;
    this.refs.updateChildBtn.disabled = !this.props.childTeams.access;
  },
  componentDidMount: function() {
    // Use IBM's bundled select2 package
    $(this.refs.childSelectList).select2();
  },
  associateTeamHandler: function() {
    var self = this;
    if (self.refs.childSelectList.value == '') {
      alert('No team selected to associate as a Child team.');
      return;
    } else {
      teamApi.associateTeam(this.props.childTeams.currentTeamId, self.refs.childSelectList.value)
        .then(function(result) {
          self.props.childTeamsUpdateHandler('You have successfully created a Child team association.');
          return null;
        })
        .catch(function(err) {
          var map = self.state.formError.map;
          return self.setState({
            formError: {
              error: err,
              map: map
            }
          });
        });
    }
  },
  childSelected: function() {
    var index = [];
    var count = 0;
    $('input[name="member"]:checked').each(function() {
      count++;
      index.push($(this).val());
    });
    if (count > 0) {
      this.state.selectedIndex = index;
      $('#memberListAction').removeAttr('disabled');
      $('#memberAction').html('Actions... (' + count + ')');
      $('#select2-memberListAction-container').text('Actions... (' + count + ')');
      $('#select2-memberListAction-container').attr('title', 'Actions... (' + count + ')');
      $('#select2-memberListAction-container').css('color', 'black');
    } else {
      this.resetMember();
    }
  },
  render: function() {
    if (this.props.childTeams.selectableChildren.length <= 0 || this.props.childTeams.selectableChildren == undefined) {
      var populateTeamNames = null;
    } else {
      var populateTeamNames = this.props.childTeams.selectableChildren.map(function(item) {
        return (
          <option key={item._id} value={item._id}>{item.name}</option>
        )
      });
    }
    return (
      <div id='childAddSection'>
        <p>
          <label aria-label='childSelectList'>Select a child team:<span class='ibm-required'>*</span></label>
          <span>
            <select id='childSelectList' name='childSelectList' style={{'width':'400px'}} ref='childSelectList' disabled={!this.props.childTeams.access}>
              <option key='' value=''>Select One</option>
              {populateTeamNames}
            </select>
          </span>
        </p>
        <p class='ibm-btn-row'>
          <label>&nbsp;<span class='ibm-access'>Update buttons</span></label>
          <span>
            <input type='button' class='ibm-btn-pri ibm-btn-small' id='updateChildBtn' ref='updateChildBtn' value='Associate team as a child' onClick={this.associateTeamHandler}/>
          </span>
        </p>
        <TeamErrorValidationHandler formError={this.state.formError} />
      </div>
    )
  }
});

module.exports = TeamChildAddSection;
