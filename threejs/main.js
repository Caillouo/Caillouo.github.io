import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

let lastArrow = '';
const loader = new OBJLoader();
const mtlLoader = new MTLLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 55);
camera.lookAt(0, 0, 0);
let tps = false;

// Ajouter une lumière directionnelle
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Ajouter une lumière ambiante
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
scene.background = new THREE.Color(0xabcdef);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Création de la zone de jeu de snake
const trait = new THREE.LineBasicMaterial({ color: 0x93C47D });
const points = [];
points.push(new THREE.Vector3(-30, 30, 0));
points.push(new THREE.Vector3(30, 30, 0));
points.push(new THREE.Vector3(30, -30, 0));
points.push(new THREE.Vector3(-30, -30, 0));
points.push(new THREE.Vector3(-30, 30, 0));
const geometry = new THREE.BufferGeometry().setFromPoints(points);

// Ajout de murs hauts à la zone de jeu
// const mur = new THREE.PlaneGeometry(60, 1);
// const murMesh = new THREE.Mesh(mur, trait);
// murMesh.position.set(0, 30, 0);

// scene.add(murMesh);

// Ajout d'une texture à la zone de jeu
const texture = new THREE.TextureLoader().load('textures/parquet.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const plane = new THREE.PlaneGeometry(60, 60);
const mesh = new THREE.Mesh(plane, material);
scene.add(mesh);

const line = new THREE.Line(geometry, trait);

scene.add(line);

let snakeHead;
// Création de la tête du serpent
mtlLoader.load(
    'objs/catHead/catHead.mtl',
    function (materials) {
        materials.preload();
        loader.setMaterials(materials);
        loader.load(
            'objs/catHead/catHead.obj',
            function (object) {
                object.position.set(0, 0, 0);
                object.rotation.x = Math.PI / 2;
                object.rotation.y = Math.PI / 2;
                scene.add(object);
                snakeHead = object;
                // Placement de la caméra au dessus de la tête du serpent
                if (tps) {
                    camera.position.set(snakeHead.position.x, snakeHead.position.y - 10, 10);
                    // Tourne la caméra vers devant la tête du serpent
                    camera.lookAt(snakeHead.position.x, snakeHead.position.y + 10, 0);
                }
            },
            function (xhr) {
            },
            function (error) {
                console.log('Erreur de tête');
            }
        )
    }
);



// snakeHead = new THREE.BoxGeometry(1, 1, 1);
// const snakeHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// const snakeHeadMesh = new THREE.Mesh(snakeHead, snakeHeadMaterial);
// scene.add(snakeHeadMesh);

// Création de la queue du serpent
const snakeTail = new THREE.BoxGeometry(1, 1, 1);
const tails = [];
const snakeTailMaterial = new THREE.MeshBasicMaterial({ color: 0x944a00 });

const snakeTailMesh = new THREE.Mesh(snakeTail, snakeTailMaterial);

snakeTailMesh.position.set(0, -1, 0);
tails.push(snakeTailMesh);
scene.add(snakeTailMesh);

let food;
// Création de la nourriture
mtlLoader.load(
    'objs/fish/fish.mtl',
    function (materials) {
        materials.preload();
        loader.setMaterials(materials);
        loader.load(
            'objs/fish/fish.obj',
            function (object) {
                object.position.set(10, 10, 0);
                object.rotation.x = Math.PI / 2;
                object.rotation.y = Math.PI / 2;
                food = object;
                scene.add(object);
            },
            function (xhr) {
            },
            function (error) {
                console.log('Erreur de nourriture');
            }
        )
    }
)
// const food = new THREE.BoxGeometry(1, 1, 1);
// const foodMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// const foodMesh = new THREE.Mesh(food, foodMaterial);
// foodMesh.position.set(10, 10, 0);
// scene.add(foodMesh);

renderer.render(scene, camera);

// ecoute des fleches du clavier
document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === 'ArrowUp' || keyName === 'ArrowDown' || keyName === 'ArrowLeft' || keyName === 'ArrowRight') {
        if (lastArrow === 'ArrowUp' && keyName === 'ArrowDown' || lastArrow === 'ArrowDown' && keyName === 'ArrowUp' || lastArrow === 'ArrowLeft' && keyName === 'ArrowRight' || lastArrow === 'ArrowRight' && keyName === 'ArrowLeft') {
            return;
        }
        changeRotation(snakeHead, keyName);
        lastArrow = keyName;
    } else {
        switch (keyName) {
            case 'z':
                camera.position.y += 1;
                break;
            case 's':
                camera.position.y -= 1;
                break;
            case 'q':
                camera.position.x -= 1;
                break;
            case 'd':
                camera.position.x += 1;
                break;
            case 'Escape':
                lastArrow = '';
                break;
            default:
                break;
        }
    }
});

