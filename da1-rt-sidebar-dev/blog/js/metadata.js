/**
 * DA1 MetaMetadata Generator
 * 
 * This script takes simple DA1 metadata objects and generates
 * comprehensive metadata tags across multiple standards.
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get the DA1 metadata from the page
    const metadataScript = document.getElementById('da1-metadata');
    
    if (metadataScript) {
        try {
            // Parse the DA1 metadata from the script tag
            const metadata = JSON.parse(metadataScript.textContent);
            
            // Generate and inject all metadata tags
            generateMetadata(metadata);
            
        } catch (error) {
            console.error('Error parsing DA1 metadata:', error);
        }
    }
});

/**
 * Generates and injects metadata tags for all supported standards
 * @param {Object} data - The DA1 metadata object
 */
function generateMetadata(data) {
    // Create meta tags in each format
    createHtmlMetaTags(data);
    createOpenGraphTags(data);
    createTwitterCardTags(data);
    createDublinCoreTags(data);
    createSchemaOrgTags(data);
    
    // Update the page title
    if (data.title) {
        document.title = data.title;
    }
}

/**
 * Creates basic HTML meta tags
 */
function createHtmlMetaTags(data) {
    const tags = [];
    
    if (data.description) {
        tags.push(createTag('meta', { name: 'description', content: data.description }));
    }
    
    if (data.author) {
        tags.push(createTag('meta', { name: 'author', content: data.author.name }));
    }
    
    if (data.keywords && data.keywords.length > 0) {
        tags.push(createTag('meta', { 
            name: 'keywords', 
            content: Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords 
        }));
    }
    
    if (data.canonicalUrl) {
        tags.push(createTag('link', { rel: 'canonical', href: data.canonicalUrl }));
    }
    
    appendTags(tags);
}

/**
 * Creates Open Graph protocol meta tags
 */
function createOpenGraphTags(data) {
    const tags = [];
    
    if (data.title) {
        tags.push(createTag('meta', { property: 'og:title', content: data.title }));
    }
    
    if (data.description) {
        tags.push(createTag('meta', { property: 'og:description', content: data.description }));
    }
    
    if (data.url) {
        tags.push(createTag('meta', { property: 'og:url', content: data.url }));
    }
    
    tags.push(createTag('meta', { property: 'og:type', content: 'article' }));
    
    if (data.siteName) {
        tags.push(createTag('meta', { property: 'og:site_name', content: data.siteName }));
    }
    
    if (data.image) {
        tags.push(createTag('meta', { property: 'og:image', content: data.image.url }));
        
        if (data.image.width) {
            tags.push(createTag('meta', { property: 'og:image:width', content: data.image.width }));
        }
        
        if (data.image.height) {
            tags.push(createTag('meta', { property: 'og:image:height', content: data.image.height }));
        }
        
        if (data.image.alt) {
            tags.push(createTag('meta', { property: 'og:image:alt', content: data.image.alt }));
        }
    }
    
    // Article specific tags
    if (data.publishedDate) {
        tags.push(createTag('meta', { property: 'article:published_time', content: data.publishedDate }));
    }
    
    if (data.modifiedDate) {
        tags.push(createTag('meta', { property: 'article:modified_time', content: data.modifiedDate }));
    }
    
    if (data.author && data.author.url) {
        tags.push(createTag('meta', { property: 'article:author', content: data.author.url }));
    }
    
    if (data.category) {
        tags.push(createTag('meta', { property: 'article:section', content: data.category }));
    }
    
    if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
            tags.push(createTag('meta', { property: 'article:tag', content: tag }));
        });
    }
    
    appendTags(tags);
}

/**
 * Creates Twitter Card meta tags
 */
function createTwitterCardTags(data) {
    const tags = [];
    
    tags.push(createTag('meta', { name: 'twitter:card', content: data.image ? 'summary_large_image' : 'summary' }));
    
    if (data.title) {
        tags.push(createTag('meta', { name: 'twitter:title', content: data.title }));
    }
    
    if (data.description) {
        // Use short description if available, otherwise use regular description
        const twitterDesc = data.shortDescription || data.description;
        tags.push(createTag('meta', { name: 'twitter:description', content: twitterDesc }));
    }
    
    if (data.image) {
        tags.push(createTag('meta', { name: 'twitter:image', content: data.image.url }));
        
        if (data.image.alt) {
            tags.push(createTag('meta', { name: 'twitter:image:alt', content: data.image.alt }));
        }
    }
    
    if (data.twitter) {
        if (data.twitter.site) {
            tags.push(createTag('meta', { name: 'twitter:site', content: data.twitter.site }));
        }
        
        if (data.twitter.creator) {
            tags.push(createTag('meta', { name: 'twitter:creator', content: data.twitter.creator }));
        }
    }
    
    if (data.readingTime) {
        tags.push(createTag('meta', { name: 'twitter:label1', content: 'Reading time' }));
        tags.push(createTag('meta', { name: 'twitter:data1', content: data.readingTime }));
    }
    
    appendTags(tags);
}

