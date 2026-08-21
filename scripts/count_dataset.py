"""Quick dataset inspection script."""
import os
from collections import defaultdict

base = r"d:\Fruit freshness & shelflife tracker\data\raw\Processed Data\Processed Data"

total_files = 0
total_aug = 0
results = []

for d in sorted(os.listdir(base)):
    folder_path = os.path.join(base, d)
    if not os.path.isdir(folder_path):
        continue
    files = os.listdir(folder_path)
    n_files = len(files)
    n_aug = sum(1 for f in files if f.lower().startswith("aug_"))
    
    # Get extensions
    exts = defaultdict(int)
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        exts[ext] += 1
    
    # Sample files
    samples = files[:3]
    
    total_files += n_files
    total_aug += n_aug
    
    ext_str = ", ".join(f"{e}:{c}" for e, c in sorted(exts.items()))
    print(f"{d:45s} | {n_files:5d} files | {n_aug:5d} aug | {ext_str}")

print(f"\n{'TOTAL':45s} | {total_files:5d} files | {total_aug:5d} augmented")
print(f"\nFolders: {len([d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))])}")
