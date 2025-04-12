#!/bin/bash

# Script to update publishedDate and modifiedDate in DA1 metadata blocks
# Author: Claude
# Date: 2025-04-07

# Directory containing the articles
ARTICLES_DIR="/Users/dainismichel/dainisne/da1.fm/blog/articles"

# File to store the schedule data
SCHEDULE_FILE="/tmp/publish_schedule.csv"

# Array of article filenames to process
declare -a ARTICLE_FILES=(
    "sample-01.html"
    "the-future-of-music-rights.html"
    "the-ultimate-metadata-guide.html"
    "the-solution-to-metadata-chaos-is-da1-metametadata.html"
    "metadata-is-money-1-billion-royalties-lost.html"
    "85-percent-news-outlets-strip-image-metadata.html"
    "hollywoods-metadata-mess-costs-billions.html"
    "blockchain-solves-medias-metadata-problem.html"
    "nft-metadata-where-real-value-lives.html"
    "wef-report-metadata-reshaping-content-economy.html"
    "metadata-copyright-protection-legal-precedent.html"
    "the-state-of-video-metadata-crisis.html"
    "when-bad-metadata-happens-to-good-musicians.html"
    "your-music-copyright-worth-nothing-without-metadata.html"
    "the-value-of-photo-metadata.html"
    "photo-metadata-key-to-protecting-your-assets.html"
    "broadcast-metadata-critical-for-monetization.html"
    "youtube-content-id-fails-to-protect-artists.html"
    "web3-future-of-creative-attribution.html"
    "distributed-ledger-tech-beyond-blockchain.html"
    "the-state-of-metadata-in-2022.html"
    "educating-artists-metadata-importance.html"
    "metadata-makes-ai-more-vulnerable.html"
    "copyrights-critical-mess-music-metadata.html"
    "when-music-metadata-meets-blockchain.html"
    "true-cost-of-metadata-stripping.html"
    "metadata-problems-across-creative-sectors.html"
    "blockchain-metametadata-creator-controlled-future.html"
    "metadata-creator-income-direct-correlation.html"
    "join-da1-early-access-secure-your-creative-future.html"
    "daily-music-revenue-loss.html"
    "metadata-format-fragmentation.html"
    "billion-dollar-royalty-blackbox.html"
    "stripped-image-metadata-crisis.html"
    "hollywood-metadata-consistency.html"
    "metadata-legal-protection.html"
    "real-value-of-nft-metadata.html"
    "beyond-creative-sectors.html"
    "artist-royalty-loss-stories.html"
    "youtube-content-id-limitations.html"
    "harvard-blockchain-validation.html"
    "government-recognition-blockchain.html"
    "metadata-disappearance-impact.html"
    "wef-content-economy-reshaping.html"
    "established-artists-metadata-struggle.html"
    "isrc-critical-identifiers.html"
    "ai-metadata-vulnerability.html"
    "european-metadata-challenges.html"
    "true-cost-free-content.html"
    "broadcast-metadata-monetization.html"
    "cross-industry-metadata-problem.html"
    "blockchain-attribution-promise.html"
    "metadata-discovery-challenge.html"
    "annual-metadata-revenue-loss.html"
    "global-metadata-standardization.html"
    "creator-education-gap.html"
    "video-metadata-vulnerability.html"
    "platform-limitation-solution.html"
    "digital-collections-value.html"
    "metadata-implementation-reality.html"
    "corporate-recognition-metadata.html"
)

# Create the schedule data
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

# Function to check if file exists
file_exists() {
    if [ ! -f "$1" ]; then
        echo "Error: File '$1' does not exist"
        return 1
    fi
    return 0
}

# Function to update metadata dates in a file
update_metadata_dates() {
    local file="$1"
    local date="$2"
    local backup_file="${file}.bak"
    
    # Create a backup of the original file
    cp "$file" "$backup_file"
    
    # Use sed to update the dates in the metadata block
    sed -i.tmp -E "s/(\"publishedDate\":\s*)\"[^\"]*\"/\1\"$date\"/" "$file"
    sed -i.tmp -E "s/(\"modifiedDate\":\s*)\"[^\"]*\"/\1\"$date\"/" "$file"
    
    # Remove temporary file created by sed
    rm "${file}.tmp"
    
    # Check if the update was successful
    if grep -q "\"publishedDate\": \"$date\"" "$file" && grep -q "\"modifiedDate\": \"$date\"" "$file"; then
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

# Process each article file
for i in "${!ARTICLE_FILES[@]}"; do
    # Check if we have enough dates
    if [ "$i" -ge "${#DATES[@]}" ]; then
        echo "Warning: Not enough dates in schedule for all articles"
        break
    fi
    
    article="${ARTICLE_FILES[$i]}"
    date="${DATES[$i]}"
    file_path="$ARTICLES_DIR/$article"
    
    echo "Processing article $((i+1))/${#ARTICLE_FILES[@]}: $article"
    
    # Check if the file exists
    if file_exists "$file_path"; then
        # Update the metadata dates in the file
        if update_metadata_dates "$file_path" "$date"; then
            ((success_count++))
        else
            ((failure_count++))
        fi
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