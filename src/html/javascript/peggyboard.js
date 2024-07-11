//==========================================
// Title:  settings.js
// Author: Pegor Karoglanian
// Date:   8/15/23
// Notes:  This javascript handles all the main UI for PeggyBoard
//========================================== 

var _mainBackend = "main_backend.php"
var _screenSize = {
    width: 0,
    height: 0
};
var _holdMode = "handHold"; //default
var _currentProblem = []; //Array of objects.
var _routeSelected = false;
var _currentSelected = 0;
var _selectedIndex = 0;
var _messageTimer = null;
var _sortOrder = 1;
var global_Climbs = new Array;
var global_Grades = new Array;
var global_Playlists = new Array;
var global_PlaylistClimbs = new Array;
var global_PlaylistIndex = 0;
var _playlistSelectedId = 0;

const _maxStartingHand = 2;
const _maxFinishingHand = 2;
var _currentStarting;
var _current;

var config = {};

$.ajax({
    url: _mainBackend,
    data: {
        function: 'getFrontendConfig'
    },
    type: 'POST',
    success: function(output) { 
        console.log(output);
        initPage(output);
    },
    dataType: 'json'
});

// testing animations...
var running = false;
async function screensaver() {
    running = true;
    index = 1;
    clearAll(true);
    while (running) {
        prev = (index - 1) % 228 == 0 ? 228 : (index - 1) % 228;
        light_hold({hold:prev, color:"000000"});
        light_hold({hold:index++ % 228, color:"FF0000"});
        await sleep(50);
    }
}
function stopScreensaver() {
    running = false;
}
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function initPage(configuration) {
    config = configuration;

    if (config.wallLayout == 'gridOffset') {
        generateGridOffsetWallLayout();
    } else if(config.wallLayout == 'grid') {
        generateGridWallLayout();
    } else {
        generateGridWallLayout();
    }
    
    loadRoutes();
    loadPlaylists();
    initSwipeEvents();
    setScreenSize();
    getVersion();
}

function generateRouteName() {
    $.ajax({
        url: _mainBackend,
        data: {
            function: 'generateName'
        },
        type: 'POST',
        success: function(output) {
            $("#routeName").val(output);
        },
        dataType: 'json'
    });
}

function setScreenSize() {
    _screenSize.width = $(window).width();
    _screenSize.height = $(window).height();

    var footerTop = $("#footerArea").offset().top;
    var footerHeight = $("#footerArea").height();
    var footerBottom = footerTop + footerHeight;
    var scale = 1;
    var increment = 0.01;
    if (footerBottom > _screenSize.height) {
        while ((footerBottom - 40) >= _screenSize.height) {
            footerTop = $("#footerArea").offset().top;
            footerHeight = $("#footerArea").height();
            footerBottom = footerTop + footerHeight;
            scale = scale - increment;
            $("#mainScreen").css("transform", "scale(" + scale + ")");
        }
    } else if (footerBottom < _screenSize.height) {
        while ((footerBottom + 40) <= _screenSize.height) {
            footerTop = $("#footerArea").offset().top;
            footerHeight = $("#footerArea").height();
            footerBottom = footerTop + footerHeight;
            scale = scale + increment;
            $("#mainScreen").css("transform", "scale(" + scale + ")");
        }
    }
}

function initSwipeEvents() {
    //add event listeners for swipe actions.
    var area = document.getElementById("interactionArea");
    area.addEventListener('swiped-left', function() {
        loadRoute(1);
    });
    area.addEventListener('swiped-right', function() {
        loadRoute(-1);
    });
}