/**
 * Creates Dublin Core meta tags
 */
function createDublinCoreTags(data) {
    const tags = [];
    
    if (data.title) {
        tags.push(createTag('meta', { name: 'DC.title', content: data.title }));
    }
    
    if (data.description) {
        tags.push(createTag('meta', { name: 'DC.description', content: data.description }));
    }
    
    if (data.author && data.author.name) {
        tags.push(createTag('meta', { name: 'DC.creator', content: data.author.name }));
    }
    
    if (data.publishedDate) {
        tags.push(createTag('meta', { name: 'DC.date', content: data.publishedDate }));
    }
    
    if (data.modifiedDate) {
        tags.push(createTag('meta', { name: 'DC.date.modified', content: data.modifiedDate }));
    }
    
    if (data.category) {
        tags.push(createTag('meta', { name: 'DC.subject', content: data.category }));
    }
    
    if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
            tags.push(createTag('meta', { name: 'DC.subject', content: tag }));
        });
    }
    
    if (data.url) {
        tags.push(createTag('meta', { name: 'DC.identifier', content: data.url }));
    }
    
    appendTags(tags);
}

/**
 * Creates Schema.org JSON-LD tags
 */
function createSchemaOrgTags(data) {
    // Create Schema.org JSON-LD structure
    const schemaData = {
        "@context": "https://schema.org",
        "@type": data.schemaType || "BlogPosting",
        "headline": data.title,
        "description": data.description,
        "datePublished": data.publishedDate,
        "dateModified": data.modifiedDate || data.publishedDate
    };
    
    // Add main entity
    if (data.url) {
        schemaData.mainEntityOfPage = {
            "@type": "WebPage",
            "@id": data.url
        };
    }
    
    // Add author information
    if (data.author) {
        schemaData.author = {
            "@type": "Person",
            "name": data.author.name
        };
        
        if (data.author.url) {
            schemaData.author.url = data.author.url;
        }
        
        if (data.author.jobTitle) {
            schemaData.author.jobTitle = data.author.jobTitle;
        }
    }
    
    // Add publisher information
    if (data.publisher) {
        schemaData.publisher = {
            "@type": "Organization",
            "name": data.publisher.name
        };
        
        if (data.publisher.logo) {
            schemaData.publisher.logo = {
                "@type": "ImageObject",
                "url": data.publisher.logo.url
            };
            
            if (data.publisher.logo.width && data.publisher.logo.height) {
                schemaData.publisher.logo.width = data.publisher.logo.width;
                schemaData.publisher.logo.height = data.publisher.logo.height;
            }
        }
    }
    
    // Add image information
    if (data.image) {
        schemaData.image = {
            "@type": "ImageObject",
            "url": data.image.url
        };
        
        if (data.image.width && data.image.height) {
            schemaData.image.width = data.image.width;
            schemaData.image.height = data.image.height;
        }
    }
    
    // Add other metadata
    if (data.keywords && data.keywords.length > 0) {
        schemaData.keywords = Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords;
    }
    
    if (data.wordCount) {
        schemaData.wordCount = data.wordCount;
    }
    
    if (data.readingTime) {
        schemaData.timeRequired = data.readingTime;
    }
    
    // Create script tag with JSON-LD data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
}

/**
 * Helper to create HTML elements for metadata
 */
function createTag(tagName, attributes) {
    const tag = document.createElement(tagName);
    
    for (const [key, value] of Object.entries(attributes)) {
        tag.setAttribute(key, value);
    }
    
    return tag;
}

/**
 * Helper to add tags to the document head
 */
function appendTags(tags) {
    tags.forEach(tag => document.head.appendChild(tag));
}

/**
 * Creates a JSON object containing DA1 metadata
 * from minimum required inputs
 */
function createDA1Metadata(options) {
    // Default publisher info
    const defaultPublisher = {
        name: "DA1",
        url: "https://da1.fm",
        logo: {
            url: "https://da1.fm/logo.png",
            width: 600,
            height: 60
        }
    };
    
    // Generate dates
    const now = new Date().toISOString();
    
    // Default metadata
    const defaultMetadata = {
        siteName: "DA1 Blog",
        schemaType: "BlogPosting",
        publishedDate: now,
        modifiedDate: now,
        publisher: defaultPublisher,
        twitter: {
            site: "@DA1metaMetaData"
        }
    };
    
    // Merge provided options with defaults
    return { ...defaultMetadata, ...options };
}
