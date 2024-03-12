import { mat4, vec4 } from "gl-matrix";
import { centerX, centerY } from "./main.js";

function sign(x, y, x1, y1, x2, y2) {
    return (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
}

export function foundMaxHeight(mapSurface) {
    let max = 0;
    for (let i = 0; i < mapSurface.length; i++) {
        for (let j = 0; j < mapSurface.length; j++) {
            if(-1 * mapSurface[i][j][1] > max){
                max = -1 * mapSurface[i][j][1];
            }
        }
    }
    return max;
}

export function isPointInTriangle(x, y, dot1, dot2, dot3) {
    const x1 = dot1[0];
    const y1 = dot1[1];
    const x2 = dot2[0];
    const y2 = dot2[1];
    const x3 = dot3[0];
    const y3 = dot3[1];
    const d1 = sign(x, y, x1, y1, x2, y2);
    const d2 = sign(x, y, x2, y2, x3, y3);
    const d3 = sign(x, y, x3, y3, x1, y1);
    const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
    const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(has_neg && has_pos);
}

export function solvePlaneEquation(x, y, dot1, dot2, dot3) {
    const x1 = dot1[0];
    const y1 = dot1[1];
    const z1 = dot1[2];
    const x2 = dot2[0];
    const y2 = dot2[1];
    const z2 = dot2[2];
    const x3 = dot3[0];
    const y3 = dot3[1];
    const z3 = dot3[2];
    const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    if (denominator === 0) {
        return -1.0;
    }
    const u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
    const v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
    const w = 1.0 - u - v;

    const interpolated_depth = u * z1 + v * z2 + w * z3;

    return interpolated_depth;
}

export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function dotProductVectors(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function toCanvas(dot, modelMatrix) {
    // Применяем матрицу проекции к координатам
    const vertex = dot.concat(1);
    const projectedVertex = vec4.create();
    vec4.transformMat4(projectedVertex, vertex, modelMatrix);

    const normlX = projectedVertex[0];
    const normlY = projectedVertex[1];
    const normlZ = projectedVertex[2];

    // Получаем координаты на 2D канвасе
    const canvasX = normlX + centerX;
    const canvasY = normlY + centerY;

    return [Math.round(canvasX), Math.round(canvasY), normlZ];
}

export function toCanvasBack(dot, modelMatrix) {
    const normlX = dot[0] - centerX;
    const normlY = dot[1] - centerY;
    const normlZ = dot[2];
    let inverseTransformedVertex = vec4.fromValues(normlX, normlY, normlZ, 1);

    // Инвертируем матрицу преобразования
    let inverseModelMatrix = mat4.create();
    mat4.invert(inverseModelMatrix, modelMatrix);

    // Применяем обратное преобразование к вектору
    let inverseVertex = vec4.create();
    vec4.transformMat4(inverseVertex, inverseTransformedVertex, inverseModelMatrix);

    // Получаем исходные координаты
    const originalX = inverseVertex[0];
    const originalY = inverseVertex[1];
    const originalZ = inverseVertex[2];

    return [originalX, originalY, originalZ];
}

// Функция для вычисления нормали к плоскости через три точки
export function calculateNormalVector(point1, point2, point3) {
    var u = [point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]];
    var v = [point3[0] - point1[0], point3[1] - point1[1], point3[2] - point1[2]];

    // Векторное произведение u и v
    return [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
}

export function arePointsCollinear(point1, point2, point3, epsilon) {
    const area = 0.5 * (
        (point1[0] * (point2[1] - point3[1])) +
        (point2[0] * (point3[1] - point1[1])) +
        (point3[0] * (point1[1] - point2[1]))
    );

    return Math.abs(area) < epsilon;
}

export function getEpsilon(size, recursion) {
    if(size <= 100){
        if(recursion <= 3) {
            return 6;
        }
        if(recursion <= 5) {
            return 2;
        }
        if(recursion <= 7) {
            return 1e-2;
        }
    }
    if(size > 100 && size <= 200){
        if(recursion <= 2) {
            return 25;
        }
        if(recursion <= 3) {
            return 25;
        }
        if(recursion <= 5) {
            return 10;
        }
        if(recursion <= 7) {
            return 1e-2;
        }
    }
    if(size > 200 && size <= 300){
        if(recursion <= 3) {
            return 40;
        }
        if(recursion <= 5) {
            return 20;
        }
        if(recursion <= 7) {
            return 2;
        }
    }
    if(size > 300 && size <= 400){
        if(recursion <= 3) {
            return 70;
        }
        if(recursion <= 5) {
            return 40;
        }
        if(recursion <= 7) {
            return 2;
        }
    }
    if(size > 400 && size <= 500){
        if(recursion <= 3) {
            return 100;
        }
        if(recursion <= 5) {
            return 60;
        }
        if(recursion <= 7) {
            return 5;
        }
    }
}