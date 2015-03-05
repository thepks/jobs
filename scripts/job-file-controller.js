jobFileController = function() {

    var initialised = false;
    var self;

    return {

        init: function() {
            self = this;

            $('#importFile').change(self.loadFromHTML3);
            initialised = true;
        },


        loadFromHTML3: function(event) {
            var uploads = event.target.files.length;
            var files = event.target.files;
            }


    };
}();
