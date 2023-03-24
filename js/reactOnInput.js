
// fonction pour changer l'intensité des ampoules
function briSlider_change(lightId) {
    let obj = { bri: Number(document.getElementById("briSlider" + lightId).value) };
    new actions().sliderChange(lightId, obj);
}
// fonction pour changer l'état du la chambre au click
function setRoomState_click(id) {
    let isChecked = document.getElementById("roomSwitch" + id).checked;
    let getBri = document.getElementById("roomSlider" + id).value;
    new actions().changeRoomState(id, isChecked, getBri).then(() => setDashboard()); // Refresh html
}

// fonction pour changer l'état du l'ampoule au click
function setLightState_click(id, isOn) {
    new actions().changeLightState(id, !isOn).then(() => setDashboard()); // Refresh html
}

// fonction pour l'animation ON et OFF
function breatheEffect_click() {
    let acc = getAccess();
    let url = acc.ip + '/api/' + acc.token + '/groups/' + allRooms[selectedRoomID].id + '/action/';
    let json = {
        on: true,
        bri: 255,
        alert: 'lselect'
    };
    putRequest(url, json);
}
