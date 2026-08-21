# FreshLife AI (Local Desktop & Mobile App)

FreshLife AI is a **100% offline, privacy-first, on-device** application that analyzes fruits and vegetables to determine their freshness condition and estimate their remaining shelf life.

This repository contains the source code to build a **Windows `.exe` installer** and an **Android `.apk` installer**.

## Architecture
- **Framework:** Next.js (Static Export), wrapped in Electron (Windows) and Capacitor (Android).
- **No Cloud Backend**: The application does not require any backend servers, serverless functions, or cloud ML hosting.
- **On-Device ML**: Inference is performed directly on your hardware using `onnxruntime-web` with WebAssembly (WASM).
- **Packaged Models**: The `.onnx` models (`best.onnx` and `mobilenet.onnx`) are compiled directly into the application.

---

## 🖥️ Building for Windows (FreshLife-AI-Setup.exe)

You can build the Windows installer directly from this repository using Node.js and Electron Builder.

### Requirements
- [Node.js](https://nodejs.org/) installed

### Build Instructions
1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Build the Next.js static files and compile the `.exe` installer:
   ```bash
   npm run build
   npm run electron:build
   ```
4. Once completed, your installer will be located at:
   **`frontend/dist/FreshLife AI Setup 1.0.0.exe`**

You can send this `.exe` file to anyone, and they can install and run the app completely offline!

---

## 📱 Building for Android (FreshLife-AI.apk)

The Android app is powered by Capacitor, which wraps the exact same web code and AI models into a native Android application.

### Requirements
- [Node.js](https://nodejs.org/) installed
- [Android Studio](https://developer.android.com/studio) installed

### Build Instructions
1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Sync your web code to the Android project:
   ```bash
   npx cap sync
   ```
3. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```
4. Inside Android Studio:
   - Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Once it finishes, a small popup will appear in the bottom right. Click **locate** to find your compiled `.apk`.
   
You can transfer this `.apk` file to any Android device to install and run the AI completely offline!
