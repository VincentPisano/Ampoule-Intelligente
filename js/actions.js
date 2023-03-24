class actions {

    // fonction pour changer l'état de la chambre (ON/OFF - intensité)
    changeRoomState(selectRoomId, setOn, setBri) {
        return new Promise((resolve, reject) => {
            let json = {
                on: setOn,
                bri: Number(setBri)
            };
            let acc = getAccess();
            let url = acc.ip+'/api/'+acc.token+'/groups/'+selectRoomId+'/action/';
            putRequest(url, json).then(response => {
                resolve(response);
            }).catch(err => reject(err));
        })
    }
    
    // fonction pour changer l'état de l'ampoule (ON/OFF - intensité)
    changeLightState(selectLightId, setOn) {
        return new Promise((resolve, reject) => {
            let json = { on: setOn};
            let acc = getAccess();
            let url = acc.ip+'/api/'+acc.token+'/lights/'+selectLightId+'/state/';
            putRequest(url, json).then(response => {
                resolve(response);
            }).catch(err => reject(err));
        }).catch(err => console.error(err));
    }
    
    // fonction qui envoie une requete HTTP PUT en cas du slider-change
    sliderChange(lightId, jsonObj) {
        let acc = getAccess();
        let url = acc.ip+'/api/'+acc.token+'/lights/'+lightId+'/state/';
        putRequest(url, jsonObj)
        .catch(err => console.error(err));
    }
}
