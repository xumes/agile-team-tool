var React = require('react');
var api = require('../api.jsx');
var TeamDropdown = require('./TeamDropdown.jsx');

var TeamForm = React.createClass({
  componentDidMount: function() {
    $('select[name="teamSquadYesNo"]').select2();
  },

  render: function() {
    var labelStyle = {
      'lineHeight': '20px',
    };
    var teamNameStyle = {
      'width': '400px'
    };
    var teamDescStyle = {
      'width': '400px',
      'height': '70px'
    };
    var squadTooltipStyle = {
      'position': 'relative',
      'top': '-5%',
      'left': '5%'
    };


    return (
      <form class="ibm-column-form">
        <p>
          <label style={labelStyle} >Create or select an existing team:<span class="ibm-required">*</span></label>
            <span>
              <TeamDropdown teamChangeHandler={this.props.teamChangeHandler}/>
           </span>
         </p>

        <p>
          <label for="teamName">&nbsp;<span class="ibm-access">Team name:</span></label>
          <span>
            <input type="text" name="teamName" id="teamName" size="50" value="" placeholder="Type team name" aria-label="Team name"
                   style={teamNameStyle}/>
          </span>
        </p>

        <p>
          <label for="teamDesc">Team description:</label>
          <span>
            <textarea name="teamDesc" id="teamDesc" placeholder="Type a short team description" style={teamDescStyle}></textarea>
          </span>
        </p>

        <p>
          <label for="teamSquadYesNo">Is this a squad team?<span class="ibm-required">*</span>
            <a class="ibm-information-link" data-widget="tooltip" data-contentid="squadToolTip" style={squadTooltipStyle}><span class="ibm-access">Tooltip</span></a>
          </label>
          <span>
            <select name="teamSquadYesNo" style={teamNameStyle}>
              <option value="Yes" selected="selected">Yes</option>
              <option value="No">No</option>
            </select>
          </span>
        </p>

        <p>
          <label>&nbsp;<span class="ibm-access">Update buttons</span></label>
          <span class="ibm-btn-row">
            <input type="button" class="ibm-btn-pri ibm-btn-small" id="addTeamBtn" value="Add team" onclick="updateTeamInfo('add');" />
            <input type="button" class="ibm-btn-sec ibm-btn-small" id="updateTeamBtn" value="Update team" onclick="updateTeamInfo('update');" disabled />
            <input type="button" class="ibm-btn-sec ibm-btn-small" id="deleteTeamBtn" value="Delete team" onclick="updateTeamInfo('delete');" disabled />
            <input type="button" class="ibm-btn-sec ibm-btn-small" id="cancelTeamBtn" value="Reset team" onclick="updateTeamInfo('reset');" />
          </span>
        </p>

      </form>
    )
  }

});

module.exports = TeamForm;
