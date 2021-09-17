/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            if(!document.getElementById("add-list-button").classList.contains("disabled")){
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();

                let statusbar = document.getElementById("top5-statusbar");
                statusbar.innerHTML = "Top 5 "+ newList.getName();
                
                this.model.view.enableButton("close-button");
                this.model.view.disableButton("add-list-button");
            }

        }

        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }

        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        document.getElementById("close-button").onmousedown = (event) => {
            this.model.closeCurrentList();
            
        }


        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    item.setAttribute("draggable",false);

                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);
                    textInput.focus();
                    textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
                    textInput.style = "width:94%";

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            if(event.target.value === ""){
                                this.model.addChangeItemTransaction(i-1, "?");
                            } else if(event.target.value === this.model.currentList.getItemAt(i-1)){
                                this.model.restoreList();
                            } else{
                                this.model.addChangeItemTransaction(i-1, event.target.value);
                                item.setAttribute("draggable",true);
                            }
                            item.setAttribute("draggable",true);
                            this.model.view.updateToolbarButtons(this.model);
                        }
                    }
                    textInput.onblur = (event) => {
                        if(event.target.value === ""){
                            this.model.addChangeItemTransaction(i-1, "?");
                        } else if(event.target.value === this.model.currentList.getItemAt(i-1)){
                            this.model.restoreList();
                        } else{
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            item.setAttribute("draggable",true);
                        }
                        item.setAttribute("draggable",true);
                        this.model.view.updateToolbarButtons(this.model);
                    }
                }
            }

            //drag and drop
            item.ondragstart = (event) => {
                event.dataTransfer.setData("draggedId", event.target.id);
            }

            item.ondragover = (event) =>{
                event.preventDefault();
            }
            

            item.ondrop = (event) => {
                event.preventDefault();
                let itemId = event.dataTransfer.getData("draggedId");
                let itemIndex = itemId.charAt(itemId.length - 1) - 1;

                if(i-1 !== itemIndex)
                    this.model.addMoveItemTransaction(i-1, itemIndex);
                this.model.view.updateToolbarButtons(this.model);

            }
        }
    }

    

    registerListSelectHandlers(id) {
        let currentListName = this.model.getList(id).getName();
        
        function updateStatusBar(name) {
            let statusbar = document.getElementById("top5-statusbar");
            statusbar.innerHTML = "Top 5 "+ name;
        }

        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            for(let i = 1; i < 6;i++){
                let items = document.getElementById("item-text-input-" + i);
                if(items !== null) items.blur();
            }

            this.model.unselectAll();
            // GET THE SELECTED LIST
            this.model.loadList(id);
            updateStatusBar(currentListName);
            this.model.view.enableButton("close-button");
            this.model.view.disableButton("add-list-button");

        }

        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            let modalCancelButton = document.getElementById("dialog-cancel-button");
            let modalConfirmButton = document.getElementById("dialog-confirm-button");

            modalCancelButton.onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }

            modalConfirmButton.onmousedown = (event) => {
                
                modal.classList.remove("is-visible");
                this.model.removeList(id);
                if(id === this.model.currentList.id){
                    this.model.closeCurrentList();
                } else {
                    this.model.unselectAll();
                     // GET THE SELECTED LIST
                    this.model.loadList(this.model.currentList.id);
                    updateStatusBar(this.model.currentList.getName());
                    this.model.view.enableButton("close-button");
                }
            }


        }


        //Text Editing for Sidebar
        document.getElementById("top5-list-" + id).ondblclick = (event) =>{
            let listBeingEdited = this.model.currentList;

            let listText = document.getElementById("list-card-text-" + id);
            listText.innerHTML = "";

            let textInput = document.createElement("input");
        
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-text-input-" + id);
            textInput.setAttribute("value", currentListName);
            

            listText.appendChild(textInput);
            textInput.focus()
            textInput.selectionStart = textInput.selectionEnd = textInput.value.length;

            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    if(event.target.value === ""){
                        listBeingEdited.setName("Untitled");
                    } else
                        listBeingEdited.setName(event.target.value);
                    this.model.sortLists();
                    this.model.saveLists();
                    this.model.view.highlightList(this.model.currentList.id);
                    updateStatusBar(this.model.currentList.getName());
                }
            }

            textInput.onblur = (event) => {
                if(event.target.value === ""){
                    listBeingEdited.setName("Untitled");
                } else
                    listBeingEdited.setName(event.target.value);
                this.model.sortLists();
                this.model.saveLists();
                this.model.view.highlightList(this.model.currentList.id);
                updateStatusBar(this.model.currentList.getName());
            }

        }

    }


    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}