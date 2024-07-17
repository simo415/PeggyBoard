export let global_Climbs = new Array();
export function setGlobalClimbs (globalClimbs) {
    global_Climbs = globalClimbs;
}

export let _currentProblem = [];
export function setCurrentProblem (currentProblem) {
    _currentProblem = currentProblem;
}
export let _routeSelected = false;
export function setRouteSelected (routeSelected) {
    _routeSelected = routeSelected;
}
export let _selectedIndex = 0;
export function setSelectedIndex (selectedIndex) {
    _selectedIndex = selectedIndex;
}

export const _mainBackend = "main_backend.php";
