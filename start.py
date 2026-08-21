#!/usr/bin/env python3
"""
FreshLife AI - Local Offline App Server

This script serves the static Next.js PWA locally.
Run this script, open http://localhost:3000 in Chrome/Edge, 
and click "Install App" to install it as a standalone local application!
"""
import os
import sys
import subprocess
import http.server
import socketserver
import webbrowser
import time

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
OUT_DIR = os.path.join(FRONTEND_DIR, "out")

PORT = 3000

class SPA_RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve the requested file if it exists
        path = self.translate_path(self.path)
        if os.path.exists(path) and not os.path.isdir(path):
            super().do_GET()
        else:
            # Fallback to index.html for client-side routing
            self.path = '/index.html'
            super().do_GET()

def build_app():
    print("=" * 60)
    print("       Building FreshLife AI (Local App)")
    print("=" * 60)
    print("Building Next.js static export...")
    try:
        subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR, shell=True, check=True)
    except subprocess.CalledProcessError:
        print("⚠️ Build failed. Ensure you ran 'npm install' in the frontend folder.")
        sys.exit(1)

def serve_app():
    if not os.path.exists(OUT_DIR):
        print(f"⚠️ App not built yet. Building now...")
        build_app()

    print("=" * 60)
    print("       FreshLife AI Local Inference Server")
    print("=" * 60)
    
    os.chdir(OUT_DIR)
    
    with socketserver.TCPServer(("", PORT), SPA_RequestHandler) as httpd:
        print(f"\n🚀 App is running at: http://localhost:{PORT}")
        print("\n💡 TIP: Open the URL in Chrome or Edge, and click the 'Install App' icon")
        print("        in the URL bar to install FreshLife AI as a native desktop/mobile app!")
        print("\nPress Ctrl+C to stop.")
        
        # Open browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    serve_app()
