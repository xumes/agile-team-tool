var React = require('react');
var ReactDOM = require('react-dom');

var LinksSelectDropdown = React.createClass({

  componentDidMount: function() {
    $('select[name=\'linklabel_[]\']').select2();
    $('.implabel').change(this.changeHandlerPopupCustomLabel);
  },

  componentWillUpdate: function(nextProps, nextState) {
    console.log('LinksSelectDropdown componentWillUpdate! ')
  },

  componentDidUpdate: function(prevProps, prevState) {
    console.log('LinksSelectDropdown componentDidUpdate! ')

    // var updateSelectLabel = this.props.updateSelectLabel;
    // defaultSelectData = this.props.initSelectLabel;
    var getSelectedLinkLabel = this.props.getSelectedLinkLabel();
    if (getSelectedLinkLabel && getSelectedLinkLabel['docId'] !== undefined) {
      var tt = getSelectedLinkLabel['docId'].split('_');
      var curLinkLabelID = tt[1];
    }

    var defaultSelectData = [
        {id: '-1', text: 'Select label'},
        {id: 'Wall of work', text: 'Wall of work'},
        {id: 'Backlog', text: 'Backlog'},
        {id: 'Retrospectives', text: 'Retrospectives'},
        {id: 'Defects', text: 'Defects'},
        {id: 'Standup schedule', text: 'Standup schedule'},
        {id: 'Other', text: 'Other...'},
        {id: 'AA', text: 'AA'}
      ];
    console.log('LinksSelectDropdown componentDidUpdate curLinkLabelID:',curLinkLabelID)
    $('#'+curLinkLabelID).select2({data: defaultSelectData});
    // console.log('LinksSelectDropdown componentDidUpdate defaultSelectData:',defaultSelectData);

    // if (getSelectedLinkLabel.elemValue !== undefined) {
    //   selectedVal = getSelectedLinkLabel.elemValue;
    // }
    // console.log('LinksSelectDropdown componentDidUpdate getSelectedLinkLabel:', JSON.stringify(getSelectedLinkLabel));
    // $('select[name=\'linklabel_[]\']').select2();
    // $('.implabel').change(this.changeHandlerPopupCustomLabel);
  },

  changeHandlerPopupCustomLabel: function(event) {
    var selectedVal = event.target.value;
    console.log('changeHandlerPopupCustomLabel selectedVal:',selectedVal)
    var selectedId = event.target.dataset.id;
    var id = this.props['id'];
    var row = {};
    var currentLabel;
    if (this.props['row'] !== undefined) {
      row = this.props['row'];
      currentLabel = row['linkLabel'];
    }
    if ((selectedVal !== undefined || selectedVal !== '') && (id === selectedId)) {
      if (selectedVal === 'Other') {
        var obj = {docId: 'linklabel_'+selectedId};
        this.props.setSelectedLinkLabel(obj);
        // this.props.setSelectedLinkLabel('linklabel_'+selectedId);
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
    }
  },

  render: function() {
    var self = this;
    var row = self.props['row'];
    var id = self.props['id'];
    var _id = self.props['_id'];
    var selectedVal = self.props['selectedVal'];
    // console.log('LinksSelectDropdown render selectedVal:',selectedVal)
    var linkLabelOption = self.props['linkLabelOption'];
    var updateSelectLabel = self.props.updateSelectLabel;
    var action = self.props['action'];
    // var getSelectedLinkLabel = self.props.getSelectedLinkLabel();
    // if (getSelectedLinkLabel.elemValue !== undefined) {
      // selectedVal = getSelectedLinkLabel.elemValue;
    // }
    // var refval = this.refs['reflinklabel_'+id];
    // console.log('id:',id,' refval:', refval)
    // console.log('LinksSelectDropdown render getSelectedLinkLabel.docId:',getSelectedLinkLabel.docId)
    // console.log('LinksSelectDropdown render getSelectedLinkLabel.elemValue:',getSelectedLinkLabel.elemValue)
    // console.log('LinksSelectDropdown render updateSelectLabel:', JSON.stringify(updateSelectLabel));
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