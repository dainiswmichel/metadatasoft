#!/bin/bash

# Path to the article
ARTICLE_PATH="/Users/dainismichel/dainisne/da1.fm/blog/articles/the-solution-to-metadata-chaos-is-da1-metametadata.html"

# New date to set
NEW_DATE="2026-04-06T09:30:00Z"

# Make a backup
cp "$ARTICLE_PATH" "${ARTICLE_PATH}.bak"

# Use awk to properly handle the JSON structure
awk -v new_date="$NEW_DATE" '
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
' "${ARTICLE_PATH}.bak" > "$ARTICLE_PATH"

# Check if the update was successful
if grep -q "\"publishedDate\": \"$NEW_DATE\"" "$ARTICLE_PATH"; then
    echo "Successfully updated dates in $ARTICLE_PATH to $NEW_DATE"
    rm "${ARTICLE_PATH}.bak"
else
    echo "Failed to update dates. Restoring from backup."
    mv "${ARTICLE_PATH}.bak" "$ARTICLE_PATH"
fi