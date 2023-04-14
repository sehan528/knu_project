const axios = require('axios');
const cheerio = require('cheerio');

var router = require('express').Router();

let courses = [];   // 서점 별 검색 결과를 담는다.
// let store = 'yes24';

router.get('/', function(req, res) {

    const SN = req.query.value;
    let store = req.query.store;

    // if(typeof SN === 'undefined') {
    //     res.render('book_search.ejs' , {data : '', name: '' , now_keyword: '', now_store: ''} )
    // }



    const getHTML = async(keyword) => {
        try {
            if(store === 'yes24'){
                return await axios.get("http://www.yes24.com/Product/Search?domain=STORE&query=" + encodeURI(keyword) + "&page=1&mkentrno=&size=50"); // pagination limit.
            }

            else if (store === 'aladin') {
                return await axios.get("https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&KeyWord=" + encodeURI(keyword) + "&KeyRecentPublish=0&OutStock=0&ViewType=Detail&SortOrder=11&CustReviewCount=0&CustReviewRank=0&KeyFullWord=" + encodeURI(keyword) + "&KeyLastWord=" 
                + encodeURI(keyword) + "&CategorySearch=&chkKeyTitle=&chkKeyAuthor=&chkKeyPublisher=&ViewRowCount=50&SuggestKeyWord=&page=1"); // pagination limit.
                
            } 

            else {
                return await axios.get("https://search.kyobobook.co.kr/search?keyword=" + encodeURI(keyword) + "&target=used&gbCode=TOT&page=1&ra=date&len=50"); // pagination limit.        
            } 
        } 
        catch (err) {
            console.log(err);
        }
    }
        
    const parsing = async (keyword) => {
        const html = await getHTML(keyword);
        const $ = cheerio.load(html.data);

        if(store === 'yes24') {
            const $couresList = $("#yesSchList > li");
            courses = [];
            // DOM 시작 지점.
            
        
            $couresList.each((idx, node) => {   
                courses.push({
                title: $(node).find("div > div.item_info > div.info_row.info_name > span.gd_name").text(),
                author: $(node).find("div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_auth > a:nth-child(1)").text(),
                // date: $(node).find("div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_date").text(),
                price: $(node).find("div > div.item_info > div.info_row.info_price > span:nth-child(1) > strong > em").text() + "원",
                img: $(node).find('em > img').attr('data-original'),
                link : "http://www.yes24.com" + $(node).find("div > div.item_info > div.info_row.info_storeLoca > dl > dd > span > a").attr('href'),
                marker : store
                })
            });
        }

        else if(store === 'aladin') {
            const $coursesList = $("#Search3_Result");
            courses = [];
        
            for (let i = 1; i <= $coursesList.children().length - 1; i++) {
                const $node = $coursesList.children(`div:nth-child(${i})`);
                courses.push({
                    title: $node.find("table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(1) > div > ul > li:nth-child(1) > a.bo3 > b").text(),
                    author: $node.find("table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(1) > div > ul > li:nth-child(2) > a:nth-child(1)").text(),
                    price: $node.find("table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(5) > a > b").text(),
                    img: $node.find('table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > div > a > img').attr('src'),
                    link: "https://www.aladin.co.kr/" + $node.find("table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(5) > a").attr('href'),
                    marker : "aladin"
                })
            }
            // console.log(courses);
            // console.log(req.query.value);
        }

        else {
            const $coursesList = $("#shopData_list > ul ");
            courses = [];
        
            for (let i = 1; i <= $coursesList.children().length; i++) {
                const $node = $coursesList.children(`li:nth-child(${i})`);
                courses.push({
                    title: $node.find("div > div > div > div > div > a > span:nth-child(2)").text(),
                    author: $node.find("div.prod_area.horizontal > div.prod_info_box > div.prod_author_info > div.auto_overflow_wrap.prod_author_group > div.auto_overflow_contents > div > a").text(),
                    price: $node.find("div.prod_area.horizontal > div.prod_info_box > div.prod_price > span.price > span.val").text() + "원",
                    img: $node.find('div.prod_area.horizontal > div.prod_thumb_box.size_lg > a > span > img').attr('src'),
                    link: $node.find("div.prod_btn_wrap > div > a").attr('href'),
                    marker : "kyobo"
                })
            }
        }


        // res.render('book_search.ejs' , {data : courses, name: req.query.value, now_keyword: SN, now_store: store} )
        if(typeof SN === 'undefined') {
            res.render('book_search.ejs', {data: '', name: '', now_keyword: '', now_store: ''});
        } else {
            res.render('book_search.ejs', {data: courses, name: req.query.value, now_keyword: SN, now_store: store});
        }
    }

    parsing(req.query.value);






});



module.exports = router;