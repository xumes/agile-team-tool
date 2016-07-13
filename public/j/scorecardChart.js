/**
 * 
 */

function loadTeamScoreCard2(teamId, containerId) {
	var curIterInfoTxt = "N/A";
	var preIterInfoTxt = "N/A";
	var completedIter = [];
	var graphCategory = [];
	var velocitySeries = new Object();
	var throughputSeries = new Object();
	var restrospectiveSeries = new Object();
	var teamSizeSeries = new Object();

	velocitySeries.name = "Velocity";
	velocitySeries.data = [];
	throughputSeries.name = "Throughput";
	throughputSeries.data = [];
	restrospectiveSeries.name = "Retrospective action items";
	restrospectiveSeries.data = [];
	teamSizeSeries.name = "Team size";
	teamSizeSeries.data = [];

	$.ajax({
		type : "GET",
		url : baseUrlDb + "/_design/teams/_view/iterinfo?keys=[\"" + encodeURIComponent(teamId) + "\"]",
		dataType : "jsonp",
		async : false
	}).done(function(data) {
		var list = [];
		//console.log(data);
		if (data != undefined) {
			for ( var i = 0; i < data.rows.length; i++) {
				//console.log(data.rows[i].value);
				list.push(data.rows[i].value);
			}

			list = list.sort(function(a, b) {
				if (new Date(b.iteration_end_dt).getTime() == new Date(a.iteration_end_dt).getTime()) {
					return 0;
				} else {
					return (new Date(b.iteration_end_dt).getTime() > new Date(a.iteration_end_dt).getTime()) ? 1 : -1;
				}
			});

			var crntIter;
			var priorIter;
			$.each(list, function(index, value) {
				if (value.iterationinfo_status == 'Completed') {
					completedIter.push(value);
					if (crntIter == undefined) {
						crntIter = value;
					} else if (priorIter == undefined) {
						priorIter = value;
						if (index == 2)
							return false;
					}
				}
			});
			console.log(completedIter);
			if (completedIter.length > 1)
				preIterInfoTxt = completedIter[completedIter.length - 1].iteration_name + " " + completedIter[completedIter.length - 1].iteration_start_dt + " - " + completedIter[completedIter.length - 1].iteration_end_dt;
			if (completedIter.length > 0)
			curIterInfoTxt = completedIter[0].iteration_name + " " + completedIter[0].iteration_start_dt + " - " + completedIter[0].iteration_end_dt;

			for (i = completedIter.length - 1; i > -1; i--) {
				//alert(i);
				/*console.log(completedIter[i]);
				if (i == (completedIter.length-1)) {
				  graphCategory.push(completedIter[i].iteration_start_dt);
				  velocitySeries.data.push(0);
				  throughputSeries.data.push(0);
				  restrospectiveSeries.data.push(0);
				  
				} else {*/
				graphCategory.push(completedIter[i].iteration_end_dt);
				velocitySeries.data.push(isNaN(parseInt(completedIter[i].nbr_story_pts_dlvrd)) ? 0 : parseInt(completedIter[i].nbr_story_pts_dlvrd));
				throughputSeries.data.push(isNaN(parseInt(completedIter[i].nbr_stories_dlvrd)) ? 0 : parseInt(completedIter[i].nbr_stories_dlvrd));
				restrospectiveSeries.data.push(isNaN(parseInt(completedIter[i].retro_action_items)) ? 0 : parseInt(completedIter[i].retro_action_items));
				teamSizeSeries.data.push(isNaN(parseInt(completedIter[i].team_mbr_cnt)) ? 0 : parseInt(completedIter[i].team_mbr_cnt));
				//}
			}

			console.log(velocitySeries);
			console.log(throughputSeries);
			console.log(restrospectiveSeries);

			//$('#container').highcharts({
			new Highcharts.Chart({
				chart : {
					renderTo : containerId,
				},
				title : {
					text : '',
					x : -20
				//center
				},
				subtitle : {
					text : preIterInfoTxt + " to " + curIterInfoTxt,
					x : -20
				},
				xAxis : {
					categories : graphCategory
				//categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				},
				yAxis : {
					title : {
						text : 'Points / Count'
					},
					plotLines : [ {
						value : 0,
						width : 1,
						color : '#808080'
					} ]
				},
				tooltip : {
					valueSuffix : 'Points'
				},
				legend : {
					layout : 'horizontal',
					align : 'center',
					verticalAlign : 'bottom',
					borderWidth : 0
				},
				series : [ {
					name : velocitySeries.name,
					data : velocitySeries.data
				//name: 'Tokyo',
				//data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
				}, {
					name : throughputSeries.name,
					data : throughputSeries.data
				//name: 'New York',
				//data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
				}, {
					name : restrospectiveSeries.name,
					data : restrospectiveSeries.data
				//name: 'Berlin',
				//data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
				}, {
					name : teamSizeSeries.name,
					data : teamSizeSeries.data
				//name: 'London',
				//data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
				} ]
			});
		}
	});
}