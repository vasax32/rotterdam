var DateConverter = new function(){
    this.convertDateToString = function (date){
        var curr_date = this.prefixZeros(date.getDate(), 2);
        var curr_month = this.prefixZeros(date.getMonth() + 1, 2);
        var curr_year = date.getFullYear();
        var formattedDate = curr_date + "." + (curr_month) + "." + curr_year;
        console.log("Converted: " + date + " : To : " + formattedDate);
        return formattedDate;
    };
    this.prefixZeros = function (num, length)
    {
        var r = "" + num;
        while (r.length < length) {
            r = "0" + r;
        }
        return r;
    };
    var dateFormat = /(\d{2}.\d{2}.\d{4})/;
    var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

    this.convertDatesToStrings = function (input) {
        // Ignore things that aren't objects.
        if (typeof input !== "object") return input;

        for (var key in input) {
            if (!input.hasOwnProperty(key)) continue;

            var value = input[key];
            var match;
            // Check for string properties which look like dates.
            if(typeof value.getMonth === 'function') {
                var formattedDate = this.convertDateToString(value);
                console.log("Converted: " + input[key] + " : To : " + formattedDate);
                input[key] = formattedDate;
            } else
//            if (typeof value === "string" && (match = value.match(regexIso8601)) ) {
//                var date = new Date(value);
//                var formattedDate = this.convertDateToString(date);
//                console.log("Converted: " + value + " : To : " + formattedDate);
//                input[key] = formattedDate;
//                //console.log(formattedDate);
//            } else
            if (typeof value === "object") {
                // Recurse into object
                this.convertDatesToStrings(value);
            }

        }
    }

    this.convertDateStringsToDates = function (input) {
        // Ignore things that aren't objects.
        if (typeof input !== "object") return input;

        for (var key in input) {
            if (!input.hasOwnProperty(key)) continue;

            var value = input[key];
            var match;
            // Check for string properties which look like dates.
            if (typeof value === "string" && (match = value.match(dateFormat))) {
                var parts = match[0].split('.');
                // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
                var date = new Date(parts[2], parts[1] - 1, parts[0]);
                console.log("Converted: " + value + " : To : " + date);
                input[key] = date; // Note: months are 0-based
            } else if (typeof value === "object") {
                // Recurse into object
                this.convertDateStringsToDates(value);
            }
        }
    };
}


