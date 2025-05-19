// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAMGqyuqsTKi1KPhIQq1Z032_MHHez3uPc",
    authDomain: "iswin-765c0.firebaseapp.com",
    projectId: "iswin-765c0",
    storageBucket: "iswin-765c0.firebasestorage.app",
    messagingSenderId: "659118128045",
    appId: "1:659118128045:web:3dcc44b2828f82f88a3f24",
    measurementId: "G-DM6E9VV3H0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { analytics, app, auth, firestore, storage };
