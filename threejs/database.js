import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDO3IIImsZrJCFfiIeDoOnfRGXTr-v1DmE",
    authDomain: "portfolio-fbd63.firebaseapp.com",
    databaseURL: "https://portfolio-fbd63-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "portfolio-fbd63",
    storageBucket: "portfolio-fbd63.appspot.com",
    messagingSenderId: "319092905833",
    appId: "1:319092905833:web:0968c20960a4f7bfb70ff8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
export var loggedUser = null;

signInWithEmailAndPassword(auth, "william.noel60150@gmail.com", "rootfirebase")
    .catch((error) => {
        console.error("Error logging in user: ", error);
    });

export async function getUser(username) {
    const userRef = ref(db, `users/${username}`);
    try {
        const snapshot = await get(userRef); // Attendre la réponse
        if (snapshot.exists()) {
            return snapshot.val(); // Renvoie les données
        } else {
            return null; // L'utilisateur n'existe pas
        }
    } catch (error) {
        console.error("Error getting user: ", error);
        return null; // Renvoie null en cas d'erreur
    }
}

export function addUser(username, password, salt) {
    const newUserRef = ref(db, `users/${username}`);
    set(newUserRef, {
        username: username,
        highScore: 0,
        password: password,
        salt: salt
    })
        .catch((error) => {
            console.error("Error adding user: ", error);
        });
}

export async function logUser(username, password = null) {
    var hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
    const userRef = ref(db, `users/${username}`);
    const user = await getUser(username);
    let hashedPassword, salt = null;
    if (user === null) {
        salt = generateSalt();
        hashObj.update(password + salt);
        hashedPassword = hashObj.getHash("HEX");
        addUser(username, hashedPassword, salt);
        loggedUser = await getUser(username);
    } else {
        salt = user.salt;
        hashObj.update(password + salt);
        hashedPassword = hashObj.getHash("HEX");
        if (localStorage.getItem("hashedPassword") !== null) {
            hashedPassword = localStorage.getItem("hashedPassword");
        }
        if (user.password !== hashedPassword) {
            return null;
        }
        loggedUser = user;
    }

    localStorage.setItem("username", username);
    localStorage.setItem('hashedPassword', hashedPassword);
    return loggedUser;
}

export async function updateScore(username, newScore) {
    const userRef = ref(db, `users/${username}`);
    update(userRef, {
        highScore: newScore,
    })
        .catch((error) => {
            console.error("Error updating score: ", error);
        });

    loggedUser = await getUser(username);
}

export async function getHighScores() {
    const usersRef = ref(db, "users");
    try {
        const snapshot = await get(usersRef); // Attendre la réponse
        if (snapshot.exists()) {
            const users = snapshot.val(); // Renvoie les données
            const highScores = Object.values(users).sort((a, b) => b.highScore - a.highScore).slice(0, 10);
            return highScores;
        } else {
            return null; // Aucun utilisateur
        }
    } catch (error) {
        console.error("Error getting high scores: ", error);
        return null; // Renvoie null en cas d'erreur
    }
}

function generateSalt() {
    var salt = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 16; i++) {
        salt += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return salt;
}