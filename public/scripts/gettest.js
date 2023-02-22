const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault(); // 기본적인 form 제출 동작을 막음

    const formData = new FormData(form);
    const searchQuery = new URLSearchParams(formData).toString();

    fetch(`/book_search?${searchQuery}`)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
});