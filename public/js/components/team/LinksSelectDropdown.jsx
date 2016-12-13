var React = require('react');
var LinksSelectDropdown = React.createClass({
  componentDidMount: function() {
    var id = this.props['id'];
    $('#linklabel_'+id).select2();
    $('.implabel').change(this.changeHandlerPopupCustomLabel);
    var hasAccess = this.props.selectedTeam.access;
    if (hasAccess) {
      $('.implink, .implabel').removeAttr('disabled');
      $('.implabel, .implink').attr('enabled', 'enabled');
    } else {
      $('.implink, .implabel').removeAttr('enabled');
      $('.implabel, .implink').attr('disabled', 'disabled');
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    var hasAccess = this.props.selectedTeam.access;
    if (hasAccess) {
      $('.implink, .implabel').removeAttr('disabled');
      $('.implabel, .implink').attr('enabled', 'enabled');
    } else {
      $('.implink, .implabel').removeAttr('enabled');
      $('.implabel, .implink').attr('disabled', 'disabled');
    }
  },

  changeHandlerPopupCustomLabel: function(event) {
    var selectedVal = event.target.value;
    var selectedId = event.target.dataset.id;
    var id = this.props['id'];
    var row = {};
    var currentLabel;
    if (this.props['row'] !== undefined) {
      row = this.props['row'];
      currentLabel = row['linkLabel'];
    }
    if ((selectedVal !== undefined || selectedVal !== '') && (selectedId !== undefined && id === selectedId)) {
      if (selectedVal === 'Other...') {
        var obj = {docId: 'linklabel_'+selectedId};
        this.props.setSelectedLinkLabel(obj);
        IBMCore.common.widget.overlay.show('modal-custom-linkLabel');
        setInterval(function() {
          $('#ibm-overlaywidget-modal-custom-linkLabel-content #newlabel').focus();
        }, 1);
      }
      if (selectedVal !== currentLabel) {
        $('#UpdateCancelLinkGrp_'+id).show();
        $('#DeleteLinkGrp_'+id).hide();
        this.props.setOnEditModeLinkIds(id);
      }
    } else {
      var selectedId = event.target.id;
      if (selectedVal === 'Other...') {
        var obj = {docId: selectedId};
        this.props.setSelectedLinkLabel(obj);
        IBMCore.common.widget.overlay.show('modal-custom-linkLabel');
        setInterval(function() {
          $('#ibm-overlaywidget-modal-custom-linkLabel-content #newlabel').focus();
        }, 1);
      }
    }
  },

  render: function() {
    var self = this;
    var row = self.props['row'];
    var id = self.props['id'];
    var _id = self.props['_id'];
    var selectedVal = self.props['selectedVal'];
    var hasAccess = self.props.selectedTeam.access;
    if (hasAccess !== undefined && !hasAccess) $('#linklabel_'+id).val(selectedVal);
    var linkLabelOption = self.props['linkLabelOption'];
    var action = self.props['action'];
    if (action === 'onInsert') {
      return (
        <div>
          <select key={id} id={`linklabel_${id}`} name='linklabel_[]' class='implabel' defaultValue={selectedVal}>
            {linkLabelOption}
          </select>
        </div>
      );
    } else {
      return (
        <div>
          <select key={id} data-id={id} data-mongo-id={_id} id={`linklabel_${id}`} name='linklabel_[]' class='implabel' defaultValue={selectedVal}>
            {linkLabelOption}
          </select>
        </div>
      );
    }
  }
});
module.exports = LinksSelectDropdown;