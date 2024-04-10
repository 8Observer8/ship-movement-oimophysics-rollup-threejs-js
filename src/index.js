import "oimophysics";
import { quat, vec3 } from "gl-matrix";
import * as THREE from "three";
import { ColladaLoader } from "collada-loader";
import { OrbitControls } from "orbit-controls";
import Keyboard from "./keyboard.js";
import DebugDrawer from "./debug-drawer.js";

const keyboard = new Keyboard();
let player;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 30;
camera.position.z = -5;

const canvas = document.getElementById("renderCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setClearColor(new THREE.Color("rgb(50, 50, 50)"), 1);
renderer.setSize(window.innerWidth, window.innerHeight);

const orbitControls = new OrbitControls(camera, canvas);

const lightColor = new THREE.Color("rgb(255, 255, 255)");
const lightIntensity = 3;
const light = new THREE.DirectionalLight(lightColor, lightIntensity);
light.position.set(3, 5, 4);
scene.add(light);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
hemiLight.position.set(0, 5, 0);
scene.add(hemiLight);

const world = new OIMO.World();
world.setGravity(new OIMO.Vec3(0, -9.8, 0));

const debugDrawer = new DebugDrawer(scene);
debugDrawer.wireframe = true;
world.setDebugDraw(debugDrawer);

const groundRBConfig = new OIMO.RigidBodyConfig();
groundRBConfig.type = OIMO.RigidBodyType.STATIC;
groundRBConfig.position = new OIMO.Vec3(0, -0.9, 0);
const groundBody = new OIMO.RigidBody(groundRBConfig);
groundBody.setOrientation(new OIMO.Quat(0, 0, 0, 1));
const groundShapeConfig = new OIMO.ShapeConfig();
groundShapeConfig.geometry = new OIMO.BoxGeometry(new OIMO.Vec3(100, 1, 100));
groundShapeConfig.friction = 1;
const groundShape = new OIMO.Shape(groundShapeConfig);
groundBody.addShape(groundShape);
world.addRigidBody(groundBody);

const wallRBConfig = new OIMO.RigidBodyConfig();
wallRBConfig.type = OIMO.RigidBodyType.STATIC;
wallRBConfig.position = new OIMO.Vec3(-3, 1, 0);
const wallBody = new OIMO.RigidBody(wallRBConfig);
wallBody.setOrientation(new OIMO.Quat(0, 0, 0, 1));
const wallShapeConfig = new OIMO.ShapeConfig();
wallShapeConfig.geometry = new OIMO.BoxGeometry(new OIMO.Vec3(1, 1, 1));
wallShapeConfig.friction = 0;
const wallShape = new OIMO.Shape(wallShapeConfig);
wallBody.addShape(wallShape);
world.addRigidBody(wallBody);

const playerRBConfig = new OIMO.RigidBodyConfig();
playerRBConfig.type = OIMO.RigidBodyType.DYNAMIC;
playerRBConfig.position = new OIMO.Vec3(0, 1, 0);
const playerBody = new OIMO.RigidBody(playerRBConfig);
playerBody.setOrientation(new OIMO.Quat(0, 0, 0, 1));
const playerShapeConfig = new OIMO.ShapeConfig();
playerShapeConfig.geometry = new OIMO.SphereGeometry(1);
playerShapeConfig.friction = 1;
const playerShape = new OIMO.Shape(playerShapeConfig);
playerBody.addShape(playerShape);
playerBody.setRotationFactor(new OIMO.Vec3(0, 1, 0));
playerBody.setAngularDamping(10);
world.addRigidBody(playerBody);

const clock = new THREE.Clock();
clock.start();
let dt;

const forward = vec3.fromValues(0, 0, 1);
const direction = vec3.fromValues(forward[0], forward[1], forward[2]);
let input = [];
const playerMovementSpeed = 3;
const playerRotationSpeed = 2;
let tempPosition, tempRotation;

const colliderCheckBoxPanel = document.getElementById("colliderCheckBoxPanel");
const showCollidersCheckbox = document.getElementById("colliderCheckBox");
let showColliders = showCollidersCheckbox.checked;
showCollidersCheckbox.onchange = () => {
    showColliders = showCollidersCheckbox.checked;
};

const loadingPanel = document.getElementById("loadingPanel");
let showInstructions = true;
const instructions = document.getElementById("instructions");
if (instructions) {
    instructions.onclick = () =>
    {
        instructions.style.display = "none";
        showInstructions = false;
        colliderCheckBoxPanel.style.display = "";
    };
}

// window.addEventListener("keydown", function(e) {
//     if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
//         e.preventDefault();
//     }
// }, false);

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.onresize = resize;

const loadingValue = document.getElementById("loadingValue");
const amountOfAssets = 6;
let assetNumber = 0;

async function loadAssets() {
    const loader = new ColladaLoader();
    const textureLoader = new THREE.TextureLoader();

    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const playerPromise = await loader.loadAsync("assets/space-ship.dae");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const playerTexture = await textureLoader.loadAsync("assets/colors.png");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const floorPromise = await loader.loadAsync("assets/floor.dae");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const floorTexture = await textureLoader.loadAsync("assets/floor.png");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const wallPromise = await loader.loadAsync("assets/wall.dae");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;
    const wallTexture = await textureLoader.loadAsync("assets/154.jpg");
    loadingValue.innerText = `${Math.round(assetNumber++ * 100 / amountOfAssets)}%`;

    loadingPanel.style.display = "none";
    instructions.style.display = "";

    player = playerPromise.scene.children[0];
    player.position.y = 2;
    playerTexture.minFilter = THREE.NearestFilter;
    playerTexture.magFilter = THREE.NearestFilter;
    const playerMaterial = new THREE.MeshPhongMaterial({
        map: playerTexture,
        color: 0xffffff
    });
    player.material = playerMaterial;
    player.scale.set(0.3, 0.3, 0.3);
    scene.add(player);
    player.add(camera);

    const floor = floorPromise.scene.children[0];
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({
        map: floorTexture,
        color: 0xffffff
    });
    floor.material = floorMaterial;
    scene.add(floor);

    const wall = wallPromise.scene.children[0];
    const halfExtents = wallBody.getShapeList().getGeometry().getHalfExtents();
    tempPosition = wallBody.getPosition();
    wall.position.set(tempPosition.x, tempPosition.y,
        tempPosition.z);
    wall.scale.set(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    const wallMaterial = new THREE.MeshPhongMaterial({
        map: wallTexture,
        color: 0xffffff
    });
    wall.material = wallMaterial;
    scene.add(wall);

    render();
}
loadAssets();

function render() {
    keyboardHandler();

    dt = clock.getDelta();
    world.step(dt);

    debugDrawer.begin();
    if (showColliders) {
        world.debugDraw();
    }
    debugDrawer.end();

    applyThirdPersonInput(input, player, playerBody, direction);

    tempPosition = playerBody.getPosition();
    player.position.set(tempPosition.x, tempPosition.y,
        tempPosition.z);
    tempRotation = playerBody.getOrientation();
    player.quaternion.set(tempRotation.x, tempRotation.y,
        tempRotation.z, tempRotation.w);

    camera.lookAt(player.position);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function keyboardHandler() {
    if (showInstructions) {
        return;
    }

    if (keyboard.pressed("KeyW") || keyboard.pressed("ArrowUp")) {
        input.push("u");
    }
    if (keyboard.pressed("KeyS") || keyboard.pressed("ArrowDown")) {
        input.push("d");
    }
    if (keyboard.pressed("KeyA") || keyboard.pressed("ArrowLeft")) {
        input.push("l");
    }
    if (keyboard.pressed("KeyD") || keyboard.pressed("ArrowRight")) {
        input.push("r");
    }
}

function applyThirdPersonInput(inputs, playerModel, body, direction) {
    inputs.forEach(input => {
        if (input === "u") {
            const vy = body.getLinearVelocity().y;
            const impulse = new OIMO.Vec3(direction[0] * playerMovementSpeed, vy,
                direction[2] * playerMovementSpeed);
            body.setLinearVelocity(impulse);
            playerBody.setRotationFactor(new OIMO.Vec3(0, 0, 0));
        }

        if (input === "d") {
            const vy = body.getLinearVelocity().y;
            const impulse = new OIMO.Vec3(-direction[0] * playerMovementSpeed, vy,
                -direction[2] * playerMovementSpeed);
            body.setLinearVelocity(impulse);
            playerBody.setRotationFactor(new OIMO.Vec3(0, 0, 0));
        }

        if (input === "l") {
            const impulse = new OIMO.Vec3(0, playerRotationSpeed, 0);
            body.setAngularVelocity(impulse);
            playerBody.setRotationFactor(new OIMO.Vec3(0, 1, 0));
        }

        if (input === "r") {
            const impulse = new OIMO.Vec3(0, -playerRotationSpeed, 0);
            body.setAngularVelocity(impulse);
            playerBody.setRotationFactor(new OIMO.Vec3(0, 1, 0));
        }
    });

    const q = quat.fromValues(playerModel.quaternion.x, playerModel.quaternion.y,
        playerModel.quaternion.z, playerModel.quaternion.w);
    vec3.transformQuat(direction, forward, q);

    if (input.length) {
        input = [];
    }
}
