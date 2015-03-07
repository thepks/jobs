(function() {

    var app = angular.module('JobDataService', []);

    var programNames = ['Please logon first'];

    function calc_approx_week(dt) {

        var yr = dt.getFullYear();
        var approx_yr_start = yr + "-01-01T00:00:00.000Z";
        var startdtsecs = Date.parse(approx_yr_start);
        var dtsecs = dt.getTime();

        var week = (dtsecs - startdtsecs) / 604800000;
        return Math.floor(week);

    }


    function to_key_value(val) {
        return val + '\u9999';
    }

    function form_from_key() {
        var togo = "[\"";
        for (var i = 0; i < arguments.length; i++) {
            togo = togo + arguments[i] + "\"";
            if (arguments.length > i + 1) {
                togo = togo + ",\"";
            }
        }
        togo += "]";
        return togo;
    }

    function form_to_key() {
        var togo = "[\"";
        for (var i = 0; i < arguments.length; i++) {
            togo = togo + arguments[i] + "\u9999\"";
            if (arguments.length > i + 1) {
                togo = togo + ",\"";
            }
        }
        togo += "]";
        return togo;
    }


    var program_types = ['Any', 'Standard', 'Custom', 'Mass', 'Namespace'];




    app.factory("JobDataService", ["$http", "$q", function($http, $q) {


        return {

            authenticate: function(username, password) {

                return $http.post("/_session", {
                    name: username,
                    password: password
                }, {
                    withCredentials: true
                });
            },

            end_session: function() {

                return $http.delete("/_session", {
                    withCredentials: true
                });

            },


            job_stats: function(program_name, from_date, to_date) {

                var startkey = form_from_key(program_name, from_date);
                var endkey = form_to_key(program_name, to_date);

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;

                return $http.get(url, {
                    withCredentials: true
                });

            },

            job_duration: function(program_name, from_date, to_date) {

                var startkey = form_from_key(program_name, from_date);
                var endkey = form_to_key(program_name, to_date);

                var url = '/jobs/_design/job_stats/_list/duration/job_summary?group=true&level=exact';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;

                return $http.get(url, {
                    withCredentials: true
                });

            },


            parallel_calls: function(program_name, from_date, to_date) {

                var startkey = form_from_key(program_name, from_date);
                var endkey = form_to_key(program_name, to_date);


                var url = '/jobs/_design/job_details/_list/parallel_calls/server?';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;

                return $http.get(url, {
                    withCredentials: true
                });

            },

            processing_characteristics: function(program_name, from_date, to_date) {

                var startkey = form_from_key(program_name, from_date);
                var endkey = form_to_key(program_name, to_date);

                var url = '/jobs/_design/job_stats/_list/proc_percentages/abap_db_split?group=true&level=exact&';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;

                return $http.get(url, {
                    withCredentials: true
                });

            },

            general_stats: function(from_date, to_date) {

                var startkey = form_from_key("{}", from_date);
                var endkey = form_to_key("", to_date);

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;
                return $http.get(url, {
                    withCredentials: true
                });

            },

            job_weekly_change_gradient: function(from_date, to_date) {

                var startdt = new Date(from_date);
                var enddt = new Date(to_date);
                var startwk = calc_approx_week(startdt);
                var endwk = calc_approx_week(enddt);

                var startkey = form_from_key("", startwk);
                var endkey = form_to_key("", endwk);


                var url = '/jobs/_design/job_stats/_list/deg_by_week/job_weekly_stats?group=true&level=exact';
                url = url + '&startkey=' + startkey;
                url = url + '&endkey=' + endkey;

                return $http.get(url, {
                    withCredentials: true
                });

            },


            program_names: function() {
                return programNames;
            },

            program_types: function() {
                return program_types;
            },

            form_program_type: function(program_type, namespace) {
                var ptype = '';
                if (program_type && program_type !== 'Any') {
                    ptype = program_type;
                }

                if (program_type && program_type === 'Namespace') {
                    ptype = namespace;
                }
                return ptype;
            },

            filter_results: function(data, program_type) {
                var data_rows = [];
                var togo = {};
                if (program_type === "") {
                    return data;
                }

                for (var i = 0; i < data.rows.length; i++) {

                    var key = data.rows[i].key;
                    var ptype = key[3];
                    if (program_type === ptype) {
                        data_rows.push(data.rows[i]);
                    }
                }
                togo.rows = data_rows;
                return togo;
            },

            filter_results_change: function(data, program_type) {
                var data_rows = [];
                var togo = {};
                if (program_type === "") {
                    return data;
                }


                for (var i = 0; i < data.rows.length; i++) {

                    var key = data.rows[i].key;
                    var split_key = key.split(/\|/g);
                    var ptype = split_key[1];
                    if (program_type === ptype) {
                        data_rows.push(data.rows[i]);
                    }
                }
                togo.rows = data_rows;
                return togo;
            },

            populate_program_names: function() {

                var deferred = $q.defer();

                var url = '/jobs/_design/job_details/_list/byuser/owner?group=true&level=exact';
                var duplist = [];
                var deduplist = [];
                var data;

                $http.get(url, {
                    withCredentials: true
                }).
                success(function(data) {
                    duplist = data.rows.map(function(a) {
                        return a.key[0];
                    });

                    deduplist = duplist.reduce(function(a, b) {
                        if (a.indexOf(b) < 0) {
                            a.push(b);
                        }
                        return a;
                    }, []);

                    programNames = deduplist;

                    deferred.resolve();
                }).
                error(function() {
                    deferred.reject();
                });

                return deferred.promise;

            },

            reset_program_names: function() {
                programNames = ['Please logon'];
            }
        };

    }]);
})();