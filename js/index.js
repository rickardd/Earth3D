// Why is the path not three/three.moduel.js?
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { createEarthCloud } from './helper.js';

var scene = new THREE.Scene();

const fov = 45;// Camera frustum vertical Field-Of-View.The higher the further away. The angle of the top and bottom plain of the view pyramid in deg. Although most other angles in Three are radians
const aspect = window.innerWidth / window.innerHeight;// Camera frustum aspect ratio.
const near = 0.01;// Camera frustum near plane.
const far = 1000;// Camera frustum far plane. has to be greater than the near value.

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.z = 6; // important when setting up to move camera back to see any objects. 

const cameraHelper = new THREE.PerspectiveCamera(fov, aspect, near, far)
cameraHelper.position.z = 0.7; // important when setting up to move camera back to see any objects. 
var helper = new THREE.CameraHelper(cameraHelper);
scene.add(helper);

var light = new THREE.AmbientLight(0xffffff, 1); // soft white light
scene.add(light);

var spotLight = new THREE.SpotLight(0xffffff, 0.3);
spotLight.position.set(20, 20, 30);
spotLight.castShadow = false;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
scene.add(spotLight);

var spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

var geometry = new THREE.SphereGeometry(0.5, 32, 32)
var material = new THREE.MeshPhongMaterial()

const textureLoader = new THREE.TextureLoader();

const baseTexturePromise = new Promise((resolve, reject) => {
    // Loading earth base texture.
    textureLoader.load('/img/earthmap1k.jpg', function (texture) {
        resolve(texture)
        console.log(texture.image.width, texture.image.height);
    })
})

const bumpTexturePromise = new Promise((resolve, reject) => {
    // loading bumpMap image to add depth to earth texture e.g making mountains pops out
    textureLoader.load('img/earthbump1k.jpg', function (texture) {
        resolve(texture)
        console.log(texture.image.width, texture.image.height);
    })
})

const specularityTexturePromise = new Promise((resolve, reject) => {
    textureLoader.load('img/earthspec1k.jpg', function (texture) {
        resolve(texture)
    })
})

const cloudMesh = createEarthCloud();
scene.add(cloudMesh);


const galaxyTexturePromise = new Promise((resolve, reject) => {
    textureLoader.load('img/galaxy_starfield.png', function (texture) {
        resolve(texture)
    })
})


let earthMesh;
let galaxyMesh;

Promise.all([baseTexturePromise, bumpTexturePromise, specularityTexturePromise, galaxyTexturePromise])
    .then(([baseTexture, bumpTexture, specularityTexture, galaxyTexture]) => {
        material.map = baseTexture;
        material.bumpMap = bumpTexture;
        material.bumpScale = 0.03;
        material.specularMap = specularityTexture;
        material.specular = new THREE.Color('grey');

        const galaxyGeometry = new THREE.SphereGeometry(90, 32, 32)
        const galaxyMaterial = new THREE.MeshBasicMaterial()
        galaxyMaterial.map = galaxyTexture;
        galaxyMaterial.side = THREE.BackSide
        galaxyMesh = new THREE.Mesh(galaxyGeometry, galaxyMaterial)
        scene.add(galaxyMesh);

        earthMesh = new THREE.Mesh(geometry, material);
        scene.add(earthMesh);
        animate()
    })

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#f1f1f1");
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);

    cloudMesh.rotateY(1 / 800)
    earthMesh.rotation.y += 1 / 1000

    controls.update();

    renderer.render(scene, camera);
}

