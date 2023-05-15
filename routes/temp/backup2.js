const puppeteer = require('puppeteer');
const router = require('express').Router();

router.get('/', async (req, res) => {
    const query = req.query.value;
    const sort = req.query.store;

    let books = [];

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`https://search.shopping.naver.com/book/search?bookTabType=ALL&pageIndex=1&pageSize=40&query=${encodeURI(query)}&sort=${sort}`);

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
        const bookList = await page.$$('#book_list > ul > li');

        for (const book of bookList) {
            const name = await book.$eval('div.bookListItem_text_area__hF892 > div.bookListItem_title__X7f9_ > span > span:nth-child(1)', el => el.textContent);
            const author = await book.$eval('div.bookListItem_text_area__hF892 > div.bookListItem_detail__RBQ6x > div:nth-child(1) > span.bookListItem_define_data__kKD8t', el => el.textContent);
            const bookstore = await book.$eval('div.bookListItem_text_area__hF892 > div.bookListItem_detail__RBQ6x > div.bookListItem_define_item__LdTib.bookListItem_publish____VOP > div.bookListItem_detail_publish__FgPYQ > span.bookListItem_define_data__kKD8t', el => el.textContent);
            const date = await book.$eval('div.bookListItem_text_area__hF892 > div.bookListItem_detail__RBQ6x > div.bookListItem_define_item__LdTib.bookListItem_publish____VOP > div.bookListItem_detail_date___byvG', el => el.textContent);
            const img = await book.$eval('a.bookListItem_info_top__VgpiO.linkAnchor > div.bookListItem_thumbnail_area__JSZ_U > div > img', el => el.src);
            const link = await book.$eval('a.bookListItem_info_top__VgpiO.linkAnchor', el => el.href);
            books.push({ name, author, bookstore, date, img, link });
        }

        await browser.close();
    } catch (err) {
        console.error(err);
    }

    // res.json(books);
    if(typeof query === 'undefined') {
        res.render('bookstore_search.ejs', {data: '', name: '', now_keyword: '', now_store: ''});
    } else {
        res.render('bookstore_search.ejs', {data: books, name: req.query.value, now_keyword: query, now_store: sort});
    }
});

module.exports = router;
