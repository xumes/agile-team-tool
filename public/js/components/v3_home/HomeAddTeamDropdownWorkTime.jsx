var React = require('react');
var Select = require('react-select');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamDropdownWorkTime = React.createClass({
  getInitialState: function() {
    return {
      showOther: false,
      defaultWorkTime: ['Full Time', 'Half Time', 'Other'],
      selectedAvgworkweek: ''
    }
  },

  componentDidMount: function() {
    var memberWorkTime = this.props.memberWorkTime || 100;
    this.setState({selectedAvgworkweek: memberWorkTime});
    this.init();
  },

  componentDidUpdate: function() {
    this.init();
  },

  init: function() {
    var self = this;
    var defaultWorkTime = _.clone(self.state.defaultWorkTime);

    $('.tbl-members-role-data .createteam-worktime-field').unbind('mouseenter mouseleave');
    $('.tbl-members-role-data .r_save-btn').click(self.saveWorkTime);
    $('.tbl-members-role-data .r_cancel-btn').click(self.cancelWorkTime);
    $('.tbl-members-role-data .createteam-worktime-field').hover(function(){
      var blockId = $(this)[0].id;
      var id = blockId.split('-')[2];
      var txt = $('#'+blockId + ' .data-team-role .data').html();
      var hasClicked = $('#wrapper-worktime-'+id).hasClass('hasClicked');

      // if the inputted data(e.g. 11%) dont exist in the array
      if (!_.contains(defaultWorkTime, txt)) {
        if (hasClicked === false) {
          self.displayOtherRoleSelect(blockId, txt);
        } else {
          $('#'+blockId + ' .custom-field-other').css('display','none');
          self.displayOtherRoleSelect(blockId, txt);
        }
      } else {
        // if the inputted data(e.g. Full Time) was exist in the array
        if (_.contains(defaultWorkTime, txt)) {
          self.hideDataTeamRole(blockId);
        }
      }

      $('#wrapper-worktime-'+id).removeClass('hasClicked');
    }, function(){
      var blockId = $(this)[0].id;
      var id = blockId.split('-')[2];
      var txt = $('#'+blockId + ' .data-team-role .data').html();
      var hasClicked = $('#wrapper-worktime-'+id).hasClass('hasClicked');
        // if the inputted data(e.g. 11%) dont exist in the array
        if (!_.contains(defaultWorkTime, txt)) {
          if (hasClicked === false) {
            $('#'+blockId + ' div.data-team-role').css('display','block');
            $('#'+blockId + ' div.data-team-role-select').css('display','none');
            $('#'+blockId + ' .custom-field-other').css('display','none');
          }
        }
    });
  },
  hideCustomFieldOther: function(blockId) {
    $('#'+blockId + ' .custom-field-other').css('display','none');
    $('#'+blockId + ' .data-team-role').css('display','none');
    $('#'+blockId + ' .data-team-role-select').css('display','block');
  },
  hideDataTeamRole: function(blockId) {
    $('#'+blockId + ' .data-team-role').css('display','none');
    $('#'+blockId + ' .data-team-role-select').css('display','block');
  },
  displayOtherRoleSelect: function(blockId, txt) {
    txt = parseInt(txt);
    $('#'+blockId + ' .data-team-role').css('display','none');
    $('#'+blockId + ' .data-team-role-select').css('display','block');
    $('#'+blockId + ' .data-team-role-select .Select-value-label').html('Other...');
    $('#'+blockId + ' .data-team-role-select .Select-placeholder').html('Other...');

    $('#'+blockId + ' .custom-field-other').css('display','block');
    $('#'+blockId + ' .custom-field-other .input-field').val(txt);
  },
  workTimeHandler: function(data) {
    if (data.value && (data.value === -1)) {
      var uid = this.refs.selavgworkweek.props['data-uid'];
      $('#wrapper-worktime-'+uid + ' .Select-placeholder').addClass('otherTxt');
      this.updateSelectValue(uid, 'Other');
      this.setState({showOther: true});
      window.setTimeout(function(){
        var input = $('#wrapper-worktime-'+uid + ' .input-field');
        var strLength = input.val().length * 2;
        input.focus();
        input[0].setSelectionRange(strLength, strLength);
      }, 10);
      $('#wrapper-worktime-'+uid + ' .data-team-role .data').html('Other');
      $('#wrapper-worktime-'+uid + ' .custom-field-other #input-field').val(this.state.selectedAvgworkweek);
    } else {
      this.setState({showOther: false});
      this.props.workTimeHandler(this.refs, data);
    }
  },
  saveWorkTime: function(uid) {
    if (typeof (uid) == 'string') {
      var other = parseInt($('#wrapper-worktime-'+uid + ' .role-worktime > #input-field').val().trim());
      if (!other) {
        alert('Average work per week is required.');
      } else {
        if (other > 100 || other < 0) {
          alert('Average work per week should be between 0 to 100.');
        } else {
          var obj = {'value': other, 'label': other};
          this.props.workTimeHandler(this.refs, obj);
          this.setState({selectedAvgworkweek: other}, function(){
            $('#wrapper-worktime-'+uid).addClass('hasClicked');
          });
        }
      }
    }
  },

  cancelWorkTime: function(uid) {
    if (typeof (uid) == 'string') {
      if (_.isUndefined(this.state.selectedAvgworkweek)) {
        $('#wrapper-worktime-'+uid+ ' .data-team-role .data').html('Select...');
        this.updateSelectValue(uid, 'Select...');
      } else {
        $('#wrapper-worktime-'+uid+ ' .data-team-role .data').html(this.getAvgworkweekByLabel(this.state.selectedAvgworkweek));
        $('#wrapper-worktime-'+uid + ' .custom-field-other').css('display','none');
        this.updateSelectValue(uid, this.state.selectedAvgworkweek);
      }
      this.setState({showOther: false});
    }
  },

  getAvgworkweekByLabel: function(value) {
    if (value == 100) {
      return 'Full Time';
    } else if (value == 50) {
      return 'Half Time';
    } else {
      if (value == 'Other'){
        return value;
      } else {
        return value + '%';
      }
    }
  },

  updateSelectValue: function(uid, value) {
    value = this.getAvgworkweekByLabel(value);
    $('#wrapper-worktime-'+uid + ' .Select-control .Select-value').html(value);
    $('#wrapper-worktime-'+uid + ' .Select-control .Select-placeholder').html(value);
  },

  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberWorkTime = self.props.memberWorkTime || 100;
    var memberWorkTimeLabel;
    var memberWorkTimeLabel = self.getAvgworkweekByLabel(memberWorkTime);

    var selavgworkweek = [];
    _.map(self.props.defaultWorkTime, function(k, v){
      if (!_.contains(self.state.defaultWorkTime, v)) {
        // selavgworkweek.push({value: k, label: v + '%'});
      } else {
        selavgworkweek.push({value: k, label: v});
      }
    });
    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    return(
      <div key={memberUserId} id={'wrapper-worktime-'+memberUserId} class='createteam-worktime-field'>
        <div class='data-team-role'>
          <div class='Select-control2'>
            <span class='Select-multi-value-wrapper data'>{memberWorkTimeLabel}</span>
            <span class='Select-arrow-zone2'>
              <span class='Select-arrow2'></span>
            </span>
          </div>
        </div>
        <div class='data-team-role-select' style={{'display':'none'}}>
          <Select
            name='select-avgworkweek'
            ref='selavgworkweek'
            data-uid={memberUserId}
            value={memberWorkTime}
            options={selavgworkweek}
            clearable={false}
            onChange={self.workTimeHandler} />
        </div>
        <div class='custom-field-other role-worktime' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='5' class='input-field wt' maxLength='3' max='100' min='0' /><h1>%</h1>
          <div class='r_save-btn' onClick={self.saveWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='r_cancel-btn' onClick={self.cancelWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>      
      </div>

    );
  }
});

module.exports = HomeAddTeamDropdownWorkTime;
