(function() {
    var app = angular.module('jobAnalyser', []);

    var option = 0;
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
                this.option = 1;
                this.logged_on = true;

                /*                $(job_page).find('#program-names').empty();
                $(job_page).find('#program-names').append("<option value='Please wait, loading'></option>");
*/
                fetch_job_types();
            });
            promise_logon.fail(function(data, status) {
                console.log("Error! " + data + "\nStatus: " + status);
                this.logon_error = 1;
                this.logon_error_message = 'Logon Failed! ' + status;


                setTimeout(function() {
                    this.logon_error = 0;
                }, 2000);

            });


        };

        this.logoff = function() {
            var promise_logoff;
            console.log('In event logoff');
            evt.preventDefault();
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

    });

    app.controller('HistoryController', function() {

        this.history = function() {
            if (this.historyFormData) {
                console.log(this.historyFormData);
                this.historyFormData = {};
            }
        };


    });

    var historyFormData = {
        fromDate: new Date(),
        toDate: new Date(),
        program: ''
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
                height: 1500,
                hAxis: {
                    title: 'Program',
                    gridlines: {
                        count: 10
                    }
                },
                vAxis: {
                    title: 'Change',
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