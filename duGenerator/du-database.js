import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD9cUcN5GhC3tMo7n7TylunxNPx5CT-eOI",
    authDomain: "du-generator.firebaseapp.com",
    databaseURL: "https://du-generator-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "du-generator",
    storageBucket: "du-generator.firebasestorage.app",
    messagingSenderId: "645876211657",
    appId: "1:645876211657:web:b636b2add268f978db1218"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export async function test () {
    console.log("test");
    try {
        await set(ref(db, 'test'), {
            username: 'test',
            highScore: 0,
            password: 'test',
            salt: 'test'
        })
    } catch (error) {
        console.error("Error adding user: ", error);
    }
}

export async function saveDb(ref, values) {
    try {
        await set(ref(db, ref), values);
    } catch (error) {
        console.error("Error adding data: ", [error, ref, values]);
    }
}