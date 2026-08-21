# FreshLife AI (Flutter Version)

FreshLife AI is a **100% offline, privacy-first, on-device** application that analyzes fruits and vegetables to determine their freshness condition and estimate their remaining shelf life. 

It has been entirely re-architected in **Flutter** to provide proper native `.exe` and `.apk` applications for Windows and Android, requiring absolutely zero web wrappers (like Electron or Capacitor), zero Node.js dependencies, and zero Python servers.

## Architecture
- **Framework:** Flutter (Dart)
- **No Web Technologies**: No Next.js, No Node.js, No Vercel, No Electron. 
- **No Cloud Backend**: The application does not require any backend servers or cloud ML hosting.
- **On-Device ML**: Inference is performed natively on your hardware using the Dart `onnxruntime` bindings.
- **Packaged Models**: The `.onnx` models (`best.onnx` and `mobilenet.onnx`) are bundled securely inside the app's native assets.

## AI Models
The original trained `best.pt` YOLO classification model (and a general vision fallback) were exported to `.onnx` format and placed inside `app/assets/models/`. 

1. **Primary Model (`best.onnx`)**: Custom-trained classification model that precisely identifies 24 supported fruit and vegetable freshness classes.
2. **Fallback Model (`mobilenet.onnx`)**: A general-purpose vision model for classifying unknown produce.
3. **Shelf-Life Engine**: A lightweight logic engine running locally in Dart that calculates estimated shelf life via model output + temp/humidity variables.

---

## 🛠️ Building the Apps

Because the frontend is entirely written in Flutter, you will need the Flutter SDK installed on your machine.

### Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.

### Build Instructions

1. Open your terminal and navigate to the `app` folder:
   ```bash
   cd app
   ```
2. Fetch the Flutter packages (like `onnxruntime` and `image_picker`):
   ```bash
   flutter pub get
   ```

**To build the Windows Desktop App (.exe):**
```bash
flutter build windows
```
*(Your native Windows `.exe` will be generated in `app/build/windows/runner/Release/`)*

**To build the Android App (.apk):**
```bash
flutter build apk
```
*(Your native Android `.apk` will be generated in `app/build/app/outputs/flutter-apk/app-release.apk`)*

You can now easily distribute these native, extremely lightweight, fully offline applications to consumers!
