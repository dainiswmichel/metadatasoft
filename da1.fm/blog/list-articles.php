<?php
// Simple article listing script
// This generates a list of HTML files in the articles directory

// Set the content type to plain text
header('Content-Type: text/plain');

// Get all HTML files in the articles directory
$articles = glob('articles/*.html');

// Output each filename on a separate line, excluding the template
foreach($articles as $article) {
    $filename = basename($article);
    // Skip the article template file
    if ($filename !== 'article-template.html') {
        echo $filename . "\n";
    }
}
?>