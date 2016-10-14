var ccIds = [];
var valCount = 0;
var hasError = false;
jQuery(function($) {
  $(document).ready(function(){
    new Clipboard('#copy-button');
  });
});

function closeApiKey() {
  $('#generateApiKey').css('cursor', 'default');
  IBMCore.common.widget.overlay.hide('generateApiKey');
}

function highlightApiKey() {
 $('#apiKey').attr('style', 'background-color: #C2DFFF');
}

function initApiKey(userEmail) {
  //check if user already has an API key base on the userEmail
  getApiKeyByUser();
}

function launchApiKey(userEmail) {
  IBMCore.common.widget.overlay.show('generateApiKey');
  //$('#feeback_submit').attr('disabled', 'disabled');
  initApiKey(userEmail);
}

function getApiKey() {
  // call server side to get a JSON with uuid
  var uuidKey;

  $.ajax({
    type: 'GET',
    url: '/api/developer/apiKey'
  }).done(function(data) {
    if (data != undefined) {
      uuidKey = data.apiKey;
      $('#apiKey').html(uuidKey);
      $('#copy-button').attr('data-clipboard-text', uuidKey);
      $('#apiKeySection').show();
      document.getElementById('apiKeyButton').disabled = true;
    }
  });
}

function getApiKeyByUser() {
  // call server side to get a JSON with uuid
  var uuidKey;

  $.ajax({
    type: 'GET',
    url: '/api/developer/apiKeyByUser'
  }).done(function(data) {
    if (data != undefined) {
      uuidKey = data.apiKey;
      $('#apiKey').html(uuidKey);
      $('#copy-button').attr('data-clipboard-text', uuidKey);
      $('#apiKeySection').show();
      document.getElementById('apiKeyButton').disabled = true;
    }
    else {
      $('#apiKeySection').hide();
      document.getElementById('apiKeyButton').removeAttr('disabled');
    }
  });

}
