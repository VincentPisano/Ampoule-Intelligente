document.addEventListener("shown.bs.collapse", makeNewConnection);
document.getElementById("loginFrom").addEventListener("submit", loginExistingCon);
document.getElementById("manuallyIpBtn").addEventListener("click", manuallyIpNewConnection);

let interval;
const refreshTime = 1500;
const postJsonObj = {devicetype: "Hue-Browser-Controller"};
checkLocalStorage();

//fonction qui sert à vérifier la cache du navigateur pour une connection déjà existante
function checkLocalStorage() { 
    let acc;
    if (acc = localStorage.getItem('hueAcc')) {
        connectionGood(JSON.parse(acc)).then(() => {
            setDashboard(); 
        }).catch(err => {
            document.getElementById("overlay").style.display = "none";
            console.error("Local storage was incorrect - " + err);
            localStorage.removeItem("hueAcc");
        });
    }
    else 
        document.getElementById("overlay").style.display = "none";
}

// fonction pour faire une nouvelle connection en utilisant l'api HUE (discovery.meethue.com)
async function makeNewConnection(event) {
    if (event.target.id === "newConnection") {
        resetAll();
        setAutoConnectText("Recherche d'un pont sur votre réseau...", "loading");
        try {
            let resGet = await getRequestSecure("discovery.meethue.com/");
            if (!resGet[0] || !resGet[0].id || !resGet[0].internalipaddress) 
                throw new Error("Impossible de trouver un bridge automatiquement; essayez d'entrer l'adresse ip manuellement");
            //check if the ip adress is correct
            let ip = await findRightIp(resGet)
            setAutoConnectText("Adresse IP Trouvée. Appuyez sur le bouton de liaison sur le bridge", "push-link");
            setupWithLinkButton(ip);
        } catch (err) {
            if (err == "TypeError: Failed to fetch")  
                showNewConError("Pas de connexion - erreur réseau possible, vérifiez la connexion réseau"); 
            else if (err == "Error: Timeout")  
                showNewConError("Timeout - aucune réponse du pont Hue. Vérifiez votre connexion réseau et celle du bridge"); 
            else 
                showNewConError("Erreur - essayez d'entrer manuellement l'adresse IP du bridge- " + err); 
        }
    }
}

// fonction pour vérifier si l'adresse ip est correcte
function findRightIp(resGet) {
    return new Promise(function(resolve, reject) {
        let timesFailed = 0;
        for (const data of resGet) {
            postRequest(data.internalipaddress+"/api/", postJsonObj).then(resPost => {
                if (!data.internalipaddress.startsWith("192")) // Assume that all IPs starts with 192)
                    throw new Error("no192Start"); 
                if (resPost[0].error.type == 101) 
                    resolve(data.internalipaddress);
            }).catch(err => {
                timesFailed++;
                if (timesFailed >= resGet.length)
                    reject("All IP's failed");
                else if (err != "Error: AbortTimeout" && err != "Error: no192Start" && err != "TypeError: Failed to fetch") 
                    reject(err);
            });
        }
    });
}

// fonction pour gérer la connection avec le bouton du bridge 
function setupWithLinkButton(ip) {
    let timesPostSend = 0;
    interval = setInterval(function() {
        if (timesPostSend > 20)
            showNewConError("Le bouton de lien n'a pas été appuyé à temps, veuillez réessayer"); 
        timesPostSend++;
        postRequest(ip+"/api/", postJsonObj).then(resPost => {
            if (Object.keys(resPost[0])[0] !== "error") 
                showSuccess(ip, resPost[0].success.username);
        }).catch(err => {
            showNewConError("Une erreur inconnue est survenue");
            console.error(err);
        });
    }, refreshTime);
}


// fonction pour gérer la connection manuelle avec l'adresse ip du bridge
function manuallyIpNewConnection() {
    resetAll();
    setAutoConnectText("Configuration IP manuelle - Test de l'IP", "loading");
    let ip = document.getElementById("manuallyIp").value;
    testIP(ip).then(function() {
        setAutoConnectText("Configuration IP manuelle - Appuyez sur le bouton de liaison sur le Bridge", "push-link");
        setupWithLinkButton(ip);
    }).catch(function() {
        showNewConError("Impossible de se connecter avec cette adresse IP");
    });
}

