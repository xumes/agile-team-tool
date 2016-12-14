var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var LinksButtonCtl = require('./LinksButtonCtl.jsx');
var LinksSelectDropdown = require('./LinksSelectDropdown.jsx');
var utils = require('../../utils');

var LinksForm = React.createClass({

  componentDidMount: function() {
    utils.autoAddHttp();
  },

  render: function() {
    var self = this;
    var id = self.props['data-counter'];
    var defaultSelectData = self.props.initSelectLabel;
    var linkLabelOption = defaultSelectData.map(function(row, id){
      return <option value={row.id} key={row.id}>{row.text}</option>
    });

    return(
      <div id={'link_' + id} key={id} data-counter={id} class='importantLinksSection'>
          {/* display dropdown select for link labels */}
          <LinksSelectDropdown
            action='onInsert'
            id={id}
            linkLabelOption={linkLabelOption}
            getSelectedLinkLabel={self.props.getSelectedLinkLabel}
            setSelectedLinkLabel={self.props.setSelectedLinkLabel}
            initSelectLabel={self.props.initSelectLabel}
            setOnEditModeLinkIds={self.setOnEditModeLinkIds}
            selectedTeam={self.props.selectedTeam} />

        <div>{/* display url textfield */}
          <input type='text' name='url_[]' id={'url_' + id} data-counter={id} placeholder='URL' size='60' class='implink' />
        </div>

        {/* display update, cancel & delete icon button */}
        <LinksButtonCtl data-counter={id}
          action='onInsert'
          selectedTeam={self.props.selectedTeam}
          resetNumChildLinks={self.props.resetNumChildLinks}
          updateLink={self.props.updateLink} />
      </div>
    );
  }
});

module.exports = LinksForm;
