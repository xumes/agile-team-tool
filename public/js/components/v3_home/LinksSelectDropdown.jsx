var React = require('react');
var LinksSelectDropdown = React.createClass({
  componentDidMount:function() {
    var self = this;
    $('#link_label').select2();
    // workaround for the onchange event
    $(document.body).on('change', '#link_label', function(){
      self.props.updateStateLinkLabel(this.value);
    });
  },
  onchangeLinkLabel: function() {
    console.log('onchangeLinkLabel..');
  },
  render: function() {
    var self = this;
    return (
      <p class="ibm-form-elem-grp">
        <label>Link Name</label>
        <span>
          <select name='link_label' class='implabel' id='link_label' value={self.props.linkLabel}>
            {self.props.linkLabelOption}
          </select>
          <span id='link_label_error' class='ibm-item-note'></span>
        </span>
      </p>
    );
  }
});

module.exports = LinksSelectDropdown;
