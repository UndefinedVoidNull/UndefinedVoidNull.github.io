const fs = require('fs');
const path = require('path');

const PDFS_DIR = path.join(__dirname, 'pdfs');
const ARCHIVES_DIR = path.join(__dirname, 'pdfs', 'archives');
const INDEX_HTML = path.join(__dirname, 'index.html');
const ARCHIVES_HTML = path.join(__dirname, 'archives.html');
const RSS_XML = path.join(__dirname, 'feed.xml');
const SITEMAP_XML = path.join(__dirname, 'sitemap.xml');
const ENTRIES_PER_PAGE = 15;
const { execSync } = require('child_process');

// Function to format filename as title (remove extension, replace hyphens/underscores with spaces, capitalize)
function formatTitle(filename) {
    return filename
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Function to format date for RSS (RFC 822)
function formatDateRSS(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getUTCDay()];
    const dayNum = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}

// Function to escape XML special characters
function escapeXML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Function to get site URL
function getSiteURL() {
    // Try to get from environment variable
    if (process.env.SITE_URL) {
        return process.env.SITE_URL.replace(/\/$/, '');
    }
    
    // Check for CNAME file (custom domain)
    try {
        const cnamePath = path.join(__dirname, 'CNAME');
        if (fs.existsSync(cnamePath)) {
            const cname = fs.readFileSync(cnamePath, 'utf8').split('\n')[0].trim();
            if (cname) {
                return `https://${cname}`;
            }
        }
    } catch (error) {
        // Ignore errors
    }
    
    // Default site URL (custom domain)
    return 'https://233lol.com';
}

// Function to generate entry HTML
function generateEntryHTML(entry) {
    const title = formatTitle(entry.filename);
    const dateStr = formatDate(entry.modifiedDate);
    const pdfPath = entry.path || `pdfs/${entry.filename}`;
    
    return `
            <div class="entry">
                <div class="entry-title">
                    <a href="${pdfPath}" target="_blank">${title}</a>
                </div>
                <div class="entry-meta">${dateStr}</div>
            </div>`;
}

// Main function
function build() {
    try {
        // Check if pdfs directory exists
        if (!fs.existsSync(PDFS_DIR)) {
            console.error(`Error: ${PDFS_DIR} directory does not exist.`);
            process.exit(1);
        }

        // Read all files in pdfs directory (excluding archives subfolder)
        const files = fs.readdirSync(PDFS_DIR);
        
        // Filter PDF files (exclude archives folder and files inside it)
        const pdfFiles = files.filter(file => {
            const filePath = path.join(PDFS_DIR, file);
            // Skip if it's a directory (like archives) or not a PDF
            if (fs.statSync(filePath).isDirectory()) {
                return false;
            }
            return file.toLowerCase().endsWith('.pdf');
        });

        // Get file stats and create entries for regular PDFs
        const entries = pdfFiles
            .map(filename => {
                const filePath = path.join(PDFS_DIR, filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    modifiedDate: stats.mtime,
                    path: `pdfs/${filename}`
                };
            })
            // Sort by modification date (newest first)
            .sort((a, b) => b.modifiedDate - a.modifiedDate);

        // Handle archived PDFs
        let archivedEntries = [];
        if (fs.existsSync(ARCHIVES_DIR)) {
            const archiveFiles = fs.readdirSync(ARCHIVES_DIR);
            const archivePDFs = archiveFiles.filter(file => 
                file.toLowerCase().endsWith('.pdf')
            );
            
            archivedEntries = archivePDFs
                .map(filename => {
                    const filePath = path.join(ARCHIVES_DIR, filename);
                    const stats = fs.statSync(filePath);
                    return {
                        filename,
                        modifiedDate: stats.mtime,
                        path: `pdfs/archives/${filename}`
                    };
                })
                .sort((a, b) => b.modifiedDate - a.modifiedDate);
            
            if (archivedEntries.length > 0) {
                console.log(`Found ${archivedEntries.length} archived PDF file(s)`);
                generateArchivesHTML(archivedEntries);
            }
        }

        console.log(`Found ${entries.length} PDF file(s):`);
        entries.forEach(entry => {
            console.log(`  - ${entry.filename} (${formatDate(entry.modifiedDate)})`);
        });

        if (entries.length === 0 && archivedEntries.length === 0) {
            console.log('No PDF files found.');
            // Update index.html with no entries message
            updateIndexHTMLWithPagination([]);
            return;
        }

        // Update index.html with pagination (only regular entries section, pinned section is left untouched)
        updateIndexHTMLWithPagination(entries);
        
        // Generate RSS feed
        generateRSSFeed(entries);
        
        // Generate sitemap (include pagination pages)
        generateSitemap(entries, archivedEntries);
        
        // Ensure about.html has SEO tags
        ensureAboutHTMLSEO();
        
        console.log('\nBuild completed successfully!');
    } catch (error) {
        console.error('Error during build:', error);
        process.exit(1);
    }
}

