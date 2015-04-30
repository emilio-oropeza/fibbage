<?php
error_reporting(E_ERROR | E_PARSE);
class GameController extends Yaf_Controller_Abstract {

	public function indexAction() {
		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->section = "jugar";

		echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
		echo $this->getView()->render("game/index.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function startAction(){
		session_start();

		$users = $_POST["players"];
		$players  = array();
		$game = 0;
		$max = 0;

		foreach ($users as $key => $user) {
			$players[$key] = json_decode($user);
			$max = $key + 1;
		}
		if(!isset($_SESSION) || !isset($_SESSION['game_id']) ){
			$db = new DBConnection();
			$game = $db->startgame($players);		
			$_SESSION['game_id']=$game;
		}else{
			$game = $_SESSION['game_id'];
		}

		$tpl = new stdClass;
		$tpl->title = "Fibbage";
		$tpl->players = $players;
		$tpl->game_id = $game;
		$tpl->questions = $this->getRandomQuestions($max);
		
		echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
		echo $this->getView()->render("game/gaming.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function getRandomQuestions($max){
		$preguntas = array(
			["pregunta"=>"Chicharito le metio _ al atletico","respuesta"=>"2 goles"],
			["pregunta"=>"En 2004 pumas gano ___","respuesta"=>"2 torneos"],
			["pregunta"=>"El equipo del siglo es ____","respuesta"=>"Real Madrid"],
			["pregunta"=>"___ gano la champions en el 2013","respuesta"=>"Bayern Munich"],
			["pregunta"=>"____ se retiro ganando la copa MX","respuesta"=>"Cuauthemoc Blanco"]
		);
		
		$arr = array();

		for ($i=0; $i < $max; $i++) { 
			$random = rand(0,4);
			$arr[$i] = $preguntas[$random];
		}

		return $arr;
	}
}
?>