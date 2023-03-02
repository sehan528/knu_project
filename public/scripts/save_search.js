$(document).ready(function () {
    // 최근 검색어 목록 가져오기
    var recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // 최근 검색어 목록 표시
    var todoList = $("#todo-list");



    for (var i = 0; i < recentSearches.length; i++) {
        var listItem = $("<p></p>");
        var itemText = $("<span></span>").addClass("btn item-text").text(recentSearches[i]);
        
        var itemText = $("<span></span>")
                .addClass("btn item-text")
                .css("color", "#BDBDBD")
                .text(recentSearches[i])
                .attr("onclick", "searchWithKeyword('" + recentSearches[i] + "')")
                .click(function() {
                    var keyword = $(this).text();
                    // var url = "/book_search?value=" + encodeURIComponent(keyword);
                    var url = "/book_search?value=" + encodeURIComponent(keyword) + "&store=" + encodeURIComponent(store);

                    window.location.href = url;
                })
                
        var deleteButton = $("<span></span>").addClass("btn btn-sm delete").text("❌");
        listItem.append(itemText);
        listItem.append(deleteButton);
        todoList.append(listItem);

        function searchWithKeyword(keyword) {
            // var url = "/book_search?value=" + encodeURIComponent(keyword);
            var url = "/book_search?value=" + encodeURIComponent(keyword) + "&store=" + encodeURIComponent(store);
            window.location.href = url;
        }
    }



    // 검색어 입력폼 제출 시 실행
    $("form").submit(function (event) {
        event.preventDefault();

        // 검색어 입력
        var newKeyword = $("input[name=value]").val();

        // 검색어가 최근 검색어 목록에 있는지 확인하고 삭제
        var index = recentSearches.indexOf(newKeyword);
        if (index !== -1) {
            recentSearches.splice(index, 1);
        }

        // 검색어가 최대 4개까지만 저장되도록 함
        if (recentSearches.length >= 4) {
            recentSearches.shift(); // 가장 오래된 검색어 삭제
        }

        // 최근 검색어 목록에 검색어 추가
        recentSearches.push(newKeyword);

        // 최근 검색어 목록을 로컬 스토리지에 저장
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

        // 검색어로 재검색
        // var url = "/book_search?value=" + encodeURIComponent(newKeyword);
        var url = "/book_search?value=" + encodeURIComponent(newKeyword) + "&store=" + encodeURIComponent(store);

        window.location.href = url;
    });

    // 최근 검색어 목록에서 검색어 삭제
    $(document).on("click", ".delete", function () {
        var itemText = $(this).prev().text();
        var index = recentSearches.indexOf(itemText);
        if (index !== -1) {
            recentSearches.splice(index, 1);
            $(this).parent().remove();
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        }
    });

    // 최근 검색어 목록 전체 삭제
    $(".allDelete").click(function () {
        recentSearches = [];
        todoList.empty();
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    });

});