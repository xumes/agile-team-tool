var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var LinksButtonCtl = require('./LinksButtonCtl.jsx');
var LinksSelectDropdown = require('./LinksSelectDropdown.jsx');

var LinksForm = React.createClass({

  componentDidMount: function() {
    $('select[name=\'linklabel_[]\']').select2();
    // this.showHideLinkDivOnCancel();
    this.showHideLinkDivOnAdd();
  },

  componentDidUpdate: function(prevProps, prevState) {
    $('select[name=\'linklabel_[]\']').select2();
  },

  showHideLinkDivOnAdd: function() {
    $('#importantLinkWrapper div.importantLinksSection').on('mouseover', function(){
      var ctr = $(this).attr('data-counter');
      $('#removelink_'+ctr).show();
      $('#savelink_'+ctr).show();
    });
    $('#importantLinkWrapper div.importantLinksSection').on('mouseout', function(){
      $('.newlink').hide();
    });
  },

  render: function() {
    var self = this;
    var id = self.props['data-counter'];
    var defaultSelectData = self.props.initSelectLabel;
    var linkLabelOption = defaultSelectData.map(function(row, id){
      return <option value={row.id} key={row.id}>{row.text}</option>
    });
    var styleHidden = {'display': 'none'};
    return(
      <div id={`link_${id}`} key={id} data-counter={id} class='importantLinksSection'>
          {/* display dropdown select for link labels */}
          <LinksSelectDropdown
            action='onInsert'
            id={id}
            linkLabelOption={linkLabelOption}
            getSelectedLinkLabel={self.props.getSelectedLinkLabel}
            setSelectedLinkLabel={self.props.setSelectedLinkLabel}
            updateSelectLabel={self.props.updateSelectLabel}
            initSelectLabel={self.props.initSelectLabel}
            setOnEditModeLinkIds={self.setOnEditModeLinkIds} />

        <div>
          <input type='text' name='url_[]' id={id} placeholder='URL' size='60' />
        </div>

        <LinksButtonCtl data-counter={id}
          action='onInsert'
          selectedTeam={self.props.selectedTeam}
          resetNumChildLinks={self.props.resetNumChildLinks}
          updateLink={self.props.updateLink}
          />
      </div>
    );
  }
});

module.exports = LinksForm;
