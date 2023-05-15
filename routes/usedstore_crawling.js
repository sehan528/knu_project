const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const router = require('express').Router();

router.get('/', async (req, res) => {
    console.log("반드시 거쳐야 됨");
    var resArray = []; // src_Result 배열 생성
    const bookName = req.query.name; // bookName 변수 생성 후 req.query.name 대입
    // const link = `http://www.yes24.com/Product/Goods/109625396`;
    const link = req.query.link; // bookLink 변수 생성 후 req.query.link 대입

    var searchISBN;
    var searchInfo;

    // ISBN은 이후의 서점별 검색을 위해서만 사용되는 용도
    // 최종 render 될 땐, 서적 디테일 정보 (searchInfo) 와 각 서점별 URL가 return 되어야 한다.


    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(link);

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

        // 추출 1 .ISBN
        const [ISBNElement] = await page.$$('#infoset_specific > div.infoSetCont_wrap > div > table > tbody > tr:nth-child(3) > td');
        const ISBN = await ISBNElement.evaluate(el => el.textContent);
        searchISBN = ISBN;

        // 추출 2 . 서적 디테일 정보
        const bookList = await page.$$('#yDetailTopWrap');
        const bookData = await Promise.all(bookList.map(async (book) => {
            const name = await book.$eval('div.gd_infoTop > div', el => el.textContent.trim().replace(/\s+/g, ' '));
            const author = await book.$eval('span.gd_pubArea > span.gd_auth', el => el.textContent.trim());
            const bookstore = await book.$eval('span.gd_pubArea > span.gd_pub > a', el => el.textContent.trim());
            const date = await book.$eval('span.gd_pubArea > span.gd_date', el => el.textContent.trim());
            try {
                var img = await book.$eval('div.topColLft > div > div.gd_3dGrp.gdImgLoadOn > div > span.gd_img > em > img', el => el.src); // 3D
            } catch(err) {
                var img = await book.$eval('div.topColLft > div > span > em > img', el => el.src); // 2D
            }
            return { name, author, bookstore, date, img };
        }));
        searchInfo = bookData;
        await browser.close();

        return { searchKey: searchISBN, searchInfo };
        

    })()
    // 1차 크롤링 성공. -> 각 서점별 검색 후 URL 반환.
    .then(async (result) => {
        const usedYes24 = `http://www.yes24.com/Product/Search?domain=USED_GOODS&query=${searchISBN}`;
        const usedAladin = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&SearchWord=${searchISBN}`;
        // https://search.kyobobook.co.kr/search?keyword=${searchKey}&gbCode=&target=used
        const KyoboURL = `http://used.kyobobook.co.kr/product/productSearchList.ink?type=isbn&orderClick=LIP&typeValue=${searchISBN}`;
        let Yes24URL = '';
        let AladinURL = '';
        

        console.log("-------------");
        try {
            const responses = await Promise.all([
                axios.get(usedYes24, { responseType: 'text' }),
                axios.get(usedAladin, { responseType: 'text' }),
                axios.get(KyoboURL)
            ]);

            // Yes24 검색 결과 페이지에서 URL 추출
            const htmlYes24 = responses[0].data;
            const $Yes24 = cheerio.load(htmlYes24);
            const urlYes24 = $Yes24('#yesSchList > li > div > div.item_info > div.info_row.info_name > a.gd_name').attr('href');
            let Yes24Price = $Yes24('#yesSchList > li > div > div.item_info > div.info_row.info_price > span:nth-child(1) > strong > em').text();
            let Yes24CNT = $Yes24('#yesSchList > li > div > div.item_info > div.info_row.info_used > span > a > strong').text();
            
            // Aladin 검색 결과 페이지에서 URL 추출
            const htmlAladin = responses[1].data;
            const $Aladin = cheerio.load(htmlAladin);
            // fs.writeFileSync('aladin_data.txt', $Aladin.html());
            let urlAladin = $Aladin('#Search3_Result > div > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div.button_search_usedall > a').attr('href');
            urlAladin = `https://www.aladin.co.kr${urlAladin}`;
            // console.log(urlAladin);

            let AladinPrice = $Aladin('#Search3_Result > div > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(5) > a > b').text();;            
            let AladinCNT = $Aladin('#Search3_Result > div > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > th:nth-child(5) > a > span').text();
            let OriginPrice = $Aladin('#Search3_Result > div > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > a > b').text();


            // kyobo 나머지 정보들
            const htmlKyobo = responses[2].data;
            const $Kyobo = cheerio.load(htmlKyobo);
            let KyoboPrice = $Kyobo('#contents > div.product_search > div.search_detail > div.info > dl > dd.lowest-price').text();
            let KyoboCNT = $Kyobo('#contents > div.product_search > div.search_detail > div.info > dl > dd.secondhand').text();

            AladinPrice = Number(AladinPrice.replace(/[^0-9]/g, ''));
            AladinCNT = Number(AladinCNT.replace(/[^0-9]/g, ''));
            OriginPrice = Number(OriginPrice.replace(/[^0-9]/g, ''));
        
            KyoboPrice = Number(KyoboPrice.replace(/[^0-9]/g, ''));
            KyoboCNT = Number(KyoboCNT.replace(/[^0-9]/g, ''));

            // 최종 전달
            // console.log(KyoboURL);
            // console.log(KyoboPrice);
            // console.log(KyoboCNT);

            // console.log(urlYes24);
            // console.log(Yes24Price);
            // console.log(Yes24CNT);

            // console.log(urlAladin);
            // console.log(AladinPrice);
            // console.log(AladinCNT);

            // console.log(searchISBN);
            // console.log(searchInfo);

            resArray.push({ 
                            name: req.query.name, 
                            link: req.query.link,
                            origin_price: OriginPrice,  
                            kyobo: KyoboURL,
                            kyobo_price: KyoboPrice,
                            kyobo_cnt: KyoboCNT,
                            yes24:urlYes24,
                            yes24_price: Yes24Price,
                            yes24_cnt: Yes24CNT,
                            aladin: urlAladin,
                            aladin_price: AladinPrice,
                            aladin_cnt: AladinCNT,
                            
                            ISBN: searchISBN,
                            INFO: searchInfo  }); // src_Result 배열에 객체 형태로 삽입 
            console.log(resArray);
            res.render('used_store', { data: resArray });
        }
        catch(error) {
            console.log(error);
        };
    })
    // 1차 크롤링이 실패했음.
    .catch((err) => {
        console.error(err);
    });


// ----------------------------------------------------------------------------------------------------------------------



});


module.exports = router;

