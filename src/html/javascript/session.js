import { _mainBackend, global_Climbs, _selectedIndex } from "./variables.js";

var _sessionId = -1;

function addSessionTick (tick) {
    if (_sessionId == -1) {
        console.log("Start a session first");
        return;
    }

    // Bit shit, should store route in variables.js instead
    var route = global_Climbs[_selectedIndex];
    if (!route || !route.id) {
        console.log("Please select a route first");
        return;
    }

    $("#sessionTick").hide();
    $("#sessionAttempt").hide();
    $("#sessionTickLoading").show();

    var options = {
        tick: tick,
        routeId: route.id,
    };

    var callback = function (output) {
        console.log("Tick added. Id=" + output);
        setTimeout(() => {
            $("#sessionTick").show();
            $("#sessionAttempt").show();
            $("#sessionTickLoading").hide();
        }, 2000);
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "addSessionTick",
            parameter: options,
        },
        type: "POST",
        success: function (output) {
            if (typeof callback != "undefined") {
                callback(output);
            }
        },
        dataType: "json",
    });
}

function startSession () {
    if (_sessionId != -1) {
        console.log("Session already started");
        return;
    }

    var callback = function (output) {
        _sessionId = output;
        console.log("Session added");
        setTimeout(() => {
            $("#menuItems").hide();
            $("#sessionStartMenu").hide();
            $("#sessionStopMenu").show();
            $("#loadingScreen").hide();
            $("#sessionInfo").show();
        }, 1000);
    };

    $("#loadingScreen").show();

    $.ajax({
        url: _mainBackend,
        data: {
            function: "createSession",
        },
        type: "POST",
        success: function (output) {
            if (typeof callback != "undefined") {
                callback(output);
            }
        },
        dataType: "json",
    });
}

function endSession () {
    if (_sessionId == -1) {
        console.log("Start a session first");
        return;
    }

    $("#loadingScreen").show();

    var options = {
        sessionId: _sessionId,
        endTime: new Date().toISOString(),
        personName: "test person",
        comments: "test",
    };

    var callback = function (output) {
        _sessionId = -1;
        console.log("Session stopped");
        setTimeout(() => {
            $("#menuItems").hide();
            $("#sessionStartMenu").show();
            $("#sessionStopMenu").hide();
            $("#loadingScreen").hide();
            $("#sessionInfo").hide();
        }, 1000);
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "updateSession",
            parameter: options,
        },
        type: "POST",
        success: function (output) {
            if (typeof callback != "undefined") {
                callback(output);
            }
        },
        dataType: "json",
    });
}

export { addSessionTick, startSession, endSession };
