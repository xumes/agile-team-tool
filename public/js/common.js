function getSiteStatus() {
  $.get('/api/util/systemstatus', function(data, status) {
    if (status == 'success') {
      setSystemMessage(data.flag, data.display);
    }
  });
  setSystemEnvironment(environment);
}

function setSystemMessage(systemStatusControl, systemStatusMsg){
  //set db system message on the top of the page banner - header.ejs id=#warningBar
  if (systemStatusControl == 'DynamicChange' || systemStatusControl == 'AdminOnlyChange' || systemStatusControl == 'AdminOnlyReadChange'){
    $('#warningBar').html(systemStatusMsg);
    $('#warningBar').show();
  } else {
    $('#warningBar').hide();
  }
}

function setSystemEnvironment(environment){
  //set label "Stage" on the top bar if it is "development" as node_env variable in our manifest file. If it is production, this is blank
  if (_.isEmpty(environment) || environment.toLowerCase() == 'development') {
    $('#systMsg').html('Stage');
    $('#systMsg').show();
    $('#debugSection').show();
  } else {
    console.log('Environment variable: '+ environment);
    $('#systMsg').hide();
    $('#debugSection').hide();
  }
}

