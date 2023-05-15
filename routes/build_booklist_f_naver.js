const puppeteer = require('puppeteer');
const router = require('express').Router();

router.get('/', async (req, res) => {
    const query = req.query.value;
    const sort = req.query.store;
    console.log(query);

    let books = [];


    // 검색값이 없을 경우 
    if(typeof query === 'undefined') {
        console.log("type undefined");
        res.render('bookstore_search.ejs', {data: '', name: '', now_keyword: '', now_store: ''});
    } 
    else if(query) {
        console.log("SEARCH");
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
    
            await page.goto(`http://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURI(query)}&page=1&size=80&dispNo2=001001003&order=${sort}`);
            // 스크롤을 자동으로 내림
            let previousHeight;
            while (true) {
                const currentHeight = await page.evaluate('document.body.scrollHeight');
                if (currentHeight === previousHeight) {
                    break;
                }
                previousHeight = currentHeight;
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForTimeout(5); // 로딩 대기
            }
    
            // 동적으로 로드된 책 정보 추출
            const bookList = await page.$$('#yesSchList > li');
            const regex = /http:\/\/www.yes24.com\/Product\/Goods\/(\d+)/;
    
            if (sort === 'SINDEX_ONLY') {
    
            for (const book of bookList) {
                const name = await book.$eval('div > div.item_info > div.info_row.info_name > a.gd_name', el => el.textContent);
                try{
                    var author = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_auth > a', el => el.textContent);
                }catch(err){
                    var author = " ";
                }
                const bookstore = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_pub > a', el => el.textContent);
                try {
                    var date = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_date', el => el.textContent);
                }catch(err){
                    var date = " ";
                }
                
                var img = await book.$eval('div > div.item_img > div.img_canvas > span > span > a', el => el.href);
                const link = await book.$eval('div.item_info > div.info_row.info_name > a.gd_name', el => el.href);
    
                const matches = regex.exec(img);
                const id = matches[1];
                img = `https://image.yes24.com/goods/${id}`;
    
                books.push({ name, author, bookstore, date, img, link });
            }
                
            } else if (sort === 'CONT_CNT') {
                for (const book of bookList) {
                    const name = await book.$eval('div > div.item_info > div.info_row.info_name > a.gd_name', el => el.textContent);
                    try{
                        var author = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_auth > a', el => el.textContent);
                    }catch(err){
                        var author = " ";
                    }
                    const bookstore = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_pub > a', el => el.textContent);
                    const date = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_date', el => el.textContent);
                    var img = await book.$eval('div > div.item_img > div.img_canvas > span > span > a', el => el.href);
                    const link = await book.$eval('div.item_info > div.info_row.info_name > a.gd_name', el => el.href);
        
                    const matches = regex.exec(img);
                    const id = matches[1];
                    img = `https://image.yes24.com/goods/${id}`;
        
                    books.push({ name, author, bookstore, date, img, link });
                }
            } else {
                for (const book of bookList) {
                    const name = await book.$eval('div > div.item_info > div.info_row.info_name > a.gd_name', el => el.textContent);
                    try{
                        var author = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_auth > a', el => el.textContent);
                    }catch(err){
                        var author = " ";
                    }
                    const bookstore = await book.$eval('div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_pub > a', el => el.textContent);
                    const date = await book.$eval('div > div.item_info > div.info_row.info_rating > span.rating_rvCount > a', el => el.textContent);
                    var img = await book.$eval('div > div.item_img > div.img_canvas > span > span > a', el => el.href);
                    const link = await book.$eval('div.item_info > div.info_row.info_name > a.gd_name', el => el.href);
                    const matches = regex.exec(img);
                    const id = matches[1];
                    img = `https://image.yes24.com/goods/${id}`;
                    books.push({ name, author, bookstore, date, img, link });
                }
            }
            await browser.close();
        } catch (err) {
            console.error(err);
        }
        res.render('bookstore_search.ejs', {data: books, name: req.query.value, now_keyword: query, now_store: sort});
    }
    else {
        console.log("PASS");
        res.render('bookstore_search.ejs', {data: '', name: '', now_keyword: '', now_store: ''});
    }
});

module.exports = router;
