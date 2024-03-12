import { isPointInTriangle, solvePlaneEquation, calculateNormalVector, toCanvas, toCanvasBack, arePointsCollinear, getEpsilon } from "./math.js";
import { width, height, ctx, surfParams } from "./main.js";
import { light, calculateLambertianIntensity, applyLighting } from "../objects/light.js";

export function z_render(object, modelMatrix, shadowMatrix, shadowBuffer, isShadowed) {
  let z_buffer = []; // Инициализация буферов
  let shot_buffer = [];
  for (let i = 0; i < height; i++) {
    z_buffer[i] = [];
    shot_buffer[i] = [];
    for (let j = 0; j < width; j++) {
      z_buffer[i][j] = Number.MAX_SAFE_INTEGER;
      shot_buffer[i][j] = "#FFFFFF";
    }
  }

  let dots = object[0]; // Преобразование к растровым координатам
  let canvas_dots = [];
  let shadow_canvas_dots = []; 
  for (let i = 0; i < dots.length; i++) {
    canvas_dots[i] = toCanvas(dots[i], modelMatrix);
    if (shadowMatrix != null) {
      shadow_canvas_dots[i] = toCanvas(dots[i], shadowMatrix);
    }
  }
  let isLine = [];

  let epsilon = getEpsilon(surfParams.size, surfParams.recursion);
  let surfaces = object[1]; // Заполнение буферов
  for (let i = 0; i < surfaces.length; i++) {
    // Получаем минимальные и максимальные координаты вершин треугольника (грани)
    const minX = Math.min(
      canvas_dots[surfaces[i][0]][0],
      Math.min(canvas_dots[surfaces[i][1]][0], canvas_dots[surfaces[i][2]][0])
    );
    const maxX = Math.max(
      canvas_dots[surfaces[i][0]][0],
      Math.max(canvas_dots[surfaces[i][1]][0], canvas_dots[surfaces[i][2]][0])
    );
    const minY = Math.min(
      canvas_dots[surfaces[i][0]][1],
      Math.min(canvas_dots[surfaces[i][1]][1], canvas_dots[surfaces[i][2]][1])
    );
    const maxY = Math.max(
      canvas_dots[surfaces[i][0]][1],
      Math.max(canvas_dots[surfaces[i][1]][1], canvas_dots[surfaces[i][2]][1])
    );
    isLine[i] = arePointsCollinear(canvas_dots[surfaces[i][0]], canvas_dots[surfaces[i][1]], canvas_dots[surfaces[i][2]], epsilon);

    let normal = calculateNormalVector(object[0][surfaces[i][0]], object[0][surfaces[i][1]], object[0][surfaces[i][2]]);
    // Проходим каждый пиксель на canvas
    for (let y = minY; y <= maxY && y <= height && y >= 0; y++) {
      for (let x = minX; x <= maxX && x <= width && x >= 0; x++) {
        // Проверяем, находится ли пиксель внутри треугольника
        if (isPointInTriangle(x, y, canvas_dots[surfaces[i][0]], canvas_dots[surfaces[i][1]], canvas_dots[surfaces[i][2]])) {
          // Проверяем z у точки
          const depthZ = solvePlaneEquation(x, y, canvas_dots[surfaces[i][0]], canvas_dots[surfaces[i][1]], canvas_dots[surfaces[i][2]]);
          if (z_buffer[y][x] - depthZ > 1e-15) {
            z_buffer[y][x] = depthZ;
            let intensity = calculateLambertianIntensity(normal, light.direction, light.intensity, light.diffuseCoefficient);
            let inShadow = false;
            if (shadowMatrix != null) {
              if (isShadowed[i]) {
                inShadow = true;
              } else {
                let pixelCoords = toCanvasBack([x, y, depthZ], modelMatrix);

                let lightPoint = toCanvas(pixelCoords, shadowMatrix);
                const shadowDepthZ = solvePlaneEquation(lightPoint[0], lightPoint[1], shadow_canvas_dots[surfaces[i][0]], shadow_canvas_dots[surfaces[i][1]], shadow_canvas_dots[surfaces[i][2]]);
                let shadowMinDepth = shadowBuffer[lightPoint[1]][lightPoint[0]];
                inShadow = (shadowDepthZ - shadowMinDepth) > 1e-17;
              }
            }
            shot_buffer[y][x] = applyLighting(intensity, surfaces[i][3], inShadow, light.intensity);
          }
        }
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (shot_buffer[y][x] != "#FFFFFF") {
        ctx.fillStyle = shot_buffer[y][x];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return [z_buffer, isLine];
}

