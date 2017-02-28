var React = require('react');
var InlineSVG = require('svg-inline-react');
var Select = require('react-select');
var _ = require('underscore');

var HomeAddTeamDropdownRole = React.createClass({
  getInitialState: function() {
    return {
      showOther: false,
      customRole: ''
    }
  },
  roleHandler: function(data) {
    if (data.value && (data.value.toLowerCase() === 'other...')) {
      var uid = this.refs.selrole.props['data-uid'];
      $('#wrapper-role-'+uid + ' .Select-value').html('Other...');
      $('.Select-placeholder').html('Other...');
      $('.Select-placeholder').addClass('otherTxt');
      this.setState({showOther: true});
    } else {
      this.setState({showOther: false});
      this.props.roleHandler(this.refs, data);
    }
  },
  saveRole: function(uid) {
    console.log('saveRole..', uid);
    var other = $('#wrapper-role-'+uid + ' #input-field').val();
    if (_.isEmpty(other)) {
      alert('Role cannot be empty.');
    } else {
      var obj = {'value': other, 'label': other};
      this.props.roleHandler(this.refs, obj);
    }
  },
  cancelRole: function(uid) {
    console.log('cancelRole..', uid);
    this.setState({showOther: false});
  },
  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberRole = self.props.memberRole;
    var options = [];
    self.props.roles.map(function(v) {
      options.push({value: v, label: v});
    });
    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    return(
      <div key={memberUserId} id={'wrapper-role-'+memberUserId}>
        <Select
          name='select-role'
          ref='selrole'
          data-uid={memberUserId}
          value={memberRole}
          options={options}
          clearable={false}
          placeholder='Select Role'
          onChange={self.roleHandler} />
        <div class='custom-field-other' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='10' class='input-field' />
          <div class='save-btn' onClick={self.saveRole.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='cancel-btn' onClick={self.cancelRole.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = HomeAddTeamDropdownRole;
