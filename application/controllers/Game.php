<?php
class GameController extends Yaf_Controller_Abstract {

	public function indexAction() {
		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->section = "jugar";

		echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));

		Yaf_Dispatcher::getInstance()->disableView();
	}
}
?>