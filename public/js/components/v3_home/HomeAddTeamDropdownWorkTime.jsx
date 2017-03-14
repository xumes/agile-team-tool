var React = require('react');
var Select = require('react-select');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamDropdownWorkTime = React.createClass({
  getInitialState: function() {
    return {
      showOther: false,
      defaultWorkTime: ['Full Time', 'Half Time', 'Other']
    }
  },

  workTimeHandler: function(data) {
    if (data.value && (data.value === -1)) {
      var uid = this.refs.selavgworkweek.props['data-uid'];
      this.updateSelectValue(uid, 'Other...');
      $('#wrapper-worktime-'+uid + ' .Select-control .Select-placeholder').addClass('otherTxt');
      this.setState({showOther: true});
    } else {
      this.setState({showOther: false});
      this.props.workTimeHandler(this.refs, data);
    }
  },

  saveWorkTime: function(uid) {
    var other = parseInt($('#wrapper-worktime-'+uid + ' > .role-worktime > #input-field').val().trim());
    if (!other) {
      alert('Average work per week is required.');
    } else {
      if (other > 100 || other < 0) {
        alert('Average work per week should be between 0 to 100.');
      } else {
        var obj = {'value': other, 'label': other};
        this.props.workTimeHandler(this.refs, obj);
      }
    }
  },

  cancelWorkTime: function(uid, prevdata) {
    var self = this;
    _.map(self.props.defaultWorkTime, function(k, v){
      if(prevdata === k){
        prevdata = v;
      }
    });

    if (_.isUndefined(prevdata)){
      self.updateSelectValue(uid, 'Select...');
    } else {
      self.updateSelectValue(uid, prevdata);
    }
    this.setState({showOther: false});
  },

  updateSelectValue: function(uid, value) {
    $('#wrapper-worktime-'+uid + ' .Select-control .Select-value').html(value);
    $('#wrapper-worktime-'+uid + ' .Select-control .Select-placeholder').html(value);
  },

  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberWorkTime = self.props.memberWorkTime || 100;
    var selavgworkweek = [];
    _.map(self.props.defaultWorkTime, function(k, v){
      if (!_.contains(self.state.defaultWorkTime, v)) {
        selavgworkweek.push({value: k, label: v + '%'});
      } else {
        selavgworkweek.push({value: k, label: v});
      }
    });
    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    return(
      <div key={memberUserId} id={'wrapper-worktime-'+memberUserId}>
        <Select
          name='select-avgworkweek'
          ref='selavgworkweek'
          data-uid={memberUserId}
          value={memberWorkTime}
          options={selavgworkweek}
          clearable={false}
          onChange={self.workTimeHandler} />
        <div class='custom-field-other role-worktime' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='5' class='input-field wt' maxLength='3' max='100' min='0' /><h1>%</h1>
          <div class='r_save-btn' onClick={self.saveWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='r_cancel-btn' onClick={self.cancelWorkTime.bind(null, memberUserId, memberWorkTime)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>      
      </div>

    );
  }
});

module.exports = HomeAddTeamDropdownWorkTime;
