//==========================================
// Title:  peggyboard.js
// Author: Pegor Karoglanian
// Date:   8/15/23
// Notes:  This javascript handles all the main UI for PeggyBoard
//==========================================

import { setScreenSize, generateGridOffsetWallLayout, generateGridWallLayout } from "./ui.js";
import { generateName, saveRouteDB, loadRoutes, deleteRoute, updateRoute } from "./route.js";
import { _mainBackend, _currentProblem } from "./variables.js";
import { populateClimb, clearAll, addHold, lightCurrent } from "./board.js";
import {
    toggleLoadSelection,
    toggleMenuSelection,
    toggleSandbagSelection,
    togglePlaylistMode,
    searchForRoute,
    sortList,
    initSwipeEvents,
    loadSwipeRoute,
    openPlaylistSelection,
    openPlaylistCreation,
    openAbout,
    getVersion,
} from "./util.js";
import { savePlaylist, loadPlaylist, loadPlaylists, nextClimb, previousClimb } from "./playlist.js";
import { addSessionTick, startSession, endSession } from "./session.js";

var config = {};

// Initial Setup
$.ajax({
    url: _mainBackend,
    data: {
        function: "getFrontendConfig",
    },
    type: "POST",
    success: function (output) {
        console.log(output);
        initPage(output);
    },
    dataType: "json",
});

function initPage (configuration) {
    config = configuration;

    if (config.wallLayout == "gridOffset") {
        generateGridOffsetWallLayout();
    } else if (config.wallLayout == "grid") {
        generateGridWallLayout(config.holdHeight, config.holdWidth);
    } else {
        generateGridWallLayout();
    }

    loadRoutes();
    loadPlaylists();
    initSwipeEvents();
    setScreenSize();
    getVersion();
}

// Main board functions
window.populateClimb = function populateClimbToUI (id, redirect) {
    populateClimb(id, redirect);
};

window.addHold = function addHoldUI (id) {
    addHold(id, config);
};

window.lightCurrent = function lightCurrentRoute () {
    lightCurrent();
};

window.clearAll = function clearAllHolds (bypass = false, callback) {
    clearAll(bypass, callback);
};

// Route functions
window.saveRoute = function saveRoute () {
    saveRouteDB();
};

window.deleteRoute = function deleteRouteDB (id) {
    deleteRoute(id);
};

window.updateRoute = function updateRouteDB (upgrade) {
    updateRoute(upgrade);
};

window.generateRouteName = function generateRouteName () {
    generateName();
};

// Menu functions
window.toggleLoadSelection = function toggleLoadSelectionMenu () {
    toggleLoadSelection();
};

window.toggleMenuSelection = function toggleMenuSelectionMenu () {
    toggleMenuSelection();
};

window.toggleSandbagSelection = function toggleSandbagSelectionMenu () {
    toggleSandbagSelection();
};

window.openSaveForm = function openSaveForm () {
    if (_currentProblem.length > 0) {
        document.getElementById("saveFormBg").style.display = "block";
    }
};

window.closeSaveForm = function closeSaveForm () {
    document.getElementById("saveFormBg").style.display = "none";
};

// Mobile UX functions
window.loadSwipeRoute = function loadSwipeRouteUtil (direction) {
    loadSwipeRoute(direction);
};

window.searchForRoute = function searchForRouteUtil () {
    searchForRoute();
};

window.sortList = function sortListUtil (type) {
    sortList(type);
};

// Playlist features
window.savePlaylist = function savePlaylistDB () {
    savePlaylist();
};

window.loadPlaylists = function loadPlaylistsDB () {
    loadPlaylists();
};

window.loadPlaylist = function loadPlaylistDB () {
    loadPlaylist();
};

window.nextClimb = function nextClimbPlaylist () {
    nextClimb();
};

window.previousClimb = function previousClimbPlaylist () {
    previousClimb();
};

window.openPlaylistCreation = function openPlaylistCreationDialog (show) {
    openPlaylistCreation(show);
};

window.openPlaylistSelection = function openPlaylistSelectionDialog (show) {
    openPlaylistSelection(show);
};

window.togglePlaylistMode = function togglePlaylistModeMenu () {
    togglePlaylistMode();
};

// About Features
window.openAbout = function openAboutDialog (show) {
    openAbout(show);
};

// Session Features
window.sessionTick = function sessionTick () {
    addSessionTick(true);
};

window.sessionAttempt = function sessionAttempt () {
    addSessionTick(false);
};

window.sessionStart = function sessionStart () {
    startSession();
};

window.sessionStop = function sessionStop () {
    endSession();
};