//fonction qui affiche le code HTML si la connection est établie
function showSuccess(ip, accessToken) {
    clearInterval(interval);
    document.getElementById("autoConnect").innerHTML = 
        `<div class="alert alert-success text-center" role="alert">
        <p><strong>Success!</strong> Une connexion au pont a été établie.</p>
        <button id="loginNewConnection" class="btn btn-primary form-input" type="button">Login</button>
        </div>
        <p class="text-center">Adresse IP: <em>${ip}</em></p> 
        <p class="text-center">Token: <em>${accessToken}</em></p>`;
    let acc = {
        token: accessToken,
        ip: ip
    };
    //Save the connection in the browser's local storage
    localStorage.setItem('hueAcc', JSON.stringify(acc)); 
    document.getElementById("loginNewConnection").addEventListener("click", setDashboard);
}

// fonction du reset
function resetAll() {
    document.getElementById("errAutoBox").style.visibility = "hidden";
    clearInterval(interval);
}

// fonction qui permet d'établir la connection et récupérer le token et l'adresse ip existant
function loginExistingCon() {
    document.getElementById("errFromBox").style.visibility = "hidden";
    let acc = {
        token: document.getElementById("accessToken").value,
        ip: document.getElementById("ipAddress").value
    };
    connectionGood(acc).then(() => {
        localStorage.setItem('hueAcc', JSON.stringify(acc));
        setDashboard();
    }).catch(err => {
        let errMsgBox = document.getElementById("errFromBox");
        errMsgBox.style.visibility = "visible";
        if (err == "TypeError: Failed to fetch")
            errMsgBox.innerText = "No connection - Check if \"insecure content\" is allowed or check network connection and IP Address";
        else if (err == "Error: AbortTimeout")
            errMsgBox.innerText = "Timeout - Check IP Address or network connection";
        else if (err == "Error: unauthorized user")
            errMsgBox.innerText = "Wrong access token";
        else {
            errMsgBox.innerText = "An unknown error occurred";
            console.error(err);
        }
    });
}


function setAutoConnectText(str, img) {
    let text = `<p class="text-center">${str}</p>`;
    switch (img) {
        case "loading":
            text += `<img id="loadingImg" src="svg/loading.svg">`; break;
        case "push-link":
            text += `<img id="loadingImg" src="img/push-link.png">`; break;
    }
    document.getElementById("autoConnect").innerHTML = text;
}

// fonction pour gerer les erreur du connection
function showNewConError(err) {
    document.getElementById("autoConnect").innerHTML = "";    
    let errMsgBox = document.getElementById("errAutoBox");
    errMsgBox.style.visibility = "visible";
    errMsgBox.innerText = err;
    clearInterval(interval);
}


// fonction pour initialiser le dashboard et ajout des event listener 
function setDashboard() {
    let acc = getAccess();
    getDashboard(acc).then(dashboard => {
        document.getElementById("mainSite").innerHTML = dashboard.getHtml(acc);
        let storage = localStorage.getItem('siteSettings');
        if (storage) 
            changeTheme(JSON.parse(storage).theme);
        document.getElementById("refreshBtn").addEventListener("click", setDashboard); 
        document.getElementById("logOutBtn").addEventListener("click", logOut);
        document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);
    }).catch(err => {
        document.getElementById("overlay").style.display = "none";
        console.error(err);
        alert("Un problème est survenu lors de la connexion au pont Philips Hue. Veuillez réessayer.");
        logOut();
    });
}

// fonction pour récupérer les données et initialiser le dashboard
async function getDashboard(acc) {
    try {
        let rooms = await getHueRooms(acc);
        let lights = await getHueLights(acc);
        return new DashboardPage(rooms, lights);
    } catch(err) {
        console.error(err);
        return err;
    }
}

