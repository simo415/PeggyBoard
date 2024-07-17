var _screenSize = {
    width: 0,
    height: 0,
};

function setScreenSize () {
    _screenSize.width = $(window).width();
    _screenSize.height = $(window).height();

    var footerTop = $("#footerArea").offset().top;
    var footerHeight = $("#footerArea").height();
    var footerBottom = footerTop + footerHeight;
    var scale = 1;
    var increment = 0.01;
    if (footerBottom > _screenSize.height) {
        while (footerBottom - 40 >= _screenSize.height) {
            footerTop = $("#footerArea").offset().top;
            footerHeight = $("#footerArea").height();
            footerBottom = footerTop + footerHeight;
            scale = scale - increment;
            $("#mainScreen").css("transform", "scale(" + scale + ")");
        }
    } else if (footerBottom < _screenSize.height) {
        while (footerBottom + 40 <= _screenSize.height) {
            footerTop = $("#footerArea").offset().top;
            footerHeight = $("#footerArea").height();
            footerBottom = footerTop + footerHeight;
            scale = scale + increment;
            $("#mainScreen").css("transform", "scale(" + scale + ")");
        }
    }
}

function generateGridOffsetWallLayout () {
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

    var table = $("<table id='gridTable'>").addClass("wallTable");
    var holdCount = 1;
    var first_offset_y_count = 0;
    var second_offset_y_count = 0;
    var global_x = 0;
    var numbers = [
        "18",
        "",
        "17",
        "",
        "16",
        "",
        "15",
        "",
        "14",
        "",
        "13",
        "",
        "12",
        "",
        "11",
        "",
        "10",
        "",
        "9",
        "",
        "8",
        "",
        "7",
        "",
        "6",
        "",
        "5",
        "",
        "4",
        "",
        "3",
        "",
        "2",
        "",
        "1",
    ];
    var letters = ["A", "", "B", "", "C", "", "D", "", "E", "", "F", "", "G", "", "H", "", "I", "", "J", "", "K"];
    for (let y = 0; y < 36; y++) {
        // Height
        var patternedCount_1 = 17;
        var patternedCount_2 = 18;
        var row = $("<tr>");
        for (let x = 0; x < 22; x++) {
            // Width
            var col = $("<td>");
            var cont = $("<div>");
            if (x == 0 && y % 2 == 0) {
                // Numbers every second row
                patternedCount_1 = patternedCount_1 - first_offset_y_count;
                cont = $("<div>").addClass("wallNumbering").text(numbers[y]);
            } else if (y == 35 && (x + 1) % 2 == 0) {
                // Letters every second column, offset by 1
                cont = $("<div>")
                    .addClass("wallLettering")
                    .text(letters[x - 1]);
            } else if (x == 0 || y == 35) {
                patternedCount_2 = patternedCount_2 + second_offset_y_count;
            } else if (y % 2 == 0) {
                // Grid holds
                if ((x + 1) % 2 == 0) {
                    $(row).addClass("borderSideOffset1");
                    cont = $(
                        "<div id=hold" + patternedCount_1 + ' onclick="addHold(' + patternedCount_1 + ')">'
                    ).addClass("wallHoldClickable wallHoldOffset1");
                    patternedCount_1 = patternedCount_1 + 35;
                }
            } else if ((y + 1) % 2 == 0) {
                // Offset holds
                if (x % 2 == 0) {
                    cont = $(
                        "<div id=hold" + patternedCount_2 + ' onclick="addHold(' + patternedCount_2 + ')">'
                    ).addClass("wallHoldClickable wallHoldOffset2");
                    patternedCount_2 = patternedCount_2 + 35;
                }
            }

            if (letters[x] == "F") {
                $(col).addClass("borderSideOffsetMiddle");
            } else if (x % 2 == 0) {
                $(col).addClass("borderSideOffset1");
            } else {
                $(col).addClass("borderSideOffset2");
            }

            if (numbers[y] == "9") {
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

    $("#interactionArea").append(table);
}

function generateGridWallLayout (height, width) {
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
    var holdHeight = height;
    // The number of holds in width of the wall
    var holdWidth = width;

    var colOffset = holdHeight * 2;
    var table = $("<table id='gridTable'>").addClass("wallTable");

    for (let y = 0; y <= holdHeight; y++) {
        var row = $("<tr>");
        // Active hold is set to the left most value in row
        var activeHold = holdHeight - y;
        // Offset is based on the difference between col1 and col2 (see example)
        // 1, 3, 5, 7, etc..
        var activeHoldOffset = y * 2 + 1;
        for (let x = 0; x <= holdWidth; x++) {
            var col = $("<td>");
            var cont = $("<div>");
            if (x == 0) {
                // Numbers are output down to 1, 0 is skipped.
                if (y != holdHeight) {
                    cont = $("<div>")
                        .addClass("wallNumbering")
                        .text(holdHeight - y);
                }
            } else if (y == holdHeight && x != 0) {
                // Letters based on UTF codes. A = 65, B = 66, etc..
                // Start at 64 as x=1 when A should be written
                // Will get a little funky for width > 26
                cont = $("<div>")
                    .addClass("wallLettering")
                    .text(String.fromCharCode(64 + x));
            } else {
                $(row).addClass("borderSideOffset1");
                cont = $("<div id=hold" + activeHold + ' onclick="addHold(' + activeHold + ')">').addClass(
                    "wallHoldClickable wallHoldOffset1"
                );

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

    $("#interactionArea").append(table);
}

function generateListOfClimbs (DATA) {
    $("#climbsTable").empty();
    var sortButtons = $(
        [
            "<div class='sort_options' id='sortOptions'>",
            " <div class='sort_by_name' id='sortByName' onclick='sortList(\"name\")'>",
            "   <span>Name</span>",
            " </div>",
            " <div class='sort_by_grade' id='sortByGrade' onclick='sortList(\"grade\")'>",
            "   <span>Grade</span>",
            " </div>",
            "</div>",
            "<div style='display:inline-block'>",
            "  <span class='deleteIcn' style='display:inline-block'></span>",
            "</div>",
        ].join("\n")
    );
    $("#climbsTable").append(sortButtons);
    if (DATA) {
        for (let y = 0; y < DATA.length; y++) {
            var details = $(
                [
                    "<div style='display:inline-block' class='main_wrap' id='route" +
                        DATA[y].id +
                        "' onclick='populateClimb(" +
                        DATA[y].id +
                        ", true)'>",
                    "  <div class='left_content'>",
                    "    <div style='display:inline-block'>",
                    "     <div class='climb_title'>" + DATA[y].name + "</div>",
                    "     <div class='climb_desc'>" + DATA[y].author + "</div>",
                    "     <div class='climb_date'>" + DATA[y].date.split(" ")[0] + "</div>",
                    "    </div>",
                    "  </div>",
                    "  <div class='right_content'>",
                    "    <div class='climb_grade'>V" + DATA[y].grade + "</div>",
                    "  </div>",
                    "</div>",
                    "<div style='display:inline-block'>",
                    "  <span class='deleteIcn' style='display:inline-block' onclick='deleteRoute(" +
                        DATA[y].id +
                        ")'></span>",
                    "</div>",
                ].join("\n")
            );

            $("#climbsTable").append(details);
        }
    }
    console.log("Done loading climbs.");
}

export { setScreenSize, generateGridOffsetWallLayout, generateGridWallLayout, generateListOfClimbs };
