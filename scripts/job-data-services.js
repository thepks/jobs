(function() {

    var app = angular.module('JobDataService', []);

    var programNames = ['Please logon first'];
    
    var logged_on = false;
    var logged_on_user;
    var logged_on_roles;

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

            set_auth_status : function(username, roles) {
                logged_on_user = username;
                logged_on_roles = roles;
                logged_on = true;
            },
            
            clear_auth_status : function() {
                logged_on = false;
                logged_on_user = '';
                logged_on_roles = '';
            },
            
            get_auth_status : function() {
                var togo ={};
                togo.logged_on = logged_on;
                togo.username = logged_on_user;
                togo.roles = logged_on_roles;
                return togo;
            },

            end_session: function() {

                return $http.delete("/_session", {
                    withCredentials: true
                });

            },
            
            create_user: function(user, pass, company) {
                
                var comp = "JOB_CO_" + company;
                var roles = [comp];
                var id = {};
                id._id = "org.couchdb.user:"+user;
                id.name = user;
                id.roles = roles;
                id.type = 'user';
                id.password = pass;
                id.withCredentials = true;
                
                return $http.put("/_users/org.couchdb.user:"+user , JSON.stringify(id));
                
            },

            list_users: function(search) {
                
                var url = '/_users/_all_docs?include_docs=true';
                if (search.length > 0) {
                    url = url + '&startkey="org.couchdb.user:'+search+'"&endkey="org.couchdb.user:'+search+'\u9999"';
                } else {
                    url = url + '&startkey="org.couchdb.user"';
                }
                return $http.get(url, {withCredentials:true});
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
                    var value = data.rows[i].value;
                    var split_key = key.split(/\|/g);
                    var ptype = split_key[1];
                    if (program_type === ptype && value !== 0) {
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