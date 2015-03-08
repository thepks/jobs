(function() {
    var app = angular.module('jobAdmin', ["JobDataService"]);

    var option = 0;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;

    app.controller('JobAdminController', ["JobDataService", function(JobDataService) {

        this.setOption = function(value) {
            this.option = value;
        };

        this.isOption = function(value) {
            return this.option === value;
        };

        this.isErrorLogon = function() {
            return logon_error === 1;
        };

        this.isLoggedOn = function() {
            return JobDataService.get_auth_status().logged_on;
        }

        this.logon = function() {
            console.log(this.username);
            var that = this;

            JobDataService.authenticate(this.username, this.password).
            success(function(data) {
                that.option = 1;
                JobDataService.set_auth_status(data.name, data.roles);
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
            this.option = 1;

            JobDataService.end_session().
            success(function(data, status, headers) {
                JobDataService.clear_auth_status();
            }).
            error(function(data, status) {
                console.log('failed to logoff');
            });

        };


    }]);

})();