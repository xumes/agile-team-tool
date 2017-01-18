var ccIds = [];
var valCount = 0;
var hasError = false;
jQuery(function($) {
  $(document).ready(function() {
    $('#feedback').keyup(function() {
      if ($('#feedback').val().trim() !== '') {
        $('#feeback_submit').removeAttr('disabled');
      } else {
        $('#feeback_submit').attr('disabled', 'disabled');
      }
    });
  });
});

function getTeamNames(_callback, args) {
  $.ajax({
    type: 'GET',
    url: '/api/teams/names'
  }).done(function(data) {
    args.push(data);

    if (typeof _callback === 'function') {
      _callback.apply(this, args);
    }
  }).fail(function() {
    if (typeof _callback === 'function') {
      _callback.apply(this, args);
    }
  });
}

function teamNamesHandler(teams) {
  teams = _.sortBy(teams, function(team) {
    return team.name;
  });
  var listOption = [];
  for (var i = 0; i < teams.length; i++) {
    var option = [];
    option.push(teams[i].name);
    option.push(teams[i].name);
    listOption.push(option);
  }
  setSelectOptions('feedback_teamName', listOption, ['Not specified', 'Not specified'], null, 'Not specified');
}

function submitFeedback() {
  valCount = 0;
  hasError = false;
  ccIds = [];
  var result = validateEmail();
  if (result) {
    processFeedback();
  }
}

function processFeedback() {
  $('#feeback_submit').attr('disabled', 'disabled');
  $('#sendFeedback').css('cursor', 'progress');
  $.ajax({
    type: 'POST',
    url: '/email/feedback',
    data: {
      'feedback_sender': $('#feedback_sender').val(),
      'feedback_senderName': $('#feedback_senderName').val(),
      'feedback_page': $('#feedback_page').val(),
      'feedback_teamName': $('#feedback_teamName').val(),
      'feedback': $('#feedback').val()
    },
    async: true
  }).done(function(message) {
    $('#sendFeedback').css('cursor', 'default');
    var feedbackMsg = IBMCore.common.widget.overlay.createOverlay({
      contentHtml: '<p>'+message+'</p>',
      classes: 'ibm-overlay ibm-overlay-alt'
    });
    feedbackMsg.init();
    feedbackMsg.show();
    IBMCore.common.widget.overlay.hide('sendFeedback', true);
  });
}

function closeFeedback() {
  $('#sendFeedback').css('cursor', 'default');
  IBMCore.common.widget.overlay.hide('sendFeedback', true);
}

function initFeedback(userInfo) {
  hasError = false;
  ccIds = [];
  valCount = 0;
  $('#feedback_sender').val(userInfo.email);
  $('#feedback_senderName').val(userInfo.name);
  $('#feedback_teamName').val('');
  $('#feedback').val('');
  $('#userEmail').html(userInfo.email);
  document.getElementById('feedback_cancel').disabled = false;
}

function launchFeeback() {
  $('#feedback').removeAttr('disabled');
  $.ajax({
    type: 'GET',
    url: '/api/users/activeInfo',
    contentType: 'application/json'
  }).fail(function(xhr, textStatus, errorThrown) {
    if (xhr.status === 400) {
      console.log(JSON.stringify(errorThrown));
    }
  }).done(function(userInfo) {
    initFeedback(userInfo[0]);
    getTeamNames(teamNamesHandler, []);
    IBMCore.common.widget.overlay.show('sendFeedback');
    $('#feeback_submit').attr('disabled', 'disabled');
  });
}

function setSelectOptions(elementId, listOption, firstOption, lastOption, selectedOption) {
  console.log('setSelectOptions');
  $('#' + elementId).empty();
  var selectedText = '';
  var option = document.createElement('option');
  if (firstOption != undefined) {
    option.setAttribute('value', firstOption[0]);
    if (firstOption[0] == selectedOption || firstOption[1] == selectedOption) {
      option.setAttribute('selected', 'selected');
      selectedText = firstOption[1];
    }
    option.appendChild(document.createTextNode(firstOption[1]));
    $('#' + elementId).append(option);

  } else {
    option.setAttribute('value', '');
    if (selectedOption == '' || selectedOption == null) {
      option.setAttribute('selected', 'selected');
      selectedText = 'Select one';
    }
    option.appendChild(document.createTextNode('Select one'));
    $('#' + elementId).append(option);
  }

  if (listOption != undefined) {
    for (var i = 0; i < listOption.length; i++) {
      option = document.createElement('option');
      if (listOption[i][0] == selectedOption || listOption[i][1] == selectedOption) {
        option.setAttribute('value', listOption[i][0]);
        option.setAttribute('selected', 'selected');
        option.appendChild(document.createTextNode(listOption[i][1]));
        selectedText = listOption[i][1];
      } else {
        option.setAttribute('value', listOption[i][0]);
        option.appendChild(document.createTextNode(listOption[i][1]));
      }

      $('#' + elementId).append(option);
    }
  }

  if (lastOption != undefined) {
    option = document.createElement('option');
    option.setAttribute('value', lastOption[0]);
    if (lastOption[0] == selectedOption || lastOption[1] == selectedOption) {
      option.setAttribute('selected', 'selected');
      selectedText = lastOption[1];
    }
    option.appendChild(document.createTextNode(lastOption[1]));
    $('#' + elementId).append(option);

  }
  //IBMCore.common.widget.selectlist.init("#" + elementId);
  //$("#" + elementId).trigger("change");
  //alert("defaulting value to : " + selectedText);
  $('#select2-' + elementId + '-container').text(selectedText);
  $('#select2-' + elementId + '-container').attr('title', selectedText);
  $('#' + elementId).attr('aria-label',elementId);
}
