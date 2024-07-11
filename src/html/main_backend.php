<?php

// Call function depending on what frontend wants.
if (isset($_POST['function']) && !empty($_POST['function'])) {
  $function = $_POST['function'];
  if (isset($_POST['parameter']) && !empty($_POST['parameter'])) {
    $parameter = $_POST['parameter'];
  }
  if (isset($_POST['parameter2']) && !empty($_POST['parameter2'])) {
    $parameters2 = $_POST['parameter2'];
  }
  switch ($function) {
    case 'setLeds':
      setLeds($parameter);
      break;
    case 'setLed':
      setLed($parameter);
      break;
    case 'clearLeds':
      clearAll();
      break;
    case 'saveRoute':
      saveRoute($parameter);
      break;
    case 'savePlaylist':
      savePlaylist($parameter);
      break;
    case 'getPlaylists':
      getPlaylists();
      break;
    case 'getPlaylistClimbs':
      getPlaylistClimbs($parameter, $parameters2);
      break;
    case 'getRoutes':
      getRoutes($parameter, $parameters2);
      break;
    case 'deleteRoute':
      deleteRoute($parameter);
      break;
    case 'updateRoute':
      updateRoute($parameter, $parameters2);
      break;
    case 'getVersion':
      getVersion();
      break;
    case 'generateName':
      generateName();
      break;
    case 'getFrontendConfig':
      getFrontendConfig();
      break;
  }
}

function getFrontendConfig()
{
  $config = require 'config.php';
  echo json_encode($config->frontend);
}

function generateName()
{
  $config = require 'config.php';
  $maxName = $config->validation['maxRouteName'];

  // Load lists of word types
  $nouns = file($config->generateName['nouns'], FILE_IGNORE_NEW_LINES);
  $adjectives = file($config->generateName['adjectives'], FILE_IGNORE_NEW_LINES);
  $names = file($config->generateName['names'], FILE_IGNORE_NEW_LINES);

  // Randomise the type based on weighting
  $weightedValues = $config->generateName['weights'];
  $rand = mt_rand(1, (int) array_sum($weightedValues));
  $type = "";

  foreach ($weightedValues as $key => $value) {
    $rand -= $value;
    if ($rand <= 0) {
      $type = $key;
      break;
    }
  }

  // Generate the name, within max length 
  do {
    $adjective = $adjectives[random_int(0, count($adjectives) - 1)];
    $noun = $nouns[random_int(0, count($nouns) - 1)];
    $noun2 = $nouns[random_int(0, count($nouns) - 1)];
    $name = $names[random_int(0, count($names) - 1)];

    if ($type == 'noun-noun') {
      $routeName = ucfirst($noun) . " " . ucfirst($noun2);
    } elseif ($type == 'noun-adjective') {
      $routeName = ucfirst($noun) . " is " . ucfirst($adjective);
    } elseif ($type == 'name-noun') {
      $routeName = ucfirst($name) . " " . ucfirst($noun);
    } elseif ($type == 'adjective-name-noun') {
      $routeName = ucfirst($adjective) . " " . ucfirst($name) . " " . ucfirst($noun);
    } elseif ($type == 'adjective-noun') {
      $routeName = ucfirst($adjective) . " " . ucfirst($noun);
    } else {
      // Should not ever get here
      $routeName = ucfirst($noun) . " is " . ucfirst($adjective);
    }
  } while ($routeName > $maxName);

  echo json_encode($routeName);
}

function setLed($hold)
{
  $config = require 'config.php';
  $commandPath = $config->tasmota['commandPath'];
  $colorMap = $config->tasmota['colorMap'];

  $curl = curl_init();
  
  $hx = json_decode($hold);
  $params = '?cmnd=led' . $hx->hold . '+' . mapColor($hx->color, $colorMap);

  curl_setopt($curl, CURLOPT_URL, $commandPath . $params);
  $result = curl_exec($curl);
  return $result;
}

function setLeds($leds)
{
  $config = require 'config.php';
  $commandPath = $config->tasmota['commandPath'];
  $colorMap = $config->tasmota['colorMap'];

  clearAll();

  $curl = curl_init();

  // Chained from led1 works best, but there's limitations of number of lights at once
  // TODO refactor at some point to use led1 chains
  $params = "?cmnd=json+{";
  foreach (json_decode($leds) as $hold) {
    $params .= '"led' . $hold->hold . '":"' . mapColor($hold->color, $colorMap) . '",';
  }
  $params = substr($params, 0, -1) . "}";

  curl_setopt($curl, CURLOPT_URL, $commandPath . $params);
  $result = curl_exec($curl);
  return $result;
}

function mapColor($color,  $colorMap) {
  if ($colorMap == 'grb') {
    return rgbToGrb($color);
  } else {
    return $color;
  }
}

// Tasmota appears to interpret colors as GRB by default, option37 to reconfigure...
// Appears that tasmota 'led' command doesnt obey option37 24
// Rewrite RGB value to GRB...
function rgbToGrb($color)
{
  $red = substr($color, 0, 2);
  $green = substr($color, 2, -2);
  $blue = substr($color, 4);
  return $green . $red . $blue;
}

function clearAll()
{
  $config = require 'config.php';
  $commandPath = $config->tasmota['commandPath'];

  $curl = curl_init();
  // Power on required, color=000000 results in power=off
  curl_setopt($curl, CURLOPT_URL, $commandPath . "?cmnd=backlog+color+000000;power+on");
  $result = curl_exec($curl);
  return $result;
}

