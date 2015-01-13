/**
 * Created by Bill on 14-12-06.
 */

//return 0 for Nulls
function zeroNull(value) {
    return value == null ? 0 : value;
}

//set all null properties in object to 0
function zeroNullObj(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] == null) {
            delete obj[prop];
        }
    }
    return obj;
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "-" + month + "-" + day;
}

function formatDateMMDDYYYY(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if(month < 10) month = '0' + month;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return month + "/" + day + "/" + year;
}

function round2Decimal(number) {
    Math.round(number * 100) / 100;
}
