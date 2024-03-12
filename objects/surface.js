import { foundMaxHeight } from "../drawScene/math.js";
import { colors, getRandomShade } from "../drawScene/color.js";

export function test_cube() {
    let dots = [
        [-50, -50, -50],
        [50, -50, -50],
        [50, 50, -50],
        [-50, 50, -50],
        [-50, -50, 50],
        [50, -50, 50],
        [50, 50, 50],
        [-50, 50, 50],
    ];
    let triangle = [
        [0, 1, 2, "#808080"],
        [0, 2, 3, "#FF0000"],
        [4, 7, 6, "#800000"],
        [4, 6, 5, "#FFFF00"],
        [0, 4, 5, "#FF00FF"],
        [0, 5, 1, "#800080"],
        [1, 5, 6, "#808000"],
        [1, 6, 2, "#00FF00"],
        [2, 6, 7, "#008000"],
        [2, 7, 3, "#00FFFF"],
        [4, 0, 3, "#008080"],
        [4, 3, 7, "#0000FF"],
    ];

    return [dots, triangle];
}

function randomInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randY(vertexes, rouhgness, side) {
    let sum = 0;
    for (let i = 0; i < vertexes.length; i++) {
        sum += vertexes[i][1];
    }
    let rand = randomInclusive(0, -rouhgness * side/2);
    
    return sum / vertexes.length + rand;
}

function index(i, j, n) {
    return i * n + j;
}

function countColor (vertexes, highLevel) {
    let countOfNulls = vertexes.reduce((acum, value) => value[1] == 0 ? acum + 1 : acum + 0, 0);
    if(countOfNulls > 1) {
        return getRandomShade(colors.ground);
    } else if(countOfNulls == 1 || Math.max(-1 *vertexes[0][1], -1*vertexes[1][1], -1*vertexes[2][1]) < highLevel) {
        return getRandomShade(colors.middle);
    } else {
        return getRandomShade(colors.high);
    }
}

function makeObjectForm(mapSurface, maxHeight) {
    let len = mapSurface.length;
    let highLevel = 3/4 * maxHeight;
    let lenTriangle = (len - 1) ** 2 * 2;
    let triangle = new Array(lenTriangle);
    let k = 0;
    for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len; j++) {
            let vertexes = [];
            let color = '';
            if (j !== len - 1) {
                vertexes.push(
                    mapSurface[i][j],
                    mapSurface[i][j + 1],
                    mapSurface[i + 1][j]
                );
                color = countColor(vertexes, highLevel);
                triangle[k] = [index(i, j, len), index(i, j + 1, len), index(i + 1, j, len), color];
                vertexes = [];
                k++;
            }
            if (j !== 0) {
                vertexes.push(
                    mapSurface[i][j],
                    mapSurface[i + 1][j - 1],
                    mapSurface[i + 1][j]
                );
                color = countColor(vertexes, highLevel);
                triangle[k] = [index(i, j, len), index(i+1, j - 1, len), index(i + 1, j, len), color];
                k++;
            }
        }
    }
    let dots = [];
    for (let i = 0; i < len; i++){
        dots = dots.concat(mapSurface[i]); 
    }

    return [dots, triangle];
}

export function fractalSurface(surfParams) {
    let dots = 2 ** surfParams.recursion + 1;
    let step = Math.round(surfParams.size / (dots-1));

    let mapSurface = [];

    for (let i = 0; i < dots; i++) {
        mapSurface[i] = [];
        for (let j = 0; j < dots; j++) {
            mapSurface[i][j] = [step * j, 0, step * i];
        }
    }

    let depth = 0;
    let tempDot = dots - 1;
    while (depth != surfParams.recursion) {
        tempDot = Math.round(tempDot/2);
        mapSurface = diamondSquare(
            mapSurface,
            surfParams.rouhgness,
            tempDot,
            step * tempDot
        );
        depth++;
    }
    let maxHeight = foundMaxHeight(mapSurface);
    let objectForm = makeObjectForm(mapSurface, maxHeight);

    return objectForm;
}

function diamondSquare(mapSurface, rouhgness, tempDot, side) {
    const len = mapSurface.length;
    // Diamond
    const diamondStep = tempDot * 2;
    for (let i = tempDot; i < len; i += diamondStep) {
        for (let j = tempDot; j < len; j += diamondStep) {

            mapSurface[i][j][1] = randY(
                [
                    mapSurface[i - tempDot][j - tempDot],
                    mapSurface[i + tempDot][j - tempDot],
                    mapSurface[i - tempDot][j + tempDot],
                    mapSurface[i + tempDot][j + tempDot],
                ],
                rouhgness,
                side
            );  
        }
    }
    // Square
    for (let i = 0; i < len; i += tempDot) {
        for (let j = 0; j < len; j += tempDot) {
            if (i != 0 && j != 0 && i != len - 1 && j != len - 1 && mapSurface[i][j][1] === 0) {
                mapSurface[i][j][1] = randY(
                    [
                        mapSurface[i - tempDot][j],
                        mapSurface[i + tempDot][j],
                        mapSurface[i][j - tempDot],
                        mapSurface[i][j + tempDot],
                    ],
                    rouhgness,
                    side
                );
            }
        }
    }

    return mapSurface;
}
