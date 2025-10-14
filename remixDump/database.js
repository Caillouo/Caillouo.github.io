import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCl7EWh8E9J9A73n3OU8NJrEkrtyjYIxNU",
    authDomain: "remix-dump.firebaseapp.com",
    databaseURL: "https://remix-dump-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "remix-dump",
    storageBucket: "remix-dump.firebasestorage.app",
    messagingSenderId: "1002833786493",
    appId: "1:1002833786493:web:1a4a312661a8e9dc7fa314"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export async function saveDb(tableName, values) {
    let table = await getDb(tableName);
    let nextId = 1;
    if (table !== null) {
        nextId = Object.keys(table).length + 1;
    }
    try {
        let test = await set(ref(db, `${tableName}/${nextId}`), values);
        console.log(test);
    } catch (error) {
        console.error("Error adding data: ", [error, ref, values]);
    }
}

export async function getDb(tableName) {
    try {
        const snapshot = await get(ref(db, tableName));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting data: ", error);
    }
}

export function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            console.error("Error logging in user: ", error);
        });
}

export function logout() {
    signOut(auth)
        .catch((error) => {
            console.error("Error logging out user: ", error);
        });
}
onAuthStateChanged(auth, (user) => {
    const btnList = document.querySelector('.btn-list');
    const loginSection = document.querySelector('.login-section');
    const showLogin = document.querySelector('.show-login');
    const deleteBtns = document.querySelectorAll('.delete-btn') ;

    if (user) {
        btnList.classList.remove('hidden');
        loginSection.classList.add('hidden');
        showLogin.classList.add('hidden');
        deleteBtns.forEach(btn => btn.classList.remove('hidden'));
    } else {
        btnList.classList.add('hidden');
        showLogin.classList.remove('hidden');
        console.log(deleteBtns);
        deleteBtns.forEach(btn => {
            btn.classList.add('hidden');
            console.log(btn);
        });
    }
});

export function updateDeleteButtonsVisibility(isLoggedIn) {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    if (isLoggedIn) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });
}

export function getUser() {
    return auth.currentUser;
}

export function deleteDb(tableName, id) {
    remove(ref(db, `${tableName}/${id}`));
}