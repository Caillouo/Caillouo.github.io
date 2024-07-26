import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let lastArrow = '';
var camera, scene, renderer, mesh, loader, mtlLoader, tps, follow, goal, clock, snakeHead;
var temp = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
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
                object.position.set(10, 10, 0.5);
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
}


function autoAvancer() {
    if (!snakeHead) {
        return;
    }
    let oldx = snakeHead.position.x;
    let oldy = snakeHead.position.y;
    let distance = tps ? 0.1 : 1;
    switch (lastArrow) {
        case 'ArrowUp':
            if (snakeHead.position.y >= 30) {
                snakeHead.position.y = -30;
            }
            snakeHead.position.y += distance;
            break;
        case 'ArrowDown':
            if (snakeHead.position.y <= -30) {
                snakeHead.position.y = 30;
            }
            snakeHead.position.y -= distance;
            break;
        case 'ArrowLeft':
            if (snakeHead.position.x <= -30) {
                snakeHead.position.x = 30;
            }
            snakeHead.position.x -= distance;
            break;
        case 'ArrowRight':
            if (snakeHead.position.x >= 30) {
                snakeHead.position.x = -30;
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
        const newTail = new THREE.BoxGeometry(1, 1, 1);
        const newTailMaterial = new THREE.MeshBasicMaterial({ color: 0x944a00 });

        const newTailMesh = new THREE.Mesh(newTail, newTailMaterial);
        newTailMesh.position.set(tails[tails.length - 1].position.x, tails[tails.length - 1].position.y, 0.5);
        tails.push(newTailMesh);
        scene.add(newTailMesh);

        food.position.set(Math.floor(Math.random() * 20) - 10, Math.floor(Math.random() * 20) - 10, 0);
    }

    renderer.render(scene, camera);
}

function animate() {
    if (tps) {
        requestAnimationFrame(animate);
        autoAvancer();
        if (snakeHead) {
            a.lerp(snakeHead.position, 0.4);
            b.copy(goal.position);

            dir.copy(a).sub(b).normalize();
            const dis = a.distanceTo(b) - 3;
            goal.position.addScaledVector(dir, dis);
            goal.position.lerp(temp, 0.02);
            temp.setFromMatrixPosition(follow.matrixWorld);
            camera.lookAt(snakeHead.position);

            // const cameraOffset = new THREE.Vector3();
            // const cameraDistance = 10; // Distance de la caméra derrière le serpent
            // const cameraHeight = 10;
            // switch (lastArrow) {
            //     case 'ArrowUp':
            //         cameraOffset.set(0, -cameraDistance, cameraHeight);
            //         break;
            //     case 'ArrowDown':
            //         cameraOffset.set(0, cameraDistance, cameraHeight);
            //         camera.rotation.z = Math.PI;
            //         break;
            //     case 'ArrowLeft':
            //         cameraOffset.set(cameraDistance, 0, cameraHeight);
            //         break;
            //     case 'ArrowRight':
            //         cameraOffset.set(-cameraDistance, 0, cameraHeight);
            //         camera.rotation.z = -Math.PI;
            //         break;
            //     default:
            //         cameraOffset.set(0, -cameraDistance, cameraHeight); // Par défaut, derrière la tête
            //         break;
            // }

            // // Calcul de la position cible de la caméra
            // const targetCameraPosition = snakeHead.position.clone().add(cameraOffset);

            // // Interpolation vers la position cible de la caméra
            // camera.position.lerp(targetCameraPosition, 0.1);

            // // La caméra regarde toujours la tête du serpent
            // camera.lookAt(snakeHead.position);
        }
        renderer.render(scene, camera);
    }
}

function init() {
    loader = new OBJLoader();
    mtlLoader = new MTLLoader();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, -3, 50);
    camera.lookAt(0, 0, 0);
    tps = document.getElementById('toggleTps').checked;
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

if (!tps)
    setInterval(autoAvancer, 100);
