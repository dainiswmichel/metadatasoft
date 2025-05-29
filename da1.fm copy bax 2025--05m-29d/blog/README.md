# DA1 Blog System

This is a static blog system designed for da1.fm that provides a robust approach to display blog articles with minimal server requirements.

## Key Features

- Self-contained articles with embedded navigation
- DA1 MetaMetaData JSON for easy metadata management
- Multiple article discovery methods (fallbacks for maximum compatibility)
- Category filtering
- Responsive design with proper sidebar integration

## How to Add a New Blog Post

1. Make a copy of `/blog/articles/article-template.html` and rename it to something descriptive (e.g., `your-article-name.html`).

2. Edit the metadata section at the top of the file:

```html
<script id="da1-metadata" type="application/json">
{
    "title": "Your Article Title",
    "description": "Brief description of the article (150-160 characters recommended).",
    "excerpt": "A slightly longer excerpt that appears on the blog listing page (1-2 sentences).",
    "author": {
        "name": "Your Name"
    },
    "publishedDate": "2025-04-15T12:00:00Z", 
    "modifiedDate": "2025-04-15T12:00:00Z",
    "category": "Category Name",
    "tags": ["Tag 1", "Tag 2", "Tag 3"],
    "readingTime": "5 min read"
}
</script>
```

3. Replace the content in the `<div class="blog-content">` section with your article content.

4. Add your article filename to `articles.txt` (one filename per line).

## Blog System Architecture

### Article Discovery

The system attempts to discover articles through multiple methods in the following order:

1. Read from `articles.txt` (recommended approach)
2. Scan the articles directory (if directory listing is enabled)
3. Use PHP lister script (if available)
4. Check for common article filenames
5. Scan for any HTML files matching patterns

### Metadata Extraction

Each article includes a DA1 metadata JSON block that provides structured information about the article. If this block is not present, the system falls back to traditional meta tags.

### Category Filtering

The blog index page includes category filtering functionality that allows users to filter articles by category. Categories are defined in the article metadata.

## Maintenance Notes

- **Updating the Article List**: When adding new articles, update `articles.txt` with the new filename.
- **Image Paths**: Store images in the `/blog/images/` directory and reference them using relative paths.
- **Sidebars**: The articles include embedded sidebars to ensure they display correctly, even on servers with restrictions.
- **Styling**: Main styles are in `blog.css`, with critical styles inlined in articles to prevent display issues.

## Troubleshooting

- **Articles Not Appearing**: Check that the filename is listed in `articles.txt` and that the JSON metadata block is properly formatted.
- **Style Issues**: Verify that the CSS files are properly linked and that the main content container has the correct margin settings.
- **Sidebar Problems**: Make sure the Alpine.js library is properly loaded and that the sidebar toggle functionality works correctly.