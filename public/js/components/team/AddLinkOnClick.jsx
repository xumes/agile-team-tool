var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var LoadLinksData = require('./LoadLinksData.jsx');

var AddLinkOnClick = React.createClass({
  addLinkHandlerx: function(event) {
    var self = this;
    console.log('addLink!');
    console.log('loadlinks3:', this.props.selectedTeam.team);
    var ctr = new Date().getTime();
    var selectdata = [
      {id: '-1', text: 'Select label'},
      {id: 'Wall of work', text: 'Wall of work'},
      {id: 'Backlog', text: 'Backlog'},
      {id: 'Retrospectives', text: 'Retrospectives'},
      {id: 'Defects', text: 'Defects'},
      {id: 'Standup schedule', text: 'Standup schedule'},
      {id: 'Other', text: 'Other...'}
    ];

    var linkLabelOption = selectdata.map(function(row, idx){
      var linklabelId = row.id;
      var linklabelValue = row.text;
      return <option value={linklabelId} key={linklabelId}>{linklabelValue}</option>
    });

    selectdata.map(function(row, idx){
      return(
        <div class='importantLinksSection' key={idx} data-counter={idx}>
          <div>
            <select name='linklabel_[]' class='implabel' >
              {linkLabelOption}
            </select>
          </div>

          <div>
            <input type='text' name='url_[]' placeholder='URL' onChange={(event) => self.keypressHandlerOnEditmodeLink(event)} />
          </div>

          <div>
            <a href='javascript:void(0)' id={`removelink_${idx}`} title='Delete the link' alt='Delete the link' class='removelink' onClick={self.removeLink} ><img src='../img/trash-ico.svg' class='trash_icon' /></a>
          </div>
        </div>      
      );
    });
  },

  addLinkHandler: function(event){
        console.log('addLink!');
    $('#importantLinkWrapper').append(<LoadLinksData />);
  },

  render: function() {
    var self = this;
    var selectedTeam = self.props.selectedTeam.team;

    return (
      <div class="addlinkWrapper">
        <a href="javascript:void(0)" onClick={self.addLinkHandler} class="add_link">&nbsp;Add a link...</a>
      </div>
    );
  }
});

module.exports = AddLinkOnClick;