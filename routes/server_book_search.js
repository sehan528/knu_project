const axios = require('axios');
const cheerio = require('cheerio');

var router = require('express').Router();

let courses = [];   // 서점 별 검색 결과를 담는다.

router.get('/', function(req, res) {
    //console.log(req.query.value);
    
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
     //console.log(courses);
    res.render('book_search.ejs' , {data : courses, name: req.query.value} )
    }
    parsing(req.query.value);

    // currentPage = courses;

    // function renderPagination(currentPage) {
    //     if (_totalCount <= 20) return; 
    
    //     var totalPage = Math.ceil(_totalCount / 20);
    //     var pageGroup = Math.ceil(currentPage / 10);
    
    //     var last = pageGroup * 10;
    //     if (last > totalPage) last = totalPage;
    //     var first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
    //     var next = last + 1;
    //     var prev = first - 1;
    
    //     const fragmentPage = document.createDocumentFragment();
    //     if (prev > 0) {
    //         var allpreli = document.createElement('li');
    //         allpreli.insertAdjacentHTML("beforeend", `<a href='#js-bottom' id='allprev'>&lt;&lt;</a>`);

    //         var preli = document.createElement('li');
    //         preli.insertAdjacentHTML("beforeend", `<a href='#js-bottom' id='prev'>&lt;</a>`);      
    //         fragmentPage.appendChild(allpreli);
    //         fragmentPage.appendChild(preli);
    //     }
        
    //     for (var i = first; i <= last; i++) {
    //         const li = document.createElement("li");
    //         li.insertAdjacentHTML("beforeend", `<a href='#js-bottom' id='page-${i}' data-num='${i}'>${i}</a>`);
    //         fragmentPage.appendChild(li);
    //     }

    //     if (last < totalPage) {
    //         var allendli = document.createElement('li');
    //         allendli.insertAdjacentHTML("beforeend", `<a href='#js-bottom'  id='allnext'>&gt;&gt;</a>`);

    //         var endli = document.createElement('li');
    //         endli.insertAdjacentHTML("beforeend", `<a  href='#js-program-detail-bottom'  id='next'>&gt;</a>`);

    //         fragmentPage.appendChild(endli);
    //         fragmentPage.appendChild(allendli);
    //     }

    //     document.getElementById('js-pagination').appendChild(fragmentPage);
    //     // 페이지 목록 생성

    //     $(`#js-pagination a`).removeClass("active");
    //     $(`#js-pagination a#page-${currentPage}`).addClass("active");

    //     $("#js-pagination a").click(function (e) {
    //         e.preventDefault();
    //         var $item = $(this);
    //         var $id = $item.attr("id");
    //         var selectedPage = $item.text();

    //         if ($id == "next") selectedPage = next;
    //         if ($id == "prev") selectedPage = prev;
    //         if ($id == "allprev") selectedPage = 1;
    //         if ($id == "allnext") selectedPage = totalPage;

    //         list.renderPagination(selectedPage);//페이지네이션 그리는 함수
    //         list.search(selectedPage);//페이지 그리는 함수
    //     });
    // };




     //console.log(courses);
    // res.render('book_search.ejs' , {data : courses } )
});



module.exports = router;