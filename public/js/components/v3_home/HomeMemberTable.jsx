var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var ReactDOM = require('react-dom');
var HomeAddMember = require('./HomeAddMember.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;


var HomeMemberTable = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },
  componentDidMount: function() {
    this.initialAll();
    $('.team-member-table-content-role > div > div > select').change(this.changeRoleHandler);
    // $('.team-member-table-content-allocation > div > select').change(this.changeMemberHandler);
    $('.team-member-table-content-awk > div > div > select').change(this.changeAwkHandler);
  },
  componentDidUpdate: function() {
    this.initialAll();
    /* update change*/
  },

  componentWillMount: function() {
    document.addEventListener('click', this.handleClick, false);
  },

  componentWillUnmount: function() {
    document.removeEventListener('click', this.handleClick, false);
  },

  handleClick: function(e){
    if(!ReactDOM.findDOMNode(this).contains(e.target) || e.target.id == 'teamMemberTableTitle') {
      $('.team-member-table-content-role > h').css('display','');
      $('.team-member-table-content-role > .modify-field').css('display','none');
      $('.team-member-table-content-location > h').css('display','');
      // $('.team-member-table-content-location input').val('');
      $('.team-member-table-content-location > .modify-field').css('display','none');
      $('.team-member-table-content-allocation > h').css('display','');
      // $('.team-member-table-content-allocation input').val('');
      $('.team-member-table-content-allocation > .modify-field').css('display','none');
      $('.team-member-table-content-awk > h').css('display','');
      $('.team-member-table-content-awk > .modify-field').css('display','none');
    }
  },

  initialAll: function() {
    $('.team-member-table-content-role > div > div > select').select2({'width':'100%'});
    // $('.team-member-table-content-allocation > div > select').select2({'width':'100%'});
    $('.team-member-table-content-awk > div > div > select').select2({'width':'99%'});
    this.hoverBlock('team-member-table-content-role');
    this.hoverBlock('team-member-table-content-location');
    this.hoverBlock('team-member-table-content-allocation');
    this.hoverBlock('team-member-table-content-awk');
    this.hoverMainBlock('team-member-table-content-block1');
    this.hoverMainBlock('team-member-table-content-block2');
    this.onClickBlock('team-member-table-content-role');
    this.onClickBlock('team-member-table-content-location');
    this.onClickBlock('team-member-table-content-allocation');
    this.onClickBlock('team-member-table-content-awk');
  },

  onClickBlock: function(block) {
    $('.' + block + ' > h').css('display','');
    $('.' + block + ' > div').css('display','none');
    $('.' + block).off('click');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).click(function(){
        $('.team-member-table-content-role > h').css('display','');
        $('.team-member-table-content-role > .modify-field').css('display','none');
        $('.team-member-table-content-location > h').css('display','');
        // $('.team-member-table-content-location input').val('');
        $('.team-member-table-content-location > .modify-field').css('display','none');
        $('.team-member-table-content-allocation > h').css('display','');
        // $('.team-member-table-content-allocation input').val('');
        $('.team-member-table-content-allocation > .modify-field').css('display','none');
        $('.team-member-table-content-awk > h').css('display','');
        $('.team-member-table-content-awk > .modify-field').css('display','none');
        $(this).find('h').css('display', 'none');
        $(this).find('.modify-field').css('display', 'block');
        var uid = $(this).find('input')[0].id;
        setTimeout(function(){
          $('#'+uid).focus();
        },0);
        var blockId = $('#'+$(this)[0].id).parents()[0].id;
        $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
      });
    }
  },

  hoverBlock: function(block) {
    $('.' + block + ' > h').unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block + ' > h').hover(function(){
        $(this).css('border','0.1em solid');
        $(this).css('background-color','#FFFFFF');
        $(this).css('padding-top','0.2em');
        $(this).css('cursor','pointer');
      }, function(){
        $(this).css('border','');
        $(this).css('background-color','');
        $(this).css('padding-top','0');
        $(this).css('cursor','default');
      });
    }
  },

  hoverMainBlock: function(block) {
    $('.' + block).unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).hover(function(){
        var blockId = $(this)[0].id;
        var roleB = $('#' + blockId + ' > .team-member-table-content-role > h').css('display');
        var locationB = $('#' + blockId + ' > .team-member-table-content-location > h').css('display');
        var allocationB = $('#' + blockId + ' > .team-member-table-content-allocation > h').css('display');
        var awkB = $('#' + blockId + ' > .team-member-table-content-awk > h').css('display');
        if (roleB != 'none' && locationB != 'none' && allocationB != 'none' && awkB != 'none') {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'block');
        } else {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
        }
      }, function(){
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
      });
    }
  },

  delTeamMemberHandler: function(idx) {
    var self = this;
    var blockId = 'name_' + idx;
    var memberEmail = $('#' + blockId + ' > div > h1').html();
    var newMembers = [];
    var newMembersContent = [];
    var r = confirm('Do you want to delete this member: ' + memberEmail + '?');
    if (r) {
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        }
      });
      _.each(self.props.loadDetailTeam.members, function(member){
        if (member.email != memberEmail) {
          newMembersContent.push(member);
        }
      });
      // self.props.loadDetailTeam.team.members = newMembers;
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          self.props.realodTeamMembers(newMembers, newMembersContent);
          // console.log(results);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },
  // changeMemberHandler: function(e) {
  //   var self = this;
  //   var newMembers = [];
  //   if (e.target.id.indexOf('role') >= 0) {
  //     var blockId = 'name_' + e.target.id.substring(12, e.target.id.length);
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
  //   } else if (e.target.id.indexOf('allocation') >= 0) {
  //     blockId = 'name_' + e.target.id.substring(18, e.target.id.length);
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').html(e.target.value + '%');
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').css('display','');
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > div').css('display','none');
  //
  //   } else {
  //     blockId = 'name_' + e.target.id.substring(11, e.target.id.length);
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
  //   }
  //   var memberEmail = $('#' + blockId + ' > div > h1').html();
  //   _.each(self.props.loadDetailTeam.team.members, function(member){
  //     if (member.email != memberEmail) {
  //       newMembers.push(member);
  //     } else {
  //       var pm = JSON.parse(JSON.stringify(member));
  //       if (e.target.id.indexOf('role') >= 0) {
  //         pm['role'] = e.target.value;
  //       } else if (e.target.id.indexOf('allocation') >= 0) {
  //         pm['allocation'] = e.target.value;
  //       } else {
  //       }
  //       newMembers.push(pm);
  //     }
  //   });
  //   api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
  //     .then(function(results){
  //       // console.log(results);
  //     })
  //     .catch(function(err){
  //       console.log(err);
  //     });
  // },

  showAddTeamTable: function() {
    this.setState({ showModal: true });
  },
  hideAddTeamTable: function() {
    this.setState({ showModal: false });
  },
  toTitleCase: function(str) {
    if (_.isEmpty(str)) return '';
    var strArray = str.toUpperCase().split(',');
    if (strArray.length < 3) {
      return str.toUpperCase();
    } else {
      strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return strArray.join(', ');
    }
  },

  changeRoleHandler: function(e) {
    var self = this;
    var newMembers = [];
    var roleId = 'role_' + e.target.id.substring(12, e.target.id.length);
    if (e.target.value == 'Other...') {
      $('#' + roleId + ' .input-field').show();
      setTimeout( function() {
        $('#r_' + roleId).focus();
      }, 0);
      $('#' + roleId + ' .input-field > input').focus();
    } else if (e.target.value == 'psr') {
      $('#' + roleId + ' .input-field > input').val('');
      $('#' + roleId + ' .input-field').hide();
    } else {
      $('#' + roleId + ' .input-field > input').val('');
      $('#' + roleId + ' .input-field').hide();
      $('#' + roleId + ' > h').html(e.target.value);
      $('#' + roleId + ' .modify-field').hide();
      $('#' + roleId + ' > h').show();
      var blockId = 'name_' + e.target.id.substring(12, e.target.id.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['role'] = e.target.value;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['role'] = e.target.value;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveRole: function(roleId) {
    var self = this;
    var newMembers = [];
    var roleValue = $('#' + roleId + ' input').val();
    $('#' + roleId + ' > h').html(roleValue);
    $('#' + roleId + ' .modify-field').hide();
    $('#' + roleId + ' > h').show();
    var blockId = 'name_' + roleId.substring(5, roleId.length);
    var memberEmail = $('#' + blockId + ' > div > h1').html();
    _.each(self.props.loadDetailTeam.team.members, function(member){
      if (member.email != memberEmail) {
        newMembers.push(member);
      } else {
        var pm = JSON.parse(JSON.stringify(member));
        pm['role'] = roleValue;
        newMembers.push(pm);
      }
    });
    api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
      .then(function(results){
        _.each(self.props.loadDetailTeam.team.members, function(member){
          if (member.email == memberEmail) {
            member['role'] = roleValue;
          }
        });
      })
      .catch(function(err){
        console.log(err);
      });
  },

  cancelRoleChange: function(roleId) {
    $('#' + roleId + ' > .modify-field').css('display','none');
    $('#' + roleId + ' > h').css('display','');
    $('#' + roleId + ' input').val('');
  },

  saveAllocation: function(allocationId) {
    var self = this;
    var newMembers = [];
    var allocationValue = $('#' + allocationId + ' input').val();
    console.log(allocationValue);
    if (allocationValue < 0 || allocationValue > 100 || allocationValue == '') {
      alert('Allocation value should be between 0 and 100.');
    } else {
      $('#' + allocationId + ' > h').html(allocationValue + '%');
      var blockId = 'name_' + allocationId.substring(11, allocationId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      $('#' + allocationId + ' > .modify-field').css('display','none');
      $('#' + allocationId + ' > h').css('display','');
      $('#' + allocationId + ' input').val('');
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['allocation'] = allocationValue;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['allocation'] = allocationValue;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  cancelAllocationChange: function(allocationId) {
    $('#' + allocationId + ' > .modify-field').css('display','none');
    $('#' + allocationId + ' > h').css('display','');
    $('#' + allocationId + ' input').val('');
  },

  saveLocation: function(locationId) {
    var self = this;
    var locationValue = $('#' + locationId + ' input').val();
    if (locationValue == '') {
      alert('Location info cannot be empty.');
    } else {
      $('#' + locationId + ' > h').html(locationValue);
      var blockId = 'name_' + locationId.substring(9, locationId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      $('#' + locationId + ' > .modify-field').css('display','none');
      $('#' + locationId + ' > h').css('display','');
      $('#' + locationId + ' input').val('');
      var newMember = _.find(self.props.loadDetailTeam.members, function(member){
        if (member.email == memberEmail) {
          return member;
        }
      });
      if (!_.isEmpty(newMember)) {
        newMember['location']['site'] = locationValue.toLowerCase();
        api.updateUser(newMember);
      }
    }
  },

  cancelLocationChange: function(locationId) {
    $('#' + locationId + ' > .modify-field').css('display','none');
    $('#' + locationId + ' > h').css('display','');
    $('#' + locationId + ' input').val('');
  },

  changeAwkHandler: function(e) {
    // console.log(e.target.id.substring(11, e.target.id.length));
    var self = this;
    var newMembers = [];
    var awkId = 'awk_' + e.target.id.substring(11, e.target.id.length);
    if (e.target.value == 'other') {
      $('#' + awkId + ' .input-field').show();
      setTimeout( function() {
        $('#w_' + awkId).focus();
      }, 0);
    } else {
      $('#' + awkId + ' .input-field > input').val('');
      $('#' + awkId + ' .input-field').hide();
      if (e.target.value == 100) {
        $('#' + awkId + ' > h').html('Full Time');
      } else {
        $('#' + awkId + ' > h').html('Half Time');
      }
      $('#' + awkId + ' .modify-field').hide();
      $('#' + awkId + ' > h').show();
      var blockId = 'name_' + e.target.id.substring(11, e.target.id.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['workTime'] = e.target.value;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['workTime'] = e.target.value;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveAwk: function(awkId) {
    var self = this;
    var newMembers = [];
    var awkValue = $('#' + awkId + ' input').val();
    if (awkValue > 100 || awkValue < 0 || awkValue == '') {
      alert('Averge work per week should be between 0 to 100.');
    } else {
      if (awkValue == 100) {
        $('#' + awkId + ' > h').html('Full Time');
      } else if (awkValue == 50) {
        $('#' + awkId + ' > h').html('Half Time');
      } else {
        $('#' + awkId + ' > h').html(awkValue + '%');
      }
      $('#' + awkId + ' .modify-field').hide();
      $('#' + awkId + ' > h').show();
      var blockId = 'name_' + awkId.substring(4, awkId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['workTime'] = awkValue;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['workTime'] = awkValue;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  cancelAwkChange: function(awkId) {
    $('#' + awkId + ' > .modify-field').css('display','none');
    $('#' + awkId + ' > h').css('display','');
    $('#' + awkId + ' input').val('');
  },

  wholeNumCheck: function(e) {
    var self = this;
    var pattern = /^\d*$/;
    if (e.charCode == 13) {
      self.keyPressCheck(e);
    } else if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  keyPressCheck: function(e) {
    var self = this;
    if (e.charCode == 13) {
      switch (e.target.id.substring(0,1)) {
        case 'l': self.saveLocation(e.target.id.substring(2,e.target.id.length));
          break;
        case 'a': self.saveAllocation(e.target.id.substring(2,e.target.id.length));
          break;
        case 'w': self.saveAwk(e.target.id.substring(2,e.target.id.length));
          break;
        case 'r': self.saveRole(e.target.id.substring(2,e.target.id.length));
          break;
      }
    }
  },

  escPressCheck: function(e) {
    var self = this;
    if (e.keyCode == 27) {
      switch (e.target.id.substring(0,1)) {
        case 'l': self.cancelLocationChange(e.target.id.substring(2,e.target.id.length));
          break;
        case 'a': self.cancelAllocationChange(e.target.id.substring(2,e.target.id.length));
          break;
        case 'w': self.cancelAwkChange(e.target.id.substring(2,e.target.id.length));
          break;
        case 'r': self.cancelRoleChange(e.target.id.substring(2,e.target.id.length));
          break;
      }
    }
  },

  // handleClick: function(e) {
  //   console.log('aaa')
  // },

  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      team = self.props.loadDetailTeam.team;
      var allocationArray = Array.from(Array(101).keys())
      var allocationSelection = allocationArray.map(function(a){
        return (
          <option key={a} value={a}>{a+'%'}</option>
        )
      });
      var roleSelection = self.props.roles.map(function(r){
        return (
          <option key={r} value={r}>{r}</option>
        )
      });
      if (team.members == null || team.members.length == 0) {
        var teamMembers = null;
      } else {
        var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
          return member.name.toLowerCase();
        });
        if (self.props.loadDetailTeam.access) {
          var addTeamBtnStyle = false;
        } else {
          addTeamBtnStyle = true;
        }
        teamMembers = members.map(function(member, idx){
          if (idx <= 14) {
            var memberDetail = _.find(team.members, function(m){
              if (m.userId == member.userId) {
                return {
                  'role': m.role,
                  'allocation': m.allocation,
                  'workTime': m.workTime
                }
              }
            });
            var mLocation = self.toTitleCase(member.location.site);
            //var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            // var src = '//images.w3ibm.mybluemix.net/image/' + member.userId.toUpperCase();
            var src = '//faces-cache.mybluemix.net/image/' + member.userId.toUpperCase();
            var blockColor = {
              'backgroundColor': '#FFFFFF'
            }
            var blockClass = 'team-member-table-content-block1';
            if (idx % 2 != 0) {
              blockColor['backgroundColor'] = '#EFEFEF';
              blockClass = 'team-member-table-content-block2';
            }
            var blockId = 'member_'+idx;
            var nameId = 'name_'+idx;
            var locationId = 'location_'+idx;
            var roleId = 'role_'+idx;
            var allocationId = 'allocation_'+idx;
            var awkId = 'awk_'+idx;
            if (self.props.loadDetailTeam.access) {
              var deletBtn = (
                <span onClick={self.delTeamMemberHandler.bind(null, idx)}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
                </span>
              );
              var addTeamBtnStyle = false;
            } else {
              deletBtn = null;
              addTeamBtnStyle = true;
            }
            var awkValue = 'Full Time';
            // if (_.isNumber(memberDetail.workTime)) {
            if (memberDetail.workTime == 50) {
              awkValue = 'Half Time';
            } else if (memberDetail.workTime == 100) {
              awkValue = 'Full Time';
            } else {
              awkValue = memberDetail.workTime + '%';
            }
            // }
            return (
              <div key={blockId} id={blockId} class={blockClass}>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
                <div id={nameId} style={{'width':'28.8%'}}>
                  <div style={{'width':'25.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img style={{'position':'relative', 'top':'17%'}} src={src}></img>
                  </div>
                  <div style={{'width':'74.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div class='team-member-table-content-role' id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                  <div class='modify-field'>
                    <div class='dropdown-list'>
                      <select id={'role_select_' + idx} defaultValue='Select a role'>
                        <option key='psr' value='psr'>Please select a role</option>
                        {roleSelection}
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'r_'+roleId} placeholder='Developer' onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck}></input>
                      <div class='save-btn' onClick={self.saveRole.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelRoleChange.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-location' id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                  <div class='modify-field'>
                    <input type='text' id={'l_'+locationId} placeholder='Somers,NY,USA' onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck}></input>
                    <div class='save-btn' onClick={self.saveLocation.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'2%'}} onClick={self.cancelLocationChange.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-allocation' id={allocationId} style={{'width':'11.3%'}}>
                  <h>{memberDetail.allocation+'%'}</h>
                  <div class='modify-field'>
                    {/*<select id={'allocation_select_' + idx} defaultValue={memberDetail.allocation}>
                      {allocationSelection}
                    </select>*/}
                    <input type='text' id={'a_'+allocationId} placeholder='50' min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck}></input>
                    <h1>%</h1>
                    <div class='save-btn' onClick={self.saveAllocation.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelAllocationChange.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-awk' id={awkId} style={{'width':'16.7%'}}>
                  <h>{awkValue}</h>
                  <div class='modify-field'>
                    <div class='dropdown-list'>
                      <select id={'awk_select_' + idx} defaultValue='Full Time'>
                        <option key='100' value='100'>Full Time</option>
                        <option key='50' value='50'>Half Time</option>
                        <option key='other' value='other'>Other</option>
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'w_'+awkId} placeholder='50' min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck}></input>
                      <h1>%</h1>
                      <div class='save-btn' onClick={self.saveAwk.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'2%'}} onClick={self.cancelAwkChange.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                  {deletBtn}
                </div>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
              </div>
            )
          }
        });
      }
      return (
        <div id='teamMemberTable' style={{'display':'none'}}>
          <div id='teamMemberTableTitle' class='team-member-table-title-div'>
            <h class='team-member-table-title'>Team Details</h>
            <div class='team-member-table-close-btn' onClick={self.props.showTeamTable}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='team-member-table' id='memberTable'>
            <div class='team-member-table-header-block'>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'28.6%'}}>
                <h>Name</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'19.1%'}}>
                <h>Role</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'21.7%'}}>
                <h>Location</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'11.1%'}}>
                <h>Allocation</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'16.7%'}}>
                <h>Avg. work week</h>
              </div>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
            </div>
            {teamMembers}
            <div class='team-member-table-footer-block'>
              <div class='team-member-table-footer'>
                <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={addTeamBtnStyle} onClick={self.showAddTeamTable}>Add Team Member</button>
              </div>
            </div>
          </div>
          <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal} onHide={self.hideAddTeamTable}>
            <HomeAddMember realodTeamMembers={self.props.realodTeamMembers} loadDetailTeam={self.props.loadDetailTeam} roleSelection={roleSelection} hideAddTeamTable={self.hideAddTeamTable}/>
          </Modal>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
