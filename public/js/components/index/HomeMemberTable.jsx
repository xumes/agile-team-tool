var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var ReactDOM = require('react-dom');
var HomeAddMember = require('./HomeAddMember.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var ConfirmDialog = require('./ConfirmDialog.jsx');
var ConfirmDialogError = require('./ConfirmDialog.jsx');

var HomeMemberTable = React.createClass({
  getInitialState: function() {
    return { showModal: false, showConfirmModal: false, showConfirmErrorModal: false, alertMsg: ''};
  },
  componentDidMount: function() {
    this.initialAll();
    $('.save-btn svg').attr('title','Save').children('title').remove();
    $('.cancel-btn svg').attr('title','Cancel').children('title').remove();
    $('.delete-btn svg').attr('title','Remove Member').children('title').remove();
    $('.team-member-table-content-role > div > div > select').change(this.changeRoleHandler);
    // $('.team-member-table-content-allocation > div > select').change(this.changeMemberHandler);
    $('.team-member-table-content-awk > div > div > select').change(this.changeAwkHandler);
  },
  componentDidUpdate: function() {
    $('.team-member-table-content-role > div > div > select').off('change');
    $('.team-member-table-content-awk > div > div > select').off('change');
    this.initialAll();
    $('.team-member-table-content-role > div > div > select').change(this.changeRoleHandler);
    $('.team-member-table-content-awk > div > div > select').change(this.changeAwkHandler);
  },

  componentWillMount: function() {
    document.addEventListener('click', this.handleClick, false);
  },

  componentWillUnmount: function() {
    document.removeEventListener('click', this.handleClick, false);
  },

  handleClick: function(e) {
    var self = this;
    // if there are fields on edit mode, check the previous field if value has changed without the user saving it
    // and cancel the previous changes
    if ($('.team-member-table-content-block-show').length >= 0) {
      var parentDivId = $('.team-member-table-content-block-show').parent().attr('id');
      _.each(self.props.loadDetailTeam.team.members, function(member, index) {
        if ($('#role_' + index + ' input').attr('placeholder') != $('#role_' + index + ' input').val() && parentDivId != ('role_' + index)) {
          self.cancelChange('role_' + index);
        }
        if ($('#location_' + index + ' input').attr('placeholder') != $('#location_' + index + ' input').val() && parentDivId != ('location_' + index)) {
          self.cancelChange('location_' + index);
        }
        if ($('#allocation_' + index + ' input').attr('placeholder') != $('#allocation' + index + ' input').val() && parentDivId != ('allocation_' + index)) {
          self.cancelChange('allocation_' + index);
        }
        if ($('#awk_' + index + ' input').attr('placeholder') != $('#awk' + index + ' input').val() && parentDivId != ('awk_' + index)) {
          self.cancelChange('awk_' + index);
        }
      });
    }
    // for all clicks ouside the member rows
    if(!ReactDOM.findDOMNode(this).contains(e.target) || e.target.id == 'teamMemberTableTitle' || e.target.id == 'teamMemberTableFooter') {
      _.each(self.props.loadDetailTeam.team.members, function(member, index) {
        if ($('#role_' + index + ' .save-btn').css('display') == 'block') {
          if ($('#role_' + index + ' input').attr('placeholder') != $('#role_' + index + ' input').val()) {
            self.cancelChange('role_' + index);
          }
        } else if ($('#location_' + index + ' .save-btn').css('display') == 'block') {
          if ($('#location_' + index + ' input').attr('placeholder') != $('#location_' + index + ' input').val()) {
            self.cancelChange('location_' + index);
          }
        } else if ($('#allocation' + index + ' .save-btn').css('display') == 'block') {
          if ($('#allocation_' + index + ' input').attr('placeholder') != $('#allocation' + index + ' input').val()) {
            self.cancelChange('allocation_' + index);
          }
        } else if ($('#awk' + index + ' .save-btn').css('display') == 'block') {
          if ($('#awk_' + index + ' input').attr('placeholder') != $('#awk' + index + ' input').val()) {
            self.cancelChange('awk_' + index);
          }
        }
      });
      $('.save-btn').hide();
      $('.cancel-btn').hide();
      $('.team-member-table-content-role > h').css('display','block');
      $('.team-member-table-content-role > h').removeClass('team-member-table-content-block-hide');
      $('.team-member-table-content-role > .modify-field').css('display','none');
      $('.team-member-table-content-role > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-location > h').css('display','block');
      $('.team-member-table-content-location > h').removeClass('team-member-table-content-block-hide');
      // $('.team-member-table-content-location input').val('');
      $('.team-member-table-content-location > .modify-field').css('display','none');
      $('.team-member-table-content-location > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-allocation > h').css('display','block');
      $('.team-member-table-content-allocation > h').removeClass('team-member-table-content-block-hide');
      // $('.team-member-table-content-allocation input').val('');
      $('.team-member-table-content-allocation > .modify-field').css('display','none');
      $('.team-member-table-content-allocation > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-awk > h').css('display','block');
      $('.team-member-table-content-awk > h').removeClass('team-member-table-content-block-hide');
      $('.team-member-table-content-awk > .modify-field').css('display','none');
      $('.team-member-table-content-awk > .modify-field').removeClass('team-member-table-content-block-show');
    }
  },

  initialAll: function() {
    var self = this;
    $('.team-member-table-content-role > div > div > select').select2({'width':'100%','dropdownParent':$('#memberTable')});
    // $('.team-member-table-content-allocation > div > select').select2({'width':'100%','dropdownParent':$('#memberTable')});
    $('.team-member-table-content-awk > div > div > select').select2({'width':'99%','dropdownParent':$('#memberTable')});
    self.hoverBlock('team-member-table-content-role');
    self.hoverBlock('team-member-table-content-location');
    self.hoverBlock('team-member-table-content-allocation');
    self.hoverBlock('team-member-table-content-awk');
    self.hoverMainBlock('team-member-table-content-block1');
    self.hoverMainBlock('team-member-table-content-block2');
    self.onClickBlock('team-member-table-content-role');
    self.onClickBlock('team-member-table-content-location');
    self.onClickBlock('team-member-table-content-allocation');
    self.onClickBlock('team-member-table-content-awk');
    _.each(self.props.loadDetailTeam.team.members, function(member, index){
      if(self.props.roles.indexOf(member.role) >= 0) {
        $('#role_select_' + index).val(member.role).change();
        $('#role_' + index + ' .input-field > input').val('');
        $('#role_' + index + ' .input-field').hide();
      } else {
        $('#role_select_' + index).val('Other...').change();
        $('#role_' + index + ' .input-field > input').val(member.role);
        $('#role_' + index + ' .input-field').show();
      }
      $('#l_location_' + index).val($('#l_location_' + index).attr('placeholder'));
      $('#a_allocation_' + index).val($('#a_allocation_' + index).attr('placeholder'));
      if (member.workTime == 100 || member.workTime == 50) {
        $('#awk_select_' + index).val(member.workTime).change();
        $('#awk_' + index + ' .input-field > input').val('');
        $('#awk_' + index + ' .input-field').hide();
      } else {
        $('#awk_select_' + index).val('other').change();
        $('#awk_' + index + ' .input-field > input').val(member.workTime);
        $('#awk_' + index + ' .input-field').show();
      }
    });
  },

  onClickBlock: function(block) {
    $('.' + block + ' > h').css('display','');
    $('.' + block + ' > div').css('display','none');
    $('.' + block).off('click');
    if (this.props.loadDetailTeam.access) {
      $('.' + block + ':not(".user-deleted")').click(function(){
        $('.save-btn').hide();
        $('.cancel-btn').hide();
        $('.team-member-table-content-role > h').css('display','block');
        $('.team-member-table-content-role > h').removeClass('team-member-table-content-block-hide');
        $('.team-member-table-content-role > .modify-field').css('display','none');
        $('.team-member-table-content-role > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-location > h').css('display','block');
        $('.team-member-table-content-location > h').removeClass('team-member-table-content-block-hide');
        // $('.team-member-table-content-location input').val('');
        $('.team-member-table-content-location > .modify-field').css('display','none');
        $('.team-member-table-content-location > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-allocation > h').css('display','block');
        $('.team-member-table-content-allocation > h').removeClass('team-member-table-content-block-hide');
        // $('.team-member-table-content-allocation input').val('');
        $('.team-member-table-content-allocation > .modify-field').css('display','none');
        $('.team-member-table-content-allocation > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-awk > h').css('display','block');
        $('.team-member-table-content-awk > h').removeClass('team-member-table-content-block-hide');
        $('.team-member-table-content-awk > .modify-field').css('display','none');
        $('.team-member-table-content-awk > .modify-field').removeClass('team-member-table-content-block-show');
        // $(this).find('h').css('display', 'none');
        // $(this).find('.modify-field').css('display', 'block');
        $(this).find('h').addClass('team-member-table-content-block-hide');
        $(this).find('.modify-field').addClass('team-member-table-content-block-show');
        $(this).find('.save-btn').show();
        $(this).find('.cancel-btn').show();
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
    $('.' + block).unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block + ':not(".user-deleted")').hover(function(){
        // $(this).css('border','0.1em solid');
        // $(this).css('background-color','#FFFFFF');
        // $(this).css('padding-top','0.2em');
        // $(this).css('cursor','pointer');
        var blockId = $(this)[0].id;
        if (!$('#' + blockId).hasClass('user-deleted')) {
          $('#' + blockId + ' > h').css('display', 'none');
          $('#' + blockId + ' > .modify-field').css('display','block');
        }
      }, function(){
        // $(this).css('border','');
        // $(this).css('background-color','');
        // $(this).css('padding-top','0');
        // $(this).css('cursor','default');
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > h').css('display', 'block');
        $('#' + blockId + ' > .modify-field').css('display','none');
      });
    }
  },

  hoverMainBlock: function(block) {
    $('.' + block).unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).hover(function(){
        var blockId = $(this)[0].id;
        var roleB = $('#' + blockId + ' > .team-member-table-content-role > h').hasClass('team-member-table-content-block-hide');
        var locationB = $('#' + blockId + ' > .team-member-table-content-location > h').hasClass('team-member-table-content-block-hide');
        var allocationB = $('#' + blockId + ' > .team-member-table-content-allocation > h').hasClass('team-member-table-content-block-hide');
        var awkB = $('#' + blockId + ' > .team-member-table-content-awk > h').hasClass('team-member-table-content-block-hide');
        if (roleB || locationB || allocationB || awkB) {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
        } else {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'block');
        }
      }, function(){
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
      });
    }
  },

  getMemberRowDetails: function(idx) {
    var member = new Object();
    member.email = $('#name_' + idx + ' > div > h1').html();
    member.role = $('#role_' + idx + ' > h').html();
    var allocation = $('#allocation_' + idx +  ' > h').html();
    member.allocation = allocation ? allocation.replace(/[^0-9.]/g,'') : '';
    var memberAwk = $('#awk_' + idx +  ' > h').html();
    if (memberAwk == 'Full Time')
      memberAwk = '100';
    else if (memberAwk == 'Half Time')
      memberAwk = '50';
    else
      memberAwk = memberAwk ? memberAwk.replace(/[^0-9.]/g,'') : '';
    member.workTime = memberAwk;
    return member;
  },

  delTeamMemberHandler: function(idx) {
    var self = this;
    var mrd = self.getMemberRowDetails(idx);
    var newMembers = [];
    var newMembersContent = [];
    var r = confirm('Do you want to delete this member: ' + mrd.email + '?');
    if (r) {
      newMembers = _.reject(self.props.loadDetailTeam.team.members, function(member, index){
        return index==idx;
      });

      _.each(self.props.loadDetailTeam.members, function(member){
        if (member.email != mrd.email) {
          newMembersContent.push(member);
        } else {
          var existMember = _.filter(newMembers, function(m){
            return m.email == mrd.email
          });
          if (!_.isEmpty(existMember))
            newMembersContent.push(member);
        }
      });

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          $('#member_' + idx).remove();
          if (newMembersContent.length != self.props.loadDetailTeam.members.length)
            self.props.reloadTeamMembers(result.members, newMembersContent);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  confirmDialog: function(idx) {
    var mrd = this.getMemberRowDetails(idx);
    this.setState({showConfirmModal: true, deleteMemberIdx: idx, deleteMemberEmail: mrd.email});
  },

  hideConfirmDialog: function() {
    this.setState({showConfirmModal: false});
  },

  hideConfirmErrorDialog: function() {
    this.setState({showConfirmErrorModal: false, alertMsg: ''});
  },

  deleteMember: function() {
    var self = this;
    var idx = self.state.deleteMemberIdx;
    var mrd = self.getMemberRowDetails(idx);
    var newMembers = [];
    var newMembersContent = [];
    newMembers = _.reject(self.props.loadDetailTeam.team.members, function(member, index){
      return index==idx;
    });

    _.each(self.props.loadDetailTeam.members, function(member){
      if (member.email != mrd.email) {
        newMembersContent.push(member);
      } else {
        var existMember = _.filter(newMembers, function(m){
          return m.email == mrd.email
        });
        if (!_.isEmpty(existMember))
          newMembersContent.push(member);
      }
    });

    api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
      .then(function(result){
        self.props.reloadTeamMembers(result.members, newMembersContent);
        self.setState({showConfirmModal: false});
      })
      .catch(function(err){
        if (err.responseJSON !== undefined && err.responseJSON['error'] !== undefined) {
          self.setState({showConfirmModal: false, showConfirmErrorModal: true, alertMsg: err.responseJSON['error']});
        } else if (err.responseJSON !== undefined && err.responseJSON['errmsg'] !== undefined) {
          self.setState({showConfirmModal: false, showConfirmErrorModal: true, alertMsg: err.responseJSON['errmsg']});
        } else {
          if (err['statusText'] != undefined) {
            self.setState({showConfirmModal: false, showConfirmErrorModal: true, alertMsg: err['statusText']});
          } else {
            self.setState({showConfirmModal: false, showConfirmErrorModal: true, alertMsg: err});
          }
        }
        console.log(err);
      });
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
      strArray = strArray.map(function(value){
        return value.trim();
      });
      strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return strArray.join(', ');
    }
  },

  changeRoleHandler: function(e) {
    var self = this;
    var newMembers = [];
    var roleId = 'role_' + e.target.id.substring(12, e.target.id.length);
    if (e.target.value == 'Other...') {
      $('#' + roleId + ' .dropdown-list').css('top', '25%');
      $('#' + roleId + ' .input-field').show();
      setTimeout( function() {
        $('#r_' + roleId).focus();
      }, 0);
      $('#' + roleId + ' .input-field > input').focus();
      $('#' + roleId + ' .save-btn').show();
      $('#' + roleId + ' .cancel-btn').show();
    } else if (e.target.value == 'psr') {
      $('#' + roleId + ' .dropdown-list').css('top', '50%');
      $('#' + roleId + ' .input-field > input').val('');
      $('#' + roleId + ' .input-field').hide();
      $('#' + roleId + ' .save-btn').hide();
      $('#' + roleId + ' .cancel-btn').hide();
    } else {
      $('#' + roleId + ' .dropdown-list').css('top', '50%');
      var idx = e.target.id.substring(12, e.target.id.length);
      var mrd = self.getMemberRowDetails(idx);
      var noChange = false;
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if (index == idx) {
          if (member.role == e.target.value && !noChange)
            noChange = true;
          member.role = e.target.value;
          newMembers.push(member);
        } else {
          newMembers.push(member);
        }
      });
      if (noChange) {
        $('#' + roleId + ' .input-field').hide();
        $('#' + roleId + ' .save-btn').hide();
        $('#' + roleId + ' .cancel-btn').hide();
        return;
      }

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          $('#' + roleId + ' .input-field > input').val('');
          $('#' + roleId + ' .input-field').hide();
          $('#' + roleId + ' .save-btn').hide();
          $('#' + roleId + ' .cancel-btn').hide();
          $('#' + roleId + ' > h').html(e.target.value);
          $('#' + roleId + ' input').attr('placeholder', e.target.value);
          $('#' + roleId + ' .modify-field').removeClass('team-member-table-content-block-show');
          $('#' + roleId + ' > h').removeClass('team-member-table-content-block-hide');

          //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveRole: function(roleId) {
    var self = this;
    var newMembers = [];
    var roleValue = $('#' + roleId + ' input').val().trim();
    if (roleValue == '') {
      self.setState({alertMsg: 'Role cannot be empty.', showConfirmErrorModal: true});
    } else {
      var idx = roleId.substring(5, roleId.length);
      var mrd = self.getMemberRowDetails(idx);
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if (index == idx) {
          member.role = roleValue;
          newMembers.push(member);
        } else {
          newMembers.push(member);
        }
      });

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          $('#' + roleId + ' > h').html(roleValue);
          $('#' + roleId + ' input').attr('placeholder', roleValue);
          $('#' + roleId + ' .save-btn').hide();
          $('#' + roleId + ' .cancel-btn').hide();
          $('#' + roleId + ' .modify-field').removeClass('team-member-table-content-block-show');
          $('#' + roleId + ' > h').removeClass('team-member-table-content-block-hide');

          //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  cancelChange: function(blockId) {
    var self = this;
    if (blockId.indexOf('role') >= 0) {
      if (self.props.roles.indexOf($('#' + blockId + ' input').attr('placeholder'))>=0) {
        $('#' + blockId + ' select').val($('#' + blockId + ' input').attr('placeholder')).change();
        $('#' + blockId + ' input').val('');
      } else {
        $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
      }
    } else if (blockId.indexOf('awk') >= 0) {
      if ($('#' + blockId + ' input').attr('placeholder') == 100 || $('#' + blockId + ' input').attr('placeholder') == 50) {
        $('#' + blockId + ' select').val($('#' + blockId + ' input').attr('placeholder')).change();
        $('#' + blockId + ' input').val('');
      } else {
        $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
      }
    } else {
      $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
    }
    $('#' + blockId + ' > .modify-field').removeClass('team-member-table-content-block-show');
    $('#' + blockId + ' > h').removeClass('team-member-table-content-block-hide');
    $('#' + blockId + ' .save-btn').hide();
    $('#' + blockId + ' .cancel-btn').hide();
  },

  saveAllocation: function(allocationId) {
    var self = this;
    var newMembers = [];
    var allocationValue = $('#' + allocationId + ' input').val();
    if (allocationValue < 0 || allocationValue > 100 || allocationValue == '') {
      self.setState({alertMsg: 'Allocation value should be between 0 and 100.', showConfirmErrorModal: true});
    } else {
      var idx = allocationId.substring(11, allocationId.length);
      var mrd = self.getMemberRowDetails(idx);
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if (index == idx) {
          member.allocation = allocationValue;
          newMembers.push(member);
        } else {
          newMembers.push(member);
        }
      });

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          $('#' + allocationId + ' > h').html(allocationValue + '%');
          $('#' + allocationId + ' > .modify-field').removeClass('team-member-table-content-block-show');
          $('#' + allocationId + ' > h').removeClass('team-member-table-content-block-hide');
          $('#' + allocationId + ' input').val(allocationValue);
          $('#' + allocationId + ' input').attr('placeholder', allocationValue);
          $('#' + allocationId + ' .save-btn').hide();
          $('#' + allocationId + ' .cancel-btn').hide();

          //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveLocation: function(locationId) {
    var self = this;
    var locationValue = $('#' + locationId + ' input').val().trim();
    if (locationValue == '') {
      self.setState({alertMsg: 'Location info cannot be empty.', showConfirmErrorModal: true});
    } else {
      var idx = locationId.substring(9, locationId.length)
      var mrd = self.getMemberRowDetails(idx);
      var userMember = _.find(self.props.loadDetailTeam.members, function(member){
        if (member.email == mrd.email) {
          return member;
        }
      });
      if (!_.isEmpty(userMember)) {
        userMember['location']['site'] = locationValue.toLowerCase();
        api.updateUser(userMember)
          .then(function(result){
            self.updateMemberTableLocations(mrd, idx, locationValue);

            //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
          })
      } else {
        self.updateMemberTableLocations(mrd, idx, locationValue);
      }
    }
  },

  updateMemberTableLocations: function(memberRowDetail, idx, locationValue) {
    var self = this;
    $('#location_' + idx + ' > h').html(locationValue);
    $('#location_' + idx + ' > .modify-field').removeClass('team-member-table-content-block-show');
    $('#location_' + idx + ' > h').removeClass('team-member-table-content-block-hide');
    $('#location_' + idx + ' input').val(locationValue);
    $('#location_' + idx + ' input').attr('placeholder', locationValue);
    $('#location_' + idx + ' .save-btn').hide();
    $('#location_' + idx + ' .cancel-btn').hide();

    $('[id^="location_"]').each(function(index, value){
      var mrd = self.getMemberRowDetails(index);
      if (memberRowDetail.email == mrd.email) {
        $('#' + value.id  + ' > h').html(locationValue);
        $('#' + value.id  + ' > .modify-field').removeClass('team-member-table-content-block-show');
        $('#' + value.id  + ' > h').removeClass('team-member-table-content-block-hide');
        $('#' + value.id  + ' input').val(locationValue);
        $('#' + value.id  + ' input').attr('placeholder', locationValue);
        $('#' + value.id  + ' .save-btn').hide();
        $('#' + value.id  + ' .cancel-btn').hide();
      }
    });
  },

  changeAwkHandler: function(e) {
    var self = this;
    var newMembers = [];
    var awkId = 'awk_' + e.target.id.substring(11, e.target.id.length);
    if (e.target.value == 'other') {
      $('#' + awkId + ' .dropdown-list').css('top', '25%');
      $('#' + awkId + ' .input-field').show();
      setTimeout( function() {
        $('#w_' + awkId).focus();
      }, 0);
      $('#' + awkId + ' .save-btn').show();
      $('#' + awkId + ' .cancel-btn').show();
    } else {
      $('#' + awkId + ' .dropdown-list').css('top', '50%');
      var idx = e.target.id.substring(11, e.target.id.length);
      var mrd = self.getMemberRowDetails(idx);
      var noChange = false;
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if (index == idx) {
          if (member.workTime == e.target.value && !noChange)
            noChange = true;
          member.workTime = e.target.value;
          newMembers.push(member);
        } else {
          newMembers.push(member);
        }
      });
      if (noChange) {
        $('#' + awkId + ' .input-field').hide();
        $('#' + awkId + ' .save-btn').hide();
        $('#' + awkId + ' .cancel-btn').hide();
        return;
      }

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          $('#' + awkId + ' input').attr('placeholder', e.target.value);
          $('#' + awkId + ' .input-field').hide();
          $('#' + awkId + ' .save-btn').hide();
          $('#' + awkId + ' .cancel-btn').hide();
          if (e.target.value == 100) {
            $('#' + awkId + ' > h').html('Full Time');
          } else {
            $('#' + awkId + ' > h').html('Half Time');
          }
          $('#' + awkId + ' .modify-field').removeClass('team-member-table-content-block-show');
          $('#' + awkId + ' > h').removeClass('team-member-table-content-block-hide');

          //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
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
      self.setState({alertMsg: 'Average work per week should be between 0 to 100.', showConfirmErrorModal: true});
    } else {
      var idx = awkId.substring(4, awkId.length);
      var mrd = self.getMemberRowDetails(idx);
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if (index == idx) {
          member.workTime = awkValue;
          newMembers.push(member);
        } else {
          newMembers.push(member);
        }
      });

      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(result){
          if (awkValue == 100) {
            $('#' + awkId + ' > h').html('Full Time');
          } else if (awkValue == 50) {
            $('#' + awkId + ' > h').html('Half Time');
          } else {
            $('#' + awkId + ' > h').html(awkValue + '%');
          }
          $('#' + awkId + ' input').attr('placeholder', awkValue);
          $('#' + awkId + ' .save-btn').hide();
          $('#' + awkId + ' .cancel-btn').hide();
          $('#' + awkId + ' .modify-field').removeClass('team-member-table-content-block-show');
          $('#' + awkId + ' > h').removeClass('team-member-table-content-block-hide');

          //self.props.reloadTeamMembers(result.members, self.props.loadDetailTeam.members);
        })
        .catch(function(err){
          console.log(err);
        });
    }
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
      self.cancelChange(e.target.id.substring(2,e.target.id.length));
      // switch (e.target.id.substring(0,1)) {
      //   case 'l': self.cancelLocationChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'a': self.cancelAllocationChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'w': self.cancelAwkChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'r': self.cancelChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      // }
    }
  },

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
        if (self.props.loadDetailTeam.access) {
          var addTeamBtnStyle = false;
        } else {
          addTeamBtnStyle = true;
        }

        teamMembers = self.props.loadDetailTeam.team.members.map(function(memberDetail, idx){
          //if (idx <= 14) {
            var userDetail = _.find(self.props.loadDetailTeam.members, function(m){
              if (m.userId == memberDetail.userId) {
                return m;
              }
            });
            var mLocation = '';
            var userExist = true;
            if (!_.isEmpty(userDetail))
              mLocation = self.toTitleCase(userDetail.location.site);
            else
              userExist = false;

            var src = '//faces-cache.mybluemix.net/image/' + memberDetail.userId.toUpperCase();
            var blockColor = {
              'backgroundColor': '#FFFFFF'
            }
            var blockClass = 'team-member-table-content-block1' + (userExist ? '' : ' user-deleted');
            if (idx % 2 != 0) {
              blockColor['backgroundColor'] = '#EFEFEF';
              blockClass = 'team-member-table-content-block2' + (userExist ? '' : ' user-deleted');
            }
            var blockId = 'member_'+idx;
            var nameId = 'name_'+idx;
            var locationId = 'location_'+idx;
            var roleId = 'role_'+idx;
            var allocationId = 'allocation_'+idx;
            var awkId = 'awk_'+idx;
            if (self.props.loadDetailTeam.access) {
              var deletBtn = (
                <span class='delete-btn' onClick={self.confirmDialog.bind(null, idx)}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
                </span>
              );
              var addTeamBtnStyle = false;
            } else {
              deletBtn = null;
              addTeamBtnStyle = true;
            }
            var awkValue = 'Full Time';
            var awkPlaceHolder = 100;
            // if (_.isNumber(memberDetail.workTime)) {
            if (memberDetail.workTime == 50) {
              awkValue = 'Half Time';
              awkPlaceHolder = 50;
            } else if (memberDetail.workTime == 100) {
              awkValue = 'Full Time';
            } else {
              awkValue = memberDetail.workTime + '%';
              awkPlaceHolder = memberDetail.workTime;
            }
            // }

            var roleTopStyle = self.props.roles.indexOf(memberDetail.role) < 0 ? {'top':'25%'} : null;
            var awkTopStyle = (memberDetail.workTime != '100' && memberDetail.workTime != '50') ? {'top':'25%'} : null;

            return (
              <div key={blockId} id={blockId} class={blockClass}>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
                <div id={nameId} style={{'width':'28.8%'}}>
                  <div style={{'width':'25.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img style={{'position':'relative', 'top':'17%'}} src={src}></img>
                  </div>
                  <div style={{'width':'74.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{memberDetail.name}</h>
                    <br/>
                    <h1 class='team-member-table-email'>{memberDetail.email}</h1>
                  </div>
                </div>
                <div class={userExist ? 'team-member-table-content-role' : 'team-member-table-content-role user-deleted'} id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                  {userExist ?
                  <div class='modify-field'>
                    <div class='dropdown-list' style={roleTopStyle}>
                      <select id={'role_select_' + idx} defaultValue='Select a role'>
                        <option key='psr' value='psr'>Please select a role</option>
                        {roleSelection}
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'r_'+roleId} placeholder={memberDetail.role} onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck}></input>
                      <div class='save-btn' onClick={self.saveRole.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelChange.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                  : ''}
                </div>
                <div class={userExist ? 'team-member-table-content-location' : 'team-member-table-content-location user-deleted'} id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                  {userExist ?
                  <div class='modify-field'>
                    <input type='text' id={'l_'+locationId} placeholder={mLocation} onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck} defaultValue={mLocation}></input>
                    <div class='save-btn' onClick={self.saveLocation.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'4%'}} onClick={self.cancelChange.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                  : <h class='user-deleted'>Invalid User<br/><span>(No longer in Bluepages)</span></h>}
                </div>
                <div class={userExist ? 'team-member-table-content-allocation' : 'team-member-table-content-allocation user-deleted'} id={allocationId} style={{'width':'11.3%'}}>
                  <h>{memberDetail.allocation+'%'}</h>
                  {userExist ?
                  <div class='modify-field'>
                    {/*<select id={'allocation_select_' + idx} defaultValue={memberDetail.allocation}>
                      {allocationSelection}
                    </select>*/}
                    <input type='text' id={'a_'+allocationId} placeholder={memberDetail.allocation} min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck} defaultValue={memberDetail.allocation}></input>
                    <h1>%</h1>
                    <div class='save-btn' onClick={self.saveAllocation.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelChange.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                  : ''}
                </div>
                <div class={userExist ? 'team-member-table-content-awk' : 'team-member-table-content-awk user-deleted'} id={awkId} style={{'width':'16.7%'}}>
                  <h>{awkValue}</h>
                  {userExist ?
                  <div class='modify-field'>
                    <div class='dropdown-list' style={awkTopStyle}>
                      <select id={'awk_select_' + idx} defaultValue='Full Time'>
                        <option key='100' value='100'>Full Time</option>
                        <option key='50' value='50'>Half Time</option>
                        <option key='other' value='other'>Other</option>
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'w_'+awkId} placeholder={awkPlaceHolder} min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck}></input>
                      <h1>%</h1>
                      <div class='save-btn' onClick={self.saveAwk.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'4%'}} onClick={self.cancelChange.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                  : ''}
                  {deletBtn}
                </div>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
              </div>
            )
          //}
        });
      }
      return (
        <div id='teamMemberTable' style={{'display':'none'}}>
          <div id='teamMemberTableTitle' class='team-member-table-title-div'>
            <h class='team-member-table-title'>Team Details</h>
            <div class='team-member-table-close-btn' onClick={self.props.closeTeamTable}>
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
              <div id='teamMemberTableFooter' class='team-member-table-footer'>
                <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={addTeamBtnStyle} onClick={self.showAddTeamTable}>Add Team Member</button>
                <h1 style={{'display':addTeamBtnStyle?'block':'none'}}>{'To be added to this team please contact the Team Lead or the Iteration Manager.'}</h1>
              </div>
            </div>
          </div>
          <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal} onHide={self.hideAddTeamTable}>
            <HomeAddMember reloadTeamMembers={self.props.reloadTeamMembers} loadDetailTeam={self.props.loadDetailTeam} roleSelection={roleSelection} hideAddTeamTable={self.hideAddTeamTable}/>
          </Modal>
          <ConfirmDialog showConfirmModal={self.state.showConfirmModal} hideConfirmDialog={self.hideConfirmDialog} confirmAction={self.deleteMember} alertType='warning' content={'Do you want to delete this member: ' + self.state.deleteMemberEmail +' ?'} actionBtnLabel='Delete' cancelBtnLabel='Cancel' />
          <ConfirmDialogError showConfirmModal={self.state.showConfirmErrorModal} hideConfirmDialog={self.hideConfirmErrorDialog} confirmAction={self.hideConfirmErrorDialog} alertType='error' content={self.state.alertMsg} actionBtnLabel='Ok' />
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
