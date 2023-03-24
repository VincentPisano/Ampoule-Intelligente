let allRooms = {};
let selectedRoomID = -1;



const allowedGroups = ["Room", "Zone"];
const allowedLights = ["Dimmable light"];

// fonction pour log out
function logOut() {
    localStorage.removeItem("hueAcc");
    location.reload();
}

// récupérer les coordonnées de connection déjà sauvgardées
function getAccess() {
    let acc = {};
    let localAcc = localStorage.getItem('hueAcc');
    if (localAcc) {
        acc = JSON.parse(localAcc);
    } else {
        console.error("Access credentials not saved")
    }
    return acc;
}


// récupérer les données des chambres
function getHueRooms(acc) {
    return new Promise((resolve, reject) => {
        getRequest(acc.ip + '/api/' + acc.token + '/groups').then(data => {

            let rooms = [];
            let roomId = 0;
            for (const [key, value] of Object.entries(data)) {
                if (value && allowedGroups.includes(value.type)) {
                    let roomObj = {
                        name: value.name,
                        on: value.state.any_on,
                        bri: value.action.bri,
                        lightsInRoom: value.lights,
                        key: roomId,
                        id: key
                    }
                    rooms.push(roomObj);
                    roomId++;
                }
            }
            allRooms = rooms;
            resolve(rooms);
        }).catch(err => reject(err));
    });
}

// récupérer les données des ampoules
function getHueLights(acc) {
    return new Promise((resolve, reject) => {
        getRequest(acc.ip + '/api/' + acc.token + '/lights').then(data => {
            let lights = [];
            for (const [key, value] of Object.entries(data)) {
                if (value && allowedLights.includes(value.type)) {
                    let lightObj = {
                        name: value.name,
                        on: value.state.on,
                        bri: value.state.bri,
                        reachable: value.state.reachable,
                        id: key
                    }
                    lights.push(lightObj);
                }
            }
            resolve(lights);
        }).catch(err => reject(err));
    });
}

// fonction pour changer le thème du dashboard
function changeTheme(themeIndex) {
    let storage = localStorage.getItem('siteSettings');
    let settingsObj = {
        effects: false,
        showUnreachable: false,
        theme: themeIndex
    }
    if (storage)
        settingsObj = JSON.parse(storage);
    settingsObj.theme = themeIndex;
    localStorage.setItem('siteSettings', JSON.stringify(settingsObj));

    if (themeIndex == 3 || themeIndex == 1) {
        for (const iterator of document.querySelectorAll('span, a, footer')) {
            iterator.classList.remove("text-white");
            iterator.classList.remove("link-white");
        }
    }
    else {
        for (const iterator of document.querySelectorAll('span, a, footer')) {
            iterator.classList.add("text-white");
            iterator.classList.add("link-white");
        }
    }
    switch (themeIndex) {
        case 1:
            document.body.style.backgroundImage = 'linear-gradient(0, #7c9ffd, #83b9ff, #6b97ff)';
            break;
        case 2:
            document.body.style.backgroundImage = 'linear-gradient(0, #000, #080808)';
            break;
        case 3:
            document.body.style.backgroundImage = 'linear-gradient(0,  #f2f2f2, #fff, #fff)';
            break;
        default:
            document.body.style.backgroundImage = 'linear-gradient(0,  #5652b9, #717ce4,#7669e7)';
            break;
    }
}
