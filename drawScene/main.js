import { z_render } from "./draw.js";
import { test_cube, fractalSurface } from "../objects/surface.js";
import { degreesToRadians } from "./math.js";
import { light } from "../objects/light.js";
import { camera, updateCamera } from "../objects/camera.js";
import { hexToRgb, Solver, Color, colors, startColors } from "./color.js";

export const width = 1040;
export const height = 800;
export const centerX = width / 2;
export const centerY = height / 2;

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

const button = document.getElementById("start");
button.onclick = start_prog;

let inputs = document.getElementsByTagName("input");

const coloredImageHigh = document.getElementById('highImg');
const colorPickerHigh = document.getElementById('highColor');

const coloredImageMiddle = document.getElementById('middleImg');
const colorPickerMiddle = document.getElementById('middleColor');

const coloredImageGround = document.getElementById('groundImg');
const colorPickerGround = document.getElementById('groundColor');


// Параметры для поверхности
let surf;
let maxSize = 250;
let modelMatrix;
let shadowBuffer =  [];
let shadowMatrix;
let isShadowed = [];

export let surfParams = {
    size : 0,
    rouhgness : 0,
    recursion : 0
};

for (let i = 0; i < height; i++) {
    shadowBuffer[i] = [];
    for (let j = 0; j < width; j++) {
        shadowBuffer[i][j] = Number.MAX_SAFE_INTEGER;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    startColors(colors.high, coloredImageHigh);
    startColors(colors.middle, coloredImageMiddle);
    startColors(colors.ground, coloredImageGround);
});

document.addEventListener("keyup", (e) => {
    if (event?.keyCode == 87 || event?.keyCode == 83 || event?.keyCode == 65 || event?.keyCode == 68) {
        if (event?.keyCode == 87) { // W
            camera.pitch -= camera.yOffset;
        }
        if (event?.keyCode === 83) { // S
            camera.pitch += camera.yOffset;
        }
        if (event?.keyCode === 65) { // A;
            camera.yaw += camera.xOffset;
        }
        if (event?.keyCode === 68) { // D
            camera.yaw -= camera.xOffset;
        }
        if (camera.pitch > 89.0) {
            camera.pitch = 89.0;
        }
        if (camera.pitch < -89.0) {
            camera.pitch = -89.0;
        }
        let x =
            Math.cos(degreesToRadians(camera.yaw)) * Math.cos(degreesToRadians(camera.pitch));
        let y = Math.sin(degreesToRadians(camera.pitch));
        let z =
            Math.sin(degreesToRadians(camera.yaw)) * Math.cos(degreesToRadians(camera.pitch));
        camera.direction = [x, y, z];
        modelMatrix = updateCamera(camera.position, camera.direction, camera.upVector, modelMatrix);
        z_render(surf, modelMatrix, shadowMatrix, shadowBuffer, isShadowed);
    }
});

function get_value(surfParams) {
    const size = inputs[0].value;
    if(size <100 || size > 500) {
        alert("Пожалуйста, введите размер массива от 10 до 500");
        return false; 
    }

    const rouhgness = inputs[1].value;
    if(rouhgness <0 || rouhgness > 8) {
        alert("Пожалуйста, введите коэффициент шероховатости от 0 до 8");
        return false; 
    }

    const recursion = inputs[2].value;
    if(recursion <0 || recursion >10) {
        alert("Пожалуйста, введите глубину рекурсии от 0 до 7");
        return false; 
    }

    surfParams.size = +size;
    surfParams.rouhgness = +rouhgness;
    surfParams.recursion = +recursion;

    return true;
}

function setCameraAndLight(size, xPos, yPos, zPos, coeff, posOffset, cameraPosition, lightPosition) {
    camera.xPos = Math.round(size/2);
    camera.yPos = -Math.round(size/4);
    camera.coeff = Math.round(size / maxSize);
    camera.position = [camera.xPos + camera.coeff * camera.posOffset, camera.yPos + camera.coeff * camera.posOffset, camera.zPos + camera.coeff * camera.posOffset];
    light.position = camera.position.slice(0);
}

function start_prog() {
    let res = get_value(surfParams);
    if(res == false) { return; }
    setCameraAndLight(surfParams.size, camera.xPos, camera.yPos, camera.zPos, camera.coeff, camera.posOffset, camera.position, light.position);
    let start = performance.now();
    surf = fractalSurface(surfParams);

    modelMatrix = updateCamera(camera.position, camera.direction, camera.upVector, modelMatrix);
    shadowMatrix = modelMatrix;

    let returns = z_render(surf, modelMatrix, null, null, null);
    shadowBuffer = returns[0];
    isShadowed = returns[1];
    let end = performance.now();
}

colorPickerHigh.addEventListener('input', () => {
    let selectedColor = colorPickerHigh.value;
    const rgb = hexToRgb(selectedColor);
  
    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    const result = solver.solve();

    colors.high = selectedColor;
    coloredImageHigh.style = `${result.filter}`;
});

colorPickerMiddle.addEventListener('input', () => {
    let selectedColor = colorPickerMiddle.value;
    const rgb = hexToRgb(selectedColor);
  
    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    const result = solver.solve();

    colors.middle = selectedColor;
    coloredImageMiddle.style = `${result.filter}`;
});

colorPickerGround.addEventListener('input', () => {
    let selectedColor = colorPickerGround.value;
    const rgb = hexToRgb(selectedColor);
  
    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    const result = solver.solve();

    colors.ground = selectedColor;
    coloredImageGround.style = `${result.filter}`;
});
