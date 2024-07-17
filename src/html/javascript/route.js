import { global_Climbs, setGlobalClimbs, _mainBackend, _selectedIndex, _currentProblem } from "./variables.js";
import { generateListOfClimbs } from "./ui.js";
import { populateClimb } from "./board.js";

function generateName () {
    $.ajax({
        url: _mainBackend,
        data: {
            function: "generateName",
        },
        type: "POST",
        success: function (output) {
            $("#routeName").val(output);
        },
        dataType: "json",
    });
}

function saveRouteDB () {
    var options = {
        name: $("#routeName").val(),
        grade: $("#routeGrade").val(),
        author: $("#routeAuthor").val(),
        problem: JSON.stringify(_currentProblem),
    };

    if (options.author == "") {
        options.author = $("#routeAuthor").attr("placeholder");
    }

    if (options.name == "" || options.grade == "" || options.author == "" || options.problem == "") {
        alert("ERROR: Please ensure all fields are filled.");
        return;
    }

    // TODO: Just use prepared statements...
    // escape any quote and apostrophes so database doesn't break.
    options.name = options.name.replace(/'/g, "\\'");
    options.author = options.author.replace(/'/g, "\\'");

    console.log("Saving Route.");
    $("#saveFormStatus").show().addClass("saveForm-container-status-loading");

    var callback = function (output) {
        setTimeout(() => {
            $("#saveFormStatus").removeClass("saveForm-container-status-loading");
            $("#saveFormStatus").addClass("saveForm-container-status-success");
            setTimeout(function () {
                $("#saveFormStatus").hide().removeClass("saveForm-container-status-success");
                $("#saveFormBg").hide();
            }, 1000);
            loadRoutes(output); //refresh list.
        }, 1000);
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "saveRoute",
            parameter: options,
        },
        type: "POST",
        success: function (output) {
            if (output != -1) {
                if (typeof callback != "undefined") {
                    callback(output);
                    console.log("Saving was successful!");
                }
            } else {
                $("#saveFormStatus").removeClass("saveForm-container-status-loading");
                $("#saveFormStatus").addClass("saveForm-container-status-error");
            }
        },
        error: function (ajaxContext) {
            console.error(ajaxContext.responseText);
            $("#saveFormStatus").removeClass("saveForm-container-status-loading");
            $("#saveFormStatus").addClass("saveForm-container-status-error");
            setTimeout(function () {
                $("#saveFormStatus").hide().removeClass("saveForm-container-status-error");
                $("#saveFormBg").hide();
            }, 2000);
        },
        dataType: "json",
    });
}

function getRoutes (sortType, sortOrder, callback) {
    $.ajax({
        url: _mainBackend,
        data: {
            function: "getRoutes",
            parameter: sortType,
            parameter2: sortOrder,
        },
        type: "POST",
        success: function (output) {
            if (typeof callback != "undefined") {
                callback(output);
                console.log("getRoutes was successful!");
            }
        },
        dataType: "json",
    });
}

function loadRoutes (show) {
    var callback = function (DATA) {
        setGlobalClimbs(DATA);
        generateListOfClimbs(DATA);
        if (show != undefined) {
            populateClimb(show);
        }
    };
    getRoutes("NAME", "ASC", callback);
}

function deleteRoute (id) {
    var route = global_Climbs.filter(x => x.id == id)[0];
    if (route == undefined) {
        console.log("Route not found; unable to delete.");
        return;
    }
    var warnDialog = confirm("Are you sure you would like to delete the problem '" + route.name + "'?");
    if (!warnDialog) {
        console.log("Route not deleted due to user decline");
        return;
    }
    $.ajax({
        url: _mainBackend,
        data: {
            function: "deleteRoute",
            parameter: id,
        },
        type: "POST",
        success: function (output) {
            loadRoutes();
            console.log("Route was deleted successfully");
        },
        dataType: "json",
    });
}

function updateRoute (upgrade) {
    $("#regradeItems").hide();
    var route = global_Climbs[_selectedIndex];
    var newGrade = upgrade ? parseInt(route.grade) + 1 : parseInt(route.grade) - 1;
    console.log("Regrading route " + route.id + " from " + route.grade + " to " + newGrade);

    $.ajax({
        url: _mainBackend,
        data: {
            function: "updateRoute",
            parameter: route.id,
            parameter2: newGrade,
        },
        type: "POST",
        success: function (output) {
            loadRoutes(route.id);
            console.log("Route was updated successfully");
        },
        dataType: "json",
    });
}

export { generateName, saveRouteDB, getRoutes, loadRoutes, deleteRoute, updateRoute };
