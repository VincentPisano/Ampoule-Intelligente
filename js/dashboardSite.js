/* classe qui sert à remplacer le code HTML du la page index 
 * par le code HTML du dashboard
 *
*/

class DashboardPage {
    constructor(rooms, lights) {
        this.rooms = rooms;
        this.lights = lights;
        // this.scenes = scenes;
    }
    getHtml(acc) {
        let storage = localStorage.getItem('siteSettings');
        let settingsObj = {
            effects: false,
            showUnreachable: false
        };
        if (storage)
            settingsObj = JSON.parse(storage);
        else
            localStorage.setItem('siteSettings', JSON.stringify(settingsObj));
        let effects = "";
        let showUnreachableC = "";
        if (settingsObj.effects) effects = "checked";
        if (settingsObj.showUnreachable) showUnreachableC = "checked";

        let header = `<div class="container pt-4">
      <header class="pb-3 mb-4">
        <div class="top-bar">
          <a class="d-flex align-items-center text-dark text-decoration-none">
            <span class="fs-4 text-white">CSO - Control a Smart Object</span>
          </a>
          <div class="d-flex flex-row-reverse top-bar-right">
            <a class="nav-link link-white" type="button" data-bs-toggle="modal" data-bs-target="#SettingsModal" >Paramètres</a>
          </div>
        </div>

        <!-- SettingsModal -->
        <div class="modal fade" id="SettingsModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content rounded-15">
              <div class="modal-header modal-header-15">
                <h5 class="modal-title text-white" id="exampleModalLabel">Paramètres</h5>
                <button type="button" class="btn-close " data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <h2 class="fs-4">Options</h2>
                
                <table class="table">
                  <tbody>
                    
                    <tr>
                      <th class="text-muted" scope="row">
                      Changer le thème:
                      </th>
                      <td class="float-left">
                        <button type="button" onClick="changeTheme(0)" class="solid-colourSelector solid-purple"></button>
                        <button type="button" onClick="changeTheme(1)" class="solid-colourSelector solid-blue"></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <h2 class="fs-4 ">Bridge</h2>
                <h3 class="fs-5 text-muted">Détail du Bridge</h3>
                <table class="table">
                  <tbody>
                    <tr><th class="text-muted" scope="row">Adresse IP:</th><td>${acc.ip}</td></tr>
                    <tr><th class="text-muted" scope="row">Token:</th><td>${acc.token}</td> </tr>
                  </tbody>
                </table>
                
                <button type="button" id="logOutBtn" class="btn btn-outline-danger my-2 btn-round">Se déconnecter</button>
    
                </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-round" id="saveSettingsBtn" data-bs-dismiss="modal">Valider</button>
              </div>
            </div>
          </div>
        </div>

      </header>
      <div class="row align-items-md-stretch">`;
        let rommsHtml = `<div class="col-md-4">
                     <div class="container-full p-4 mt-2 text-white bg-dark shadow-cos rounded-15">
                      <div class="d-flex flex-row justify-content-between">
                        <h1 class="display-8">Chambres</h1>
                        <button id="refreshBtn" class="btn btn-secondary btn-refresh">Actualiser</button>

                      </div>
                    <div id="roomSelecters">`
        let allHtml = header + rommsHtml;

        let lightsHtml = `</div></div></div> 
                      <div class="col-md-8">
                      <div class="row test row-cols-1 m-0">
                      <div class="p-3 mt-2 container-half text-white bg-dark shadow-cos rounded-15 d-flex align-content-start flex-wrap" id="lightSelecters"
                      style="height : 65vh">
                      <h1 class="display-8 my-2 w-100 ">Ampoules</h1>`;

        let bottomHtml = "</div></div></div></div>";
        let footer = ` <footer class="text-white bottom-text">
      <p class="text-center ">&copy;2023 MIAGE - ILW</p>
    </footer>`;
        if (selectedRoomID === -1)
            selectedRoomID = allRooms[0].key;

        for (const room of this.rooms) {
            let lightsInThisRoom = [];
            for (const light of this.lights) {
                if (room.lightsInRoom.includes(String(light.id)))
                    lightsInThisRoom.push(light);
            }
            lightsInThisRoom.sort(compare);
            allHtml += makeRoomSelecter(room.name, room.on, room.key, room.id, room.bri, lightsInThisRoom);
        }
        allHtml += lightsHtml;
        for (const light of this.lights) {
            if (allRooms[selectedRoomID].lightsInRoom.includes(String(light.id)))
                allHtml += makeLightSelecter(light, settingsObj);
        }

        allHtml += bottomHtml;
        allHtml += footer;
        return allHtml;
    }
}

function makeRoomSelecter(name, on, key, id, bri, lights) {
    let checkedStr = "";
    let colorsGradient = "linear-gradient(to right,";
    let sliderDisabled = "";
    let selected = "";
    if (selectedRoomID == key)
        selected = "selected";
    if (on) {
        checkedStr = "checked";
        if (lights.length === 1)
            colorsGradient = "rgb(255, 233, 191";
    }
    else {
        sliderDisabled = 'style="display:none"';
    }
    return `<div class="roomSelecter ${selected} my-3" style="background: ${colorsGradient});" class="btn roomSelecter my-2">
          <button class="btn roomBtn" onclick="selectRoom_click(this,${key});">${name}</button>
            <label class="switch swRight">
              <input type="checkbox" id="roomSwitch${id}" onclick="setRoomState_click(${id})" ${checkedStr}>
              <span class="slider"></span>
            </label>   
            <input type="range" min="0" max="254" value="${bri}" ${sliderDisabled} class="sliderBar" id="roomSlider${id}" onchange="setRoomState_click(${id})">
        </div>`
}

function compare(a, b) {
    if (a.ct && b.ct) {
        if (a.ct < b.ct)
            return -1;
        if (a.ct > b.ct)
            return 1;
    }
    return 0;
}

// fonction du code HTML des ampoules
function makeLightSelecter(light, settingsObj) {
    // let colorConv = new ColorConverter();
    let color = "";
    let textColor = "text-hover-white";
    let sliders = `<input type="range" min="0" max="255" value="${light.bri}" class="briSlider sliderBar" id="briSlider${light.id}" onchange="briSlider_change(${light.id})">`;
    let pickersCollapse = "";
    if (light.on) {
        textColor = "text-hover-black";
        color = "255, 233, 191";

        if (light.bri) {
            pickersCollapse = `<button class="btn pickerActivator" type="button" data-bs-toggle="collapse" data-bs-target="#pickerPopup${light.id}" aria-expanded="true" aria-controls="pickerPopup${light.id}">`
            if (!light.reachable) {
                pickersCollapse += `Unreachable`;
            }
            else
                pickersCollapse += `<img src="svg/chevron-down.svg">`;

            pickersCollapse += `</button>
      <div id="pickerPopup${light.id}" class="collapse accordion-collapse" data-bs-parent="#lightSelecters">
        <div class="card card-body rounded-10 pickerPopupCard">
            ${sliders}
        </div>
      </div>`;
        }

    }
    return `<div class="lightSelecter my-2" id="${light.id}" style="background-color: rgb(${color})"> 
  <button type="button" class="btn nowrapTxt ${textColor}" onclick="setLightState_click(${light.id}, ${light.on})">${light.name}</button>
    ${pickersCollapse}
  </div>`
}


