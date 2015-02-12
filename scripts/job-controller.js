
jobController = function() {
   var initialised = false;
   var job_page;
   var logged_on = false;
   var auth_token = '';
   var analysis_type;  // 1= history, 2= variability, 3=degradation

   return {
      init:function(page) {
         job_page = page;
	       fetch_job_types();

          hide_all(job_page);

         	$(job_page).find('#loadEvt').click(function(evt) {
  				  console.log('In event load');
	  				evt.preventDefault();
	  				hide_all(job_page);
		  			$(job_page).find('#load').show();

  				});

  				$(job_page).find('#historyEvt').click(function(evt) {
  				  console.log('In history event');
  				  evt.preventDefault();
  				  hide_all(job_page);
  				  (job_page).find('#program-sect').show();
  				  (job_page).find('#history-form').show();
  				  (job_page).find('#history-form-title').text('Select program details to be displayed');
  				  (job_page).find('#analysis-button').text('Display History');
  				  (job_page).find('#analysis-button').val('1');
  				  analysis_type = 1;
  				});

  				$(job_page).find('#variabilityEvt').click(function(evt) {
  				  console.log('In variability event');
  				  evt.preventDefault();
  				  hide_all(job_page);
  				  (job_page).find('#program-sect').hide();
  				  (job_page).find('#history-form').show();
  				  (job_page).find('#history-form-title').text('Select duration for variability analysis');
  				  (job_page).find('#analysis-button').text('Display Variability');
  				  (job_page).find('#analysis-button').val('2');
  				  analysis_type = 2;
  				});

  				$(job_page).find('#degradationEvt').click(function(evt) {
  				  console.log('In degradation event');
  				  evt.preventDefault();
  				  hide_all(job_page);
  				  (job_page).find('#program-sect').hide();
  				  (job_page).find('#history-form').show();
  				  (job_page).find('#history-form-title').text('Select duration for degradation analysis');
  				  (job_page).find('#analysis-button').text('Display Degradation');
  				  (job_page).find('#analysis-button').val('3');
  				  analysis_type = 3;
  				});


        	$(job_page).find('#recommendationEvt').click(function(evt) {
  				  console.log('In event recommendation');
	  				evt.preventDefault();
	  				hide_all(job_page);

  				  (job_page).find('#program-sect').hide();
  				  (job_page).find('#history-form').show();
  				  (job_page).find('#history-form-title').text('Select duration for recommendation analysis');
  				  (job_page).find('#analysis-button').text('Display Recommendations');
  				  (job_page).find('#analysis-button').val('4');
  				  analysis_type = 4;

		  			$(job_page).find('#recommendation').show();

  				});

        	$(job_page).find('#logonEvt').click(function(evt) {
  				  console.log('In event logon');
	  				evt.preventDefault();
	  				hide_all(job_page);
		  			$(job_page).find('#authentication').slideToggle("slow");

  				});


        	$(job_page).find('#logoffEvt').click(function(evt) {
  				  console.log('In event logoff');
	  				evt.preventDefault();
		  			$(job_page).find('#logonEvt').show();
            $(job_page).find('#logoffEvt').hide();
            logged_on = false;
  				  $.ajax({
  				    type: "DELETE",
  				    url: "/_session",
  	  			  success: function(data, status, jqXHR){
  	  			    // Mod to add in setting the cookie
                console.log("Data: " + data + "\nStatus: " + status);
              },
              error: function(data,status) {
                console.log("Error! "+ data + "\nStatus: " + status)
                }
                });

            auth_token = '';
            hide_all(job_page);
  				});

  				$(job_page).find('#authButton').click(function(evt) {
  				  console.log('In logon');
  				  var usr = $(job_page).find('#username').val();
  				  var pwd = $(job_page).find('#password').val();
  				  $.ajax({
  				    type: "POST",
  				    url: "/_session",
  				    data: {
    				    name : usr,
    				    password : pwd
  	  			  },
  	  			  success: function(data, status, jqXHR){
                console.log("Data: " + data + "\nStatus: " + status);
                auth_token = jqXHR.getResponseHeader("AuthSession");
    	       	  $(job_page).find('#authentication').hide();
    		  			$(job_page).find('#logonEvt').hide();
                $(job_page).find('#logoffEvt').show();
                hide_all(job_page);
                logged_on = true;
              },
              error: function(data,status) {
                console.log("Error! "+ data + "\nStatus: " + status)

  				      $(job_page).find('#auth-results').show();
  			        $(job_page).find('#auth-results').text('Logon Failed! ' + status);

    				    setTimeout(function(){
    				      $(job_page).find('#auth-results').hide();
    				    },2000);


                }
                });

  				});



         $('#importFile').change(loadFromHTML);
         initialised = true;
         console.log('Initialised job-controller');
      }
   }
}();


function hide_all(job_page){

  $(job_page).find('#load').hide();
 	$(job_page).find('#recommendation').hide();
 	$(job_page).find('#authentication').hide();
 	$(job_page).find('#logoffEvt').hide();
 	$(job_page).find('#history-form').hide();

}

