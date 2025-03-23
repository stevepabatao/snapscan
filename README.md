# SnapScan - Film Negative Scanner App

<p align="center">
  <img src="https://github.com/yourusername/snapscan/raw/main/public/logo.png" alt="SnapScan Logo" width="200" />
</p>

<p align="center">
  A web-based application for converting 35mm film negatives into digital positive images using your smartphone camera.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#technical-architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Overview

SnapScan is a progressive web application that transforms your smartphone into a powerful film scanner. It allows photographers to quickly digitize 35mm film negatives with professional-quality results, all without expensive scanning equipment.

The app uses advanced image processing algorithms to convert film negatives into positive images, with specialized handling for different film types including color negative, black & white, and slide/positive films.

## Features

### Scanning Capabilities
- **Real-time camera preview** with film frame guides
- **Support for all 35mm film types**:
  - Color negative (C-41 process)
  - Black & white negative
  - Slide/positive film (E-6 process)
- **Flash control** for low-light scanning
- **Automatic negative-to-positive conversion**

### Image Processing
- **Advanced negative inversion algorithm** with orange mask compensation
- **Green cast removal** for more natural colors
- **AI-powered enhancement** using TensorFlow.js for natural-looking results
- **Auto white balance** and levels adjustment
- **Custom color balance controls** (Red, Green, Blue)
- **Basic image adjustments**:
  - Brightness
  - Contrast
  - Saturation

### Image Manipulation
- **Interactive cropping** with drag handles
- **Image rotation** (90°)
- **Horizontal flip**
- **One-click auto-enhance**

### Storage and Export
- **Local storage** using IndexedDB
- **Image download** functionality
- **Gallery view** for managing saved scans

## Demo

<p align="center">
  <img src="https://github.com/yourusername/snapscan/raw/main/docs/demo.gif" alt="SnapScan Demo" width="600" />
</p>

## Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snapscan.git
cd snapscan