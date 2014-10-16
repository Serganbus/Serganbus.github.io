if (!this.ru) this.ru = {}; 
else if (typeof ru !== "object") {
    throw new Error("имя ru существует, но не является обектом!");
}
if (!ru.tomsk) ru.tomsk = {}; 
else if (typeof ru.tomsk !== "object") {
    throw new Error("имя ru.tomsk существует, но не является обектом!");
}

ru.tomsk.url = {};
ru.tomsk.url.getVariables = function () {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};

ru.tomsk.validation = {};
ru.tomsk.validation.isValidMoneyFormat = function (aValue_str) {
    var lValue_num = parseFloat(aValue_str.replace(",", ".")).toFixed(2);
    //var regexp = /^(\d+((\.|,)\d+)?|\.\d+)$/;
    var regexp = /^(?:\d+\.)?\d+$/;
    return (this.isNumber(lValue_num) && lValue_num > 0) ? regexp.test(lValue_num.toString()) : false;
};

ru.tomsk.validation.isNumber = function (aValue_obj) {
    return !isNaN(parseFloat(aValue_obj)) && isFinite(aValue_obj);
};

ru.tomsk.validation.isValidDate = function (aValue_str, aOptUserFormat_str) {
    // Set default format if format is not provided
    var lUserFormat_str = aOptUserFormat_str || "yyyy-mm-dd";

    // Find custom delimiter by excluding the
    // month, day and year characters
    var delimiter = /[^mdy]/.exec(lUserFormat_str)[0];

    // Create an array with month, day and year
    // so we know the format by index
    var theFormat = lUserFormat_str.split(delimiter);

    // Get the user date now that we know the delimiter
    var theDate = aValue_str.split(delimiter);

    function isDate (date, format) {
        var m, d, y, i = 0, len = format.length, f;
        for (i; i < len; i++) {
            f = format[i];
            if (/m/.test(f)) m = date[i];
            if (/d/.test(f)) d = date[i];
            if (/y/.test(f)) y = date[i];
        }
        return (m > 0 && m < 13 &&
                y && y.length === 4 &&
                d > 0 &&
                // Is it a valid day of the month?
                d <= (new Date(y, m, 0)).getDate()
        );
    }
    return isDate(theDate, theFormat);
};