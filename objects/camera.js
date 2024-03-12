import { mat4 } from "gl-matrix";

export let camera = {
    xPos: 0,
    yPos: 0,
    zPos: 100,
    posOffset: 10,
    coeff: 0,
    position: [],
    direction: [0, 0, 1],
    upVector: [0, 1, 0],
    xOffset: 10,
    yOffset: 10,
    yaw: 90.0,
    pitch: 0.0,
};

export function updateCamera(cameraPosition, cameraDirection, upVector, modelMatrix) {
    let cameraVector = cameraDirection.map((item, index) => {
        return cameraPosition[index] - item;
    });

    let viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, cameraPosition, cameraVector, upVector);

    let projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, -1, 1, -1, 1, 0.1, 100);

    modelMatrix = mat4.create();
    mat4.multiply(modelMatrix, projectionMatrix, viewMatrix);

    return modelMatrix;
}