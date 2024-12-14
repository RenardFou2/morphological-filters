"use client";

import React, { useRef, useState } from 'react';

const ImageProcessor = () => {
  const [filter, setFilter] = useState('dilation');
  const [structuringElement, setStructuringElement] = useState([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]);

  const canvasRef = useRef(null);
  const resultCanvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const applyDilation = (pixels, width, height, structuringElement) => {
    const result = new Uint8ClampedArray(pixels);
  
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let max = 0;
  
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const pixelIndex = ((y + i) * width + (x + j)) * 4; // RGBA
            if (structuringElement[i + 1][j + 1] === 1) {
              max = Math.max(max, pixels[pixelIndex]);
            }
          }
        }
  
        const pixelIndex = (y * width + x) * 4;
        result[pixelIndex] = max; // Red channel
        result[pixelIndex + 1] = max; // Green channel
        result[pixelIndex + 2] = max; // Blue channel
      }
    }
  
    return result;
  };

  const applyErosion = (pixels, width, height, structuringElement) => {
    const result = new Uint8ClampedArray(pixels);
  
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let min = 255;
  
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const pixelIndex = ((y + i) * width + (x + j)) * 4; // RGBA
            if (structuringElement[i + 1][j + 1] === 1) {
              min = Math.min(min, pixels[pixelIndex]);
            }
          }
        }
  
        const pixelIndex = (y * width + x) * 4;
        result[pixelIndex] = min; // Red channel
        result[pixelIndex + 1] = min; // Green channel
        result[pixelIndex + 2] = min; // Blue channel
      }
    }
  
    return result;
  };

  const applyOpening = (pixels, width, height, structuringElement) => {
    const eroded = applyErosion(pixels, width, height, structuringElement);
    return applyDilation(eroded, width, height, structuringElement);
  };
  
  const applyClosing = (pixels, width, height, structuringElement) => {
    const dilated = applyDilation(pixels, width, height, structuringElement);
    return applyErosion(dilated, width, height, structuringElement);
  };
  

  const applyFilter = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const { width, height, data } = imageData;

    // Wybierz odpowiedni filtr
    let resultPixels;
    if (filter === 'dilation') {
      resultPixels = applyDilation(data, width, height, structuringElement);
    } else if (filter === 'erosion') {
      resultPixels = applyErosion(data, width, height, structuringElement);
    } else if (filter === 'opening') {
      resultPixels = applyOpening(data, width, height, structuringElement);
    } else if (filter === 'closing') {
      resultPixels = applyClosing(data, width, height, structuringElement);
    }

    // Wyświetl wynik w drugim canvasie
    const resultCanvas = resultCanvasRef.current;
    const resultCtx = resultCanvas.getContext('2d');
    resultCanvas.width = width;
    resultCanvas.height = height;

    const resultImageData = new ImageData(resultPixels, width, height);
    resultCtx.putImageData(resultImageData, 0, 0);
  };

  return (
    <div>
      <h1>Filtry morfologiczne</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div>
        <label>
          Filtr:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="dilation">Dylatacja</option>
            <option value="erosion">Erozja</option>
            <option value="opening">Otwarcie</option>
            <option value="closing">Zamknięcie</option>
            <option value="hit-or-miss">Hit-or-Miss</option>
          </select>
        </label>
      </div>
      <button onClick={applyFilter}>Zastosuj filtr</button>
      <div>
        <h3>Oryginalny obraz</h3>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div>
        <h3>Wynikowy obraz</h3>
        <canvas ref={resultCanvasRef}></canvas>
      </div>
    </div>
  );
};

export default ImageProcessor;
