# FreshLife AI Dataset

## Overview
The dataset contains 14,160 images of 8 types of produce, classified into 3 freshness conditions.

**Path**: `data/raw/Processed Data/Processed Data/`

## Classes
- **Fruits**: Banana, Orange, Papaya, Pineapple
- **Vegetables**: Bittermelon, Cucumber, Eggplant, Tomato

## Conditions
- **Fresh**: Recently harvested, optimal condition.
- **Semi-Fresh**: Beginning to show signs of aging but still consumable.
- **Rotten**: Spoiled, unsafe for consumption.

## Data Augmentation & Leakage Prevention
The raw dataset contains heavily augmented images (prefixed with `aug_`).
To prevent data leakage, the custom `ml.data.splitter` explicitly groups augmented images with their original source images before performing a 70/15/15 (Train/Val/Test) split. MD5 hashing ensures no cross-contamination between splits.

## Labels & Shelf Life
Labels are extracted directly from the folder names using regex. The folders encode the ground-truth shelf-life ranges for that specific produce and condition (e.g., `Fresh Banana(1-4)`).

## Audit & Cleaning
The `ml.data.audit` script performs:
1. Integrity checks (detecting corrupted images).
2. MD5 exact duplicate detection.
3. Perceptual hashing (pHash) for near-duplicate detection.
The `ml.data.cleaner` moves corrupted images to a quarantine folder, preserving the original dataset structure.
