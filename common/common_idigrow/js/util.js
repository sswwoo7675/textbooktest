const highlighter = new Highlighter();

highlighter.on(Highlighter.event.CLICK, function (data, inst, e) {
    highlighter.remove(data.id);
});

function openToolTip(){
    const sendData = {};

    const selection = document.getSelection();

    //드래그 한 경우가 아닐경우(클릭 등), return 처리
    if(selection.isCollapsed){
        selection.removeAllRanges();
        sendData.instruction = "hide tool";
        window.parent.postMessage(JSON.stringify(sendData), '*')
        return;
    }

    //selection객체를 이용하여 Range객체 얻기
    const selectionRange = selection.getRangeAt(0)
    
    //드래그 시작 노드, 종료 노드 얻어 시작노드와 종료노드 다를 경우 기능 막을 때 필요(추후고려) 
    // const startNode = selectionRange.startContainer.parentNode
    // const endNode = selectionRange.endContainer.parentNode

    // if (!startNode.isSameNode(endNode)) {
    //     this.showMenu = false
    //     return
    // }

    //드래그 Range로 부터 Rect 추출 후 x y width 가져오기
    const { x, y, width } = selectionRange.getBoundingClientRect();

    //width가 0이면 종료
    if (!width) {
        sendData.instruction = "hide tool";
        window.parent.postMessage(JSON.stringify(sendData), '*')
        return;
    }

    const dragPosition = {
        x: x,
        y: y,
        width: width
    }

    sendData.instruction = "show tool";
    sendData.dragPosition = dragPosition
    sendData.dragText = selection.toString();

    window.parent.postMessage(JSON.stringify(sendData), '*')


}

// function makeHighlight() {

//     const highlightElement = document.createElement('span');
//     highlightElement.className = 'highlight-me';
//     highlightElement.style.backgroundColor = 'yellow';

//     const selection = document.getSelection();
//     const range = selection.getRangeAt(0);
//     range.surroundContents(highlightElement);

//     selection.removeAllRanges();
// }

function makeHighlight2() {
    const selection = document.getSelection();

    if (!selection.isCollapsed) {
        highlighter.fromRange(selection.getRangeAt(0));
    }

    selection.removeAllRanges();    
}

function receiveMsgFromParent(e){
    const message = e.data;

    if(message == "remove select"){
        document.getSelection().removeAllRanges();
    }

    if (message == "highlight") {
        makeHighlight2()
    }
}

window.onload = function(){
    window.addEventListener("mouseup",openToolTip);
    window.addEventListener("message",receiveMsgFromParent)
}