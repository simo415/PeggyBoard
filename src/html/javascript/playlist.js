import { _mainBackend } from "./variables.js";
import { populateClimb } from "./board.js";
import { togglePlaylistMode } from "./util.js";

var global_Playlists = new Array();
var global_PlaylistClimbs = new Array();
var _playlistSelectedId = 0;
var global_PlaylistIndex = 0;

function savePlaylist () {
    var options = {
        name: $("#playlistName").val(),
        mingrade: $("#minGrade").val(),
        maxgrade: $("#maxGrade").val(),
        orderby: $("#orderBy").val(),
    };

    if (options.name == "" || options.mingrade == "" || options.maxgrade == "" || options.orderby == "") {
        alert("ERROR: Please ensure all fields are filled.");
        return;
    }

    console.log("Saving Playlist.");
    $("#playlistFormStatus").show().addClass("saveForm-container-status-loading");

    var callback = function (output) {
        setTimeout(() => {
            $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
            $("#playlistFormStatus").addClass("saveForm-container-status-success");
            setTimeout(function () {
                $("#playlistFormStatus").hide().removeClass("saveForm-container-status-success");
                $("#createPlaylist").hide();
            }, 2000);
            loadPlaylists();
        }, 2000);
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "savePlaylist",
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
                $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
                $("#playlistFormStatus").addClass("saveForm-container-status-error");
            }
        },
        error: function (ajaxContext) {
            console.error(ajaxContext.responseText);
            $("#playlistFormStatus").removeClass("saveForm-container-status-loading");
            $("#playlistFormStatus").addClass("saveForm-container-status-error");
            setTimeout(function () {
                $("#playlistFormStatus").hide().removeClass("saveForm-container-status-error");
                $("#createPlaylist").hide();
            }, 2000);
        },
        dataType: "json",
    });
}

function loadPlaylists () {
    var callback = function (output) {
        var options = "";
        if (!global_Playlists) {
            return;
        }
        for (let i = 0; i < global_Playlists.length; i++) {
            options += '<option value="' + i + '">' + global_Playlists[i].name + "</option>";
        }
        document.getElementById("openPlaylistName").innerHTML = options;
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "getPlaylists",
        },
        type: "POST",
        success: function (output) {
            global_Playlists = output;
            if (typeof callback != "undefined") {
                callback(global_Playlists);
                console.log("getPlaylists was successful!");
            }
        },
        dataType: "json",
    });
}

function loadPlaylist () {
    _playlistSelectedId = $("#openPlaylistName").val();
    console.log("Loading playlist " + _playlistSelectedId);
    var playlist = global_Playlists[_playlistSelectedId];
    openPlaylistSelection(false);

    var callback = function (output) {
        populateClimb(global_PlaylistClimbs[global_PlaylistIndex].id);
        togglePlaylistMode(true);
    };

    $.ajax({
        url: _mainBackend,
        data: {
            function: "getPlaylistClimbs",
            parameter: playlist.id,
            parameter2: playlist.orderby,
        },
        type: "POST",
        success: function (output) {
            global_PlaylistClimbs = output;
            global_PlaylistIndex = 0;
            if (typeof callback != "undefined") {
                callback(global_PlaylistClimbs);
                console.log("getPlaylistClimbs was successful!");
            }
        },
        dataType: "json",
    });
}

function updatePlaylistInfobar (active) {
    if (active) {
        var name = global_Playlists[_playlistSelectedId].name;
        $("#selectedPlaylistInfo").text(
            name + " | " + (global_PlaylistIndex + 1) + " of " + global_PlaylistClimbs.length
        );
    } else {
        $("#selectedPlaylistInfo").text("");
    }
}

function nextClimb () {
    var nextIndex = global_PlaylistIndex + 1;
    if (nextIndex < global_PlaylistClimbs.length) {
        populateClimb(global_PlaylistClimbs[nextIndex].id);
        global_PlaylistIndex = nextIndex;
        updatePlaylistInfobar(true);
    } else {
        console.log("Playlist finished");
    }
}

function previousClimb () {
    var prevIndex = global_PlaylistIndex - 1;
    if (prevIndex >= 0) {
        populateClimb(global_PlaylistClimbs[prevIndex].id);
        global_PlaylistIndex = prevIndex;
        updatePlaylistInfobar(true);
    } else {
        console.log("At start of playlist");
    }
}

export { savePlaylist, loadPlaylist, loadPlaylists, nextClimb, previousClimb, updatePlaylistInfobar };
