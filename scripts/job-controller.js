jobController = function() {
    var initialised = false;
    var job_page;
    var logged_on = false;
    var auth_token = '';
    var analysis_type; // 1= history, 2= variability, 3=degradation
    var self;


    return {

        init: function(page) {
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
                var url;
                var promise_func1, promise_func1b, promise_func1c, promise_func1d;
                var promise_func2;
                var promise_func3;

                evt.preventDefault();
                from_date = (job_page).find('#startDate').val();
                to_date = (job_page).find('#endDate').val();
                func = (job_page).find('#analysis-button').val();
                program_name = (job_page).find('#program-name').val();
                console.log('In action performing');

                switch (func) {
                    case '1':

                        if (program_name.length < 1 || program_name === 'Please logon') {

                            $(job_page).find('#form-val-message').show();

                            setTimeout(function() {
                                $(job_page).find('#form-val-message').hide();
                            }, 3000);


                        } else {

                            url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';


                            url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                            url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                            promise_func1 = $.ajax({
                                url: url,
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            });

                            promise_func1.done(function(data) {
                                console.log("Fetched: " + data);
                                var graph1 = history_graph();
                                graph1.init(job_page, data, 'summary-results');
                                graph1.register();
                                $(job_page).find('.job-variability').show();
                            });

                            url = '/jobs/_design/job_stats/_list/duration/job_summary?group=true&level=exact';
                            url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                            url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                            promise_func1b = $.ajax({
                                url: url,
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            });

                            promise_func1b.done(function(data) {
                                console.log("Fetched: " + data);
                                var graph2 = history_graph();
                                graph2.init(job_page, data, 'summary-history');
                                graph2.register_history();
                                $(job_page).find('.job-history-duration').show();
                            });

                            url = '/jobs/_design/job_details/_list/parallel_calls/server?';
                            url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                            url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                            promise_func1c = $.ajax({
                                url: url,
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            });

                            promise_func1c.done(function(data) {
                                console.log("Fetched: " + data);
                                var graph3 = history_graph();
                                graph3.init(job_page, data, 'summary-parallel');
                                graph3.register_concurrent_chart();
                                $(job_page).find('.job-parallelism').show();
                            });

                            url = '/jobs/_design/job_stats/_list/proc_percentages/abap_db_split?group=true&level=exact&';
                            url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                            url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                            promise_func1d = $.ajax({
                                url: url,
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            });

                            promise_func1d.done(function(data) {
                                console.log("Fetched: " + data);
                                var graph4 = history_graph();
                                graph4.init(job_page, data, 'summary-processing');
                                graph4.register_processing_chart();
                                $(job_page).find('.job-processing-characteristics').show();
                            });



                        }

                        break;

                    case '2':

                        url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
                        url = url + '&startkey=[\"A\",\"' + from_date + '\"]';
                        url = url + '&endkey=[\"\u9999\",\"' + to_date + '\u9999\"]';

                        promise_func2 = $.ajax({
                            url: url,
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json"
                        });

                        promise_func2.done(function(data) {
                            console.log("Fetched: " + JSON.stringify(data));
                            var var_graph = history_graph();
                            var_graph.init(job_page, data, 'summary-results');
                            var_graph.register_variability_chart();
                        });

                        break;

                    case '3':
                        // get the date approx weeks
                        var startdt = new Date(from_date);
                        var enddt = new Date(to_date);
                        var startwk = calc_approx_week(startdt);
                        var endwk = calc_approx_week(enddt);

                        url = '/jobs/_design/job_stats/_list/deg_by_week/job_weekly_stats?group=true&level=exact';
                        url = url + '&startkey=[\"A\",\"' + startwk + '\"]';
                        url = url + '&endkey=[\"\u9999\",\"' + endwk + '\"]';

                        promise_func2 = $.ajax({
                            url: url,
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json"
                        });

                        promise_func2.done(function(data) {
                            console.log("Fetched: " + JSON.stringify(data));
                            var var_graph = history_graph();
                            var_graph.init(job_page, data, 'summary-reduce');
                            var_graph.register_change_chart();
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


            $(job_page).find('#cancelled-items').click(function(evt) {

                var promise_cancel;
                evt.preventDefault();

            });

            $(job_page).find('#logonEvt').click(function(evt) {
                console.log('In event logon');
                evt.preventDefault();
                self.hide_all();
                $(job_page).find('#authentication').slideToggle("slow");

            });


            $(job_page).find('#logoffEvt').click(function(evt) {
                var promise_logoff;
                console.log('In event logoff');
                evt.preventDefault();
                $(job_page).find('#logonEvt').show();
                $(job_page).find('#logoffEvt').hide();
                logged_on = false;
                promise_logoff = $.ajax({
                    type: "DELETE",
                    url: "/_session"

                });
                promise_logoff.done(function(data, status, jqXHR) {
                    // Mod to add in setting the cookie
                    console.log("Data: " + data + "\nStatus: " + status);
                    $(job_page).find('#program-names').empty();
                    $(job_page).find('#program-names').append("<option value='Please logon'></option>");

                });
                promise_logoff.fail(function(data, status) {
                    console.log("Error! " + data + "\nStatus: " + status);
                });

                auth_token = '';
                self.hide_all();
            });

            $(job_page).find('#authButton').click(function(evt) {
                console.log('In logon');
                var usr = $(job_page).find('#username').val();
                var pwd = $(job_page).find('#password').val();

                var promise_logon;

                promise_logon = $.ajax({
                    type: "POST",
                    url: "/_session",
                    data: {
                        name: usr,
                        password: pwd
                    }
                });
                promise_logon.done(function(data, status, jqXHR) {
                    console.log("Data: " + data + "\nStatus: " + status);
                    auth_token = jqXHR.getResponseHeader("AuthSession");
                    $(job_page).find('#authentication').hide();
                    $(job_page).find('#logonEvt').hide();
                    $(job_page).find('#logoffEvt').show();

                    self.hide_all();
                    logged_on = true;

                    $(job_page).find('#program-names').empty();
                    $(job_page).find('#program-names').append("<option value='Please wait, loading'></option>");

                    self.fetch_job_types();
                });
                promise_logon.fail(function(data, status) {
                    console.log("Error! " + data + "\nStatus: " + status);

                    $(job_page).find('#auth-results').show();
                    $(job_page).find('#auth-results').text('Logon Failed! ' + status);

                    setTimeout(function() {
                        $(job_page).find('#auth-results').hide();
                    }, 2000);

                });

            });



            $('#importFile').change(self.loadFromHTML2);
            initialised = true;
            console.log('Initialised job-controller');
        },


        // hide all page sections for clean display

        hide_all: function() {

            $(job_page).find('#load').hide();
            $(job_page).find('#recommendation').hide();
            $(job_page).find('#authentication').hide();
            $(job_page).find('#history-form').hide();
            $(job_page).find('#summary-results').hide();
            $(job_page).find('#summary-history').hide();
            $(job_page).find('#summary-parallel').hide();
            $(job_page).find('#summary-processing').hide();
            $(job_page).find('#about').hide();
            $(job_page).find('.job-history-duration').hide();
            $(job_page).find('.job-variability').hide();
            $(job_page).find('.job-parallelism').hide();
            $(job_page).find('.job-processing-characteristics').hide();
            $(job_page).find('.summary-neutral').hide();
            $(job_page).find('.summary-increase').hide();
            $(job_page).find('.summary-decrease').hide();
            $(job_page).find('.job-change-neutral').hide();
            $(job_page).find('.job-change-increase').hide();
            $(job_page).find('.job-change-decrease').hide();
        },


        // Fetch job type - a list of all program names from this users scope of access

        fetch_job_types: function() {

            var url = '/jobs/_design/job_details/_list/byuser/owner?group=true&level=exact';
            var duplist = [];
            var deduplist = [];
            var promise_jobtypes;

            promise_jobtypes = $.ajax({
                url: url,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });

            promise_jobtypes.done(function(data, status, jqXHR) {
                $(job_page).find('#program-names').empty();
                $(job_page).find('#program-name').val('');
                console.log("Fetched: " + data);

                duplist = data.rows.map(function(a) {
                    return a.key[0];
                });

                deduplist = duplist.reduce(function(a, b) {
                    if (a.indexOf(b) < 0) {
                        a.push(b);
                    }
                    return a;
                }, []);

                for (var q = 0; q < deduplist.length; q++) {
                    $(job_page).find('#program-names').append("<option value='" + deduplist[q] + "'></option>");
                }

            });

        },

        loadFromHTML2: function(event) {

            if (logged_on) {
                console.log('About to read');

                $(job_page).find('#load-feedback').text("Loading ... please wait");
                $(job_page).find('#load-feedback').show();


                /*           for (var i=0; i< event.target.files.length; i++) {
                             new file_parser(event.target.files[i]).
                               then(self.uploadAsUser,
                                 function(error) {

                                   $(job_page).find('#load-feedback').text("The file specified cannot be read");

                                   setTimeout(function() {
                                       $(job_page).find('#load-feedback').hide();
                                   }, 2000);


                                 });
                           }*/
                var uploads = event.target.files.length;

                for (var i = 0; i < event.target.files.length; i++) {
                    new file_parser(event.target.files[i]).
                    then(upload_job_data).
                    then(function() {
                        console.log('Upload done!');
                        uploads--;


                        if (uploads === 0) {

                            $(job_page).find('#load-feedback').text("Upload completed");

                            self.fetch_job_types();

                            setTimeout(function() {
                                $('#load-feedback').hide();
                            }, 5000);


                        }



                    },

                    function(error) {

                        $(job_page).find('#load-feedback').text("The file specified cannot be read");

                        setTimeout(function() {
                            $(job_page).find('#load-feedback').hide();
                        }, 2000);


                    });
                }
            } else {
                $(job_page).find('#load-feedback').text("Please logon to upload");

                setTimeout(function() {
                    $('#load-feedback').hide();
                }, 5000);

            }

            //            upload_job_data(parsed_lines, id)

        }

    };
}();

function upload_job_data(parsed_lines, id) {

    var deferred = $.Deferred();
    var token = id;
    var usr;
    var promise_upload;

    promise_upload = $.get("/_session", function(data, status) {
        console.log("Data " + data);
        var res = JSON.parse(data);
        console.log(res.userCtx.name);

        upload(parsed_lines, res.userCtx.name);
    });


    promise_upload.done(function() {
        deferred.resolve(token);
    });

    promise_upload.fail(function(jqXHR, textStatus, errorThrown) {
        deferred.reject(token, errorThrown);
    });


    return deferred.promise();
}


function upload(data, username) {

    var deferred = $.Deferred();

    var promise_bulkupload;

    var config = {
        "job_field": "1",
        "start_date_field": "Strtdate",
        "start_time_field": "Strttime",
        "end_date_field": "Enddate",
        "end_time_field": "Endtime",
        "duration_field": "Duration",
        "status_field": "S",
        "cpu_field": "CPU ms",
        "db_field": "DB ms",
        "prog_field": "Progname"
    };


    var last_pos = 0;
    var is_mass = false;
    var first = true;
    var col = [];
    var field_names = [];
    var lines = data;
    var job_list = [];
    var job = {};

    //      	console.log(lines[0]);
    for (var l = 0; l < lines.length; l++) {
        if (lines[l].trim().length < 1) {
            continue;
        }
        is_mass = false;
        if (first) { // First line describes file columns
            first = false;
            var fields = lines[l].split(/ +/);
            //      			console.log('>>>'+fields+'<<<'+fields.length);
            for (var i = 0; i < fields.length; i++) {
                if (!fields[i].match(/[A-Z]/)) {
                    if (fields[i] === 'lc') {
                        i += 2;
                        continue;
                    }
                    if (i > 0) {
                        fields[i - 1] = fields[i - 1] + ' ' + fields[i];
                        field_names.pop();
                        field_names.push(fields[i - 1]);

                    }
                } else {
                    field_names.push(fields[i]);
                }
            } // Find the column widths
            for (var j = 0; j < field_names.length; j++) {
                last_pos = lines[l].indexOf(field_names[j], last_pos);
                col.push(last_pos);
            }

        } else { // rest of the file is the data
            job = {};
            var val;
            var strtdate;
            var tf;

            for (var w = 0; w < col.length; w++) {
                if (w < col.length - 1) {
                    val = lines[l].slice(col[w], col[w + 1] - 1);
                } else {
                    val = lines[l].slice(col[w]);
                }
                if (w == config.job_field) {
                    // Look for mass
                    job[field_names[w]] = val.toString().trim().split(/ +/)[0];

                } else if (field_names[w] === config.start_time_field) {
                    strtdate = job[config.start_date_field];
                    tf = val.split(':');
                    val = new Date(strtdate.getFullYear(), strtdate.getMonth(), strtdate.getDate(), tf[0], tf[1], tf[2]);
                    job[field_names[w]] = val;
                } else if (field_names[w] === config.end_time_field) {
                    strtdate = job[config.end_date_field];
                    tf = val.split(':');
                    val = new Date(strtdate.getFullYear(), strtdate.getMonth(), strtdate.getDate(), tf[0], tf[1], tf[2]);
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

    var upload_list = {
        docs: job_list
    };

    //console.log(JSON.stringify(upload));

    promise_bulkupload = $.ajax({
        url: "/jobs/_bulk_docs",
        type: "POST",
        data: JSON.stringify(upload_list),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });

    promise_bulkupload.done(function() {
        deferred.resolve();
    });

    promise_bulkupload.fail(function(data, status) {
        deferred.reject(data);
    });

    return deferred.promise();
}



function file_parser(f) {
    var deferred = $.Deferred();

    var reader = new FileReader();


    reader.onload = function(evt) {
        var parsed_lines = parse_html(evt.target.result);
        deferred.resolve(parsed_lines);
    };

    reader.onerror = function(evt) {
        deferred.reject(evt);
    };

    console.log('About to read');
    reader.readAsText(f);
    return deferred.promise();
}

function parse_html(data) {

    var lines = data;

    var a = 0;
    var maxlen = lines.length;
    console.log('Length is ' + maxlen);
    var linepos, linepos2, linepos3;
    var r, q, q2, q3, q4;
    var processed = '';
    while (a < maxlen) {
        linepos = lines.indexOf('nobr', a);
        if (linepos == -1) {
            break;
        }

        linepos2 = lines.indexOf('>', linepos) + 1;
        linepos3 = lines.indexOf('<', linepos2);
        r = lines.slice(linepos2, linepos3);
        q = r.replace(/&nbsp;/g, ' ');
        q2 = q.replace(/&amp;/g, '&');
        q3 = q2.replace(/&lt;/g, '<');
        q4 = q3.replace(/&#38;/g, '&');
        if (q4.trim().length > 1) {
            processed = processed + q4 + '\n';
        }

        a = linepos3;
    }

    var line_array = processed.split("\n");
    //console.log(processed[0]);
    /*    var line_cnt = 0;
    for (var l in line_array) {
        line_cnt++;
    }
*/
    return line_array;

}


function history_graph() {

    var res_data;
    var job_page;
    var self;
    var dom_id;

    return {
        init: function(page, raw_data, id) {

            self = this;
            res_data = raw_data;
            job_page = page;
            dom_id = id;

        },

        reset_data: function(raw_data) {
            res_data = raw_data;
        },


        register: function() {
            // Load the Visualization API and the core package.
            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_graph();
                }
            });

        },

        register_history: function() {
            // Load the Visualization API and the core package.
            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_history_graph();
                }
            });

        },

        register_variability_chart: function() {

            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_variability_graph();
                }
            });

        },

        register_concurrent_chart: function() {

            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_concurrent_graph();
                }
            });

        },

        register_processing_chart: function() {

            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_processing_graph();
                }
            });

        },


        register_change_chart: function() {

            google.load('visualization', '1.0', {
                'packages': ['corechart'],
                'callback': function() {
                    self.draw_change_graph();
                }
            });

        },
        draw_graph: function() {
            console.log("Draw history graph");
            // Create the data table.

            var data_rows = [];

            for (var i = 0; i < res_data.rows.length; i++) {

                var count = res_data.rows[i].value.count;
                var avg = res_data.rows[i].value.sum / count;
                var stddev;
                var lowval;
                var highval;


                if (count > 1) {
                    stddev = Math.sqrt((res_data.rows[i].value.sumsqr - (res_data.rows[i].value.sum * res_data.rows[i].value.sum / count)) / (count - 1));
                    lowval = avg - stddev;
                    highval = avg + stddev;
                } else {
                    lowval = res_data.rows[i].value.min;
                    highval = res_data.rows[i].value.max;
                }

                var new_row = [];
                new_row = [
                new Date(res_data.rows[i].key[1].slice(0, 10)),
                res_data.rows[i].value.min,
                lowval,
                highval,
                res_data.rows[i].value.max];

                data_rows.push(new_row);

            }


            var data = google.visualization.arrayToDataTable(data_rows, true);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 400,
                hAxis: {
                    title: 'Date',
                    format: 'dd.MM.yy',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Time (s)'
                },
                legend: 'none'
            };

            var chart_lines = new google.visualization.CandlestickChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        },

        draw_history_graph: function() {
            console.log("Draw history graph");
            // Create the data table.

            var data_rows = [];

            for (var i = 0; i < res_data.rows.length; i++) {

                var value = res_data.rows[i].value;
                var key = new Date(res_data.rows[i].key[1].slice(0, 10));

                var new_row = [];
                new_row = [
                key,
                value];

                data_rows.push(new_row);

            }


            var data = google.visualization.arrayToDataTable(data_rows, true);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 400,
                hAxis: {
                    title: 'Date',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Time (s)'
                },
                legend: 'none'
            };

            var chart_lines = new google.visualization.ColumnChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        },


        draw_concurrent_graph: function() {
            console.log("Draw concurrent graph");
            // Create the data table.

            var data_rows = [];

            for (var i = 0; i < res_data.rows.length; i++) {

                var value = res_data.rows[i].value;
                var key = new Date(res_data.rows[i].key[1]);

                for (var interval in value) {
                    var new_row = [];
                    new_row = [
                    new Date(interval),
                    value[interval]];

                    data_rows.push(new_row);

                }

            }


            var data = google.visualization.arrayToDataTable(data_rows, true);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 400,
                hAxis: {
                    title: 'Time',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Concurrent WP'
                },
                legend: 'none'
            };

            var chart_lines = new google.visualization.ColumnChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        },

        draw_processing_graph: function() {
            console.log("Draw procesing graph");
            // Create the data table.

            var data_rows = [];
            data_rows.push(['Date', 'CPU (ABAP)', 'DB']);


            for (var i = 0; i < res_data.rows.length; i++) {
                var new_row = [];
                var value = res_data.rows[i].value;
                var key = new Date(res_data.rows[i].key[1].slice(0, 10));
                new_row = [key,
                value.abap,
                value.db];

                data_rows.push(new_row);

            }


            var data = google.visualization.arrayToDataTable(data_rows, false);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 400,
                hAxis: {
                    title: 'Date',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Processing Percentage'
                },
                legend: {
                    position: 'top',
                    maxLines: 3
                },

                isStacked: true,
            };

            var chart_lines = new google.visualization.ColumnChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        },
        
        draw_change_graph: function() {
            console.log("Draw change graph");
            // Create the data table.

            var data_rows = [];
            data_rows.push(['Program', 'Change']);


            for (var i = 0; i < res_data.rows.length; i++) {
                var new_row = [];
                var value = res_data.rows[i].value;
                var key = res_data.rows[i].key;
                new_row = [key,value];

                data_rows.push(new_row);

            }


            var data = google.visualization.arrayToDataTable(data_rows, false);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 1000,
                hAxis: {
                    title: 'Program',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Change'
                },
                legend: {
                    position: 'top',
                    maxLines: 3
                },

                isStacked: false,
            };

            var chart_lines = new google.visualization.BarChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        },



        draw_variability_graph: function() {
            console.log("Draw variability graph");
            // Create the data table.

            var data_rows = [];
            var prog_group = {};

            for (var i = 0; i < res_data.rows.length; i++) {

                var progkey = res_data.rows[i].key[0];
                if (!(progkey in prog_group)) {
                    prog_group[progkey] = {};
                    prog_group[progkey].program = progkey;
                    prog_group[progkey].min = 999999999999999;
                    prog_group[progkey].max = 0;
                    prog_group[progkey].count = 0;
                    prog_group[progkey].sum = 0;
                    prog_group[progkey].sumsqr = 0;
                }

                prog_group[progkey].count += res_data.rows[i].value.count;
                prog_group[progkey].sum += res_data.rows[i].value.sum;
                prog_group[progkey].sumsqr += res_data.rows[i].value.sumsqr;
                if (prog_group[progkey].min > res_data.rows[i].value.min) {
                    prog_group[progkey].min = res_data.rows[i].value.min;
                }
                if (prog_group[progkey].max < res_data.rows[i].value.max) {
                    prog_group[progkey].max = res_data.rows[i].value.max;
                }
            }

            for (var key in prog_group) {
                var item = prog_group[key];
                var cnt = item.count;
                var sum = item.sum;
                var sumsqr = item.sumsqr;
                var avg = sum / cnt;
                var min = item.min;
                var max = item.max;
                var program = item.program;

                var stddev;
                var lowval;
                var highval;


                if (cnt > 1) {
                    stddev = Math.sqrt((sumsqr - (sum * sum / cnt)) / (cnt - 1));
                    lowval = avg - stddev;
                    highval = avg + stddev;
                } else {
                    lowval = min;
                    highval = max;
                }

                var new_row = [];
                new_row = [
                program,
                min,
                lowval,
                highval,
                max];

                data_rows.push(new_row);

            }



            var data = google.visualization.arrayToDataTable(data_rows, true);

            // Set chart options
            var options_lines = {
                width: 1000,
                height: 563,
                hAxis: {
                    title: 'Program',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Time (s)'
                },
                legend: 'none'
            };

            var chart_lines = new google.visualization.CandlestickChart(document.getElementById(dom_id));
            chart_lines.draw(data, options_lines);
            $(job_page).find('#' + dom_id).show();

        }


    };


}




Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


function sap_date(dt) {
    var parts = dt.split(".");
    return new Date(parts[2], parts[1] - 1, parts[0]);
}


function calc_approx_week(dt) {

    var yr = dt.getFullYear();
    var approx_yr_start = yr + "-01-01T00:00:00.000Z";
    var startdtsecs = Date.parse(approx_yr_start);
    var dtsecs = dt.getTime();

    var week = (dtsecs - startdtsecs) / 604800000;
    return Math.floor(week);

}