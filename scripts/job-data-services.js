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




    app.factory("JobDataService", ["$http", "$q", function($http, $q) {


        return {

            authenticate: function(username, password) {

                return $http.post("/_session", {
                    name: username,
                    password: password
                },
                {withCredentials : true}
                );
            },

            end_session: function() {

                return $http.delete("/_session",{withCredentials : true});

            },

            job_stats: function(program_name, from_date, to_date) {

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';


                url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                return $http.get(url,{withCredentials : true});

            },

            job_duration: function(program_name, from_date, to_date) {

                var url = '/jobs/_design/job_stats/_list/duration/job_summary?group=true&level=exact';
                url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                return $http.get(url,{withCredentials : true});

            },


            parallel_calls: function(program_name, from_date, to_date) {

                var url = '/jobs/_design/job_details/_list/parallel_calls/server?';
                url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                return $http.get(url,{withCredentials : true});

            },

            processing_characteristics: function(program_name, from_date, to_date) {

                var url = '/jobs/_design/job_stats/_list/proc_percentages/abap_db_split?group=true&level=exact&';
                url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                return $http.get(url,{withCredentials : true});

            },

            general_stats: function(from_date, to_date) {
                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
                url = url + '&startkey=[\"\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"\u9999\",\"' + to_date + '\u9999\"]';
                return $http.get(url,{withCredentials : true});

            },

            job_weekly_change_gradient: function(from_date, to_date) {

                var startdt = new Date(from_date);
                var enddt = new Date(to_date);
                var startwk = calc_approx_week(startdt);
                var endwk = calc_approx_week(enddt);

                var url = '/jobs/_design/job_stats/_list/deg_by_week/job_weekly_stats?group=true&level=exact';
                url = url + '&startkey=[\"\",\"' + startwk + '\"]';
                url = url + '&endkey=[\"\u9999\",\"' + endwk + '\"]';

                return $http.get(url,{withCredentials : true});

            },


            program_names: function() {
                return programNames;
            },

            populate_program_names: function() {

                var deferred = $q.defer();

                var url = '/jobs/_design/job_details/_list/byuser/owner?group=true&level=exact';
                var duplist = [];
                var deduplist = [];
                var data;

                $http.get(url,{withCredentials : true}).
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