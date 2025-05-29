/**
 * DA1 Metadata Script
 * This script extracts metadata from the DA1 JSON block and generates appropriate meta tags
 */

document.addEventListener('DOMContentLoaded', () => {
    const metadataScript = document.getElementById('da1-metadata');
    
    if (!metadataScript) {
        console.warn('No DA1 metadata found on page, defaulting to standard meta tags');
        // Extract from regular meta tags as fallback
        const title = document.querySelector('title')?.textContent || '';
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        generateMetadata({ title, description });
        return;
    }
    
    try {
        const metadata = JSON.parse(metadataScript.textContent);
        generateMetadata(metadata);
    } catch (e) {
        console.error('Error parsing DA1 metadata:', e);
        // Fallback to existing meta tags
        const title = document.querySelector('title')?.textContent || '';
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        generateMetadata({ title, description });
    }
});

/**
 * Generates metadata tags based on the provided metadata object
 */
function generateMetadata(metadata) {
    // Clean up any previously generated meta tags
    document.querySelectorAll('meta[data-da1-generated="true"]').forEach(el => el.remove());
    
    const tags = [];
    
    // Standard HTML meta tags
    if (metadata.title) {
        document.title = metadata.title;
    }
    
    if (metadata.description) {
        appendOrUpdateMeta(tags, 'description', metadata.description);
    }
    
    // Open Graph (Facebook, LinkedIn)
    if (metadata.title) {
        appendOrUpdateMeta(tags, 'og:title', metadata.title, 'property');
    }
    
    if (metadata.description) {
        appendOrUpdateMeta(tags, 'og:description', metadata.description, 'property');
    }
    
    appendOrUpdateMeta(tags, 'og:type', 'article', 'property');
    
    if (metadata.url) {
        appendOrUpdateMeta(tags, 'og:url', metadata.url, 'property');
    }
    
    if (metadata.image && metadata.image.url) {
        appendOrUpdateMeta(tags, 'og:image', metadata.image.url, 'property');
        
        if (metadata.image.width) {
            appendOrUpdateMeta(tags, 'og:image:width', metadata.image.width, 'property');
        }
        
        if (metadata.image.height) {
            appendOrUpdateMeta(tags, 'og:image:height', metadata.image.height, 'property');
        }
    }
    
    // Twitter Card
    appendOrUpdateMeta(tags, 'twitter:card', 'summary_large_image');
    
    if (metadata.title) {
        appendOrUpdateMeta(tags, 'twitter:title', metadata.title);
    }
    
    if (metadata.description) {
        appendOrUpdateMeta(tags, 'twitter:description', metadata.description);
    }
    
    if (metadata.twitter && metadata.twitter.site) {
        appendOrUpdateMeta(tags, 'twitter:site', metadata.twitter.site);
    }
    
    if (metadata.twitter && metadata.twitter.creator) {
        appendOrUpdateMeta(tags, 'twitter:creator', metadata.twitter.creator);
    }
    
    if (metadata.image && metadata.image.url) {
        appendOrUpdateMeta(tags, 'twitter:image', metadata.image.url);
    }
    
    // Article specifics
    if (metadata.publishedDate) {
        appendOrUpdateMeta(tags, 'article:published_time', metadata.publishedDate, 'property');
    }
    
    if (metadata.modifiedDate) {
        appendOrUpdateMeta(tags, 'article:modified_time', metadata.modifiedDate, 'property');
    }
    
    if (metadata.author && metadata.author.name) {
        appendOrUpdateMeta(tags, 'article:author', metadata.author.name, 'property');
    }
    
    if (metadata.category) {
        appendOrUpdateMeta(tags, 'article:section', metadata.category, 'property');
    }
    
    if (metadata.tags && Array.isArray(metadata.tags)) {
        metadata.tags.forEach(tag => {
            const metaTag = document.createElement('meta');
            metaTag.setAttribute('property', 'article:tag');
            metaTag.setAttribute('content', tag);
            metaTag.setAttribute('data-da1-generated', 'true');
            tags.push(metaTag);
        });
    }
    
    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': metadata.title || '',
        'description': metadata.description || '',
        'image': metadata.image ? metadata.image.url : '',
        'datePublished': metadata.publishedDate || '',
        'dateModified': metadata.modifiedDate || metadata.publishedDate || '',
        'author': {
            '@type': 'Person',
            'name': metadata.author ? metadata.author.name : '',
            'url': metadata.author ? metadata.author.url : '',
            'jobTitle': metadata.author ? metadata.author.jobTitle : ''
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'DA1',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://da1.fm/resources/images/logo.png'
            }
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': metadata.url || window.location.href
        }
    };
    
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    
    if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.type = 'application/ld+json';
        jsonLdScript.setAttribute('data-da1-generated', 'true');
        document.head.appendChild(jsonLdScript);
    }
    
    jsonLdScript.textContent = JSON.stringify(jsonLd, null, 2);
    
    // Append all tags to the head
    appendTags(tags);
}

/**
 * Creates or updates a meta tag with the given name/property and content
 */
function appendOrUpdateMeta(tags, name, content, propType = 'name') {
    let metaTag = document.querySelector(`meta[${propType}="${name}"]`);
    
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(propType, name);
        metaTag.setAttribute('data-da1-generated', 'true');
    }
    
    metaTag.setAttribute('content', content);
    tags.push(metaTag);
    
    return metaTag;
}

/**
 * Appends an array of tags to the document head
 */
function appendTags(tags) {
    tags.forEach(tag => {
        document.head.appendChild(tag);
    });
}