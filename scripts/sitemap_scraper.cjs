const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITES = [
    { name: 'heliy', url: 'https://heliy.kz', sitemap: 'https://heliy.kz/sitemap.xml' },
    { name: 'luch', url: 'https://luch.asia', sitemap: 'https://luch.asia/sitemap.xml' }
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

async function scrapeProductPage(url, siteUrl, categoryName, siteName) {
    try {
        const res = await axiosInstance.get(url);
        const $ = cheerio.load(res.data);
        
        // If it's not a product page, skip
        if (!$('.catalog-detail__name').length && !$('#pagetitle').length) {
            return false;
        }

        const name = $('.catalog-detail__name, #pagetitle').text().trim();
        if (!name) return false;

        const priceText = $('.price--actual, .price_value').first().text().replace(/\D/g, '');
        const price = priceText ? parseInt(priceText, 10) : 0;
        
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
        
        let localImages = [];
        for (const imgUrl of images) {
            const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
            const filename = `${siteName}_${globalIdCounter}_${localImages.length}${ext}`;
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
            description: description,
            modifications: [
                {
                    id: 1,
                    name: "Стандарт",
                    prices: [{ currency_price: price, currency: "KZT" }]
                }
            ]
        });
        
        // Save every 50 products to avoid huge memory/IO overhead inside loop
        if (allProducts.length % 50 === 0) {
             fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
             console.log(`[${siteName}] Checkpoint: Saved ${allProducts.length} products`);
        }
        
        console.log(`[${siteName}] Scraped product: ${name}`);
        return true;
    } catch (e) {
        console.error(`[Error scraping ${url}]: ${e.message}`);
        return false;
    }
}

async function scrapeSitemap(site) {
    try {
        console.log(`[${site.name}] Fetching sitemap: ${site.sitemap}`);
        const res = await axiosInstance.get(site.sitemap);
        const $ = cheerio.load(res.data, { xmlMode: true });
        
        const urls = [];
        $('loc').each((i, el) => {
            const url = $(el).text();
            if (url.includes('/catalog/')) {
                urls.push(url);
            }
        });
        
        console.log(`[${site.name}] Found ${urls.length} catalog links in sitemap. Start scraping...`);
        
        let count = 0;
        for (const url of urls) {
            const parts = url.split('/').filter(p => p);
            let categoryName = parts.length > 3 ? parts[parts.length - 2] : 'Default';
            
            try {
                const isProduct = await scrapeProductPage(url, site.url, categoryName, site.name);
                if (isProduct) count++;
            } catch (innerE) {
                console.error(`[Loop Error]: ${innerE.message}`);
            }
        }
        console.log(`[${site.name}] Completed. Processed ${count} products.`);
    } catch(e) {
        console.error(`Error on ${site.sitemap}: ${e.message}`);
    }
}

async function main() {
    console.log("Sitemap scraping started...");
    
    // Load existing if any
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            if (Array.isArray(existing) && existing.length > 0) {
               allProducts = existing;
               globalIdCounter = Math.max(...existing.map(p => p.id)) + 1;
               console.log(`Loaded ${existing.length} existing products, resuming...`);
            }
        } catch(e) {
            console.log("Could not load existing file, starting fresh.");
        }
    }
    
    for (const site of SITES) {
        await scrapeSitemap(site);
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`\nFinished! Saved ${allProducts.length} products to ${OUTPUT_FILE}`);
}

main().catch(e => {
    console.error("Critical Main Error:", e);
    // Ensure we save whatever we got on critical failure
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
});
