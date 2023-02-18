const toDoForm = document.querySelector('#todo-form');
const toDoInput = toDoForm.querySelector('input');
const toDoList = document.querySelector('#todo-list');
const allDelete = document.querySelector('.allDelete');
const txt = document.querySelector('.txt');
const TODOS_KEY = "todos";

let toDos = [];

function saveToDos() {
    typeof Storage !== "undefined" &&
    localStorage.setItem(TODOS_KEY, JSON.stringify(toDos.slice(-3))); // 최근 3개의 항목만 저장
    console.log(toDos);
};

function allDeleteToDo() { //전체 item을 삭제
    // localStorage.clear(toDos);
    // console.log(toDos);
    // toDoList.innerText = '최근검색어 내역이 없습니다.';

    localStorage.removeItem(TODOS_KEY);
    toDos = []; // toDos 배열도 초기화
    toDoList.innerText = '최근검색어 내역이 없습니다.';
    txt.innerText = ''; // '최근검색어 내역이 없습니다.' 문구도 초기화
    allDelete.classList.add('off'); // '모두 지우기' 버튼을 다시 숨깁니다.
};

function deleteToDo(e) {
    const li = e.target.parentElement;
    li.remove();
    toDos = toDos.filter((toDo) => toDo.id !== parseInt(li.id));
    toDos.length === 0 && (txt.innerText = "최근검색어 내역이 없습니다.");
    saveToDos();
    if (toDos.length < 3) { // 항목이 3개보다 적을 경우 빈 문자열을 채워줌
        
        for (let i = toDos.length; i < 3; i++) {
            toDos.push({ id: Date.now(), text: "" });
        }
    }
};

function paintToDo (newTodo) { //화면에 뿌림
    if (!newTodo) {
        return;
    }

    const {id, text} = newTodo;
    const item = document.createElement("li");
    const span = document.createElement("span");
    const button = document.createElement("button");

    item.id = id;
    span.innerText = text;
    button.innerText = '❌';
    button.addEventListener("click", deleteToDo);
    allDelete.addEventListener("click", allDeleteToDo);
    item.appendChild(span);
    item.appendChild(button);
    toDoList.appendChild(item);

    const toDoItems = document.querySelectorAll('#todo-list li'); // 현재 리스트 항목 개수 가져오기
    if (toDoItems.length > 3) { // 리스트 항목이 3개 이상인 경우
        // toDoList.removeChild(toDoItems[toDoItems.length - 1]); // 리스트의 마지막 항목 삭제
        toDoList.removeChild(toDoItems[0]);
    }

    if (toDos.length > 0) {
        allDelete.classList.remove('off');
    } else {
        txt.innerText = '최근검색어 내역이 없습니다.';
    }
    saveToDos();
};

function handleToDoSubmit(event) {
    event.preventDefault();
    const newTodoItem = toDoInput.value;
    toDoInput.value = '';
    if (newTodoItem !== '') { // 입력값이 비어있지 않은 경우에만 실행
        const newTodoObj = {
            id: Date.now(),
            text: newTodoItem
        };
        toDos.push(newTodoObj);
        paintToDo(newTodoObj);
        saveToDos();
    }
};

toDoForm.addEventListener('submit', handleToDoSubmit);

const savedToDos = JSON.parse(localStorage.getItem(TODOS_KEY));
if(savedToDos !== null) {
    toDos = savedToDos //전에 있던 items들을 계속 가지도 있다록 합니다. 
    savedToDos.forEach(paintToDo);
}
