<?php
error_reporting(E_ERROR | E_PARSE);
class ProfileController extends Yaf_Controller_Abstract {

	public function indexAction() {
		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->section = "puntajes";

		session_start();
		if (isset($_SESSION) && @$_SESSION['acceso']==='ok') {
			$db = new DBConnection();
			$tpl->user = $db->getUserData()->user;

			echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
			echo $this->getView()->render("profile/index.phtml",get_object_vars($tpl));
			echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));
			
		}else{
			echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
			echo $this->getView()->render("layout/login.phtml",get_object_vars($tpl));
			echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));
		}

		

		Yaf_Dispatcher::getInstance()->disableView();
	}
}
?>