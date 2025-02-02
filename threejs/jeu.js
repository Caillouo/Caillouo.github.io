import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loggedUser, updateScore, getHighScores } from '../database.js';

let lastArrow = '';
var camera, scene, renderer, mesh, loader, mtlLoader, tps, follow, goal, clock, snakeHead, arrowHelper;
var temp = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var highScores = {};
var score = 0;
var speed = document.getElementById('speed').value;
document.getElementById('speed').addEventListener('input', (event) => {
    speed = event.target.value;
});
var ended = false;
var paused = document.getElementById('displayPause').style.display === 'flex';
init();

// Création de la queue du serpent
const snakeTail = new THREE.BoxGeometry(1, 1, 1);
const tails = [];
const snakeTailMaterial = new THREE.MeshBasicMaterial({ color: 0x944a00 });

const snakeTailMesh = new THREE.Mesh(snakeTail, snakeTailMaterial);

snakeTailMesh.position.set(0, -1, 0.5);
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
                object.position.set(Math.floor(Math.random() * 20) - 10, Math.floor(Math.random() * 20) - 10, 0);
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

renderer.render(scene, camera);

// ecoute des fleches du clavier
document.addEventListener('keydown', (event) => {
    if (ended) {
        return;
    }
    const keyName = event.key;
    if (keyName === 'ArrowUp' || keyName === 'ArrowDown' || keyName === 'ArrowLeft' || keyName === 'ArrowRight') {
        if (paused) {
            return;
        }
        if (lastArrow === 'ArrowUp' && keyName === 'ArrowDown' || lastArrow === 'ArrowDown' && keyName === 'ArrowUp' || lastArrow === 'ArrowLeft' && keyName === 'ArrowRight' || lastArrow === 'ArrowRight' && keyName === 'ArrowLeft') {
            return;
        }
        if (lastArrow === '') {
            document.getElementById('displayStart').style.display = 'none';
            if (keyName === 'ArrowDown') {
                return;
            }
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
                pauseGame();
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
    const distance = 1;

    if (!tps) {
        // Mode normal (pas TPS)
        for (let i = tails.length - 1; i > 0; i--) {
            tails[i].position.x = tails[i - 1].position.x;
            tails[i].position.y = tails[i - 1].position.y;
        }
        tails[0].position.x = oldx;
        tails[0].position.y = oldy;
    } else {
        // Mode TPS
        for (let i = 0; i < tails.length; i++) {
            const segment = tails[i];
            let targetPosition;

            if (i === 0) {
                // Premier segment suit la tête
                targetPosition = new THREE.Vector3(oldx, oldy, snakeHead.position.z);
            } else {
                // Autres segments suivent le segment précédent
                targetPosition = tails[i - 1].position.clone();
            }

            // Calcul de la distance actuelle
            const segmentDistance = segment.position.distanceTo(targetPosition);

            // Ajustement de la position pour garder la distance constante
            if (segmentDistance > distance) {
                segment.position.lerp(targetPosition, (segmentDistance - distance) / segmentDistance);
            }
        }
    }
}


function changeRotation(object, keyName) {
    switch (keyName) {
        case 'ArrowUp':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = Math.PI / 2;
            break;
        case 'ArrowDown':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = -Math.PI / 2;
            break;
        case 'ArrowLeft':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = Math.PI;
            break;
        case 'ArrowRight':
            object.rotation.x = Math.PI / 2;
            object.rotation.y = 0;
            break;
        default:
            break;
    }

    // updateCameraPosition(object);
}


function autoAvancer() {
    if (!snakeHead || paused) {
        return;
    }
    let oldx = snakeHead.position.x;
    let oldy = snakeHead.position.y;
    let distance = tps ? 0.1 : 1;
    distance *= speed / 50;
    switch (lastArrow) {
        case 'ArrowUp':
            if (snakeHead.position.y >= 30) {
                loose();
                // snakeHead.position.y = -30;
            }
            snakeHead.position.y += distance;
            break;
        case 'ArrowDown':
            if (snakeHead.position.y <= -30) {
                loose();
                // snakeHead.position.y = 30;
            }
            snakeHead.position.y -= distance;
            break;
        case 'ArrowLeft':
            if (snakeHead.position.x <= -30) {
                loose();
                // snakeHead.position.x = 30;
            }
            snakeHead.position.x -= distance;
            break;
        case 'ArrowRight':
            if (snakeHead.position.x >= 30) {
                loose();
                // snakeHead.position.x = -30;
            }
            snakeHead.position.x += distance;
            break;
        default:
            break;
    }
    if (lastArrow !== '') {
        avancerTail(oldx, oldy);
    }

    if (food && (Math.abs(snakeHead.position.x - food.position.x) < 1 && Math.abs(snakeHead.position.y - food.position.y) < 1)) {
        manger();
    }

    checkCollision();

    renderer.render(scene, camera);
}

function checkCollision() {
    for (let i = 0; i < tails.length; i++) {
        let seuil = 0.5;
        if (Math.abs(snakeHead.position.x - tails[i].position.x) < seuil && Math.abs(snakeHead.position.y - tails[i].position.y) < seuil) {
            loose();
        }
    }
}

function loose() {
    ended = true;
    paused = true;
    document.getElementById('displayLoose').style.display = 'flex';
    document.getElementById('scoreLoose').innerText = score;

    let classement = getHighScores().then((classement) => {
        let classementTable = '';

        for (let i = 0; i < classement.length; i++) {
            classementTable += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${classement[i].username}</td>
                    <td>${classement[i].highScore}</td>
                </tr>
            `;
        }

        document.getElementById('classement').innerHTML = classementTable;
    });
}

function manger() {
    const newTail = new THREE.BoxGeometry(1, 1, 1);
    const newTailMaterial = new THREE.MeshBasicMaterial({ color: 0x944a00 });

    const newTailMesh = new THREE.Mesh(newTail, newTailMaterial);
    newTailMesh.position.set(tails[tails.length - 1].position.x, tails[tails.length - 1].position.y, 0.5);
    tails.push(newTailMesh);
    scene.add(newTailMesh);

    food.position.set(Math.floor(Math.random() * 20) - 10, Math.floor(Math.random() * 20) - 10, 0);
    score++;
    document.getElementById('scoreValue').innerText = score;

    if (loggedUser) {
        setHighScore();
    }
}

function animate() {
    if (tps) {
        requestAnimationFrame(animate);
        autoAvancer();
        if (snakeHead) {
            if (food) {
                // Calculer la direction de la nourriture par rapport à la tête
                const foodDirection = new THREE.Vector3();
                foodDirection.subVectors(food.position, snakeHead.position).normalize();

                // Mettre à jour la position de la flèche au-dessus de la tête du serpent
                const arrowPosition = snakeHead.position.clone();
                arrowPosition.z += 2;  // Place la flèche au-dessus de la tête
                arrowHelper.position.copy(arrowPosition);

                // Mettre à jour la direction de la flèche pour qu'elle pointe vers la nourriture
                arrowHelper.setDirection(foodDirection);
            }

            // updateCameraPosition();

            a.lerp(snakeHead.position, 0.4);
            b.copy(goal.position);

            dir.copy(a).sub(b).normalize();
            const dis = a.distanceTo(b) - 3;
            goal.position.addScaledVector(dir, dis);
            goal.position.lerp(temp, 0.02);
            temp.setFromMatrixPosition(follow.matrixWorld);
            camera.lookAt(snakeHead.position);
        }
        renderer.render(scene, camera);
    }
}

function updateCameraPosition(object) {
    const offset = 5;  // Distance behind the snake
    const height = 2;  // Height of the camera relative to the snake

    // Create a vector to get the direction of the snake's head
    const direction = new THREE.Vector3();
    object.getWorldDirection(direction);  // Get the direction the snake's head is facing

    // Create a vector for the camera's position
    const cameraPosition = new THREE.Vector3();

    // Place the camera behind the snake
    cameraPosition.copy(object.position);  // Copy the position of the snake's head
    // Scale the direction vector and subtract it from the camera position
    direction.multiplyScalar(offset); // Scale the direction by offset
    cameraPosition.sub(direction); // Now subtract it

    // Add height to the camera
    cameraPosition.y += height;  // Adjust height

    // Update the camera's position
    camera.position.copy(cameraPosition);

    // Orient the camera to look at the snake's head
    camera.lookAt(object.position);  // Look at the snake's head
}

function init() {
    loader = new OBJLoader();
    mtlLoader = new MTLLoader();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, -3, 50);
    camera.lookAt(0, 0, 0);
    tps = true;
    scene.background = new THREE.Color(0xabcdef);
    renderer = new THREE.WebGLRenderer();
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

    const texture = new THREE.TextureLoader().load('textures/parquet.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.PlaneGeometry(60, 60);
    mesh = new THREE.Mesh(plane, material);

    const line = new THREE.Line(geometry, trait);
    scene.add(line);

    // Création des murs autour de la zone de jeu
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wallThickness = 1;
    const wallHeight = 1;

    // Mur Nord
    const northWall = new THREE.BoxGeometry(60, wallThickness, wallHeight);
    const northWallMesh = new THREE.Mesh(northWall, wallMaterial);
    northWallMesh.position.set(0, 30 + wallThickness / 2, wallHeight / 2);
    scene.add(northWallMesh);

    // Mur Sud
    const southWall = new THREE.BoxGeometry(60, wallThickness, wallHeight);
    const southWallMesh = new THREE.Mesh(southWall, wallMaterial);
    southWallMesh.position.set(0, -30 - wallThickness / 2, wallHeight / 2);
    scene.add(southWallMesh);

    // Mur Est
    const eastWall = new THREE.BoxGeometry(wallThickness, 60, wallHeight);
    const eastWallMesh = new THREE.Mesh(eastWall, wallMaterial);
    eastWallMesh.position.set(30 + wallThickness / 2, 0, wallHeight / 2);
    scene.add(eastWallMesh);

    // Mur Ouest
    const westWall = new THREE.BoxGeometry(wallThickness, 60, wallHeight);
    const westWallMesh = new THREE.Mesh(westWall, wallMaterial);
    westWallMesh.position.set(-30 - wallThickness / 2, 0, wallHeight / 2);
    scene.add(westWallMesh);

    goal = new THREE.Object3D;
    follow = new THREE.Object3D;

    // Création de la tête du serpent
    mtlLoader.load(
        'objs/catHead/catHead.mtl',
        function (materials) {
            materials.preload();
            loader.setMaterials(materials);
            loader.load(
                'objs/catHead/catHead.obj',
                function (object) {
                    object.position.set(0, 0, 0.5);
                    object.rotation.x = Math.PI / 2;
                    object.rotation.y = Math.PI / 2;
                    scene.add(object);
                    snakeHead = object;
                    snakeHead.add(follow);

                    goal.add(camera);
                    scene.add(mesh);

                    const arrowDir = new THREE.Vector3(0, 1, 0);
                    const arrowLength = 1;
                    const arrowColor = 0xff4141;
                    const arrowHeadWidth = 0.3; // Largeur de la tête de la flèche
                    const arrowHeadLength = 0.5; // Longueur de la tête de la flèche

                    // Création de la flèche
                    arrowHelper = new THREE.ArrowHelper(arrowDir, snakeHead.position, arrowLength, arrowColor, arrowHeadLength, arrowHeadWidth);

                    // Changer l'épaisseur du trait de la flèche
                    arrowHelper.line.material.linewidth = 5; // Par exemple, 5 pour une épaisseur plus grande

                    scene.add(arrowHelper);

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

    // Création de lumières pour éclairer la scène
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 10);
    scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(0, -30, 10);
    scene.add(light2);
    const light3 = new THREE.DirectionalLight(0xffffff, 1);
    light3.position.set(30, 0, 10);
    scene.add(light3);
    const light4 = new THREE.DirectionalLight(0xffffff, 1);
    light4.position.set(-30, 0, 10);
    scene.add(light4);
    const light5 = new THREE.DirectionalLight(0xffffff, 1);
    light5.position.set(0, 30, 10);
    scene.add(light5);
}
animate();

export function pauseGame() {
    paused = !paused;
    if (paused) {
        document.getElementById('displayPause').style.display = 'flex';
    } else {
        document.getElementById('displayPause').style.display = 'none';
    }
}
if (!tps)
    setInterval(autoAvancer, 100);

function loadHighScores() {
    if (localStorage.getItem('highscores') && Object.keys(localStorage.getItem('highscores')).length > 0) {
        highScores = JSON.parse(localStorage.getItem('highscores'));
    }
    highScores[username.value] = 0;
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

export function getHighScoreFor(username) {
    if (Object.keys(highScores).length === 0) {
        loadHighScores();
    }

    return highScores[username] || 0;
}

function setHighScore() {
    let userHighScore = loggedUser.highScore;
    if (score >= userHighScore) {
        updateScore(loggedUser.username, score);
        document.getElementById('highscore').innerText = score;
    }
}