// Function to generate pagination HTML
function generatePaginationHTML(currentPage, totalPages) {
    if (totalPages <= 1) {
        return '';
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button (only show if not first page)
    if (currentPage > 1) {
        const prevPage = currentPage === 2 ? 'index.html' : `p${currentPage - 1}.html`;
        paginationHTML += `<a href="${prevPage}" class="pagination-link">«</a>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1) {
            if (currentPage === 1) {
                paginationHTML += '<span class="pagination-link active">1</span>';
            } else {
                paginationHTML += '<a href="index.html" class="pagination-link">1</a>';
            }
        } else {
            const pageFile = `p${i}.html`;
            if (i === currentPage) {
                paginationHTML += `<span class="pagination-link active">${i}</span>`;
            } else {
                paginationHTML += `<a href="${pageFile}" class="pagination-link">${i}</a>`;
            }
        }
    }
    
    // Next button (only show if not last page)
    if (currentPage < totalPages) {
        const nextPage = `p${currentPage + 1}.html`;
        paginationHTML += `<a href="${nextPage}" class="pagination-link">»</a>`;
    }
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Function to update index.html with pagination
// Note: This only updates the regular entries section. The pinned-entries section is left untouched for manual editing.
function updateIndexHTMLWithPagination(entries) {
    try {
        const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
        
        // Generate all page files
        for (let page = 1; page <= totalPages; page++) {
            const startIndex = (page - 1) * ENTRIES_PER_PAGE;
            const endIndex = Math.min(startIndex + ENTRIES_PER_PAGE, entries.length);
            const pageEntries = entries.slice(startIndex, endIndex);
            
            // Read template (index.html for page 1, or create new for other pages)
            let html;
            if (page === 1) {
                html = fs.readFileSync(INDEX_HTML, 'utf8');
            } else {
                // Use index.html as template for other pages
                html = fs.readFileSync(INDEX_HTML, 'utf8');
                // Update title and canonical URL for paginated pages
                html = html.replace(/<title>.*?<\/title>/i, `<title>Askin's Blog - Page ${page}</title>`);
                html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="https://233lol.com/p${page}.html">`);
                
                // Remove pinned entries section for pages 2+
                // Match the entire pinned-entries div including the container
                const pinnedRegex = /<div\s+class="pinned-entries">[\s\S]*?<!--\s*PINNED_ENTRIES_END\s*-->[\s\S]*?<\/div>/gi;
                html = html.replace(pinnedRegex, '');
            }
            
            // Generate entries HTML
            let entriesHTML = '';
            if (pageEntries.length === 0) {
                entriesHTML = '<div class="no-entries">No PDF entries found. Add PDF files to the /pdfs directory and run build.js again.</div>';
            } else {
                entriesHTML = pageEntries
                    .map(entry => generateEntryHTML(entry))
                    .join('\n');
            }
            
            // Replace the entries section
            const startMarker = '<!-- GENERATED_ENTRIES_START -->';
            const endMarker = '<!-- GENERATED_ENTRIES_END -->';
            const entriesRegex = new RegExp(
                startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 
                '[\\s\\S]*?' + 
                endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'g'
            );
            
            // Add pagination after entries (only lower pagination)
            const paginationHTML = generatePaginationHTML(page, totalPages);
            const newEntriesContent = `${startMarker}\n${entriesHTML}\n${paginationHTML}\n            ${endMarker}`;
            
            html = html.replace(entriesRegex, newEntriesContent);
            
            // Add RSS link if not present
            html = addRSSLink(html);
            
            // Ensure SEO tags are present and up-to-date
            html = ensureSEOTags(html, 'index', entries.length);
            
            // Write file
            const outputFile = page === 1 ? INDEX_HTML : path.join(__dirname, `p${page}.html`);
            fs.writeFileSync(outputFile, html, 'utf8');
            console.log(`Generated ${page === 1 ? 'index.html' : `p${page}.html`} (page ${page}/${totalPages})`);
        }
        
        // Clean up old page files if total pages decreased (both old and new naming)
        if (totalPages > 0) {
            for (let page = totalPages + 1; page <= 10; page++) {
                // Remove old naming (page2.html, page3.html, etc.)
                const oldPageFile = path.join(__dirname, `page${page}.html`);
                if (fs.existsSync(oldPageFile)) {
                    fs.unlinkSync(oldPageFile);
                    console.log(`Removed old page${page}.html`);
                }
                // Remove new naming (p2.html, p3.html, etc.)
                const newPageFile = path.join(__dirname, `p${page}.html`);
                if (fs.existsSync(newPageFile)) {
                    fs.unlinkSync(newPageFile);
                    console.log(`Removed old p${page}.html`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating index.html with pagination:', error);
        throw error;
    }
}

// Function to generate archives.html
function generateArchivesHTML(archivedEntries) {
    try {
        // Read index.html as template
        let html = fs.readFileSync(INDEX_HTML, 'utf8');
        
        // Update title
        html = html.replace(/<title>.*?<\/title>/i, '<title>Archives - Askin\'s Blog</title>');
        
        // Update canonical URL
        html = html.replace(/<link\s+rel="canonical"[^>]*>/i, '<link rel="canonical" href="https://233lol.com/archives.html">');
        
        // Update header link to point back to index
        html = html.replace(/<h1><a href="index\.html">/g, '<h1><a href="index.html">');
        
        // Generate entries HTML
        let entriesHTML = '';
        if (archivedEntries.length === 0) {
            entriesHTML = '<div class="no-entries">No archived PDF entries found.</div>';
        } else {
            entriesHTML = archivedEntries
                .map(entry => generateEntryHTML(entry))
                .join('\n');
        }
        
        // Replace the entries section
        const startMarker = '<!-- GENERATED_ENTRIES_START -->';
        const endMarker = '<!-- GENERATED_ENTRIES_END -->';
        const entriesRegex = new RegExp(
            startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 
            '[\\s\\S]*?' + 
            endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'g'
        );
        
        // Add archives header and entries (no pagination)
        const archivesHeader = '<h2 style="margin-top: 30px; margin-bottom: 20px; color: #2c3e50;">Archives</h2>';
        const newEntriesContent = `${startMarker}\n${archivesHeader}\n${entriesHTML}\n            ${endMarker}`;
        
        html = html.replace(entriesRegex, newEntriesContent);
        
        // Remove pinned entries section for archives
        // Match the entire pinned-entries div including the container
        const pinnedRegex = /<div\s+class="pinned-entries">[\s\S]*?<!--\s*PINNED_ENTRIES_END\s*-->[\s\S]*?<\/div>/gi;
        html = html.replace(pinnedRegex, '');
        
        // Add RSS link if not present
        html = addRSSLink(html);
        
        // Update SEO tags for archives page
        html = html.replace(/<meta\s+name="description"[^>]*>/i, 
            '<meta name="description" content="Archived PDF documents from Askin\'s Blog. Browse all archived academic documents, research papers, and scholarly articles.">');
        html = html.replace(/<meta\s+property="og:title"[^>]*>/i,
            '<meta property="og:title" content="Archives - Askin\'s Blog">');
        html = html.replace(/<meta\s+property="og:description"[^>]*>/i,
            '<meta property="og:description" content="Archived PDF documents from Askin\'s Blog.">');
        
        // Write archives.html
        fs.writeFileSync(ARCHIVES_HTML, html, 'utf8');
        console.log(`Generated archives.html with ${archivedEntries.length} archived entries`);
    } catch (error) {
        console.error('Error generating archives.html:', error);
        throw error;
    }
}

// Function to generate RSS feed
function generateRSSFeed(entries) {
    try {
        const siteURL = getSiteURL();
        const blogTitle = 'Askin\'s Blog';
        const blogDescription = 'Askin\'s Blog, powered by PDF Blog';
        
        // Get the most recent entry date for lastBuildDate
        const lastBuildDate = entries.length > 0 
            ? formatDateRSS(entries[0].modifiedDate)
            : formatDateRSS(new Date());
        
        let itemsXML = '';
        entries.forEach(entry => {
            const title = escapeXML(formatTitle(entry.filename));
            const pdfPath = entry.path ? entry.path.replace(/\\/g, '/') : `pdfs/${encodeURIComponent(entry.filename)}`;
            const link = `${siteURL}/${pdfPath}`;
            const pubDate = formatDateRSS(entry.modifiedDate);
            const guid = `${siteURL}/${pdfPath}`;
            
            itemsXML += `    <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <description>${title}</description>
    </item>
`;
        });
        
        const rssXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXML(blogTitle)}</title>
        <link>${siteURL}</link>
        <description>${escapeXML(blogDescription)}</description>
        <language>zh-cn</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        <atom:link href="${siteURL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXML}    </channel>
</rss>`;
        
        fs.writeFileSync(RSS_XML, rssXML, 'utf8');
        console.log('Generated feed.xml');
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        throw error;
    }
}

// Function to generate sitemap.xml
function generateSitemap(entries, archivedEntries = []) {
    try {
        const siteURL = getSiteURL();
        
        // Format date for sitemap (W3C format: YYYY-MM-DD)
        function formatDateSitemap(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        let urlXML = '';
        
        // Add homepage
        urlXML += `    <url>
        <loc>${siteURL}/</loc>
        <lastmod>${formatDateSitemap(new Date())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
`;
        
        // Add about page
        urlXML += `    <url>
        <loc>${siteURL}/about.html</loc>
        <lastmod>${formatDateSitemap(new Date())}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
`;
        
        // Add RSS feed
        urlXML += `    <url>
        <loc>${siteURL}/feed.xml</loc>
        <lastmod>${formatDateSitemap(new Date())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`;
        
        // Add archives page if it exists
        if (archivedEntries.length > 0) {
            urlXML += `    <url>
        <loc>${siteURL}/archives.html</loc>
        <lastmod>${formatDateSitemap(new Date())}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
`;
        }
        
        // Add pagination pages
        const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
        for (let page = 2; page <= totalPages; page++) {
            urlXML += `    <url>
        <loc>${siteURL}/p${page}.html</loc>
        <lastmod>${formatDateSitemap(new Date())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`;
        }
        
        // Add PDF entries
        entries.forEach(entry => {
            const pdfPath = entry.path ? entry.path.replace(/\\/g, '/') : `pdfs/${encodeURIComponent(entry.filename)}`;
            const url = `${siteURL}/${pdfPath}`;
            const lastmod = formatDateSitemap(entry.modifiedDate);
            
            urlXML += `    <url>
        <loc>${url}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
`;
        });
        
        const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXML}</urlset>`;
        
        fs.writeFileSync(SITEMAP_XML, sitemapXML, 'utf8');
        console.log('Generated sitemap.xml');
    } catch (error) {
        console.error('Error generating sitemap:', error);
        throw error;
    }
}

// Function to ensure SEO tags are present and up-to-date
function ensureSEOTags(html, pageType, entryCount = 0) {
    const siteURL = getSiteURL();
    const isIndex = pageType === 'index';
    const pageTitle = isIndex 
        ? "Askin's Blog - PDF Blog Showcasing Academic Documents"
        : "About - Askin's Blog";
    const pageDescription = isIndex
        ? `A static PDF blog showcasing ${entryCount} academic documents, research papers, and scholarly articles in PDF format. Browse and read PDF documents on various topics including philosophy, sociology, political science, and more.`
        : "Learn more about Askin's Blog, a static PDF blog powered by PDF Blog. Subscribe to our RSS feed for the latest academic documents and research papers.";
    const pageUrl = isIndex ? `${siteURL}/` : `${siteURL}/about.html`;
    
    // Check if head tag exists
    if (!html.includes('<head>')) {
        return html; // Can't add SEO if no head tag
    }
    
    // Function to get or create meta tag
    function getOrCreateMetaTag(name, property, content) {
        const isProperty = !!property;
        const selector = isProperty ? `property="${property}"` : `name="${name}"`;
        const regex = new RegExp(`<meta\\s+${isProperty ? 'property' : 'name'}="${isProperty ? property : name}"[^>]*>`, 'i');
        
        if (html.match(regex)) {
            // Update existing tag
            html = html.replace(regex, `<meta ${isProperty ? 'property' : 'name'}="${isProperty ? property : name}" content="${escapeXML(content)}">`);
        } else {
            // Insert after viewport meta tag
            const viewportRegex = /(<meta\s+name="viewport"[^>]*>)/i;
            if (html.match(viewportRegex)) {
                html = html.replace(viewportRegex, `$1\n    <meta ${isProperty ? 'property' : 'name'}="${isProperty ? property : name}" content="${escapeXML(content)}">`);
            }
        }
    }
    
    // Function to get or create link tag
    function getOrCreateLinkTag(rel, href) {
        const regex = new RegExp(`<link\\s+rel="${rel}"[^>]*>`, 'i');
        if (html.match(regex)) {
            html = html.replace(regex, `<link rel="${rel}" href="${href}">`);
        } else {
            // Insert before stylesheet link
            const stylesheetRegex = /(<link\s+rel="stylesheet"[^>]*>)/i;
            if (html.match(stylesheetRegex)) {
                html = html.replace(stylesheetRegex, `<link rel="${rel}" href="${href}">\n    $1`);
            }
        }
    }
    
    // Update or create title tag
    const titleRegex = /<title>.*?<\/title>/i;
    if (titleRegex.test(html)) {
        html = html.replace(titleRegex, `<title>${escapeXML(pageTitle)}</title>`);
    }
    
    // Primary Meta Tags
    getOrCreateMetaTag('title', null, pageTitle);
    getOrCreateMetaTag('description', null, pageDescription);
    getOrCreateMetaTag('keywords', null, isIndex 
        ? 'PDF blog, academic blog, research papers, scholarly articles, philosophy, sociology, political science, PDF documents'
        : 'about, PDF blog, academic blog, RSS feed, PDF documents');
    getOrCreateMetaTag('author', null, 'Askin');
    getOrCreateMetaTag('robots', null, 'index, follow');
    getOrCreateMetaTag('language', null, 'English');
    if (isIndex) {
        getOrCreateMetaTag('revisit-after', null, '7 days');
    }
    getOrCreateMetaTag('theme-color', null, '#2c3e50');
    
    // Canonical URL
    getOrCreateLinkTag('canonical', pageUrl);
    
    // Open Graph Tags
    getOrCreateMetaTag(null, 'og:type', 'website');
    getOrCreateMetaTag(null, 'og:url', pageUrl);
    getOrCreateMetaTag(null, 'og:title', pageTitle);
    getOrCreateMetaTag(null, 'og:description', pageDescription);
    getOrCreateMetaTag(null, 'og:site_name', "Askin's Blog");
    
    // Twitter Tags
    getOrCreateMetaTag(null, 'twitter:card', isIndex ? 'summary_large_image' : 'summary');
    getOrCreateMetaTag(null, 'twitter:url', pageUrl);
    getOrCreateMetaTag(null, 'twitter:title', pageTitle);
    getOrCreateMetaTag(null, 'twitter:description', pageDescription);
    
    // Structured Data (JSON-LD)
    const structuredData = isIndex ? {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Askin's Blog",
        "description": `A static PDF blog showcasing ${entryCount} academic documents, research papers, and scholarly articles`,
        "url": siteURL,
        "author": {
            "@type": "Person",
            "name": "Askin"
        },
        "publisher": {
            "@type": "Person",
            "name": "Askin"
        },
        "inLanguage": "zh-CN",
        "numberOfItems": entryCount
    } : {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About - Askin's Blog",
        "description": "Learn more about Askin's Blog, a static PDF blog powered by PDF Blog",
        "url": pageUrl,
        "mainEntity": {
            "@type": "Blog",
            "name": "Askin's Blog",
            "url": siteURL
        }
    };
    
    const structuredDataScript = `<script type="application/ld+json">\n    ${JSON.stringify(structuredData, null, 6)}\n    </script>`;
    const structuredDataRegex = /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i;
    
    if (structuredDataRegex.test(html)) {
        html = html.replace(structuredDataRegex, structuredDataScript);
    } else {
        // Insert before stylesheet link
        const stylesheetRegex = /(<link\s+rel="stylesheet"[^>]*>)/i;
        if (html.match(stylesheetRegex)) {
            html = html.replace(stylesheetRegex, `${structuredDataScript}\n    \n    $1`);
        }
    }
    
    return html;
}

// Function to ensure about.html has SEO tags
function ensureAboutHTMLSEO() {
    try {
        const ABOUT_HTML = path.join(__dirname, 'about.html');
        if (!fs.existsSync(ABOUT_HTML)) {
            return; // about.html doesn't exist, skip
        }
        
        let html = fs.readFileSync(ABOUT_HTML, 'utf8');
        html = ensureSEOTags(html, 'about', 0);
        fs.writeFileSync(ABOUT_HTML, html, 'utf8');
        console.log('Updated about.html SEO tags');
    } catch (error) {
        console.error('Error updating about.html SEO:', error);
        // Don't throw - this is not critical
    }
}

// Function to add RSS link to HTML
function addRSSLink(html) {
    // Use relative path for RSS link (works both locally and on GitHub Pages)
    const rssLink = `<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="feed.xml">`;
    
    // Check if RSS link already exists
    if (html.includes('feed.xml')) {
        // Update existing RSS link to use relative path
        return html.replace(/<link rel="alternate" type="application\/rss\+xml"[^>]*href="[^"]*feed\.xml"[^>]*>/g, rssLink);
    }
    
    // Add RSS link after the stylesheet link
    const stylesheetRegex = /(<link rel="stylesheet" href="style\.css">)/;
    return html.replace(stylesheetRegex, `$1\n    ${rssLink}`);
}

// Run build
build();

