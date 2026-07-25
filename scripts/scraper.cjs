const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITES = [
    { name: 'heliy', url: 'https://heliy.kz', startUrl: 'https://heliy.kz/catalog/' },
    { name: 'luch', url: 'https://luch.asia', startUrl: 'https://luch.asia/catalog/' }
];

const DATA_DIR = path.join(__dirname, '..', 'data');
const MEDIA_DIR = path.join(DATA_DIR, 'media', 'scraped');
const OUTPUT_FILE = path.join(DATA_DIR, 'scraped_products_full.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
});

let globalIdCounter = 1;
let allProducts = [];

async function downloadImage(url, filepath) {
    if (fs.existsSync(filepath)) return true;
    try {
        const response = await axiosInstance({ url, responseType: 'stream' });
        return new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(filepath))
                .on('finish', () => resolve(true))
                .on('error', e => reject(e));
        });
    } catch (e) {
        return false;
    }
}

async function scrapeProductPage(url, siteUrl) {
    try {
        const res = await axiosInstance.get(url);
        const $ = cheerio.load(res.data);
        
        let description = $('.detail-text').text().trim() || $('.catalog-detail__text').text().trim() || '';
        
        let images = [];
        $('.catalog-detail__gallery-img img, .product-detail-gallery__item img, [data-entity="images-slider-block"] img').each((i, el) => {
            let src = $(el).attr('data-src') || $(el).attr('src');
            if (src && src.startsWith('/')) src = siteUrl + src;
            if (src && !images.includes(src)) images.push(src);
        });
        
        if (images.length === 0) {
            let src = $('.catalog-detail__image img').attr('src');
            if (src) images.push(src.startsWith('/') ? siteUrl + src : src);
        }
        
        return { description, images };
    } catch (e) {
        return { description: '', images: [] };
    }
}

async function scrapeCatalogPage(site, pageUrl, visitedUrls, limit) {
    if (visitedUrls.has(pageUrl) || allProducts.length >= limit) return;
    visitedUrls.add(pageUrl);
    
    try {
        console.log(`[${site.name}] Fetching ${pageUrl}`);
        const res = await axiosInstance.get(pageUrl);
        const $ = cheerio.load(res.data);
        
        const items = $('.catalog-item').toArray();
        for (const item of items) {
            if (allProducts.length >= limit) break;
            
            const nameEl = $(item).find('.catalog-item__name a, .item-title a');
            const name = nameEl.text().trim();
            let link = nameEl.attr('href');
            if (!link || !name) continue;
            
            if (link.startsWith('/')) link = site.url + link;
            if (visitedUrls.has(link)) continue;
            visitedUrls.add(link);
            
            const priceText = $(item).find('.price--actual, .price_value').text().replace(/\D/g, '');
            const price = priceText ? parseInt(priceText, 10) : 0;
            
            const parts = link.split('/').filter(p => p);
            let categoryName = parts.length > 3 ? parts[parts.length - 2] : 'Default';
            
            console.log(`[${site.name}] Scraping product: ${name}`);
            const details = await scrapeProductPage(link, site.url);
            
            let localImages = [];
            for (const imgUrl of details.images) {
                const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
                const filename = `${site.name}_${globalIdCounter}_${localImages.length}${ext}`;
                const filepath = path.join(MEDIA_DIR, filename);
                await downloadImage(imgUrl, filepath);
                localImages.push({ image: `/media/scraped/${filename}` });
            }
            
            allProducts.push({
                id: globalIdCounter++,
                name: name,
                category_detail: {
                    id: 1,
                    name: categoryName
                },
                images: localImages,
                description: details.description,
                modifications: [
                    {
                        id: 1,
                        name: "Стандарт",
                        prices: [{ currency_price: price, currency: "KZT" }]
                    }
                ]
            });
            
            // Save incrementally
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
        }
        
        // Find subcategories and next pages
        if (allProducts.length < limit) {
            let nextLinks = [];
            $('.pagination-next a, .modern-page-next, .section-item a, .menu-item a').each((i, el) => {
                let href = $(el).attr('href');
                if (href && href.includes('/catalog/')) {
                    if (href.startsWith('/')) href = site.url + href;
                    if (!visitedUrls.has(href)) nextLinks.push(href);
                }
            });
            
            for (const nextLink of nextLinks) {
                if (allProducts.length >= limit) break;
                await scrapeCatalogPage(site, nextLink, visitedUrls, limit);
            }
        }
    } catch(e) {
        console.error(`Error on ${pageUrl}`);
    }
}

async function main() {
    console.log("Full scraping started...");
    // Limit to 500 products total for this demo run so it doesn't run forever
    const TOTAL_LIMIT = 500; 
    
    for (const site of SITES) {
        const visitedUrls = new Set();
        await scrapeCatalogPage(site, site.startUrl, visitedUrls, TOTAL_LIMIT);
    }
    
    console.log(`\nFinished! Saved ${allProducts.length} products to ${OUTPUT_FILE}`);
}

main().catch(console.error);