function loadFromHTML(event){
   var reader = new FileReader();
   reader.onload = function(evt) {
      var parsed_lines = parse_html(evt.target.result);
      var a = upload(parsed_lines);

   };

   reader.onerror = function(evt) {
      errorLogger("cannot_read_file","The file specified cannot be read");
   };

   console.log('About to read');
   reader.readAsText(event.target.files[0]);

}

function parse_html(data) {


	var lines = data;

	var a = 0;
	var maxlen = lines.length;
	console.log('Length is ' + maxlen);
	var linepos, linepos2, linepos3;
	var r,q,q2,q3,q4;
	var processed = '';
	while (a<maxlen){
		linepos = lines.indexOf('nobr',a);
		if (linepos == -1){
			break;
		}

		linepos2 = lines.indexOf('>',linepos)+1;
		linepos3 = lines.indexOf('<',linepos2);
		r = lines.slice(linepos2,linepos3);
		q = r.replace(/&nbsp;/g,' ');
		q2 = q.replace(/&amp;/g,'&');
		q3 = q2.replace(/&lt;/g,'<');
		q4 = q3.replace(/&#38;/g,'&');
		if (q4.trim().length > 1){
			processed = processed + q4 + '\n';
		}

		a = linepos3;
	}

	var line_array = processed.split("\n");
	//console.log(processed[0]);
	var line_cnt = 0;
	for (var l in line_array) {
		line_cnt ++;
	}

   return line_array;

}

function upload(data) {
   var upload_url = '/jobs';
   var options = {
     hostname: '127.0.0.1',
     port: 5984,
     path: '/jobs',
     method: 'POST',
     headers: {
	'Content-type' : 'application/json'
     }

   };

   var config = {
	"job_field" : "1",
	"start_date_field" : "Strtdate",
	"start_time_field" : "Strttime",
	"end_date_field" : "Enddate",
	"end_time_field" : "Endtime",
	"duration_field" : "Duration",
	"status_field" : "S",
	"cpu_field" : "CPU ms",
	"db_field" : "DB ms",
	"prog_field" : "Progname"
   };



	var last_pos = 0;
	var found_jobs = [];
	var is_mass = false;
	var dedup_jobs = Object.create(null);
	var first = true;
	var col = [];
	var field_names = [];
	var lines = data;

	console.log(lines[0]);
	for (var l in lines) {
		if (lines[l].trim().length < 1) {
			continue;
		}
		is_mass = false;
		if (first) {	// First line describes file columns
			first=false;
			var fields = lines[l].split(/ +/);
			console.log('>>>'+fields+'<<<'+fields.length);
			for (var i=0; i<fields.length; i++){
				if (!fields[i].match(/[A-Z]/)){
					if (fields[i]  === 'lc') {
						i += 2;
						continue;
					}
					if (i>0){
						fields[i-1] = fields[i-1] + ' '+ fields[i];
						field_names.pop();
						field_names.push(fields[i-1]);

					}
				} else {
					field_names.push(fields[i]);
				}
			}	// Find the column widths
			for (var j=0; j<field_names.length; j++){
				last_pos=lines[l].indexOf(field_names[j],last_pos);
				col.push(last_pos);
			}

		} else { // rest of the file is the data
			job = {};
			var val;
			for (var w=0; w<col.length; w++){
				if (w < col.length-1) {
					val = lines[l].slice(col[w],col[w+1]-1);
				} else {
					val = lines[l].slice(col[w]);
				}
				if (w == config.job_field) {
					// Look for mass
					job[field_names[w]] = val.toString().trim().split(/ +/)[0];

				} else if(field_names[w] === config.start_time_field){
					strtdate = job[config.start_date_field];
					tf = val.split(':');
					val = new Date(strtdate.getFullYear(),strtdate.getMonth(),strtdate.getDate(),tf[0],tf[1],tf[2]);
					job[field_names[w]] = val;
				} else if(field_names[w] === config.end_time_field){
					strtdate = job[config.end_date_field];
					tf = val.split(':');
					val = new Date(strtdate.getFullYear(),strtdate.getMonth(),strtdate.getDate(),tf[0],tf[1],tf[2]);
					job[field_names[w]] = val;
				} else if (field_names[w] === config.start_date_field || field_names[w] === config.end_date_field) {

					val = sap_date(val);
					job[field_names[w]] = val;
				} else {

//				console.log(val);
				//if (w ==
				   job[field_names[w]] = val.toString().trim().split(/ +/)[0];
				}
			}
//			console.log(job);
		        job.type = "JobRecord";
		        job.structure = "v0.1";


			$.ajax({
				url: upload_url,
				type: "POST",
				data: JSON.stringify(job),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function() {
					console.log("Uploaded: " + job['Jobname']);
				}

			});
		}
	}
	return col;



}


function fetch_job_types() {

   var url = '/jobs/_design/dir/_view/mass_job_types';
                        $.ajax({
                                url: url,
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function(data) {
                                        console.log("Fetched: " + data);
                                }

                        });
}



Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


function sap_date(dt) {
  var parts = dt.split(".");
  return new Date(parts[2],parts[1]-1,parts[0]);
};
