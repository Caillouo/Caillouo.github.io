import * as THREE from 'three';

let scene, camera, renderer;
let player, doorMeshes = [];
let doorSize = 2; // Taille des portes
let roomSize = 10; // Taille de la pièce
let doorDistance = 5; // Distance des portes du joueur

function init() {
    // Création de la scène
    scene = new THREE.Scene();

    // Création de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Création du rendu
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Création du joueur (représenté par une sphère)
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    scene.add(player);

    // Création des portes
    createDoors();

    // Animation de la scène
    animate();
}

function createDoors() {
    const doorGeometry = new THREE.BoxGeometry(doorSize, doorSize, 0.2);
    const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Porte gauche
    let doorLeft = new THREE.Mesh(doorGeometry, doorMaterial);
    doorLeft.position.set(-roomSize / 2, 0, -doorDistance);
    scene.add(doorLeft);
    doorMeshes.push(doorLeft);

    // Porte droite
    let doorRight = new THREE.Mesh(doorGeometry, doorMaterial);
    doorRight.position.set(roomSize / 2, 0, -doorDistance);
    scene.add(doorRight);
    doorMeshes.push(doorRight);

    // Porte haut
    let doorTop = new THREE.Mesh(doorGeometry, doorMaterial);
    doorTop.position.set(0, roomSize / 2, -doorDistance);
    scene.add(doorTop);
    doorMeshes.push(doorTop);

    // Porte bas
    let doorBottom = new THREE.Mesh(doorGeometry, doorMaterial);
    doorBottom.position.set(0, -roomSize / 2, -doorDistance);
    scene.add(doorBottom);
    doorMeshes.push(doorBottom);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onKeyDown(event) {
    const movementSpeed = 0.2;
    switch (event.code) {
        case 'ArrowLeft':
            player.position.x -= movementSpeed;
            break;
        case 'ArrowRight':
            player.position.x += movementSpeed;
            break;
        case 'ArrowUp':
            player.position.y += movementSpeed;
            break;
        case 'ArrowDown':
            player.position.y -= movementSpeed;
            break;
    }
}

// Écoute des événements clavier
window.addEventListener('keydown', onKeyDown, false);

// Initialisation
init();
