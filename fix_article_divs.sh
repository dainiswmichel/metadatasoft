#!/bin/bash

# Script to fix missing closing div tags in articles
# Author: Claude
# Date: 2025-04-07

# Directory containing the articles
ARTICLES_DIR="/Users/dainismichel/dainisne/da1.fm/blog/articles"

# Function to fix missing closing div tags
fix_closing_divs() {
    local file="$1"
    local backup_file="${file}.bak"
    
    echo "Processing $file"
    
    # Create a backup of the original file
    cp "$file" "$backup_file"
    
    # Check if the file is missing the closing divs
    if ! grep -q "</div>[ ]*</div>[ ]*</div>[ ]*<!-- Right Sidebar" "$file"; then
        # Find where the blog-content div ends
        last_line=$(grep -n "</div>[ ]*$" "$file" | tail -1 | cut -d: -f1)
        
        if [ -n "$last_line" ]; then
            # Add the missing closing divs after the last closing div
            sed -i.tmp "${last_line}a\\
        </div>\\
    </div>\\
\\
    <!-- Right Sidebar Container -->\\
    <div id=\"right-sidebar-container\" class=\"sidebar-dark\"></div>\\
\\
    <!-- Footer Container -->\\
    <div id=\"footer-container\"></div>\\
\\
    <!-- Scripts -->\\
    <!-- Use the blog component loader which handles path resolution automatically -->\\
    <script src=\"../js/component-loader.js\"></script>\\
</body>\\
</html>" "$file"
            
            echo "Successfully fixed closing divs in $file"
            rm "$file.tmp"
            rm "$backup_file"
            return 0
        else
            echo "Could not find appropriate place to add closing divs in $file"
            mv "$backup_file" "$file"
            return 1
        fi
    else
        echo "File already has proper closing divs, no changes needed"
        rm "$backup_file"
        return 0
    fi
}

# Main execution
echo "Starting fix of article HTML structure..."
echo "---------------------------------------------"

# Check if the articles directory exists
if [ ! -d "$ARTICLES_DIR" ]; then
    echo "Error: Articles directory '$ARTICLES_DIR' does not exist"
    exit 1
fi

# Get all HTML files in the articles directory
article_files=("$ARTICLES_DIR"/*.html)

# Skip certain files that shouldn't be processed
skip_files=("$ARTICLES_DIR/tweet-template.html")

# Track success and failure counts
success_count=0
failure_count=0

# Process each article file
for file_path in "${article_files[@]}"; do
    # Check if this file should be skipped
    skip=0
    for skip_file in "${skip_files[@]}"; do
        if [ "$file_path" == "$skip_file" ]; then
            echo "Skipping $file_path"
            skip=1
            break
        fi
    done
    
    if [ $skip -eq 1 ]; then
        continue
    fi
    
    # Fix the closing divs
    if fix_closing_divs "$file_path"; then
        ((success_count++))
    else
        ((failure_count++))
    fi
    
    echo "---------------------------------------------"
done

# Print summary
echo "Update complete!"
echo "Successfully fixed: $success_count articles"
echo "Failed to fix: $failure_count articles"

if [ "$failure_count" -eq 0 ]; then
    exit 0
else
    exit 1
fi