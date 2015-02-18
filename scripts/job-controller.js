
jobController = function() {
   var initialised = false;
   var job_page;
   var logged_on = false;
   var auth_token = '';
   var analysis_type;  // 1= history, 2= variability, 3=degradation
   var self;

   return {

      init:function(page) {
         job_page = page;
         self = this;



//	       fetch_job_types();

          self.hide_all();

          $(job_page).find('#logoffEvt').hide();

         	$(job_page).find('#loadEvt').click(function(evt) {
  				  console.log('In event load');
	  				evt.preventDefault();
	  				self.hide_all();
		  			$(job_page).find('#load').show();

  				});

	        $(job_page).find('#aboutEvt').click(function(evt) {
  				  console.log('In About event');
  				  evt.preventDefault();
  				  self.hide_all();
  				  $(job_page).find('#about').show();
  				});

	        $(job_page).find('#homeEvt').click(function(evt) {
  				  console.log('In home event');
  				  evt.preventDefault();
  				  self.hide_all();
  				});

  				$(job_page).find('#historyEvt').click(function(evt) {
  				  console.log('In history event');
  				  evt.preventDefault();
  				  self.hide_all();
  				  $(job_page).find('#program-sect').show();
  				  $(job_page).find('#history-form').show();
  				  $(job_page).find('#history-form-title').text('Select program details to be displayed');
  				  $(job_page).find('#analysis-button').text('Display History');
  				  $(job_page).find('#analysis-button').val('1');
  				  analysis_type = 1;
  				});


          $(job_page).find('#analysis-button').click(function(evt) {
            var from_date;
            var to_date;
            var program_name;
            var func;

            evt.preventDefault();
            from_date = (job_page).find('#startDate').val();
            to_date = (job_page).find('#endDate').val();
            func = (job_page).find('#analysis-button').val();
            program_name = (job_page).find('#program-name').val();
            console.log('In action performing');

            switch (func) {
              case '1' :

                   var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';


                   url = url+'&startkey=[\"'+program_name+'\",\"'+from_date+'\"]';
                   url = url+'&endkey=[\"'+program_name+'\",\"'+to_date+'\u9999\"]';

                   $.ajax({
                            url: url,
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(data, status, jqXHR) {


                              console.log("Fetched: " + data);

                              history_graph.init(job_page,data,'summary-results');
                              history_graph.register();



                            }

                           });

                   break;


            }

          });

  				$(job_page).find('#variabilityEvt').click(function(evt) {
  				  console.log('In variability event');
  				  evt.preventDefault();
  				  self.hide_all();
  				  $(job_page).find('#program-sect').hide();
  				  $(job_page).find('#history-form').show();
  				  $(job_page).find('#history-form-title').text('Select duration for variability analysis');
  				  $(job_page).find('#analysis-button').text('Display Variability');
  				  $(job_page).find('#analysis-button').val('2');
  				  analysis_type = 2;


  				});

  				$(job_page).find('#degradationEvt').click(function(evt) {
  				  console.log('In degradation event');
  				  evt.preventDefault();
  				  self.hide_all();
  				  $(job_page).find('#program-sect').hide();
  				  $(job_page).find('#history-form').show();
  				  $(job_page).find('#history-form-title').text('Select duration for degradation analysis');
  				  $(job_page).find('#analysis-button').text('Display Degradation');
  				  $(job_page).find('#analysis-button').val('3');
  				  analysis_type = 3;
  				});


        	$(job_page).find('#recommendationEvt').click(function(evt) {
  				  console.log('In event recommendation');
	  				evt.preventDefault();
	  				self.hide_all();

  				  $(job_page).find('#program-sect').hide();
  				  $(job_page).find('#history-form').show();
  				  $(job_page).find('#history-form-title').text('Select duration for recommendation analysis');
  				  $(job_page).find('#analysis-button').text('Display Recommendations');
  				  $(job_page).find('#analysis-button').val('4');
  				  analysis_type = 4;

		  			$(job_page).find('#recommendation').show();

  				});

        	$(job_page).find('#logonEvt').click(function(evt) {
  				  console.log('In event logon');
	  				evt.preventDefault();
	  				self.hide_all();
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
            self.hide_all();
  				});

  				$(job_page).find('#authButton').click(function(evt) {
  				  console.log('In logon');
  				  var usr = $(job_page).find('#username').val();
  				  var pwd = $(job_page).find('#password').val();
  				  var jname = [];
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

                self.hide_all();
                logged_on = true;
                self.fetch_job_types();
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



         $('#importFile').change(self.loadFromHTML);
         initialised = true;
         console.log('Initialised job-controller');
      },


      // hide all page sections for clean display

      hide_all:function(){

        $(job_page).find('#load').hide();
       	$(job_page).find('#recommendation').hide();
       	$(job_page).find('#authentication').hide();
       	$(job_page).find('#history-form').hide();
       	$(job_page).find('#summary-results').hide();
        $(job_page).find('#about').hide();
        },


      // Fetch job type - a list of all program names from this users scope of access

      fetch_job_types: function() {

         var url = '/jobs/_design/job_details/_list/byuser/owner?group=true&level=exact';
         var res;
         var usr;
         var job_list_data = {};
         var job_names = [];
         var duplist = [];
         var deduplist = [];

          $.ajax({
                  url: url,
                  type: "GET",
                  contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  success: function(data, status, jqXHR) {


                    $(job_page).find('#program-names').empty();

                    console.log("Fetched: " + data);

                    duplist = data.rows.map(function(a) {return a.key[0];});

                    deduplist = duplist.reduce(function(a,b){
                      if (a.indexOf(b) < 0 ) {a.push(b)};
                      return a;
                      },[]);

                    for (var q=0; q<deduplist.length; q++) {
                      $(job_page).find('#program-names').append("<option value='" +deduplist[q]+"'></option>");
                    }


                  }

                 });

      },

      // function to read and trigger upload of file

      loadFromHTML: function(event){
         var reader = new FileReader();

         $(job_page).find('#load-feedback').text("Loading ...");
         $(job_page).find('#load-feedback').show();

         reader.onload = function(evt) {
            var parsed_lines = self.parse_html(evt.target.result);
            self.uploadAsUser(parsed_lines);

         };

         reader.onerror = function(evt) {
            errorLogger("cannot_read_file","The file specified cannot be read");

            $(job_page).find('#load-feedback').text("The file specified cannot be read");

            setTimeout(function(){
          				      $(job_page).find('#load-feedback').hide();
          				    },2000);

         };

         console.log('About to read');
         reader.readAsText(event.target.files[0]);

      },

      // Function to perform mass upload of parsed data as a particular user.  Check user is logged on.

      uploadAsUser : function(parsed_lines){
        var usr;

        $.get("/_session",function(data,status) {
        console.log("Data " + data);
        var res = JSON.parse(data);

        self.upload(parsed_lines,res.userCtx.name);


        }).fail(function(jqXHR, textStatus, errorThrown) {
          console.log('Error! ' + errorThrown);

            $(job_page).find('#load-feedback').text("Please logon to upload");

            setTimeout(function(){
          				      $('#load-feedback').hide();
          				    },5000);
        });


      },

      // function parse the html file

      parse_html : function(data) {


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

      },

      // uokoad the data

      upload: function(data, username) {
        var upload_url = '/jobs';

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
      	var job_list = [];

//      	console.log(lines[0]);
      	for (var l=0; l<lines.length; l++) {
      		if (lines[l].trim().length < 1) {
      			continue;
      		}
      		is_mass = false;
      		if (first) {	// First line describes file columns
      			first=false;
      			var fields = lines[l].split(/ +/);
//      			console.log('>>>'+fields+'<<<'+fields.length);
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
		        job.owner = username;

		        job_list.push(job);


      		}
      	}

        var upload_list = { docs : job_list};

        //console.log(JSON.stringify(upload));

      	$.ajax({
      				url: "/jobs/_bulk_docs",
      				type: "POST",
      				data: JSON.stringify(upload_list),
      				contentType: "application/json; charset=utf-8",
      				dataType: "json",
      				success: function() {
      					console.log("Uploaded: ");

                $(job_page).find('#load-feedback').text("Upload completed");

                self.fetch_job_types();

                setTimeout(function(){
              				      $('#load-feedback').hide();
              				    },5000);
          				},
      				error: function(data,status) {
                  console.log("Error! "+ data + "\nStatus: " + status)

                  $(job_page).find('#load-feedback').text("Upload failed!");

                  setTimeout(function(){
                				      $('#load-feedback').hide();
                				    },5000);
                    }

      			});


      	return col;

      }



   }
}();


history_graph = function () {

  var res_data;
  var job_page;
  var self;
  var dom_id;

  return {
    init : function (page, raw_data, id) {

      self = this;
      res_data = raw_data;
      job_page = page;
      dom_id = id;

    },

    reset_data : function(raw_data) {
      res_data = raw_data;
    },


    register : function () {
    // Load the Visualization API and the piechart package.
        google.load('visualization', '1.0', {'packages':['corechart'], 'callback' : function () {self.draw_graph();}});

    },

    draw_graph : function() {
      console.log("Draw history graph");
            // Create the data table.

      var data_rows = [];

      for (var i=0; i<res_data.rows.length ;i++) {

        var count = res_data.rows[i].value.count;
        var avg = res_data.rows[i].value.sum/count;
        var stddev;
        var lowval;
        var highval;


        if (count > 1) {
          stddev = Math.sqrt((res_data.rows[i].value.sumsqr - (res_data.rows[i].value.sum * res_data.rows[i].value.sum / count))/(count-1));
          lowval = avg - stddev;
          highval = avg + stddev;
        } else {
          lowval = res_data.rows[i].value.min;
          highval = res_data.rows[i].value.max;
        }

        var new_row = [];
        new_row = [
          new Date(res_data.rows[i].key[1].slice(0,10)),
          res_data.rows[i].value.min,
          lowval,
          highval,
          res_data.rows[i].value.max];

        data_rows.push( new_row );

      }


    var data = google.visualization.arrayToDataTable(data_rows, true);

      // Set chart options
      var options_lines = {
        width: 1000,
        height: 563,
        hAxis: {
          title: 'Date',
          format: 'dd.MM.yy',
          gridlines: {count: 10}
        },
        vAxis: {
          title: 'Time (s)'
        },
        legend:'none'
      };

      var chart_lines = new google.visualization.CandlestickChart(document.getElementById(dom_id));
      chart_lines.draw(data, options_lines);
      $(job_page).find('#'+dom_id).show();

    },

  }


}();




Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


function sap_date(dt) {
  var parts = dt.split(".");
  return new Date(parts[2],parts[1]-1,parts[0]);
};
