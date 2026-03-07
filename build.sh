#!/bin/bash
# build.sh - Concatenate CSS and JS for production deployment
# Usage: ./build.sh
# Creates dist/ directory with optimized files

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

echo "Building PRAYED for production..."

# Clean dist
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/css" "$DIST_DIR/js" "$DIST_DIR/img" "$DIST_DIR/data/prayers"

# Concatenate CSS (order matters for specificity)
echo "  Concatenating CSS..."
cat \
  "$SCRIPT_DIR/css/variables.css" \
  "$SCRIPT_DIR/css/base.css" \
  "$SCRIPT_DIR/css/components.css" \
  "$SCRIPT_DIR/css/screens.css" \
  "$SCRIPT_DIR/css/bible.css" \
  "$SCRIPT_DIR/css/dark-mode.css" \
  > "$DIST_DIR/css/styles.css"

# Concatenate JS (order matters for dependencies)
echo "  Concatenating JS..."
cat \
  "$SCRIPT_DIR/js/imgmap-generated.js" \
  "$SCRIPT_DIR/js/config.js" \
  "$SCRIPT_DIR/js/weather.js" \
  "$SCRIPT_DIR/js/places.js" \
  "$SCRIPT_DIR/js/ui.js" \
  "$SCRIPT_DIR/js/auth.js" \
  "$SCRIPT_DIR/js/habits.js" \
  "$SCRIPT_DIR/js/home.js" \
  "$SCRIPT_DIR/js/pray.js" \
  "$SCRIPT_DIR/js/circles.js" \
  "$SCRIPT_DIR/js/bible.js" \
  "$SCRIPT_DIR/js/profile.js" \
  "$SCRIPT_DIR/js/app.js" \
  > "$DIST_DIR/js/app.js"

# Copy static assets
echo "  Copying assets..."
cp -r "$SCRIPT_DIR/img/" "$DIST_DIR/img/"
cp -r "$SCRIPT_DIR/data/" "$DIST_DIR/data/"
cp "$SCRIPT_DIR/index.html" "$DIST_DIR/"
cp "$SCRIPT_DIR/manifest.json" "$DIST_DIR/"

# Calculate sizes
CSS_SIZE=$(wc -c < "$DIST_DIR/css/styles.css")
JS_SIZE=$(wc -c < "$DIST_DIR/js/app.js")
IMG_COUNT=$(find "$DIST_DIR/img" -type f | wc -l)

echo ""
echo "Build complete!"
echo "  CSS: $(echo "scale=1; $CSS_SIZE/1024" | bc) KB"
echo "  JS:  $(echo "scale=1; $JS_SIZE/1024" | bc) KB"
echo "  Images: $IMG_COUNT files"
echo "  Output: $DIST_DIR/"
