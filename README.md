# FreshLife AI

FreshLife AI is a **100% offline, privacy-first, on-device** application that analyzes fruits and vegetables to determine their freshness condition and estimate their remaining shelf life.

## Architecture

This project was intentionally built as a **Fully Local Inference Application** (PWA).
- **No Cloud Backend**: The application does not require any backend servers, serverless functions, or cloud ML hosting (Vercel, Render, AWS, etc.).
- **No API Keys**: The application uses no external services like Gemini. All intelligence is contained locally.
- **On-Device ML**: Inference is performed directly on your hardware (Windows PC, Android) using `onnxruntime-web`.
- **Installable Desktop/Mobile App**: Functions as a Progressive Web App (PWA). It can be installed natively on Windows (via Chrome/Edge) and Android, completely caching its AI models for offline functionality.

## AI Models

The original trained `best.pt` YOLO classification model (and a general vision fallback) were exported to `.onnx` formats optimized for cross-platform offline execution. The original `.pt` files are retained in the `models/` directory for any future training needs.

1. **Primary Model (`best.onnx`)**: Custom-trained classification model that precisely identifies 24 supported fruit and vegetable freshness classes.
2. **Fallback Model (`mobilenet.onnx`)**: A general-purpose vision model for classifying unknown produce.
3. **Shelf-Life Engine**: A lightweight deterministic logic engine running locally in TypeScript that calculates estimated shelf life via model output + temp/humidity variables.

---

## 🚀 Installation & Setup (Windows)

Because FreshLife AI is an offline app, you do **not** need to deploy it to the cloud. You simply install it on your local device.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Python 3](https://www.python.org/) installed

### Step 1: Install
Simply double-click the **`Install-FreshLife.bat`** file in the project folder.
*(This will automatically download the necessary UI packages and compile the offline application).*

### Step 2: Run
Double-click the **`Start-FreshLife.bat`** file.
*(This will start a local server and automatically open the app in your browser).*

### Step 3: Install as a Desktop App
When the app opens in Google Chrome or Microsoft Edge (at `http://localhost:3000`):
1. Look for the **"App available / Install" icon** in the right corner of the address bar.
2. Click **Install**.
3. FreshLife AI will now appear as a native app on your computer, with its own icon in your Start Menu/Taskbar, and **will run completely offline without the terminal!**

---

## Manual Installation (Mac / Linux)

1. Open your terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
2. Start the local static server:
   ```bash
   python3 start.py
   ```
3. Open `http://localhost:3000` in Chrome/Edge and click the "Install App" icon in the URL bar.