function generateGridOffsetWallLayout() {
    //This is a bit funky, but it is to generate a table in a zig-zag pattern
    // to make it easier for the neopixels to light up in a simple manner.
    // simply put, it generates a tables with layout like so:
    //
    //    18|--|53|--|...|368
    //    --|19|--|54|...|--
    //    17|--|52|--|...|367
    //    --|20|--|55|...|--
    //    16|--|51|--|...|366
    //    --|21|--|56|...|--
    //    15|--|50|--|...|365
    //    --|22|--|57|...|--
    //    ~~~~~~~~~~~~~~~~~~~
    //     1|--|36|--|...|351
    //
    // Excuse the hardcoded values :/

    var table = $("<table id='gridTable'>").addClass('wallTable')
    var holdCount = 1;
    var first_offset_y_count = 0;
    var second_offset_y_count = 0;
    var global_x = 0;
    var numbers = ['18', '', '17', '', '16', '', '15', '', '14', '', '13', '', '12', '', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1']
    var letters = ['A', '', 'B', '', 'C', '', 'D', '', 'E', '', 'F', '', 'G', '', 'H', '', 'I', '', 'J', '', 'K'];
    for (y = 0; y < 36; y++) { // Height
        var patternedCount_1 = 17;
        var patternedCount_2 = 18;
        var row = $('<tr>');
        for (x = 0; x < 22; x++) { // Width
            var col = $('<td>');
            var cont = $('<div>');
            if ((x == 0) && (y % 2 == 0)) { // Numbers every second row
                patternedCount_1 = patternedCount_1 - first_offset_y_count;
                cont = $('<div>').addClass('wallNumbering').text(numbers[y]);
            } else if ((y == 35) && ((x + 1) % 2 == 0)) { // Letters every second column, offset by 1
                cont = $('<div>').addClass('wallLettering').text(letters[x - 1]);
            } else if ((x == 0) || (y == 35)) {
                patternedCount_2 = patternedCount_2 + second_offset_y_count;
            } else if (y % 2 == 0) { // Grid holds
                if ((x + 1) % 2 == 0) {
                    $(row).addClass("borderSideOffset1")
                    cont = $('<div id=hold' + patternedCount_1 + ' onclick="addHold(' + patternedCount_1 + ')">').addClass('wallHoldClickable wallHoldOffset1');
                    patternedCount_1 = patternedCount_1 + 35;
                }
            } else if ((y + 1) % 2 == 0) { // Offset holds
                if ((x) % 2 == 0) {
                    cont = $('<div id=hold' + patternedCount_2 + ' onclick="addHold(' + patternedCount_2 + ')">').addClass('wallHoldClickable wallHoldOffset2');
                    patternedCount_2 = patternedCount_2 + 35;
                }
            }

            if (letters[x] == 'F') {
                $(col).addClass("borderSideOffsetMiddle");
            } else if (x % 2 == 0) {
                $(col).addClass("borderSideOffset1");
            } else {
                $(col).addClass("borderSideOffset2");
            }

            if (numbers[y] == '9') {
                $(col).addClass("borderBottomOffsetMiddle");
            } else if (y % 2 == 0) {
                $(col).addClass("borderBottomOffset1");
            } else {
                $(col).addClass("borderBottomOffset2");
            }

            col.append(cont);
            row.append(col);
        }

        if (y % 2 == 0) {
            first_offset_y_count = first_offset_y_count + 1;
        } else if ((y + 1) % 2 == 0) {
            second_offset_y_count = second_offset_y_count + 1;
        }

        table.append(row);
    }

    $('#interactionArea').append(table);
}

function generateGridWallLayout() {
    // This is to generate a table in a grid pattern of configurable size
    // to make it easier for the neopixels to light up in a simple manner.
    // it generates a tables with layout like so:
    //
    //    18|19|54|55|...|199
    //    17|20|53|56|...|200
    //    16|21|52|57|...|201
    //    15|22|51|58|...|202
    //    ~~~~~~~~~~~~~~~~~~~
    //     1|36|37|71|...|216
    //
    // Table is generated top-left to bottom-right
    // 

    // The number of holds in height of the wall
    var holdHeight = config.holdHeight;
    // The number of holds in width of the wall
    var holdWidth = config.holdWidth;
    
    var colOffset = (holdHeight * 2);
    var table = $("<table id='gridTable'>").addClass('wallTable');

    for (y = 0; y <= holdHeight; y++) {
        var row = $('<tr>');
        // Active hold is set to the left most value in row
        var activeHold = holdHeight - y;
        // Offset is based on the difference between col1 and col2 (see example)
        // 1, 3, 5, 7, etc..
        var activeHoldOffset = (y * 2) + 1;
        for (x = 0; x <= holdWidth; x++) {
            var col = $('<td>');
            var cont = $('<div>');
            if (x == 0) {
                // Numbers are output down to 1, 0 is skipped.
                if (y != holdHeight) {
                    cont = $('<div>').addClass('wallNumbering').text(holdHeight - y);
                }
            } else if ((y == holdHeight) && (x != 0)) {
                // Letters based on UTF codes. A = 65, B = 66, etc..
                // Start at 64 as x=1 when A should be written
                // Will get a little funky for width > 26
                cont = $('<div>').addClass('wallLettering').text(String.fromCharCode(64 + x));
            } else {
                $(row).addClass("borderSideOffset1");
                cont = $('<div id=hold' + activeHold + ' onclick="addHold(' + activeHold + ')">').addClass('wallHoldClickable wallHoldOffset1');
                
                // Calculation for the next hold value
                if (x % 2 == 0) {
                    // For even columns, the next value will be double
                    // the holdHeight; minus the offset, added to activeHold
                    // Example: holdHeight = 18
                    // activeHold = 19; the next activeHold would be 54
                    // ((18 * 2) - 1) + 19 = 54
                    activeHold += colOffset - activeHoldOffset;
                } else {
                    // For odd columns, the next value will be the offset 
                    // added to activeHold
                    // Example: holdHeight = 18
                    // activeHold = 18; the next activeHold would be 19
                    activeHold += activeHoldOffset;
                }
            }

            // Midpoint vertically to draw line
            if (x + 1 == Math.floor(holdWidth / 2)) {
                $(col).addClass("borderSideOffsetMiddle");
            } else {
                $(col).addClass("borderSideOffset1");
            }

            // Midpoint horizontally to draw line
            if (y + 1 == Math.floor(holdHeight / 2)) {
                $(col).addClass("borderBottomOffsetMiddle");
            } else {
                $(col).addClass("borderBottomOffset1");
            }

            // console.log("H" + y + "W" + x + ": ", cont);
            col.append(cont);
            row.append(col);
        }

        table.append(row);
    }

    $('#interactionArea').append(table);
}

function addHold(id) {
    var type = 'startingHand';
    var plainText = 'Starting Hold';
    //var color = '00FF00';
    var color = config.colorStart;

    //Check if max amount of starting and ending hand holds has reached.
    var maxStartingReached = (_currentProblem.filter(function(obj) {
        return obj.type === "startingHand"
    }).length >= _maxFinishingHand ? true : false);
    var maxFinishingReached = (_currentProblem.filter(function(obj) {
        return obj.type === "finishingHand"
    }).length >= _maxFinishingHand ? true : false);

    //Check if a hold currently exists this position.
    try {
        var currentType = _currentProblem.filter(function(obj) {
            return obj.hold == id
        })[0].type;
    } catch {
        var currentType = undefined;
    }

    if (currentType != undefined) {
        $("#hold" + id).removeClass(currentType);
        var removeHold = _currentProblem.map(function(item) {
            return item.hold;
        }).indexOf(id);
        _currentProblem.splice(removeHold, 1);

        // Checks currently selected type, to determine next
        switch (currentType) {
            case "startingHand":
                type = "handHold";
                plainText = 'Hand Hold';
                color = config.colorHand;
                break;
            case "handHold":
                type = "footHold";
                plainText = 'Foot Hold';
                color = config.colorFoot;
                break;
            case "footHold":
                if (!maxFinishingReached) {
                    type = "finishingHand";
                    plainText = 'Finishing Hold';
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
            plainText = 'Hand Hold';
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
        _messageTimer = setTimeout(function() {
            $("#displayMessage").text("");
            $("#messageArea").hide();
        }, 500);
        $("#hold" + id).addClass(type);
        var hold = {
            hold: id,
            type: type,
            color: color
        };
        _currentProblem.push(hold);
        light_hold(hold);
    } else {
        light_hold({hold:id, color:"000000"});
    }
}

function light_hold(hold) {
    // Light an individually addressed hold
    // Fire and forget... but should consider handling failure by removing 
    // frontend light or showing error
    $.ajax({
        url: _mainBackend,
        data: {
            function: 'setLed',
            parameter: JSON.stringify(hold)
        },
        type: 'POST',
        dataType: 'json'
    });
}

function remove_hold(id) {
    try {
        var currentType = _currentProblem.filter(function(obj) {
            return obj.hold == id
        })[0].type;
        $("#hold" + id).removeClass(currentType);
        var removeHold = _currentProblem.map(function(item) {
            return item.hold;
        }).indexOf(id);
        _currentProblem.splice(removeHold, 1);
    } catch {
        console.error("Can't remove a hold that doesn't exist!")
    }
}

function lightCurrent() {
    if (_currentProblem.length > 0) {
        $.ajax({
            url: _mainBackend,
            data: {
                function: 'setLeds',
                parameter: JSON.stringify(_currentProblem)
            },
            type: 'POST',
            success: function(output) {
                if (typeof(callback) != "undefined") {
                    callback();
                    console.log('Setting LEDs was successful!');
                }
            },
            dataType: 'json'
        });
    } else {
        console.log("No holds to light.");
    }
}

function clearAll(bypass = false, callback) {
    if (!bypass) {
        var warnDialog = confirm("Are you sure you would like to clear the current problem?");
    }
    if (bypass || warnDialog == true) {
        // Clear the current problem.
        console.log("Clearing problem.");

        var holdIDs = []
        _currentProblem.forEach(hold => holdIDs.push(hold.hold));
        for (var i = 0; i < holdIDs.length; i++) {
            remove_hold(holdIDs[i]);
        }

        if (!bypass) {
            _routeSelected = false;
            $("#route" + _currentSelected).removeClass('climb_selected');
        }
        // Make sure all LEDs are off
        $.ajax({
            url: _mainBackend,
            data: {
                function: 'clearLeds'
            },
            type: 'POST',
            success: function(output) {
                if (typeof(callback) != "undefined") {
                    callback();
                    console.log('Clearing LEDs was successful!');
                }
            },
            dataType: 'json'
        });

        $("#selectedRouteName").text(""); //clear the name if there was one;
        document.getElementById("regrade").style.display = "none";
    } else {
        console.log("Clear Canceled.")
    }
}

function saveRoute() {
    var options = {
        name: $("#routeName").val(),
        grade: $("#routeGrade").val(),
        author: $("#routeAuthor").val(),
        problem: JSON.stringify(_currentProblem)
    };

    if (options.author == "") {
        options.author = $("#routeAuthor").attr('placeholder');
    }

    if (options.name == "" || options.grade == "" || options.author == "" || options.problem == "") {
        alert("ERROR: Please ensure all fields are filled.")
        return;
    }

    // TODO: Just use prepared statements...
    // escape any quote and apostrophes so database doesn't break. 
    options.name = options.name.replace(/'/g, "\\'");
    options.author = options.author.replace(/'/g, "\\'");

    console.log("Saving Route.");
    $("#saveFormStatus").show().addClass("saveForm-container-status-loading");

    var callback = function(output) {
        setTimeout(() => {
            $("#saveFormStatus").removeClass("saveForm-container-status-loading");
            $("#saveFormStatus").addClass("saveForm-container-status-success");
            setTimeout(function() {
                $("#saveFormStatus").hide().removeClass("saveForm-container-status-success");
                $("#saveFormBg").hide();
            }, 1000);
            loadRoutes(output); //refresh list.
        }, 1000);
    }

    $.ajax({
        url: _mainBackend,
        data: {
            function: 'saveRoute',
            parameter: options
        },
        type: 'POST',
        success: function(output) {
            if (output != -1) {
                if (typeof(callback) != "undefined") {
                    callback(output);
                    console.log('Saving was successful!');
                }
            } else {
                $("#saveFormStatus").removeClass("saveForm-container-status-loading");
                $("#saveFormStatus").addClass("saveForm-container-status-error");
            }
        },
        error: function(ajaxContext) {
            console.error(ajaxContext.responseText)
            $("#saveFormStatus").removeClass("saveForm-container-status-loading");
            $("#saveFormStatus").addClass("saveForm-container-status-error");
            setTimeout(function() {
                $("#saveFormStatus").hide().removeClass("saveForm-container-status-error");
                $("#saveFormBg").hide();
            }, 2000);
        },
        dataType: 'json',
    });
}

function openSaveForm() {
    if (_currentProblem.length > 0) {
        document.getElementById("saveFormBg").style.display = "block";
    }
}

function closeSaveForm() {
    document.getElementById("saveFormBg").style.display = "none";
}


function getRoutes(sortType, sortOrder, callback) {
    $.ajax({
        url: _mainBackend,
        data: {
            function: 'getRoutes',
            parameter: sortType,
            parameter2: sortOrder
        },
        type: 'POST',
        success: function(output) {
            global_Climbs = output;
            if (typeof(callback) != "undefined") {
                callback(global_Climbs);
                console.log('getRoutes was successful!');
            }
        },
        dataType: 'json'
    });
}

function deleteClimb(id) {
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
            function: 'deleteRoute',
            parameter: id
        },
        type: 'POST',
        success: function(output) {
            loadRoutes();
            console.log("Route was deleted successfully");
        },
        dataType: 'json'
    });
}

function populateClimb(id, redirect = false) {
    if (global_Climbs.length > 0) {
        //add active class to the selected and remove from old one if any.
        $("#route" + _currentSelected).removeClass('climb_selected');
        $("#route" + id).addClass('climb_selected')
        _currentSelected = id;
        _selectedIndex = global_Climbs.findIndex(x => x.id == id);
        var route = global_Climbs.filter(x => x.id == id)[0];
        if (route != undefined) {
            _routeSelected = true; //Flag to not allow interaction area to be used when a route is active.
            var holds = JSON.parse(route.holds);
            if (_currentProblem.length > 0) {
                clearAll(true); //bypass warning and clear the canvas/lights.
            }
            _currentProblem = holds; //set the new current to loaded one.
            $("#selectedRouteName").text(route.name + ', V' + route.grade);
            document.getElementById("regrade").style.display = "inline-block";
            grade = parseInt(route.grade);
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
            for (hold in holds) {
                $("#hold" + holds[hold].hold).addClass(holds[hold].type);
            }
            if (redirect) {
                toggleLoadSelection();
            }
            lightCurrent();
        }
    }
}

function toggleLoadSelection() {
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

function toggleMenuSelection() {
    if ($("#menuItems").is(":visible")) {
        $("#menuItems").hide();
    } else {
        $("#menuItems").show();
        document.addEventListener("click", function(event) {
            if (event.target.id == "menuButton" || event.target.className == "menuItem") {
                //do nothing
            } else {
                $("#menuItems").hide();
            }
        });
    }
}

function toggleSandbagSelection() {
    if ($("#regradeItems").is(":visible")) {
        $("#regradeItems").hide();
    } else {
        $("#regradeItems").show();
        document.addEventListener("click", function(event) {
            if (event.target.id == "regradeButton" || event.target.className == "regradeItem") {
                //do nothing
            } else {
                $("#regradeItems").hide();
            }
        });
    }
}

function updateRoute(upgrade) {
    $("#regradeItems").hide();
    var route = global_Climbs[_selectedIndex];
    newGrade = upgrade ? parseInt(route.grade) + 1 : parseInt(route.grade) - 1;
    console.log("Regrading route " + route.id + " from " + route.grade + " to " + newGrade);
    
    $.ajax({
        url: _mainBackend,
        data: {
            function: 'updateRoute',
            parameter: route.id,
            parameter2: newGrade
        },
        type: 'POST',
        success: function(output) {
            loadRoutes(route.id);
            console.log("Route was updated successfully");
        },
        dataType: 'json'
    });
}

function loadRoutes(show) {
    var callback = function(DATA) {
        generateListOfClimbs(DATA);
        if (show != undefined) {
            populateClimb(show);
        }
    }
    getRoutes("NAME", "ASC", callback);
}

function generateListOfClimbs(DATA) {
    $("#climbsTable").empty()
    var sortButtons = $(["<div class='sort_options' id='sortOptions'>",
        " <div class='sort_by_name' id='sortByName' onclick='sortList(\"name\")'>",
        "   <span>Name</span>",
        " </div>",
        " <div class='sort_by_grade' id='sortByGrade' onclick='sortList(\"grade\")'>",
        "   <span>Grade</span>",
        " </div>",
        "</div>",
        "<div style='display:inline-block'>",
        "  <span class='deleteIcn' style='display:inline-block'></span>",
        "</div>"
    ].join("\n"))
    $("#climbsTable").append(sortButtons);
    for (y = 0; y < DATA.length; y++) {
        var details = $([
            "<div style='display:inline-block' class='main_wrap' id='route" + DATA[y].id + "' onclick='populateClimb(" + DATA[y].id + ", true)'>",
            "  <div class='left_content'>",
            "    <div style='display:inline-block'>",
            "     <div class='climb_title'>" + DATA[y].name + "</div>",
            "     <div class='climb_desc'>" + DATA[y].author + "</div>",
            "     <div class='climb_date'>" + DATA[y].date.split(' ')[0] + "</div>",
            "    </div>",
            "  </div>",
            "  <div class='right_content'>",
            "    <div class='climb_grade'>V" + DATA[y].grade + "</div>",
            "  </div>",
            "</div>",
            "<div style='display:inline-block'>",
            "  <span class='deleteIcn' style='display:inline-block' onclick='deleteClimb(" + DATA[y].id + ")'></span>",
            "</div>"
            
        ].join("\n"))

        $("#climbsTable").append(details);
    }
    console.log("Done loading climbs.")
}

function loadRoute(direction) {
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
        console.error("Error occured on swipe.")
    }
}

//shitty effect to give feedback for swiping through problems.
function crappyEffect() {
    $("#gridTable").css('opacity', 0.3);
    setTimeout(function() {
        $("#gridTable").css('opacity', '');
    }, 200);
}

function searchForRoute() {
    var key = $("#searchBar").val();
    //clear current results
    var data = filterByValue(global_Climbs, key);
    generateListOfClimbs(data);
}

function filterByValue(array, string) {
    return array.filter(o =>
        Object.keys(o).some(k => o["name"].toLowerCase().includes(string.toLowerCase())));
}

function sortList(type) {
    var callback = function(DATA) {
        generateListOfClimbs(DATA);
    }
    var order;
    _sortOrder = _sortOrder * (-1); //flip flop the sort order shenanigans
    if (_sortOrder < 0) {
        order = "ASC";
    } else {
        order = "DESC";
    }
    if (type == 'name') {
        console.log('Sorting by name: ' + order);
        getRoutes("NAME", order, callback);
    } else if (type == 'grade') {
        console.log('Sorting by grade: ' + order);
        getRoutes("GRADE", order, callback);
    } else {
        console.error("Invalid sort type.");
    }
}

function savePlaylist() {
    var options = {
        name: $("#playlistName").val(),
        mingrade: $("#minGrade").val(),
        maxgrade: $("#maxGrade").val(),
        orderby: $("#orderBy").val()
    };

    if (options.name == "" || options.mingrade == "" || options.maxgrade == "" || options.orderby == "") {
        alert("ERROR: Please ensure all fields are filled.")
        return;
    }

    console.log("Saving Playlist.");
    $("#playlistFormStatus").show().addClass("saveForm-container-status-loading");

    var callback = function(output) {
        setTimeout(() => {
            $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
            $("#playlistFormStatus").addClass("saveForm-container-status-success");
            setTimeout(function() {
                $("#playlistFormStatus").hide().removeClass("saveForm-container-status-success");
                $("#createPlaylist").hide();
            }, 2000);
            loadPlaylists(); 
        }, 2000);
    }

    $.ajax({
        url: _mainBackend,
        data: {
            function: 'savePlaylist',
            parameter: options
        },
        type: 'POST',
        success: function(output) {
            if (output != -1) {
                if (typeof(callback) != "undefined") {
                    callback(output);
                    console.log('Saving was successful!');
                }
            } else {
                $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
                $("#playlistFormStatus").addClass("saveForm-container-status-error");
            }
        },
        error: function(ajaxContext) {
            console.error(ajaxContext.responseText)
            $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
            $("#playlistFormStatus").addClass("saveForm-container-status-error");
            setTimeout(function() {
                $("#playlistFormStatus").hide().removeClass("saveForm-container-status-error");
                $("#createPlaylist").hide();
            }, 2000);
        },
        dataType: 'json',
    });
}

function loadPlaylists() {
    var callback = function(output) {
        var options = "";
        for (i = 0; i < global_Playlists.length; i++) {
            options += '<option value="' + i + '">' + global_Playlists[i].name + '</option>';
        }
        document.getElementById("openPlaylistName").innerHTML = options;
    }

    $.ajax({
        url: _mainBackend,
        data: {
            function: 'getPlaylists'
        },
        type: 'POST',
        success: function(output) {
            global_Playlists = output;
            if (typeof(callback) != "undefined") {
                callback(global_Playlists);
                console.log('getPlaylists was successful!');
            }
        },
        dataType: 'json'
    });
}

function loadPlaylist() {
    _playlistSelectedId = $('#openPlaylistName').val();
    console.log("Loading playlist " + _playlistSelectedId);
    var playlist = global_Playlists[_playlistSelectedId];
    openPlaylistSelection(false);

    var callback = function(output) {
        populateClimb(global_PlaylistClimbs[global_PlaylistIndex].id);
        togglePlaylistMode(true); 
    }

    $.ajax({
        url: _mainBackend,
        data: {
            function: 'getPlaylistClimbs',
            parameter: playlist.id,
            parameter2: playlist.orderby
        },
        type: 'POST',
        success: function(output) {
            global_PlaylistClimbs = output;
            global_PlaylistIndex = 0;
            if (typeof(callback) != "undefined") {
                callback(global_PlaylistClimbs);
                console.log('getPlaylistClimbs was successful!');
            }
        },
        dataType: 'json'
    });
}

function togglePlaylistMode(playlistMode) {
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

function updatePlaylistInfobar(active) {
    if (active) {
        var name = global_Playlists[_playlistSelectedId].name;
        $("#selectedPlaylistInfo").text(name + " | " + (global_PlaylistIndex + 1) + " of " + (global_PlaylistClimbs.length));
    } else {
        $("#selectedPlaylistInfo").text("");
    }
}

function nextClimb() {
    var nextIndex = global_PlaylistIndex + 1;
    if (nextIndex < global_PlaylistClimbs.length) {
        populateClimb(global_PlaylistClimbs[nextIndex].id);
        global_PlaylistIndex = nextIndex;
        updatePlaylistInfobar(true);
    } else {
        console.log("Playlist finished");
    }
}

function previousClimb() {
    var prevIndex = global_PlaylistIndex - 1;
    if (prevIndex >= 0) {
        populateClimb(global_PlaylistClimbs[prevIndex].id);
        global_PlaylistIndex = prevIndex;
        updatePlaylistInfobar(true);
    } else {
        console.log("At start of playlist");
    }
}

function openPlaylistCreation(show) {
    if (show) {
        $("#createPlaylist").show();
    } else {
        $("#createPlaylist").hide();
    }
}

function openPlaylistSelection(show) {
    if (show) {
        $("#openPlaylist").show();
    } else {
        $("#openPlaylist").hide();
    }
}

function openAbout(show) {
    if (show) {
        $("#aboutPage").show();
    } else {
        $("#aboutPage").hide();
    }
}

function getVersion() {
    $.ajax({ url: _mainBackend,
        data: {function: 'getVersion'},
        type: 'POST',
        success: function(output) {
                    output = output.trim();
                    $("#versionDiv").html("v:" + output.slice(30,));
                },
        error: function (ajaxContext) {
                console.error("Something went wrong...");
            },
    });
}
