(function() {
    var app = angular.module('jobAnalyser', ["upload", "JobGraphService", "JobDataService"]);

    var option = 0;
    var job_data = false;
    var logged_on = false;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;

    app.controller('JobController', ["JobDataService", function(JobDataService) {

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

            JobDataService.authenticate(this.username, this.password).
            success(function() {
                that.option = 1;
                that.logged_on = true;
                setTimeout(function() {
                    JobDataService.populate_program_names();
                }, 200);
            }).
            error(function(data, status) {
                that.logon_error = 1;
                that.logon_error_message = 'Logon Failed! ' + status;


                setTimeout(function() {
                    that.logon_error = 0;
                }, 2000);

            });


        };





        this.logoff = function() {
            console.log('In event logoff');
            this.logged_on = false;
            this.option = 1;

            JobDataService.end_session().
            success(function(data, status, headers) {
                JobDataService.reset_program_names();
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

    app.controller('VariabilityController', ["JobGraphService", "JobDataService", function(JobGraphService, JobDataService) {

        this.history = function() {
            var that = this;

            this.data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                JobDataService.general_stats(from_date, to_date).
                success(function(data) {
                    JobGraphService.variability_graph(data, 'variability-results');
                });

                this.job_data = true;
            }
        };



    }]);

    app.controller('ChangeController', ["JobGraphService", "JobDataService", function(JobGraphService, JobDataService) {

        this.history = function() {
            var that = this;

            this.job_data = false;
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                JobDataService.job_weekly_change_gradient(from_date, to_date).
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


    app.controller('HistoryController', ["JobGraphService", "JobDataService", function(JobGraphService, JobDataService) {

        this.history = function() {
            if (this.historyFormData) {
                console.log(this.historyFormData);

                var program_name = this.historyFormData.program;
                var from_date = this.historyFormData.fromDate;
                var to_date = this.historyFormData.toDate;

                JobDataService.job_stats(program_name, from_date, to_date).
                success(function(data) {
                    JobGraphService.duration_overview(data, 'summary-results');
                });


                JobDataService.job_duration(program_name, from_date, to_date).
                success(function(data) {
                    JobGraphService.history_graph(data, 'summary-history');
                });


                JobDataService.parallel_calls(program_name, from_date, to_date).
                success(function(data) {
                    JobGraphService.concurrent_graph(data, 'summary-parallel');
                });


                JobDataService.processing_characteristics(program_name, from_date, to_date).
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





})();