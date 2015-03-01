(function() {
    var app = angular.module('jobAnalyser', []);

    var option = 0;
    var job_data = false;
    var logged_on = false;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;

    app.controller('JobController', function() {

        this.setOption = function(value) {
            this.option = value;
        };

        this.isOption = function(value) {
            return this.option === value;
        };

        this.isErrorLogon = function() {
            return logon_error === 1;
        };

        this.logon = function() {
            console.log(this.username);
            var that = this;

            var promise_logon;

            promise_logon = $.ajax({
                type: "POST",
                url: "/_session",
                data: {
                    name: this.username,
                    password: this.password
                }
            });
            promise_logon.done(function(data, status, jqXHR) {
                console.log("Data: " + data + "\nStatus: " + status);
                //                auth_token = jqXHR.getResponseHeader("AuthSession");

                /*                $(job_page).find('#program-names').empty();
                $(job_page).find('#program-names').append("<option value='Please wait, loading'></option>");
*/
                fetch_job_types();
                that.option = 1;
                that.logged_on = true;

            });
            promise_logon.fail(function(data, status) {
                console.log("Error! " + data + "\nStatus: " + status);
                that.logon_error = 1;
                that.logon_error_message = 'Logon Failed! ' + status;


                setTimeout(function() {
                    that.logon_error = 0;
                }, 2000);

            });


        };

        this.logoff = function() {
            var promise_logoff;
            console.log('In event logoff');
            this.logged_on = false;
            this.option = 1;

            promise_logoff = $.ajax({
                type: "DELETE",
                url: "/_session"

            });
            promise_logoff.done(function(data, status) {
                // Mod to add in setting the cookie
                console.log("Data: " + data + "\nStatus: " + status);
                $('#program-names').empty();
                $('#program-names').append("<option value='Please logon'></option>");

            });
            promise_logoff.fail(function(data, status) {
                console.log("Error! " + data + "\nStatus: " + status);
            });


        };

    });

    app.controller('UploadController', function() {


        this.load = function() {


            console.log('About to read');

            console.log($('#importFiles')[0].files[0]['name']);
            return;



            $('#load-feedback').text("Loading ... please wait");
            $('#load-feedback').show();

            var uploads = event.target.files.length;

            for (var i = 0; i < event.target.files.length; i++) {
                new file_parser(event.target.files[i]).
                then(upload_job_data).
                then(function() {
                    console.log('Upload done!');
                    uploads--;


                    if (uploads === 0) {

                        $('#load-feedback').text("Upload completed");

                        self.fetch_job_types();

                        setTimeout(function() {
                            $('#load-feedback').hide();
                        }, 5000);


                    }



                },

                function(error) {

                    $('#load-feedback').text("The file specified cannot be read");

                    setTimeout(function() {
                        $('#load-feedback').hide();
                    }, 2000);


                });
            }

            //            upload_job_data(parsed_lines, id)

        };
    });

    app.controller('VariabilityController', function() {

        this.history = function() {
            var that = this;

            this.data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;
                var promise_func2;

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
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
                    var_graph.init(data, 'variability-results');
                    var_graph.register_variability_chart();
                });

                this.job_data = true;
            }
        };



    });

    app.controller('ChangeController', function() {

        this.history = function() {
            var that = this;

            this.job_data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;
                var promise_func3;

                var startdt = new Date(from_date);
                var enddt = new Date(to_date);
                var startwk = calc_approx_week(startdt);
                var endwk = calc_approx_week(enddt);

                var url = '/jobs/_design/job_stats/_list/deg_by_week/job_weekly_stats?group=true&level=exact';
                url = url + '&startkey=[\"A\",\"' + startwk + '\"]';
                url = url + '&endkey=[\"\u9999\",\"' + endwk + '\"]';

                promise_func3 = $.ajax({
                    url: url,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });

                promise_func3.done(function(data) {
                    console.log("Fetched: " + JSON.stringify(data));
                    var var_graph = history_graph();
                    var_graph.init(data, 'summary-reduce');
                    var_graph.register_change_chart();
                });

                this.job_data = true;
            }
        };



    });


    app.controller('HistoryController', function() {

        this.history = function() {
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var program_name = this.historyFormData.program;
                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;
                var promise_func1;
                var promise_func1b;
                var promise_func1c;
                var promise_func1d;

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';


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
                    graph1.init(data, 'summary-results');
                    graph1.register();
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
                    graph2.init(data, 'summary-history');
                    graph2.register_history();
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
                    graph3.init(data, 'summary-parallel');
                    graph3.register_concurrent_chart();
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
                    graph4.init(data, 'summary-processing');
                    graph4.register_processing_chart();
                });

                this.job_data = true;
            }
        };


    });

    var historyFormData = {
        fromDate: new Date(),
        toDate: new Date(),
        program: ''
    };

    upload_job_data = function(parsed_lines, id) {

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
    };


    upload = function(data, username) {

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

        //          console.log(lines[0]);
        for (var l = 0; l < lines.length; l++) {
            if (lines[l].trim().length < 1) {
                continue;
            }
            is_mass = false;
            if (first) { // First line describes file columns
                first = false;
                var fields = lines[l].split(/ +/);
                //                  console.log('>>>'+fields+'<<<'+fields.length);
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

                        //                console.log(val);
                        //if (w ==
                        job[field_names[w]] = val.toString().trim().split(/ +/)[0];
                    }
                }
                //            console.log(job);
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
    };



    file_parser = function(f) {
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
    };

    parse_html = function(data) {

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

    };



    fetch_job_types = function() {

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

        promise_jobtypes.done(function(data, status) {
            $('#program-names').empty();
            $('#program-name').val('');
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
                $('#program-names').append("<option value='" + deduplist[q] + "'></option>");
            }

        });

    };



    function history_graph() {

        var res_data;
        var self;
        var dom_id;

        return {
            init: function(raw_data, id) {

                self = this;
                res_data = raw_data;
                dom_id = id;

            },

            reset_data: function(raw_data) {
                res_data = raw_data;
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
                    new_row = [key, value];

                    data_rows.push(new_row);

                }


                var data = google.visualization.arrayToDataTable(data_rows, false);

                // Set chart options
                var options_lines = {
                    width: 1000,
                    height: 1200,
                    hAxis: {
                        title: 'Change Factor',
                        gridlines: {
                            count: 10
                        }
                    },
                    vAxis: {
                        title: 'Program',
                        textStyle: {
                            fontSize: 7
                        }
                    },
                    legend: 'none',

                    isStacked: false
                };

                var chart_lines = new google.visualization.BarChart(document.getElementById(dom_id));
                chart_lines.draw(data, options_lines);

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
                        },
                        textStyle: {
                            fontSize: 7
                        }
                    },
                    vAxis: {
                        title: 'Time (s)',
                    },
                    legend: 'none'
                };

                var chart_lines = new google.visualization.CandlestickChart(document.getElementById(dom_id));
                chart_lines.draw(data, options_lines);

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

})();