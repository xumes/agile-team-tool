var React = require('react');
var _ = require('underscore');

var ModalLinkLabelForm = React.createClass({
  componentDidMount: function() {
    $('#modal-custom-linkLabel').overlay();
  },

  addnewLinkLabel: function() {
    var self = this;
    var curLinkLabelID = self.props.getSelectedLinkLabel().docId; // e.g. linklabel_5703df3215101ecf8cbc8bf4b930a027
    var defaultSelectData = [];
    var newlabel = $.trim($('#newlabel').val());
    if (newlabel !== ''){
      defaultSelectData.push({id: newlabel, text: newlabel});
      $('#'+curLinkLabelID).select2({data: defaultSelectData});
      $('#'+curLinkLabelID).val(newlabel);
      $('#select2-' + curLinkLabelID + '-container').text(newlabel);
      var obj = {docId: curLinkLabelID, elemValue: newlabel};
      self.props.setSelectedLinkLabel(obj);
      IBMCore.common.widget.overlay.hide('modal-custom-linkLabel', true);
      $('#newlabel').val('');
    } else {
      alert('Please enter a label name');
    }
  },

  cancelLinkLabel: function() {
    var curLinkLabelID = this.props.getSelectedLinkLabel().docId;
    $('#modal-custom-linkLabel').css('cursor', 'default');
    IBMCore.common.widget.overlay.hide('modal-custom-linkLabel', true);
    $('#select2-' + curLinkLabelID + '-container').text('Select label');
    $('#select2-' + curLinkLabelID + '-container').attr('title', 'Select label');
    $('#'+curLinkLabelID).val('-1');
    $('#newlabel').val('');
  },

  render: function() {
    var self = this;
    return (
      <div id="modal-custom-linkLabel" class="ibm-common-overlay" data-widget="overlay">
        <form id="customLinkLabelForm" class="ibm-row-form" action="javascript:void(0);">
          <h2 class="ibm-bold">Link Label</h2>
          <p>
            <label for="newlabel">Please enter a new label name:</label>
            <span>
              <input type="text" name="newlabel" id="newlabel" aria-label="New label" size="45" placeholder="Other" required/>
            </span>
          </p>
          <div class="ibm-rule ibm-alternate">
            <hr />
          </div>
          <span class="ibm-btn-row">
            <input type="button" class="ibm-btn-pri ibm-btn-small" id="addnewLinkLabelBtn" value="Create" onClick={self.addnewLinkLabel} />
            <input type="button" class="ibm-btn-sec ibm-btn-small" id="cancelLinkLabelBtn" value="Cancel" onClick={self.cancelLinkLabel} />
          </span>
        </form>
      </div>
    );
  }
});

module.exports = ModalLinkLabelForm;
