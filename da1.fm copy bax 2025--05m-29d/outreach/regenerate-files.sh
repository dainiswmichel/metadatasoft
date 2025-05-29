#!/bin/bash

# Script to completely regenerate all outreach post HTML files with proper structure
# This is the final solution to fix all structural issues

# Array of files to completely rebuild
FILES=(
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/imogen-heap.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/justin-blau-3lau.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/rac-andr-allen-anjos.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/richie-hawtin.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/zo-keating.html"
)

# Function to extract content between tags
extract_content() {
  local file="$1"
  local start_pattern="$2"
  local end_pattern="$3"
  
  awk -v start="$start_pattern" -v end="$end_pattern" '
    BEGIN { printing = 0; content = ""; }
    $0 ~ start { printing = 1; }
    printing == 1 { content = content $0 "\n"; }
    $0 ~ end { printing = 0; }
    END { print content; }
  ' "$file" | grep -v "$end_pattern"
}

for file in "${FILES[@]}"; do
  echo "Rebuilding $file..."
  
  # Create a backup of the original file
  cp "$file" "${file}.bak.$(date +%Y%m%d%H%M%S)"
  
  # Extract all the necessary content sections
  head_content=$(awk '/<html/,/<body>/ {print}' "$file")
  meta_content=$(extract_content "$file" '<div class="outreach-meta">' '</div>')
  target_info=$(extract_content "$file" '<div class="target-info">' '</div>')
  outreach_message=$(extract_content "$file" '<div class="outreach-message">' '</div>')
  tweet1_content=$(extract_content "$file" '<div class="tweet-content">' '</div>' | head -n 7)
  tweet2_content=$(extract_content "$file" '<h2>Tweet 2: Invitation Tweet</h2>' '</div>' | head -n 3)
  follow_up_plan=$(extract_content "$file" '<div class="follow-up-plan">' '</div>')
  
  # Get the target details
  target_name=$(grep -o 'content="[^"]*"' "$file" | grep 'da1:target' | head -1 | cut -d'"' -f2)
  target_role=$(grep -o 'content="[^"]*"' "$file" | grep 'da1:target-role' | head -1 | cut -d'"' -f2)
  target_twitter=$(grep -o 'content="[^"]*"' "$file" | grep 'da1:target-twitter' | head -1 | cut -d'"' -f2)
  target_date=$(grep -o '<span><i class="bi bi-calendar3"></i>[^<]*</span>' "$file" | sed 's/<[^>]*>//g' | head -1 | xargs)
  category=$(grep -o '<div class="category-tag">[^<]*</div>' "$file" | sed 's/<[^>]*>//g' | head -1 | xargs)
  
  # Create a completely new file with proper structure
  cat > "${file}.new" << EOF
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to ${target_name} - DA1</title>
    <meta name="description" content="DA1's outreach to ${target_name} about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="${target_name}">
    <meta name="da1:target-role" content="${target_role}">
    <meta name="da1:target-twitter" content="${target_twitter}">
    <meta name="da1:publish-date" content="2025-04-29T21:00:00.000Z">
    <meta name="da1:category" content="${category}">
    <meta name="da1:tags" content="${category}">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to ${target_name} - DA1">
    <meta property="og:description" content="DA1's outreach to ${target_name} about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/$(basename "$file")">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to ${target_name} - DA1">
    <meta name="twitter:description" content="DA1's outreach to ${target_name} about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">${category}</div>
            <h1>Outreach to ${target_name}</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: ${target_name}</span>
                <span><i class="bi bi-briefcase"></i> ${target_role}</span>
                <span><i class="bi bi-twitter"></i> ${target_twitter}</span>
                <span><i class="bi bi-calendar3"></i> ${target_date}</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About ${target_name}</h2>
            $(extract_content "$file" '<div class="target-details">' '</div>')
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            $(extract_content "$file" '<p>Dear' '</div>' | grep -v '</div>')
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            $(extract_content "$file" '<p data-tweet-text' '<div class="tweet-status' | head -1)
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            $(extract_content "$file" '<p data-tweet-text' '<div class="tweet-status' | tail -1)
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

  # Replace the original file with the new one
  mv "${file}.new" "$file"
  
  echo "Successfully rebuilt $file"
done

echo "All files have been successfully regenerated!"