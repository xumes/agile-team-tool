var React = require('react');
var _ = require('underscore');

var ModalLinkLabelForm = React.createClass({
  componentDidMount: function() {
    console.log('ModalLinkLabelForm componentDidMount...');
    $('#modal-custom-linkLabel').overlay();
  },

  componentDidUpdate: function(prevProps, prevState) {
    // console.log('ModalLinkLabelForm componentDidUpdate...');
  },

  addnewLinkLabel: function() {
    console.log('addnewLinkLabel...');
    var self = this;
    // var defaultSelectData = self.props.initSelectLabel;
    // var defaultSelectData = _.clone(self.props.initSelectLabel);
    // var curLinkLabelID = self.props.getSelectedLinkLabel(); // e.g. linklabel_5703df3215101ecf8cbc8bf4b930a027
    var curLinkLabelID = self.props.getSelectedLinkLabel().docId; // e.g. linklabel_5703df3215101ecf8cbc8bf4b930a027
    // var curLinkLabel = self.props.getSelectedLinkLabel().elemValue; // e.g. linklabel_5703df3215101ecf8cbc8bf4b930a027
    // console.log('addnewLinkLabel curLinkLabelID:', curLinkLabelID);
    // console.log('addnewLinkLabel defaultSelectData:', defaultSelectData);
    // console.log('addnewLinkLabel curLinkLabel:', curLinkLabel);
    // var curLinkLabelID = self.props.currentLinkLabelID;
    // var curLinkLabelID = 'linklabel_5703df3215101ecf8cbc8bf4b930a027';

    var defaultSelectData = [];
    var newlabel = $.trim($('#newlabel').val());
    if (newlabel !== ''){
      defaultSelectData.push({id: newlabel, text: newlabel});
      $('#'+curLinkLabelID).select2({data: defaultSelectData});

      // console.log('updateSelectLabel:', JSON.stringify({id: newlabel, text: newlabel}));
      // console.log('addnewLinkLabel newlabel:', newlabel);
      console.log('addnewLinkLabel defaultSelectData:', JSON.stringify(defaultSelectData));
      // var opt = $('#'+curLinkLabelID + ' option[value='+ newlabel +']');
      // opt.attr('selected','selected');
      $('#'+curLinkLabelID).val(newlabel);

      // self.props.updateSelectLabel([{id: newlabel, text: newlabel}]);
      $('#select2-' + curLinkLabelID + '-container').text(newlabel);
      var obj = {docId: curLinkLabelID, elemValue: newlabel};
      self.props.setSelectedLinkLabel(obj);
      IBMCore.common.widget.overlay.hide('modal-custom-linkLabel', true);


      // $('#'+curLinkLabelID).attr('selected', 'selected');
      // $('#'+curLinkLabelID).val(newlabel).change();
      // document.getElementById(curLinkLabelID).value=newlabel;
      // $('#'+curLinkLabelID).val(newlabel);
      // $("#" + curLinkLabelID + " [value='" + newlabel + "']").attr("selected","selected");
      // $('#select2-' + curLinkLabelID + '-container').text(newlabel);
      $('#newlabel').val('');
    } else {
      alert('Please enter a label name');
    }
  },

  cancelLinkLabel: function() {
    var curLinkLabelID = this.props.getSelectedLinkLabel().docId;
    console.log('cancelLinkLabel curLinkLabelID:', curLinkLabelID);
    $('#modal-custom-linkLabel').css('cursor', 'default');
    IBMCore.common.widget.overlay.hide('modal-custom-linkLabel', true);
    $('#select2-' + curLinkLabelID + '-container').text('Select label');
    $('#select2-' + curLinkLabelID + '-container').attr('title', 'Select label');
    $('#'+curLinkLabelID).val('-1');
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
