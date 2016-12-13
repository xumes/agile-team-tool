var React = require('react');

var LinksUrlTextfield = React.createClass({

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

  render: function() {
    var self = this;
    var id = self.props['data-id'];
    var idx = self.props['data-counter'];
    var linkUrl = self.props.linkUrl;
    var hasAccess = self.props.selectedTeam.access;
    if (hasAccess !== undefined && !hasAccess) $('#url_'+id).val(linkUrl);
    return (
      <div>
        <input type='text' name='url_[]' id={'url_' + id} key={'input-' + idx + '-' + id} data-id={id} defaultValue={linkUrl} data-counter={id} placeholder='URL' size='60' class='implink' onChange={self.props.onEditmodeLink} />
      </div>
    );
  }

});
module.exports = LinksUrlTextfield;