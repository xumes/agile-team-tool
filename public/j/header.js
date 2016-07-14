$( document ).ready(function() {
 	//nav bar drop down menu display
	$('#dropdown-display-li').on('mouseenter', function() {
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin ibm-active");
	}).on('mouseleave', function(){
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin");
	});
});