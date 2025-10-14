import { deleteDb, getDb, getUser, login, logout, saveDb, updateDeleteButtonsVisibility } from "./database.js";

// Gestion du modal
const addBtn = document.getElementById("addMixBtn");
const modal = document.getElementById("addMixModal");
const cancelBtn = document.getElementById("cancelAdd");
const confirmBtn = document.getElementById("confirmAdd");

addBtn.addEventListener("click", () => modal.classList.add("active"));
cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

confirmBtn.addEventListener("click", () => {
    const title = document.getElementById("mixTitle").value.trim();
    const desc = document.getElementById("mixDesc").value.trim();
    const audio = document.getElementById("mixAudio").value.trim();
    const image = document.getElementById("mixImage").value.trim() || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900";

    if (!title || !audio) {
        alert("Merci d’ajouter au moins un titre et un lien audio !");
        return;
    }

    appendMix(title, image, desc, audio);

    // Fermer et réinitialiser le modal
    modal.classList.remove("active");
    document.getElementById("mixTitle").value = "";
    document.getElementById("mixDesc").value = "";
    document.getElementById("mixAudio").value = "";
    document.getElementById("mixImage").value = "";

    saveDb('mixs', { title, desc, audio, image });
});

document.addEventListener("DOMContentLoaded", () => {
    loadMixes();
});

document.querySelector('.logout-btn').addEventListener('click', () => {
    logout();
    document.querySelector('.btn-list').classList.add('hidden');
});

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Merci d’entrer un email et un mot de passe !");
        return;
    }

    login(email, password);
});

document.getElementById('showLogin').addEventListener('click', () => {
    document.querySelector('.login-section').classList.remove('hidden');
    document.querySelector('.show-login').classList.add('hidden');
});
export function appendMix(id, title, image, desc, audio) {
    const newMix = document.createElement("div");
    newMix.classList.add("mix-card");
    newMix.id = `mix-${id}`;
    newMix.innerHTML = `
    <img src="${image}" alt="Mix cover" class="mix-thumb" />
    <div class="mix-content"">
      <h2 class="mix-title">${title}</h2>
      <p class="mix-desc">${desc}</p>
      <audio controls preload="none">
        <source src="${audio}" type="audio/mpeg">
      </audio>
      <a href="${audio}" class="btn" download target="_blank">Télécharger</a>
      <button class="btn delete-btn hidden">Supprimer</button>
    </div>
  `;
    document.querySelector(".mix-container").prepend(newMix);

    const user = getUser();
    updateDeleteButtonsVisibility(!!user);

    let btn = document.querySelector(`#mix-${id} .delete-btn`)
    btn.addEventListener('click', () => {
        document.querySelector(`#mix-${id}`).remove();
        deleteDb('mixs', id);
    });
}

export function loadMixes() {
    getDb('mixs').then(mixs => {
        mixs.forEach((mix, id) => appendMix(id, mix.title, mix.image, mix.desc, mix.audio));
    });
}

