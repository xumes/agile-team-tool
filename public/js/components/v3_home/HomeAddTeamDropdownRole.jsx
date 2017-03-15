var React = require('react');
var InlineSVG = require('svg-inline-react');
var Select = require('react-select');
var _ = require('underscore');

var HomeAddTeamDropdownRole = React.createClass({
  getInitialState: function() {
    return {
      showOther: false,
      selectedRole: ''
    }
  },
  componentDidMount: function() {
    this.init();
    var memberRole = this.props.memberRole;
    this.setState({selectedRole: memberRole});
  },
  componentDidUpdate: function() {
    this.init();
  },

  init: function() {
    var self = this;
    $('.createteam-role-field').mouseover(function() {
      var blockId = $(this)[0].id;
      var txt = $('#'+blockId + ' .data-team-role .data').html();
      $('#'+blockId +' > div.data-team-role').css('display','none');
      $('#'+blockId +' > div.data-team-role-select').css('display','block');
      $('#'+blockId + ' .data-team-role-select .Select-value-label').html(txt);
      $('#'+blockId + ' .data-team-role-select .Select-placeholder').html(txt);
    });

    $('.createteam-role-field').mouseleave(function() {
      var blockId = $(this)[0].id;
      var txt = $('#'+blockId + ' .data-team-role .data').html();
      $('#'+blockId +' > div.data-team-role').css('display','block');
      $('#'+blockId +' > div.data-team-role-select').css('display','none');
    });
  },
  roleHandler: function(data) {
    if (data.value && (data.value.toLowerCase() === 'other...')) {
      var uid = this.refs.selrole.props['data-uid'];
      $('#wrapper-role-'+uid + ' .Select-placeholder').addClass('otherTxt');
      this.updateSelectValue(uid, 'Other...');
      this.setState({showOther: true});
      window.setTimeout(function(){
        var input = $('#wrapper-role-'+uid + ' .input-field');
        var strLength = input.val().length * 2;
        input.focus();
        input[0].setSelectionRange(strLength, strLength);
      }, 10);
      $('#wrapper-role-'+uid + ' .data-team-role .data').html(data.value);
      $('#wrapper-role-'+uid + ' .custom-field-other #input-field').val(this.state.selectedRole);
    } else {
      this.setState({showOther: false});
      this.props.roleHandler(this.refs, data);
    }
  },
  saveRole: function(uid) {
    var other = $('#wrapper-role-'+uid + ' > .role-other > #input-field').val();
    if (_.isEmpty(other)) {
      alert('Role cannot be empty.');
    } else {
      var obj = {'value': other, 'label': other};
      $('#wrapper-role-'+uid + ' > div.data-team-role .data').html(other);
      $('#wrapper-role-'+uid + ' > div.data-team-role-select').css('display', 'none');
      this.props.roleHandler(this.refs, obj);
      this.setState({selectedRole: other});
      this.updateSelectValue(uid, other);
    }
  },
  cancelRole: function(uid) {
    if (_.isUndefined(this.state.selectedRole)) {
      $('#wrapper-role-'+uid+ ' .data-team-role .data').html('Select Role');
      this.updateSelectValue(uid, 'Select Role');
    } else {
      $('#wrapper-role-'+uid+ ' .data-team-role .data').html(this.state.selectedRole);
      this.updateSelectValue(uid, this.state.selectedRole);
    }
    this.setState({showOther: false});
  },
  updateSelectValue: function(uid, value) {
    $('#wrapper-role-'+uid + ' .data-team-role-select .Select-control .Select-value').html(value);
    $('#wrapper-role-'+uid + ' .data-team-role-select .Select-control .Select-placeholder').html(value);
  },
  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberRole = self.props.memberRole || 'Select Role';
    var options = [];
    self.props.defaultRoles.map(function(v) {
      if (v) {
        options.push({value: v, label: v});
      }
    });
    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    return(
      <div key={memberUserId} id={'wrapper-role-'+memberUserId} class='createteam-role-field'>
        <div class='data-team-role'>
          <div class='Select-control2' >
            <span class='Select-multi-value-wrapper data'>{memberRole}</span>
            <span class='Select-arrow-zone2'>
              <span class='Select-arrow2'></span>
            </span>
          </div>
        </div>
        <div class='data-team-role-select' style={{'display':'none'}} >
          <Select
            name='select-role'
            ref='selrole'
            data-uid={memberUserId}
            value={memberRole}
            options={options}
            clearable={false}
            placeholder='Select Role'
            onChange={self.roleHandler} />
        </div>
        <div class='custom-field-other role-other' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='10' class='input-field' />
          <input id='current-role' type='hidden' value={memberRole} />
          <div class='r_save-btn' onClick={self.saveRole.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='r_cancel-btn' onClick={self.cancelRole.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = HomeAddTeamDropdownRole;
