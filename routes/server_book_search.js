const axios = require('axios');
const cheerio = require('cheerio');

var router = require('express').Router();

let courses = [];   // 서점 별 검색 결과를 담는다.


router.get('/', function(req, res) {
    //console.log(req.query.value);
    let SN = req.query.value;
    // console.log(SN);
    
    const getHTML = async(keyword) => {
        try {
            return await axios.get("http://www.yes24.com/Product/Search?domain=STORE&query=" + encodeURI(keyword) + "&page=1&mkentrno=&size=50"); // pagination limit.
        } 
        catch (err) {
            console.log(err);
        }
    }
        
    const parsing = async (keyword) => {
        const html = await getHTML(keyword);
        // console.log(html);
        const $ = cheerio.load(html.data);
        const $couresList = $("#yesSchList > li");
        courses = [];
        // DOM 시작 지점.
        
    
        $couresList.each((idx, node) => {   
            // const title = $(node).find("div > div.item_info > div.info_row.info_name > span.gd_name").text();
            courses.push({
            title: $(node).find("div > div.item_info > div.info_row.info_name > span.gd_name").text(),
            author: $(node).find("div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_auth > a:nth-child(1)").text(),
            date: $(node).find("div > div.item_info > div.info_row.info_pubGrp > span.authPub.info_date").text(),
            price: $(node).find("div > div.item_info > div.info_row.info_price > span:nth-child(1) > strong > em").text(),
            img: $(node).find('em > img').attr('data-original'),
            link : $(node).find("div > div.item_info > div.info_row.info_storeLoca > dl > dd > span > a").attr('href')
            })
        });
        // console.log(courses);
    res.render('book_search.ejs' , {data : courses, name: req.query.value, now_keyword: SN} )
    }
    parsing(req.query.value);
    // req.query.value
});



module.exports = router;