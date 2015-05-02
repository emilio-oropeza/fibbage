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
		
		foreach ($users as $key => $user) {
			$players[$key] = json_decode($user);
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
		
		echo $this->getView()->render("layout/header.phtml",get_object_vars($tpl));
		echo $this->getView()->render("game/gaming.phtml",get_object_vars($tpl));
		echo $this->getView()->render("layout/footer.phtml",get_object_vars($tpl));

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function getquestionsAction(){

		$index = json_decode($_GET['index']);

		$questions = array(
			["i"=>0,"q"=>"Chicharito le metio _ al atletico","a"=>"2 goles","ba"=>"un susto"],
			["i"=>1,"q"=>"En 2004 pumas gano ___","a"=>"2 torneos","ba"=>"nada"],
			["i"=>2,"q"=>"El equipo del siglo es ____","a"=>"Real Madrid","ba"=>"Barcelona"],
			["i"=>3,"q"=>"___ gano la champions en el 2013","a"=>"Bayern Munich","ba"=>"Borussia Dortmund"],
			["i"=>4,"q"=>"____ se retiro ganando la copa MX","a"=>"Cuauthemoc Blanco","ba"=>"Francisco Palencia"],
			["i"=>5,"q"=>"5","a"=>"5","ba"=>"6"],
			["i"=>6,"q"=>"6","a"=>"6","ba"=>"7"],
			["i"=>7,"q"=>"7","a"=>"7","ba"=>"8"],
			["i"=>8,"q"=>"8","a"=>"8","ba"=>"9"]
		);

		$flag = true;
		$i =0;

		$question = ["error"=>"Todas las preguntas fueron enviadas"];

		while($flag){
			$random = rand(0,sizeof($questions));
			if(!in_array($questions[$random]["i"], $index)){
				$question = $questions[$random];
				$flag = false;
			}
			
		}

		echo json_encode($question);

		Yaf_Dispatcher::getInstance()->disableView();
	}

	public function saveAction(){
		session_start();
		$tpl = new stdClass;
		$tpl->game_id = $_SESSION['game_id'];
		$tpl->players = json_decode($_POST['json']);

		$max = 0;
		$p = -1;
		foreach ($tpl->players as $key => $player) {
			if($player->score > $max){
				$max = $player->score;
				$p = $player->id;
			}
		}
		$tpl->winner = $p;
		//print_r($tpl);

		$db = new DBConnection();
		$game = $db->savegame($tpl);

		Yaf_Dispatcher::getInstance()->disableView();
	}
}
?>