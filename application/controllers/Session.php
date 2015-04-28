<?php

error_reporting(E_ERROR | E_PARSE);
class SessionController extends Yaf_Controller_Abstract {

	public function indexAction() {
		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->section = "login";

		echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/login.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function loginAction(){
		$username = $_POST['user'];
		$password = $_POST['pass'];

		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->section = "inicio";

		$db = new DBConnection();
		$isConnected = $db->login($username, $password);
		if($isConnected){
			header("location: /"); 
		}else{
			echo md5($_POST['pass']);
			$msj =  '?ERROR=Usuario%20o%20contraseña%20incorrectos';
			header("location: /session".$msj);
		}


		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function logoutAction(){
		@session_start(); 
		if($_SESSION['acceso']=='ok') { 
			session_destroy(); 
			header("location: /index"); 
		} 
		exit();
	}
}
?>