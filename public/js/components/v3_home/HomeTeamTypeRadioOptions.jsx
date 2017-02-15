var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamTypeRadioOptions = React.createClass({
  componentDidMount: function() {
    $("span[data-widget=tooltip]").tooltip();
    $("#selparent-1").select2();
    $("#selparent-1").change(this.props.onchangeParentTeamDropdown);
    var selectedParentTeam = this.props.selectedParentTeam;
    $("#selparent-1").val(selectedParentTeam.value);
    $('#select2-selparent-1-container').text(selectedParentTeam.text);
  },

  render: function() {
    var selectedteamType = this.props.selectedteamType;
    var selparent1Style = {'display': 'none'};
    if (selectedteamType == 'squadteam') {
      selparent1Style = {'display': 'block'};
      $('#steam').prop('checked', true).trigger('change');
    } else {
      $('#steam').prop('checked', false).trigger('change');
    }
    return (
      <div class="midcontent">
        <div class="optbox-1 rpad">
          <span class="ibm-radio-wrapper">
            <input class="ibm-styled-radio" id="pteam" name="teamtype" type="radio" value="parentteam" onChange={this.props.onchangeTeamtypeRadio} />
            <label for="pteam" class="ibm-field-label lbl"><span data-widget="tooltip" title="A parent team, also known as a domain, subdomain, or tribe, is a team who oversees numerous teams below them and would have 'Roll up' data from each of those teams.">Parent team</span></label>
          </span>

          <div class="pteam-bg">
            <InlineSVG src={require('../../../img/Att-icons/att-icons_parentteam.svg')}></InlineSVG>
          </div>
        </div>

        <div class="optbox-1">
          <span class="ibm-radio-wrapper">
            <input class="ibm-styled-radio" id="steam" name="teamtype" type="radio" value="squadteam" onChange={this.props.onchangeTeamtypeRadio} />
            <label for="steam" class="ibm-field-label lbl"><span data-widget="tooltip" title="Typically, a squad is a team that uses Agile frameworks like Scrum or Kanban to deliver outcomes. Still not sure if you are a squad? If your team does not have any other teams organized below it, then it would be a squad.">Squad team</span></label>
          </span>
          <div class="pteam-bg">
            <InlineSVG src={require('../../../img/Att-icons/att-icons_squadteam.svg')}></InlineSVG>
          </div>
        </div>
        <div class="clearboth"></div>
        <div class="optsel-1" style={selparent1Style} >
          <select name="selparent1" id="selparent-1" class="selparent">
            <option>Select parent team (optional)</option>
            {this.props.populateTeamNames}
          </select>
        </div>

        <div class="clearboth"></div>
      </div>
    );
  }
});

module.exports = HomeTeamTypeRadioOptions;
