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
		$respond = $db->login($username, $password);
		$r = json_decode($respond);
		if(array_key_exists("error", $r)){
			
			$msj =  '?ERROR='.$r->error;
			header("location: /session".$msj);
		}else{
			session_start();
			$_SESSION['user_id']=$r->id;
			$_SESSION['username']=$r->username;
			$_SESSION['acceso']='ok';
			header("location: /"); 
		}


		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function logingameAction(){
		$username = $_POST['user'];
		$password = $_POST['pass'];

		$db = new DBConnection();
		$respond = $db->login($username, $password);

		print_r($respond);

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function registergameAction(){
		$username = $_POST['user'];
		$password = $_POST['pass'];

		$db = new DBConnection();
		$respond = $db->setUser($username, $password);

		print_r($respond);


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