// zoom avec la molette de la souris
document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        camera.position.z += 1;
    } else {
        camera.position.z -= 1;
    }
});

function avancerTail(oldx, oldy) {
    for (let i = tails.length - 1; i > 0; i--) {
        tails[i].position.x = tails[i - 1].position.x;
        tails[i].position.y = tails[i - 1].position.y;
    }
    tails[0].position.x = oldx;
    tails[0].position.y = oldy;
}

function changeRotation(object, keyName) {
    let offset = 10; // Définir un décalage pour la position de la caméra
    let lookAtOffset = 10; // Définir un décalage pour la direction de la caméra

    switch (keyName) {
        case 'ArrowUp':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = Math.PI / 2;
            if (tps) {
                camera.position.set(snakeHead.position.x, snakeHead.position.y - offset, snakeHead.position.z + offset);
                camera.lookAt(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z);
            }
            break;
        case 'ArrowDown':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = -Math.PI / 2;
            if (tps) {
                camera.position.set(snakeHead.position.x, snakeHead.position.y + offset, snakeHead.position.z + offset);
                camera.lookAt(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z);
            }
            break;
        case 'ArrowLeft':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = Math.PI;
            if (tps) {
                camera.position.set(snakeHead.position.x + offset, snakeHead.position.y, snakeHead.position.z + offset);
                camera.lookAt(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z);
            }
            break;
        case 'ArrowRight':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = 0;
            if (tps) {
                camera.position.set(snakeHead.position.x - offset, snakeHead.position.y, snakeHead.position.z + offset);
                camera.lookAt(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z);
            }
            break;
        default:
            break;
    }
}


function autoAvancer() {
    if (!snakeHead) {
        return;
    }
    let oldx = snakeHead.position.x;
    let oldy = snakeHead.position.y;
    switch (lastArrow) {
        case 'ArrowUp':
            if (snakeHead.position.y === 50) {
                snakeHead.position.y = -50;
            }
            snakeHead.position.y += 1;
            if (tps) {
                camera.position.y += 1;
            }
            break;
        case 'ArrowDown':
            if (snakeHead.position.y === -50) {
                snakeHead.position.y = 50;
            }
            snakeHead.position.y -= 1;
            if (tps) {
                camera.position.y -= 1;
            }
            break;
        case 'ArrowLeft':
            if (snakeHead.position.x === -50) {
                snakeHead.position.x = 50;
            }
            snakeHead.position.x -= 1;
            if (tps) {
                camera.position.x -= 1;
            }
            break;
        case 'ArrowRight':
            if (snakeHead.position.x === 50) {
                snakeHead.position.x = -50;
            }
            snakeHead.position.x += 1;
            if (tps) {
                camera.position.x += 1;
            }
            break;
        default:
            break;
    }
    if (lastArrow !== '') {
        avancerTail(oldx, oldy);
    }

    if (food && (snakeHead.position.x === food.position.x && snakeHead.position.y === food.position.y)) {
        const newTail = new THREE.BoxGeometry(1, 1, 1);
        const newTailMaterial = new THREE.MeshBasicMaterial({ color: 0x944a00 });

        const newTailMesh = new THREE.Mesh(newTail, newTailMaterial);
        newTailMesh.position.set(tails[tails.length - 1].position.x, tails[tails.length - 1].position.y, 0);
        tails.push(newTailMesh);
        scene.add(newTailMesh);

        food.position.set(Math.floor(Math.random() * 20) - 10, Math.floor(Math.random() * 20) - 10, 0);
    }

    renderer.render(scene, camera);
}

setInterval(autoAvancer, 100);
