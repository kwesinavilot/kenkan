// Content type detection utilities

export interface ContentTypeInfo {
    type: string;
    confidence: number;
    indicators: string[];
}

export function detectContentType(): ContentTypeInfo {
    const url = window.location.href;
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const title = document.title.toLowerCase();

    // Check for PDF
    if (url.includes('.pdf') || document.querySelector('embed[type="application/pdf"]') ||
        document.querySelector('object[type="application/pdf"]') ||
        document.querySelector('#viewer') && hostname.includes('pdf')) {
        return {
            type: 'PDF Document',
            confidence: 0.95,
            indicators: ['PDF URL', 'PDF embed element']
        };
    }

    // Check for academic/research content
    const academicIndicators = [
        'abstract', 'doi:', 'arxiv', 'pubmed', 'scholar.google', 'researchgate',
        'ieee', 'acm.org', 'springer', 'elsevier', 'nature.com', 'science.org'
    ];

    const academicKeywords = ['abstract', 'methodology', 'conclusion', 'references', 'bibliography'];
    const hasAcademicIndicators = academicIndicators.some(indicator =>
        url.toLowerCase().includes(indicator) || hostname.toLowerCase().includes(indicator)
    );

    const hasAcademicKeywords = academicKeywords.some(keyword =>
        title.includes(keyword) || document.body.textContent?.toLowerCase().includes(keyword)
    );

    if (hasAcademicIndicators || hasAcademicKeywords) {
        return {
            type: 'Research Article',
            confidence: 0.85,
            indicators: ['Academic domain', 'Research keywords']
        };
    }

    // Check for news articles
    const newsIndicators = [
        'cnn.com', 'bbc.com', 'reuters.com', 'ap.org', 'nytimes.com', 'washingtonpost.com',
        'theguardian.com', 'wsj.com', 'bloomberg.com', 'npr.org', 'abc.com', 'cbs.com',
        'fox.com', 'msnbc.com', 'usatoday.com'
    ];

    const newsSelectors = [
        'article[role="article"]', '.article', '.news-article', '.story',
        '[itemtype*="NewsArticle"]', '.post-content', '.entry-content'
    ];

    const hasNewsIndicators = newsIndicators.some(indicator =>
        hostname.toLowerCase().includes(indicator)
    );

    const hasNewsStructure = newsSelectors.some(selector =>
        document.querySelector(selector)
    );

    if (hasNewsIndicators || hasNewsStructure) {
        return {
            type: 'News Article',
            confidence: 0.8,
            indicators: ['News domain', 'Article structure']
        };
    }

    // Check for blog posts
    const blogIndicators = [
        'blog', 'wordpress', 'medium.com', 'substack.com', 'ghost.org',
        'blogger.com', 'tumblr.com', 'dev.to', 'hashnode'
    ];

    const blogSelectors = [
        '.blog-post', '.post', '.entry', '.article-content',
        '[itemtype*="BlogPosting"]', '.wp-content'
    ];

    const hasBlogIndicators = blogIndicators.some(indicator =>
        url.toLowerCase().includes(indicator) || hostname.toLowerCase().includes(indicator)
    );

    const hasBlogStructure = blogSelectors.some(selector =>
        document.querySelector(selector)
    );

    if (hasBlogIndicators || hasBlogStructure) {
        return {
            type: 'Blog Post',
            confidence: 0.75,
            indicators: ['Blog platform', 'Blog structure']
        };
    }

    // Check for documentation
    const docIndicators = [
        'docs.', 'documentation', 'wiki', 'readme', 'guide', 'tutorial',
        'github.com', 'gitlab.com', 'readthedocs', 'gitbook'
    ];

    const docKeywords = ['api', 'documentation', 'guide', 'tutorial', 'reference', 'manual'];

    const hasDocIndicators = docIndicators.some(indicator =>
        url.toLowerCase().includes(indicator) || hostname.toLowerCase().includes(indicator)
    );

    const hasDocKeywords = docKeywords.some(keyword =>
        title.includes(keyword) || pathname.toLowerCase().includes(keyword)
    );

    if (hasDocIndicators || hasDocKeywords) {
        return {
            type: 'Documentation',
            confidence: 0.7,
            indicators: ['Documentation domain', 'Doc keywords']
        };
    }

    // Check for e-commerce/product pages
    const ecommerceIndicators = [
        'amazon.com', 'ebay.com', 'shopify', 'woocommerce', 'etsy.com',
        'walmart.com', 'target.com', 'bestbuy.com'
    ];

    const ecommerceSelectors = [
        '.product', '.item', '[itemtype*="Product"]', '.price',
        '.add-to-cart', '.buy-now'
    ];

    const hasEcommerceIndicators = ecommerceIndicators.some(indicator =>
        hostname.toLowerCase().includes(indicator)
    );

    const hasEcommerceStructure = ecommerceSelectors.some(selector =>
        document.querySelector(selector)
    );

    if (hasEcommerceIndicators || hasEcommerceStructure) {
        return {
            type: 'Product Page',
            confidence: 0.65,
            indicators: ['E-commerce domain', 'Product elements']
        };
    }

    // Check for forums/discussions
    const forumIndicators = [
        'reddit.com', 'stackoverflow.com', 'discourse', 'phpbb', 'vbulletin',
        'forum', 'discussion', 'community'
    ];

    const forumSelectors = [
        '.forum', '.thread', '.discussion', '.comment', '.reply',
        '[role="discussion"]'
    ];

    const hasForumIndicators = forumIndicators.some(indicator =>
        url.toLowerCase().includes(indicator) || hostname.toLowerCase().includes(indicator)
    );

    const hasForumStructure = forumSelectors.some(selector =>
        document.querySelector(selector)
    );

    if (hasForumIndicators || hasForumStructure) {
        return {
            type: 'Forum Discussion',
            confidence: 0.6,
            indicators: ['Forum platform', 'Discussion structure']
        };
    }

    // Check for social media
    const socialIndicators = [
        'twitter.com', 'x.com', 'facebook.com', 'linkedin.com', 'instagram.com',
        'tiktok.com', 'youtube.com', 'pinterest.com'
    ];

    const hasSocialIndicators = socialIndicators.some(indicator =>
        hostname.toLowerCase().includes(indicator)
    );

    if (hasSocialIndicators) {
        return {
            type: 'Social Media',
            confidence: 0.9,
            indicators: ['Social media domain']
        };
    }

    // Check for Wikipedia
    if (hostname.includes('wikipedia.org')) {
        return {
            type: 'Wikipedia Article',
            confidence: 0.95,
            indicators: ['Wikipedia domain']
        };
    }

    // Check content structure for generic article detection
    const articleSelectors = [
        'article', 'main', '.content', '.main-content', '.article-body',
        '[role="main"]', '.post-body', '.entry-body'
    ];

    const hasArticleStructure = articleSelectors.some(selector => {
        const element = document.querySelector(selector);
        return element && element.textContent && element.textContent.length > 500;
    });

    if (hasArticleStructure) {
        return {
            type: 'Article',
            confidence: 0.5,
            indicators: ['Article structure']
        };
    }

    // Default fallback
    return {
        type: 'Web Page',
        confidence: 0.3,
        indicators: ['Generic web content']
    };
}

export function getContentMetrics() {
    const textContent = document.body.textContent || '';
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);

    return {
        wordCount: words.length,
        characterCount: textContent.length,
        paragraphCount: document.querySelectorAll('p').length,
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        linkCount: document.querySelectorAll('a').length,
        imageCount: document.querySelectorAll('img').length
    };
}