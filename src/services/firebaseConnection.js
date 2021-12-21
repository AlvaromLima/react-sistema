import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// salvar imagens no firebase
import 'firebase/storage';

let firebaseConfig = {
    apiKey: "AIzaSyDECXlHpgGBFwK3O36pMtTubjEBMcj2v98",
    authDomain: "sistema-a1221.firebaseapp.com",
    projectId: "sistema-a1221",
    storageBucket: "sistema-a1221.appspot.com",
    messagingSenderId: "138564378814",
    appId: "1:138564378814:web:e332177062b97a58f43eef",
    measurementId: "G-BNRW2GGZRG"
};
  
// Verifica se tem conexão aberta
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

export default firebase;

