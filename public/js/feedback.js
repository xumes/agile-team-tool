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

function teamNamesHandler(teams) {
  teams = sortAgileTeamsByName(teams);
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

function initFeedback(userEmail) {
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

function launchFeeback(userEmail) {
  getTeamNames(teamNamesHandler, []);

  IBMCore.common.widget.overlay.show('sendFeedback');
  $('#feeback_submit').attr('disabled', 'disabled');
  initFeedback(userEmail);
}

function validateEmail() {
  var isValid = false;
  var ids = $('#feedback_cc').val();
  if (ids === '' || ids.indexOf('/') == -1) {
    isValid = true;
  }
  if (ids !== '') {
    ids = ids.split(',');
    $.each(ids, function(index, item) {
      if (item.length > 1 && item !== ' ') {
        item = item.replace(/^\s\s*/, '').replace(/\s*$/, '');
        if (item.indexOf('/') > 0) {
          valCount += 1;
          getEmail(item);
        } else {
          if (ccIds.indexOf(item) == -1) {
            ccIds.push(item);
          }
        }
      }
    });
  }
  return isValid;
}


//TODO remove ?
function getEmail(notesId) {
  var facesRoot = 'https://faces.w3ibm.mybluemix.net/api/';
  var facesFunc = 'find/?format=faces&q=notes/id:' + encodeURIComponent(notesId);
  var facesURL = facesRoot + facesFunc;

  $.ajax({
    'global': false,
    'cache': false,
    'url': facesURL,
    'timeout': 5000,
    'jsonp': 'callback',
    'scriptCharset': 'UTF-8',
    'success': function(data) {
      if (data.persons.length === 0) {
        showMessagePopup('Your feedback could not be submitted because at least one of the cc email addresses is not in internet address or NotesID format.');
        return false;
      }
      var facesPerson = data.persons[0].person;
      if (facesPerson['notes-id'] == notesId) {
        var emailId = facesPerson.email;
        if (ccIds.indexOf(emailId) == -1) {
          ccIds.push(emailId);
        }
        valCount--;
        if (valCount <= 0 && !hasError) {
          processFeedback();
        }
      } else {
        hasError = true;
        showMessagePopup('Your feedback could not be submitted because at least one of the cc email addresses is not in internet address or NotesID format.');
        return false;
      }
    },
    'error': function(data, status, error) {
      valCount--;
      hasError = true;
      showMessagePopup(status);
      return false;
    }
  });
}
