$(function() {
    const $searchBook = $("#searchBook");
    // $를 붙여서 element인 것을 쉽게 인지할 수 있도록 함.

    $searchBook.on("keyup", function (e) {
        if (e.key === "Enter") {
            localStorage.setItem("bookname", $searchBook.val());
            // 검색 로직
            // 1. searchBook 있는 검색하는 책 제목 데이터를 가져온다.
            // 2. 첵 제목을 서버에 던져준다.

            // location.href = "/검색할 서버 ejs 이름?bookname=책이름";
        }
    });

    // 최근검색
    
});


// 담을 수 있는 리스트 만들고 -> 큐 형식으로 최대 3개 담기.
// ["", "", ""]