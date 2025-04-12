#!/bin/bash

# Directory containing the articles
ARTICLES_DIR="/Users/dainismichel/dainisne/da1.fm/blog/articles"

# Create the schedule data - array of dates
declare -a DATES=(
    "2025-03-27T09:15:00Z"
    "2025-03-27T14:42:00Z"
    "2025-03-28T10:30:00Z"
    "2025-03-29T08:45:00Z"
    "2025-03-29T16:20:00Z"
    "2025-03-30T11:05:00Z"
    "2025-03-31T09:30:00Z"
    "2025-03-31T13:15:00Z"
    "2025-04-01T10:50:00Z"
    "2025-04-02T08:22:00Z"
    "2025-04-02T15:40:00Z"
    "2025-04-03T12:10:00Z"
    "2025-04-04T09:45:00Z"
    "2025-04-04T14:30:00Z"
    "2025-04-05T11:20:00Z"
    "2025-04-06T10:05:00Z"
    "2025-04-06T16:45:00Z"
    "2025-04-07T09:10:00Z"
    "2025-04-07T13:50:00Z"
    "2025-04-08T08:30:00Z"
    "2025-04-09T12:15:00Z"
    "2025-04-09T16:05:00Z"
    "2025-04-10T10:40:00Z"
    "2025-04-10T15:25:00Z"
    "2025-04-11T09:00:00Z"
    "2025-04-12T11:35:00Z"
    "2025-04-12T14:55:00Z"
    "2025-04-13T10:20:00Z"
    "2025-04-13T15:10:00Z"
    "2025-04-14T08:55:00Z"
    "2025-04-15T12:30:00Z"
    "2025-04-15T16:15:00Z"
    "2025-04-16T09:25:00Z"
    "2025-04-16T14:40:00Z"
    "2025-04-17T11:00:00Z"
    "2025-04-18T08:15:00Z"
    "2025-04-18T13:45:00Z"
    "2025-04-19T10:30:00Z"
    "2025-04-19T15:20:00Z"
    "2025-04-20T09:50:00Z"
    "2025-04-21T12:05:00Z"
    "2025-04-21T16:35:00Z"
    "2025-04-22T08:40:00Z"
    "2025-04-22T13:25:00Z"
    "2025-04-23T11:15:00Z"
    "2025-04-24T09:35:00Z"
    "2025-04-24T14:50:00Z"
    "2025-04-25T10:10:00Z"
    "2025-04-25T15:55:00Z"
    "2025-04-26T08:20:00Z"
    "2025-04-27T12:45:00Z"
    "2025-04-27T16:30:00Z"
    "2025-04-28T09:05:00Z"
    "2025-04-28T14:00:00Z"
    "2025-04-29T10:25:00Z"
    "2025-04-30T08:50:00Z"
    "2025-04-30T13:35:00Z"
    "2025-05-01T11:10:00Z"
    "2025-05-01T15:45:00Z"
    "2025-05-02T09:20:00Z"
)

# Function to update metadata dates in a file
update_metadata_dates() {
    local file="$1"
    local date="$2"
    local backup_file="${file}.bak"
    
    echo "Updating $file with date $date"
    
    # Create a backup of the original file
    cp "$file" "$backup_file"
    
    # Use awk to properly handle the JSON structure
    awk -v new_date="$date" '
    /publishedDate/ {
        split($0, parts, "\"publishedDate\":");
        split(parts[2], date_parts, ",");
        gsub(/^[ \t]*"/, "\"", date_parts[1]);
        print parts[1] "\"publishedDate\": \"" new_date "\"" date_parts[2] ",";
        next;
    }
    /modifiedDate/ {
        split($0, parts, "\"modifiedDate\":");
        split(parts[2], date_parts, ",");
        gsub(/^[ \t]*"/, "\"", date_parts[1]);
        print parts[1] "\"modifiedDate\": \"" new_date "\"" date_parts[2] ",";
        next;
    }
    {print}
    ' "$backup_file" > "$file"
    
    # Check if the update was successful
    if grep -q "\"publishedDate\": \"$date\"" "$file"; then
        echo "Successfully updated dates in $file to $date"
        rm "$backup_file"  # Remove backup if successful
        return 0
    else
        echo "Error: Failed to update dates in $file"
        mv "$backup_file" "$file"  # Restore backup if failed
        return 1
    fi
}

# Main execution
echo "Starting update of article publication dates..."
echo "---------------------------------------------"

# Check if the articles directory exists
if [ ! -d "$ARTICLES_DIR" ]; then
    echo "Error: Articles directory '$ARTICLES_DIR' does not exist"
    exit 1
fi

# Track success and failure counts
success_count=0
failure_count=0

# Get all HTML files in the articles directory
article_files=("$ARTICLES_DIR"/*.html)

# Skip certain files that shouldn't be processed
skip_files=("$ARTICLES_DIR/tweet-template.html" "$ARTICLES_DIR/the-solution-to-metadata-chaos-is-da1-metametadata-archive-02.html")

# Process each article file
date_index=0
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
    
    # Check if we have enough dates
    if [ "$date_index" -ge "${#DATES[@]}" ]; then
        echo "Warning: Not enough dates in schedule for all articles"
        break
    fi
    
    date="${DATES[$date_index]}"
    echo "Processing article $((date_index+1))/${#article_files[@]}: $file_path"
    
    # Update the metadata dates in the file
    if update_metadata_dates "$file_path" "$date"; then
        ((success_count++))
    else
        ((failure_count++))
    fi
    
    ((date_index++))
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