function savePlaylist($options) {
  $sql = "INSERT INTO playlist (name, mingrade, maxgrade, orderby) VALUES ('$options[name]', '$options[mingrade]', '$options[maxgrade]', '$options[orderby]')";
  $db = openDatabase();
  if ($db != 0) {
    if ($db->exec($sql) != 0) { // TODO: Return DB error
      echo json_encode($db->lastInsertId());
    } else {
      echo json_encode(-1);
    }
    $db = null;
  }
}

function getPlaylists()
{
  $db = openDatabase();
  if ($db != 0) {
    $i = 0;
    $sql = "SELECT id, name, mingrade, maxgrade, date, orderby FROM playlist";
    $res = $db->query($sql);
    while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
      $playlist[$i] = $row;
      $i++;
    }
    echo json_encode($playlist);
    $db = null;
  } else {
    echo ("ERROR: Could not retrieve playlists!");
  }
}

function getPlaylistClimbs($playlistId, $orderby) {
  $sort = "";
  if ($orderby == 'routeName' || $orderby == 'date' || $orderby == 'grade') {
    $sort = "order by $orderby";
  }
  $db = openDatabase();
  if ($db != 0) {
    $i = 0;
    $sql = "SELECT r.id, r.routename, r.grade, r.author, r.date, r.holds
            from routes r, playlist p
            where r.grade >= p.mingrade
            and r.grade <= p.maxgrade
            and p.id = $playlistId
            $sort";
    $res = $db->query($sql);
    while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
      $climbs[$i] = $row;
      $i++;
    }
    if ($orderby == 'random') {
      shuffle($climbs);
    }
    echo json_encode($climbs);
    $db = null;
  } else {
    echo ("ERROR: Could not retrieve climbs from playlist!");
  }
}

function saveRoute($options)
{
  $config = require 'config.php';
  $maxName = $config->validation['maxRouteName'];
  $maxAuthor = $config->validation['maxAuthorName'];

  // build the sql request
  if (strlen($options['name']) > $maxName || strlen($options['author']) > $maxAuthor) {
    echo json_encode("Error: input too big.");
    echo json_encode(-1);
    return false;
  }

  $sql = "INSERT INTO routes (routename, grade, author, holds) VALUES ('$options[name]', '$options[grade]', '$options[author]', '$options[problem]')";
  // send the sql request
  $db = openDatabase();
  if ($db != 0) {
    if ($db->exec($sql) != 0) { // TODO: Return DB error
      //echo json_encode($db->lastInsertRowID());
      echo json_encode($db->lastInsertId());
    } else {
      echo json_encode(-1);
    }
    //$db->close();
    $db = null;
  }
}

function openDatabase()
{
  $config = require 'config.php';
  $type = $config->database['type'];

  $db = new PDO($config->database['connectionString']);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  if ($type == 'sqlite'/* && !file_exists($config->database['location'])*/) {
    $db->exec('
    CREATE TABLE IF NOT EXISTS "routes" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "routename" varchar UNIQUE NOT NULL,
        "grade" integer NOT NULL,
        "author" varchar(24) DEFAULT NULL,
        "date" datetime DEFAULT CURRENT_TIMESTAMP,
        "holds" varchar NOT NULL
    )');
    $db->exec('
    CREATE TABLE IF NOT EXISTS "playlist" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "name" varchar UNIQUE NOT NULL,
        "mingrade" integer NOT NULL,
        "maxgrade" integer NOT NULL,
        "date" datetime DEFAULT CURRENT_TIMESTAMP,
        "orderby" varchar NOT NULL
    )');
  }

  return $db;
}

function getRoutes($sortType = "GRADE", $sortOrd = "ASC")
{
  switch ($sortType) {
    case "NAME":
      $sortType = "routename";
      break;
    case "GRADE":
      $sortType = "grade";
      break;
    case "DATE":
      $sortType = "date";
      break;
    default:
      $sortType = "routename";
  }
  switch ($sortOrd) {
    case "ASC":
      $sortOrd = "ASC";
      break;
    case "DESC":
      $sortOrd = "DESC";
      break;
    default:
      $sortOrd = "ASC";
  }

  $db = openDatabase();
  if ($db != 0) {
    $i = 0;
    $sql = "SELECT id, routename, grade, author, date, holds FROM routes ORDER BY $sortType $sortOrd";
    $res = $db->query($sql);
    //while ($row = $res->fetchArray(1)) {
    while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
      $row["name"] = $row["routename"];
      $climbs[$i] = $row;
      $i++;
    }
    echo json_encode($climbs);
    //$db->close();
    $db = null;
  } else {
    echo ("ERROR: Could not retrieve climbs!");
  }
}

function deleteRoute($routeId)
{
  $sql = "DELETE FROM `routes` WHERE id=$routeId";
  // send the sql request
  $db = openDatabase();
  if ($db != 0) {
    if ($db->query($sql) === TRUE) {
      echo json_encode("True");
    } else {
      echo json_encode("False");
    }
    //$db->close();
    $db = null;
  } else {
    echo ("ERROR: Could not delete climb!");
  }
}

function updateRoute($routeId, $grade)
{
  if (!is_numeric($grade) || $grade < 0) {
    $grade = 0;
  }
  $sql = "UPDATE `routes` SET grade=$grade WHERE id=$routeId";
  // send the sql request
  $db = openDatabase();
  if ($db != 0) {
    if ($db->exec($sql) > 0) {
      echo json_encode("True");
    } else {
      echo json_encode("False");
    }
    //$db->close();
    $db = null;
  } else {
    echo ("ERROR: Could not update climb!");
  }
}

function getVersion() {
  $config = require 'config.php';
  echo $config->version;
}
?>