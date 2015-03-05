(function() {
    var app = angular.module('jobAnalyser', ["upload","JobGraphService"]);

    var option = 0;
    var job_data = false;
    var logged_on = false;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;

    app.controller('JobController', ["$http", "$q", function($http, $q) {

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

            $http.post("/_session", {
                name: this.username,
                password: this.password
            }).
            then(that.fetch_job_types).
            then(function() {
                that.option = 1;
                that.logged_on = true;
            },(function(data, status) {
                that.logon_error = 1;
                that.logon_error_message = 'Logon Failed! ' + status;


                setTimeout(function() {
                    that.logon_error = 0;
                }, 2000);

            })
            );


        };
        
        this.fetch_job_types = function() {
    
            var deferred = $q.defer();
    
            var url = '/jobs/_design/job_details/_list/byuser/owner?group=true&level=exact';
            var duplist = [];
            var deduplist = [];
            var promise_jobtypes;
            var that = this;
            var data;
    
            $http.get(url).
            success(function(data) {
    
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
                
                deferred.resolve();
            }).
            error( function(){
               deferred.reject(); 
            });
            
            return deferred.promise;
    
        };
    

        this.logoff = function() {
            console.log('In event logoff');
            this.logged_on = false;
            this.option = 1;

            $http.delete("/_session").
            success(function(data, status, headers) {
                $('#program-names').empty();
                $('#program-names').append("<option value='Please logon'></option>");
            }).
            error(function(data, status) {
                console.log('failed to logoff');
            });

        };

    }]);

    app.controller('UploadController2', function() {


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

    app.controller('VariabilityController',["$http", "JobGraphService" , function($http, JobGraphService) {

        this.history = function() {
            var that = this;

            this.data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';
                url = url + '&startkey=[\"\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"\u9999\",\"' + to_date + '\u9999\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.variability_graph(data, 'variability-results');
                });

                this.job_data = true;
            }
        };



    }]);

    app.controller('ChangeController',["$http", "JobGraphService", function($http, JobGraphService) {

        this.history = function() {
            var that = this;

            this.job_data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                var startdt = new Date(from_date);
                var enddt = new Date(to_date);
                var startwk = calc_approx_week(startdt);
                var endwk = calc_approx_week(enddt);

                var url = '/jobs/_design/job_stats/_list/deg_by_week/job_weekly_stats?group=true&level=exact';
                url = url + '&startkey=[\"\",\"' + startwk + '\"]';
                url = url + '&endkey=[\"\u9999\",\"' + endwk + '\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.change_graph(data, 'summary-reduce');
                });
                this.job_data = true;
            }
        };



    }]);

    app.controller('UploadController', function() {

        //        var Files = $resource('/files/:id', { id: "@id" });


        this.model = {
            file: []
        };

        this.upload = function(m) {
            console.log(m.file);
            //                Files.prototype.$save.call(model.file, function(self, headers) {
            // Handle server response
            //                });
        };

    });


    app.controller('HistoryController',["$http", "JobGraphService", function($http, JobGraphService) {

        this.history = function() {
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var program_name = this.historyFormData.program;
                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                var url = '/jobs/_design/job_stats/_list/byuser/job_stats?group=true&level=exact';


                url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.duration_overview(data, 'summary-results');
                });

                url = '/jobs/_design/job_stats/_list/duration/job_summary?group=true&level=exact';
                url = url + '&startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.history_graph(data, 'summary-history');
                });

                url = '/jobs/_design/job_details/_list/parallel_calls/server?';
                url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.concurrent_graph(data, 'summary-parallel');
                    });

                url = '/jobs/_design/job_stats/_list/proc_percentages/abap_db_split?group=true&level=exact&';
                url = url + 'startkey=[\"' + program_name + '\",\"' + from_date + '\"]';
                url = url + '&endkey=[\"' + program_name + '\",\"' + to_date + '\u9999\"]';

                $http.get(url).
                success(function(data) {
                    JobGraphService.processing_graph(data, 'summary-processing');
                });

                this.job_data = true;
            }
        };


    }]);

    var historyFormData = {
        fromDate: new Date(),
        toDate: new Date(),
        program: ''
    };







    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };




    function calc_approx_week(dt) {

        var yr = dt.getFullYear();
        var approx_yr_start = yr + "-01-01T00:00:00.000Z";
        var startdtsecs = Date.parse(approx_yr_start);
        var dtsecs = dt.getTime();

        var week = (dtsecs - startdtsecs) / 604800000;
        return Math.floor(week);

    }

})();