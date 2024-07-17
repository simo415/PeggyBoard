import { global_Climbs, setGlobalClimbs, _mainBackend } from "./variables.js";
import { generateListOfClimbs } from "./ui.js";
import { getRoutes } from "./route.js";
import { updatePlaylistInfobar } from "./playlist.js";

var _sortOrder = 1;

function toggleLoadSelection () {
    if ($("#loadIcn").hasClass("loadActive")) {
        $("#tableOfClimbs").hide();
        $("#interactionArea").show();
        $("#loadIcn").removeClass("loadActive");
    } else {
        $("#interactionArea").hide();
        $("#tableOfClimbs").show();
        $("#loadIcn").addClass("loadActive");
    }
}

function toggleMenuSelection () {
    if ($("#menuItems").is(":visible")) {
        $("#menuItems").hide();
    } else {
        $("#menuItems").show();
        document.addEventListener("click", function (event) {
            if (event.target.id == "menuButton" || event.target.className == "menuItem") {
                //do nothing
            } else {
                $("#menuItems").hide();
            }
        });
    }
}

function toggleSandbagSelection () {
    if ($("#regradeItems").is(":visible")) {
        $("#regradeItems").hide();
    } else {
        $("#regradeItems").show();
        document.addEventListener("click", function (event) {
            if (event.target.id == "regradeButton" || event.target.className == "regradeItem") {
                //do nothing
            } else {
                $("#regradeItems").hide();
            }
        });
    }
}

function togglePlaylistMode (playlistMode) {
    if (playlistMode) {
        document.getElementById("loadIcn").style.display = "none";
        document.getElementById("saveIcn").style.display = "none";
        document.getElementById("clearIcn").style.display = "none";
        document.getElementById("prevIcn").style.display = "inline-block";
        document.getElementById("nextIcn").style.display = "inline-block";
        document.getElementById("stopIcn").style.display = "inline-block";
        updatePlaylistInfobar(true);
    } else {
        document.getElementById("loadIcn").style.display = "inline-block";
        document.getElementById("saveIcn").style.display = "inline-block";
        document.getElementById("clearIcn").style.display = "inline-block";
        document.getElementById("prevIcn").style.display = "none";
        document.getElementById("nextIcn").style.display = "none";
        document.getElementById("stopIcn").style.display = "none";
        updatePlaylistInfobar(false);
    }
}

function openPlaylistCreation (show) {
    if (show) {
        $("#createPlaylist").show();
    } else {
        $("#createPlaylist").hide();
    }
}

function openPlaylistSelection (show) {
    if (show) {
        $("#openPlaylist").show();
    } else {
        $("#openPlaylist").hide();
    }
}

function openAbout (show) {
    if (show) {
        $("#aboutPage").show();
    } else {
        $("#aboutPage").hide();
    }
}

function searchForRoute () {
    var key = $("#searchBar").val();
    //clear current results
    var data = filterByValue(global_Climbs, key);
    generateListOfClimbs(data);
}

function filterByValue (array, string) {
    return array.filter(o => Object.keys(o).some(k => o["name"].toLowerCase().includes(string.toLowerCase())));
}

function sortList (type) {
    var callback = function (DATA) {
        setGlobalClimbs(DATA);
        generateListOfClimbs(DATA);
    };
    var order;
    _sortOrder = _sortOrder * -1;
    if (_sortOrder < 0) {
        order = "ASC";
    } else {
        order = "DESC";
    }
    if (type == "name") {
        console.log("Sorting by name: " + order);
        getRoutes("NAME", order, callback);
    } else if (type == "grade") {
        console.log("Sorting by grade: " + order);
        getRoutes("GRADE", order, callback);
    } else {
        console.error("Invalid sort type.");
    }
}

function initSwipeEvents () {
    //add event listeners for swipe actions.
    var area = document.getElementById("interactionArea");
    area.addEventListener("swiped-left", function () {
        loadSwipeRoute(1);
    });
    area.addEventListener("swiped-right", function () {
        loadSwipeRoute(-1);
    });
}

function loadSwipeRoute (direction) {
    if (_routeSelected == false) {
        //don't allow for swipe while creating a climb.
        return;
    }
    if (direction == 1) {
        var newIndex = _selectedIndex + 1;
        if (newIndex <= global_Climbs.length - 1) {
            populateClimb(global_Climbs[newIndex].id);
            crappyEffect();
        }
    } else if (direction == -1) {
        if (_selectedIndex > 0) {
            populateClimb(global_Climbs[_selectedIndex - 1].id);
            crappyEffect();
        }
    } else {
        console.error("Error occured on swipe.");
    }
}

//shitty effect to give feedback for swiping through problems.
function crappyEffect () {
    $("#gridTable").css("opacity", 0.3);
    setTimeout(function () {
        $("#gridTable").css("opacity", "");
    }, 200);
}

function getVersion () {
    $.ajax({
        url: _mainBackend,
        data: { function: "getVersion" },
        type: "POST",
        success: function (output) {
            output = output.trim();
            $("#versionDiv").html("v:" + output.slice(30));
        },
        error: function (ajaxContext) {
            console.error("Something went wrong...");
        },
    });
}

export {
    toggleLoadSelection,
    toggleMenuSelection,
    toggleSandbagSelection,
    togglePlaylistMode,
    searchForRoute,
    sortList,
    loadSwipeRoute,
    initSwipeEvents,
    openPlaylistCreation,
    openPlaylistSelection,
    openAbout,
    getVersion,
};
