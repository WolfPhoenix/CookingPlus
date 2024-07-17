import { Firebase } from './firebase.js';


document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    const firebaseInstance = new Firebase();
    const app = firebaseInstance.getApp();

    console.log(app); // Verifica que la app de Firebase se ha inicializado correctamente

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}
