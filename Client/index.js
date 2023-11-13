


const http =  new coreHTTP();

const list = document.querySelector(".List");

let testB = document.getElementById("Hello");

//For new item so it doesn't get trigged multiple times
let neoNotSet = false;


const URL = "http://localhost:8080/api"

/**
 * Removes html injection from string
 * @param {string} str The value to check
 * @returns String
 */
function HtmlToString(str){
    // test case: <a href="https://www.google.com">Google</a>
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

/**
 * Edits the TaskObj text 
 * @param {*} key the TaskObj id to edit
 */
function EditTodo(key) {
    //Somehow the key is the whole html for the thing im looking for so...

    // Get the task item by its id
    // let taskItem = document.getElementById(key);
    let taskItem = key;

    // Get the task text and replace it with an input field
    let taskText = taskItem.querySelector('.task-text');
    let oldValue = taskText.textContent;
    taskText.innerHTML = `<input type="text" id="input${key}" class="textEdit" value="${oldValue}">`;

    // Focus the input field
    let input = document.getElementById(`input${key}`);
    input.focus();

    // When the input field loses focus, update the task text with the new value
    input.onblur = () => {
        taskText.textContent = input.value;

        //Update the database
        const isToggled = key.querySelector('.checkmark-button').getAttribute('completed') === 'true';
        Update(key.id.slice(1), taskText.textContent, isToggled);
    };
}

/**
 * Deletes the item
 * @param {*} key the key to deleat
 */
function DeleteTodo(key){
    let element = key;

    //Send to server to delete
    // console.log(`Deleting: ${key.id}`);
    Remove(key.id.slice(1));

    element.parentNode.removeChild(element);
}


/**
 * Makes a new Todo item
 * @param {*} key The key in the database
 * @param {*} item todo task text
 * @param {*} isDone if the item is done or not (may remove this)
 * @returns the html text
 */
function MakeTodo(key, item, isDone){

    let html = `<div class="TaskObj" id=${key}>`;

    //Add the check mark button
    html +=  `<button class="checkmark-button" completed=${isDone} onclick="SetTodoStatus(${key})">`; 
    
    if(isDone===true){
        html += `✔`;
    }
    html +=  `</button>`;
 
    //handles new object and preexisting object (from the database)
    if(key != -1){
        //Add the text 
        html += `<div class="task-text" ondblclick="EditTodo(${key})"`
        
        //If the item is allredy done
        if(isDone == true){
            // html += `<s>${item}</s>`
            html +=  ` style="text-decoration: line-through;">`
        } else {
            html += `>`;
        }

        html += `${HtmlToString(item)}`;
        html += `</div>`;
    } else {
        html += `<div class="task-text"  class="task-text">${HtmlToString(item)}</div>`;
    }

    //Add the delete button
    html += `<button class="delete-button" ondblclick="DeleteTodo(${key})">Delete</button></div>`;

    return html;
}


/**
 * Updates Todo item task status
 * @param {*} key The key in the database
 * @param {*} override force sets the status, only used when making the object from the database
 */
async function SetTodoStatus(key, override) {
    // let task = document.getElementById(key);
    let task = key;
    if (task) {
        let text = task.querySelector('.task-text');
        if (text) {
            let state = !(key.querySelector('.checkmark-button').getAttribute('completed') === 'true');
            if(override != null){
                state = override;
            }

            key.querySelector('.checkmark-button').setAttribute('completed', state);
            //Send http request
            Update(key.id.slice(1), text.textContent, state);


            //adds the check mark to the item
            if(state===true){
                text.style.textDecoration = 'line-through';
                key.querySelector('.checkmark-button').innerHTML=`✔`;
            }else {
                text.style.textDecoration = 'none';
                key.querySelector('.checkmark-button').innerHTML=``;
            }
        }
    }
}

/**
 * Sets the unassigned task (the one with id -1) to a id
 * Should only be used when 
 * @param {*} newId the new id
 */
function SetUnassigned(newId) {
    
    //This is the temp one
    let task = document.getElementById('-1');

    if (task) {
        // Replace the old ID with the new one
        task.id = `_` + newId.toString();

        // Update the onclick attributes of the buttons to use the new ID
        let checkmarkButton = task.querySelector('.checkmark-button');
        if (checkmarkButton) {
            checkmarkButton.setAttribute('onclick', `SetTodoStatus(${task.id})`);
        }

        let deleteButton = task.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.setAttribute('ondblclick', `DeleteTodo(${task.id})`);
        }

        let textElement = task.querySelector('.task-text');
        if (textElement) {
            textElement.setAttribute('ondblclick', `EditTodo(${task.id})`);
        }
    }
}




testB.addEventListener('click', async function() {
    //The key of -1 is a item not in the database
    let key = -1; 

    if(neoNotSet === true){
        return;
    }
    neoNotSet = true;
    
    // Create the new button with editable text
    let newButtonHtml = MakeTodo(key, 'Click to edit text', false);

    // Add the new button to the document
    let newButtonContainer = document.createElement('div');
    newButtonContainer.innerHTML = newButtonHtml;
    // document.body.appendChild(newButtonContainer.firstChild);
    list.appendChild(newButtonContainer.firstChild);

    // Add an event listener to the new button to make its text editable
    let newButton = document.getElementById(key);
    newButton.querySelector('.task-text').addEventListener('click', function(event) {
        let textElement = event.target;
        let originalText = textElement.textContent;

        // Make the text editable
        textElement.contentEditable = 'true';

        // When the text loses focus, check if it was modified
        // textElement.addEventListener('blur', function() {
        textElement.addEventListener('focusout', async function() {
            // If the text was not modified, remove the button
            if (textElement.textContent === originalText) {
                newButton.parentNode.removeChild(newButton);
                neoNotSet = false;
            } else {
                //Create it and change the ids         
                await CreateDoc(textElement.textContent);
                neoNotSet = false;
            }
            // Make the text non-editable again
            textElement.contentEditable = 'false';
        });
    }, {once: true});
});


/**
 * Gets the list from the server
 * @returns promise
 */
async function LoadTodos() {
    return http.get(URL)
        .then(response => {
            // console.log(response.task);
            
            for(let i = 0; i < response.task.length; i++){
                // console.log(response.task[i]);
                let strKey = `_` + response.task[i]._id;
                list.innerHTML +=  MakeTodo(strKey, response.task[i].name, response.task[i].completed);
            }
        })
        .catch(error => {
        console.error(`Error: ${error}`);
    });
}

async function Update(key, text, status){
    return http.put(URL, {key, text, status})
    .then(response => {
        // console.log(response);
    })
    .catch(error => {
        console.error(`Error: ${error}`);
    })
}

async function CreateDoc(text){
    return http.post(URL, {text})
    .then(response => {
        // console.log(response._id);
        SetUnassigned(response._id);
    })
    .catch(error => {
        console.error(`Error: ${error}`);
    })
}

async function Remove(key){
    return http.delete(`${URL}/${key}`)
    .then(response => {
        // console.log(response);
    })
    .catch(error => {
        console.error(`Error: ${error}`);
    })
}

async function main(){
    await LoadTodos();
}
  

main();



