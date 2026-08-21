# FreshLife AI

FreshLife AI is a **100% offline, privacy-first, on-device** application that analyzes fruits and vegetables to determine their freshness condition and estimate their remaining shelf life.

## Architecture

This project was intentionally redesigned as a **Fully Local Inference Application** (PWA).
- **No Cloud Backend**: The application does not require any backend servers, serverless functions, or cloud ML hosting (Vercel, Render, AWS, etc.).
- **No API Keys**: The application uses no external services like Gemini. All intelligence is contained locally.
- **On-Device ML**: Inference is performed directly on the user's hardware (Windows PC, Android) using `onnxruntime-web`.
- **Installable**: Functions as a Progressive Web App (PWA). It can be installed as a native-feeling app on Windows (via Chrome/Edge) and Android, completely caching its AI models for offline functionality.

## AI Models

The original trained `best.pt` YOLO classification model (and a general vision fallback) were exported to `.onnx` formats optimized for cross-platform deployment. The original `.pt` files are still retained in the `models/` directory for any future backend/training needs.

1. **Primary Model (`best.onnx`)**: Custom-trained classification model that precisely identifies 24 supported fruit and vegetable freshness classes.
2. **Fallback Model (`mobilenet.onnx`)**: A general-purpose vision model for classifying unknown produce (alerts the user if training data is insufficient).
3. **Shelf-Life Engine**: A lightweight deterministic logic engine running locally in TypeScript that calculates estimated shelf life via model output + temp/humidity variables.

## Setup & Running Locally

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the local server:
   ```bash
   python start.py
   ```
   
   *This script will automatically build the static Next.js frontend (`frontend/out`) and serve it locally on port 3000.*

## Deployment / Installation

To "deploy" this to your own devices:
1. Run `python start.py` to start the local server.
2. Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. Look for the **"App available / Install" icon** in the right corner of the address bar.
4. Click **Install**. FreshLife AI will now be available as a standalone desktop/mobile app and will run entirely offline!
