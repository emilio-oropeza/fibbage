<?php
//date_default_timezone_set('America/New_York');
error_reporting(E_ALL);
ini_set('display_errors', '1');
define ("APPLICATION_PATH", dirname(__FILE__));

$application = new Yaf_Application("conf/application.ini");

$response = $application
	->bootstrap()
	->run();

?>
