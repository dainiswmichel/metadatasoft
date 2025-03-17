#!/bin/bash

# Configuration
PROJECT_DIR="/Users/dainismichel/dainisne"

echo "Scanning for Google dependencies in $PROJECT_DIR..."

# Scan HTML files for Google references
echo
echo "==== HTML Files with Google references ===="
grep -r --include="*.html" "google\|googleapis\|gstatic" "$PROJECT_DIR" || echo "None found"

# Scan JavaScript files for Google references
echo
echo "==== JavaScript Files with Google references ===="
grep -r --include="*.js" "google\|googleapis\|gstatic" "$PROJECT_DIR" || echo "None found"

# Scan CSS files for Google references
echo
echo "==== CSS Files with Google references ===="
grep -r --include="*.css" "google\|googleapis\|gstatic" "$PROJECT_DIR" || echo "None found"

# Scan package.json for Google dependencies
echo
echo "==== Package dependencies with Google references ===="
find "$PROJECT_DIR" -name "package.json" -exec grep -l "google" {} \; | 
while read file; do
    echo "Found in $file:"
    cat "$file" | grep -n -A2 -B2 "google"
done || echo "None found"

echo
echo "==== Search engine optimization suggestions ===="
echo "1. Consider adding meta tags for DuckDuckGo, Bing, etc. in your HTML:"
echo "   <meta name=\"ddg:find\" content=\"relevant keywords\" />"
echo "   <meta name=\"msnbot\" content=\"index,follow\" />"
echo
echo "2. Register your site with alternative search engines:"
echo "   - Bing Webmaster Tools: https://www.bing.com/webmasters"
echo "   - Yandex Webmaster: https://webmaster.yandex.com"
echo "   - DuckDuckGo: https://duck.co/help/results/submit"
echo
echo "3. Create and submit a sitemap.xml to these search engines"