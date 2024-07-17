import {
    global_Climbs,
    _currentProblem,
    setCurrentProblem,
    setRouteSelected,
    setSelectedIndex,
    _mainBackend,
} from "./variables.js";

var _messageTimer = null;
var _currentSelected = 0;

function populateClimb (id, redirect = false) {
    if (global_Climbs.length > 0) {
        //add active class to the selected and remove from old one if any.
        $("#route" + _currentSelected).removeClass("climb_selected");
        $("#route" + id).addClass("climb_selected");
        _currentSelected = id;
        setSelectedIndex(global_Climbs.findIndex(x => x.id == id));
        var route = global_Climbs.filter(x => x.id == id)[0];
        if (route != undefined) {
            setRouteSelected(true); //Flag to not allow interaction area to be used when a route is active.
            var holds = JSON.parse(route.holds);
            if (_currentProblem.length > 0) {
                clearAll(true); //bypass warning and clear the canvas/lights.
            }
            setCurrentProblem(holds); //set the new current to loaded one.
            $("#selectedRouteName").text(route.name + ", V" + route.grade);
            document.getElementById("regrade").style.display = "inline-block";
            var grade = parseInt(route.grade);
            if (grade + 1 < 16) {
                $("#upgradeRoute").show();
                $("#upgradeRoute").text("Upgrade V" + (grade + 1));
            } else {
                $("#upgradeRoute").hide();
            }
            if (grade - 1 >= 0) {
                $("#downgradeRoute").show();
                $("#downgradeRoute").text("Sandbag V" + (grade - 1));
            } else {
                $("#downgradeRoute").hide();
            }
            for (var hold in holds) {
                $("#hold" + holds[hold].hold).addClass(holds[hold].type);
            }
            if (redirect) {
                toggleLoadSelection();
            }
            lightCurrent();
        }
    }
}

function clearAll (bypass = false, callback) {
    if (!bypass) {
        var warnDialog = confirm("Are you sure you would like to clear the current problem?");
    }
    if (bypass || warnDialog == true) {
        // Clear the current problem.
        console.log("Clearing problem.");

        var holdIDs = [];
        _currentProblem.forEach(hold => holdIDs.push(hold.hold));
        for (let i = 0; i < holdIDs.length; i++) {
            remove_hold(holdIDs[i]);
        }

        if (!bypass) {
            setRouteSelected(false);
            $("#route" + _currentSelected).removeClass("climb_selected");
        }
        // Make sure all LEDs are off
        $.ajax({
            url: _mainBackend,
            data: {
                function: "clearLeds",
            },
            type: "POST",
            success: function (output) {
                if (typeof callback != "undefined") {
                    callback();
                    console.log("Clearing LEDs was successful!");
                }
            },
            dataType: "json",
        });

        $("#selectedRouteName").text(""); //clear the name if there was one;
        document.getElementById("regrade").style.display = "none";
    } else {
        console.log("Clear Canceled.");
    }
}

function remove_hold (id) {
    try {
        var currentType = _currentProblem.filter(function (obj) {
            return obj.hold == id;
        })[0].type;
        $("#hold" + id).removeClass(currentType);
        var removeHold = _currentProblem
            .map(function (item) {
                return item.hold;
            })
            .indexOf(id);
        _currentProblem.splice(removeHold, 1);
    } catch {
        console.error("Can't remove a hold that doesn't exist!");
    }
}

function addHold (id, config) {
    var type = "startingHand";
    var plainText = "Starting Hold";
    var color = config.colorStart;

    //Check if max amount of starting and ending hand holds has reached.
    var maxStartingReached =
        _currentProblem.filter(function (obj) {
            return obj.type === "startingHand";
        }).length >= config.maxStartHolds
            ? true
            : false;
    var maxFinishingReached =
        _currentProblem.filter(function (obj) {
            return obj.type === "finishingHand";
        }).length >= config.maxFinishHolds
            ? true
            : false;

    //Check if a hold currently exists this position.
    try {
        var currentType = _currentProblem.filter(function (obj) {
            return obj.hold == id;
        })[0].type;
    } catch {
        var currentType = undefined;
    }

    if (currentType != undefined) {
        $("#hold" + id).removeClass(currentType);
        var removeHold = _currentProblem
            .map(function (item) {
                return item.hold;
            })
            .indexOf(id);
        _currentProblem.splice(removeHold, 1);

        // Checks currently selected type, to determine next
        switch (currentType) {
            case "startingHand":
                type = "handHold";
                plainText = "Hand Hold";
                color = config.colorHand;
                break;
            case "handHold":
                type = "footHold";
                plainText = "Foot Hold";
                color = config.colorFoot;
                break;
            case "footHold":
                if (!maxFinishingReached) {
                    type = "finishingHand";
                    plainText = "Finishing Hold";
                    color = config.colorFinish;
                } else {
                    type = "none";
                }
                break;
            case "finishingHand":
                type = "none";
                break;
            default:
                type = "handHold";
                color = config.colorHand;
        }
    } else {
        if (type == "startingHand" && maxStartingReached) {
            type = "handHold";
            plainText = "Hand Hold";
            color = config.colorHand;
        }
    }

    if (type != "none") {
        var holdOffset = $("#hold" + id).offset();
        $("#displayMessage").text(plainText);
        $("#messageArea").css("top", holdOffset.top - 10);
        $("#messageArea").css("left", holdOffset.left + 10);
        $("#messageArea").show();
        clearTimeout(_messageTimer);
        _messageTimer = setTimeout(function () {
            $("#displayMessage").text("");
            $("#messageArea").hide();
        }, 500);
        $("#hold" + id).addClass(type);
        var hold = {
            hold: id,
            type: type,
            color: color,
        };
        _currentProblem.push(hold);
        light_hold(hold);
    } else {
        light_hold({ hold: id, color: "000000" });
    }
}

function light_hold (hold) {
    // Light an individually addressed hold
    // Fire and forget... but should consider handling failure by removing
    // frontend light or showing error
    $.ajax({
        url: _mainBackend,
        data: {
            function: "setLed",
            parameter: JSON.stringify(hold),
        },
        type: "POST",
        dataType: "json",
    });
}

function lightCurrent () {
    if (_currentProblem.length > 0) {
        $.ajax({
            url: _mainBackend,
            data: {
                function: "setLeds",
                parameter: JSON.stringify(_currentProblem),
            },
            type: "POST",
            success: function (output) {
                if (typeof callback != "undefined") {
                    callback();
                    console.log("Setting LEDs was successful!");
                }
            },
            dataType: "json",
        });
    } else {
        console.log("No holds to light.");
    }
}

export { populateClimb, clearAll, addHold, lightCurrent };
