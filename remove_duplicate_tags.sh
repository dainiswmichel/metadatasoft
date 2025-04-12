#!/bin/bash

# Script to remove duplicate tags section from bottom of article files
# Author: Claude
# Date: 2025-04-07

# Directory containing the articles
ARTICLES_DIR="/Users/dainismichel/dainisne/da1.fm/blog/articles"

# Function to remove the tag section from an article file
remove_tags_section() {
    local file="$1"
    local backup_file="${file}.bak"
    
    echo "Processing $file"
    
    # Create a backup of the original file
    cp "$file" "$backup_file"
    
    # Use awk to remove the bottom tags section
    # This searches for the tag section div and removes it and all contained lines
    awk '
    BEGIN { print_line = 1; tag_section_found = 0; }
    /<!-- Article Tags|<div class="blog-post-tags">/ { 
        tag_section_found = 1; 
        print_line = 0; 
    }
    /^<\/div>/ { 
        if (tag_section_found == 1) {
            tag_section_found = 0;
            next;
        }
    }
    { if (print_line) print $0; }
    /^<\/div>/ { 
        if (tag_section_found == 0) {
            print_line = 1;
        }
    }
    ' "$backup_file" > "$file"
    
    # Check if the file was modified
    if diff -q "$file" "$backup_file" > /dev/null; then
        echo "No changes made to $file"
        rm "$backup_file"
        return 1
    else
        echo "Successfully removed tag section from $file"
        rm "$backup_file"
        return 0
    fi
}

# Main execution
echo "Starting removal of duplicate tag sections..."
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
    
    # Remove the tag section
    if remove_tags_section "$file_path"; then
        ((success_count++))
    else
        ((failure_count++))
    fi
    
    echo "---------------------------------------------"
done

# Print summary
echo "Update complete!"
echo "Successfully updated: $success_count articles"
echo "Failed to update: $failure_count articles"

if [ "$failure_count" -eq 0 ]; then
    exit 0
else
    exit 1
fi