/**
* Nathan Johnson
* 11/15/18
* This is the javascript page for my pentester's notes webshell page.  It provides the frontend
* behavior for the webshell.
*/
(function() {
    "use strict";
    let url;
    window.addEventListener("load", initialize);

    /**
    * This function initializes the program.  It sets up listeners for all the buttons on the page
    * and sets the cookie/working directory for the webshell to "/"
    * @param no parameters
    * @return no returns
    */
    function initialize(){
        $("get-target-btn").addEventListener("click", checkConnection);
        $("backtomain").addEventListener("click", func => connectionError("true"));
        $("simpleshell-btn").addEventListener("click", simpleShell);
        $("privesc-btn").addEventListener("click", privEsc);
        $("submit-btn").addEventListener
            ("click", func => fetchShellCommand(qsa(".input-field")[3].value));
        $("clear-btn").addEventListener("click", clearResults);
        $("priv-results-btn").addEventListener("click", fetchPrivResults);
        document.cookie = "/";
    }
    /**
    * this function checks to make sure the connection to the backend php script is sound by
    * sending it a GET fetch request.  It then redirects the flow of the program depending on
    * whether or not this request was successful
    * @param no parameters
    * @return no returns
    */
    function checkConnection(){
        let ip = qsa(".input-field")[0].value;
        let uri =qsa(".input-field")[1].value;
        let port = qsa(".input-field")[2].value;
        if (ip.slice(0, 4) === "http") {
            ip = ip.slice(7);
        }
        url = "http://" + ip + ":" + port + uri;
        let fullUrl = url + "?check=true";
        console.log(fullUrl);
        fetch(fullUrl)
        .then(checkStatus)
        .then(JSON.parse)
        .then(optionsScreen)
        .catch(connectionError);
    }

    /**
    * This function hides the currently displayed section, and displays the error section
    * @param no parameters
    * @return no returns
    */
    function connectionError(apiData){
        if (apiData.name != "true"){
            if(qsa("main > section")[4].classList[0] != "hidden"){
                qsa("main > section")[4].classList.toggle("hidden");
            } else if (qsa("main > section")[2].classList[0] != "hidden"){
                qsa("main > section")[2].classList.toggle("hidden");
            } else {
                qsa("main > section")[0].classList.toggle("hidden");
            }
            qsa("main > section")[3].classList.toggle("hidden");
        }
    }

    /**
    * This function hides the options page, and displays the simple shell page
    * @param no parameters
    * @return not returns
    */
    function simpleShell(){
        console.log("simple shell");
        qsa("main > section")[1].classList.toggle("hidden");
        qsa("main > section")[2].classList.toggle("hidden");
    }

    /**
    * This function clears the command results printed on the webshell page
    * @param no parameters
    * @return no returns
    */
    function clearResults(){
        while(qsa("article").length > 1){
        qsa("article")[1].remove();
        }
		qs("article").innerText = "";
		qs("article").classList = ".hidden";
    }

    /**
    * This function performs a fetch POST request to a backend php script.  It then receives the
    * JSON formatted response, and redirects the flow of the program depending on whether or not
    * the request was successful.
    * @param command {string} - any shell command the user wishes to run on the target server
    * @returns {JSON object} returns a JSON object from the php script, which if successful, should
    * contain the response to the command, and the current working directory
    */
    function fetchShellCommand(command){
        qsa(".input-field")[3].value = "";
        console.log(command);
        let params = new FormData();
        params.append("cmd", command);
        params.append("dir", document.cookie);
        fetch(url, {
            method: "post",
            body: params})
        .then(checkStatus)
        .then(JSON.parse)
        .then(apiData => displayResults(apiData, command))
        .catch(connectionError);
    }

    /**
    * This function displays the results of a POST api fetch request
    * @param apiData {JSON object} - the response to a fetch POST request in JSON format
    * @param command {STRING} - any shell command the user wishes to run on the target server
    * @return no returns
    */
    function displayResults(apiData, command){
        console.log(apiData);
        document.cookie = apiData.dir;
        let shellResults = document.createElement("section");
        let commandSection = document.createElement("section");
        shellResults.innerText = apiData.name;
        commandSection.innerText = "******** " + command + " ********";
        if(qsa("main > section")[4].classList[0] === "hidden"){
            $("search-results").appendChild(shellResults);
        } else {
            $("privesc-results").appendChild(shellResults);
            $("privesc-results").appendChild(commandSection);
        }
    }

    /**
    * This function hides the options screen and displays the privilege escalation screen
    * @param no parameters
    * @return no returns
    */
    function privEsc(){
        console.log("privesc");
        if(document.getElementsByName("ostype")[0].checked){
            alert("no windows privesc functionality yet, sowwy");
        } else{
            qsa("main > section")[1].classList.toggle("hidden");
            qsa("main > section")[4].classList.toggle("hidden");
        }
    }

    /**
    * This function sets up the needed variables for a POST fetch request, and then calls the
    * function that makes the POST request
    * @param no parameters
    * @return no returns
    */
    function fetchPrivResults(){
        let privCmdArray = [];
        for(let i=0; i<qsa(".privesc-command").length; i++){
            if(qsa(".privesc-command")[i].checked){
                privCmdArray.push(qsa(".privesc-command")[i].value);
            }
        }
        for(let i=0; i<privCmdArray.length; i++){
            fetchShellCommand(privCmdArray[i]);

        }
    }

    /**
    * This function hides the landing section and displays the options section
    * @param no parameters
    * @return no returns
    */
    function optionsScreen(){
            qsa("main > section")[0].classList.toggle("hidden");
            qsa("main > section")[1].classList.toggle("hidden");
    }

    /**
    * This Function returns a DOM element by its given id
    * @param {string} given element id
    * @returns {object} DOM object defined by given id
    */
    function $(id){
        return document.getElementById(id);
    }

    /**
    * This Function returns a DOM element by its css selector
    * @param {string} given element's css selector
    * @returns {object} DOM element defined by given css selector
    */
    function qs(query){
        return document.querySelector(query);
    }

    /**
    * This Function returns an array of DOM elements by their shared css selector
    * @param {string} given elements' css selector
    * @return {object[]} array of DOM elements defined by given css selector
    */
    function qsa(query){
        return document.querySelectorAll(query);
    }

    /**
    * This Function takes in an HTTP response status code and checks to see if the HTTP request
    * associated with said status code has been successful.  If the request is successful,
    * it returns
    * that status code, if not, it returns the promise result,
    * along with the error status code and any corresponding text
    * @param {object} response - response to check for success/error
    * @return {object} - valid result text if response was successful, otherwise rejected
    * Promise result
    */
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300 || response.status == 0) {
        return response.text();
        } else {
            return Promise.reject(new Error(response.status + ": " + response.statusText));
        }
    }
})();
