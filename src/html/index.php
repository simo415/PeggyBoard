<?php
require "main_backend.php";
$config = require 'config.php';

// HTML   ?>
<!DOCTYPE html>
<html>
<meta name="viewport" content="width=device-width, initial-scale=1.0,  minimum-scale=1.0, user-scalable=no">

<head>
  <title>
    PeggyBoard
  </title>
  <link href="css/main.css?v=1" rel="stylesheet">
  <script src="jquery/jquery.min.js" type="text/javascript"></script>
  <script src="javascript/swipe-event.js" type="text/javascript"></script>
</head>

<body>
  <!-- Save form only visible when saving. -->
  <div class="saveFormBg" id="saveFormBg">
    <div class="saveForm" id="saveForm">
      <div class="saveForm-container">
        <div class="saveForm-container-status" id="saveFormStatus"></div>
        <h1 style="text-align:center">Save Route</h1>

        <label for="routeName"><b>Route Name</b></label>
        <input type="text" id="routeName" placeholder="Enter Name" name="routeName"
          maxlength="<?= $config->validation['maxRouteName'] ?>" required>
        <button type="submit" class="btn" onclick="generateRouteName()">Random</button>
        <label for="routeGrade"><b>Grade</b></label>
        <select name="routeGrade" id="routeGrade" required>
          <?php
          for ($i = $config->frontend['minGrade']; $i <= $config->frontend['maxGrade']; $i++) {
            echo '<option value="' . $i . '">V' . $i . '</option>';
          }
          ?>
        </select>

        <label for="routeAuthor"><b>Author</b></label>
        <input type="text" id="routeAuthor" placeholder="<?= $config->frontend['defaultAuthor'] ?>" name="routeAuthor"
          maxlength="<?= $config->validation['maxAuthorName'] ?>" required>

        <button type="submit" class="btn" onclick="saveRoute()">Save</button>
        <button type="submit" class="btn cancel" onclick="closeSaveForm()">Close</button>
      </div>
    </div>
  </div>
  <div id="aboutPage" class="saveFormBg">
    <div class="saveForm">
      <div class="saveForm-container">
        <p>PeggyBoard is an interactive climbing wall powered by a Raspberry Pi.</p>
        <p>Original project is open source and can be found on <a href="https://github.com/PegorK/PeggyBoard">GitHub</a>.
        <p>Forked project is open source and can be found on <a href="https://github.com/simo415/PeggyBoard">GitHub</a>.
        </p>
        <p>Enjoy and get stronk!!</p>
        <p>Original developed by Pegor Karoglanian (devPegor@gmail.com) July 2020</p>
        <p>~Product of the Coronavirus~</p>
        <button type="submit" class="btn cancel" onclick="openAbout(false)">Close</button>
      </div>
    </div>
  </div>
  <div id="createPlaylist" class="saveFormBg">
    <div class="saveForm">
      <div class="saveForm-container">
        <div class="saveForm-container-status" id="playlistFormStatus"></div>
        <h1 style="text-align:center">Create Playlist</h1>

        <label for="playlistName"><b>Playlist Name</b></label>
        <input type="text" id="playlistName" placeholder="Enter Name" name="playlistName"
          maxlength="<?= $config->validation['maxRouteName'] ?>" required>
        <!--<button type="submit" class="btn" onclick="generateRouteName()">Random</button>-->
        <label for="minGrade"><b>Min Grade</b></label>
        <select name="minGrade" id="minGrade" required>
          <?php
          for ($i = $config->frontend['minGrade']; $i <= $config->frontend['maxGrade']; $i++) {
            echo '<option value="' . $i . '">V' . $i . '</option>';
          }
          ?>
        </select>

        <label for="maxGrade"><b>Max Grade</b></label>
        <select name="maxGrade" id="maxGrade" required>
          <?php
          for ($i = $config->frontend['minGrade']; $i <= $config->frontend['maxGrade']; $i++) {
            echo '<option value="' . $i . '">V' . $i . '</option>';
          }
          ?>
        </select>

        <label for="orderBy"><b>Order By</b></label>
        <select name="orderBy" id="orderBy">
          <option value="random">Random</option>
          <option value="routeName">Route Name</option>
          <option value="grade">Grade</option>
          <option value="date">Created Date</option>
        </select>

        <button type="submit" class="btn" onclick="savePlaylist()">Save</button>
        <button type="submit" class="btn cancel" onclick="openPlaylistCreation(false)">Close</button>
      </div>
    </div>
  </div>
  <div id="openPlaylist" class="saveFormBg">
    <div class="saveForm">
      <div class="saveForm-container">
        <h1 style="text-align:center">Open Playlist</h1>

        <label for="playlistName"><b>Playlist Name</b></label>
        <select name="openPlaylistName" id="openPlaylistName"></select>

        <button type="submit" class="btn" onclick="loadPlaylist()">Open</button>
        <button type="submit" class="btn cancel" onclick="openPlaylistSelection(false)">Close</button>
      </div>
    </div>
  </div>
  <div id="mainScreen">
    <div class="headerArea">
      <div class="logoText"></div>
    </div>
    <div id="interactionArea" class="wallLayoutArea">
      <div class="nameArea">
        <span id="selectedPlaylistInfo" style="display:block"></span>
        <!-- only visible if a saved route is selected -->
        <span id="selectedRouteName"></span>
        <div id="regrade" class="dropup">
          <span id="regradeButton" class="regradeIcn" title="Regrade" onclick="toggleSandbagSelection()"></span>
          <div id="regradeItems" class="dropup-content">
            <a id="upgradeRoute" class="regradeItem" onclick="updateRoute(true)">Upgrade</a>
            <a id="downgradeRoute" class="regradeItem" onclick="updateRoute(false)">Downgrade</a>
          </div>
        </div>
      </div>
      <div id="messageArea" class="messageArea" hidden>
        <span id="displayMessage"></span>
      </div>
      <!-- Table is Generated -->
    </div>
    <div id="tableOfClimbs" class="wallLayoutArea" hidden>
      <div id="searchAndSort" class="searchAndSort">
        <span class="searchIcn"></span>
        <input type="text" id="searchBar" oninput="searchForRoute()" />
      </div>
      <div id="climbsTable" class="climbsTable">
        <!-- Content is Generated -->
      </div>
    </div>
    <div id="footerArea" class="footerArea">
      <div class="bottomButtons">
        <div class="dropup">
          <span id="menuButton" class="menuIcn" title="Menu" onclick="toggleMenuSelection()"></span>
          <div id="menuItems" class="dropup-content">
            <a class="menuItem" onclick="openAbout(true)">About</a>
            <a class="menuItem" onclick="openPlaylistCreation(true)">Create Playlist</a>
            <a class="menuItem" onclick="openPlaylistSelection(true)">Open Playlist</a>
          </div>
        </div>
        <span id="loadIcn" class="loadIcn" title="List of climbs" onclick="toggleLoadSelection()"></span>
        <span id="prevIcn" class="prevIcn" title="Previous Climb" onclick="previousClimb()" hidden></span>
        <span id="lightIcn" class="lightIcn" title="Light current problem" onclick="lightCurrent()"></span>
        <span id="saveIcn" class="saveIcn" title="Save problem" onclick="openSaveForm()"></span>
        <span id="nextIcn" class="nextIcn" title="Next Climb" onclick="nextClimb()" hidden></span>
        <span id="clearIcn" class="clearIcn" title="Clear problem" onclick="clearAll()"></span>
        <span id="stopIcn" class="stopIcn" title="Stop Playlist" onclick="togglePlaylistMode(false)" hidden></span>
      </div>
    </div>
    <div class="versionNumber" id="versionDiv"></div>
  </div>
</body>

</html>
<script src="javascript/peggyboard.js?v=1" type="text/javascript"></script>