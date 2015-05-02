<?php

require 'rb.php';

class DBConnection{
	
	public function __construct(){
		R::setup( 'mysql:host=localhost:3306; dbname=fibbage','service', 'S3rv1c3' );
	}
	

	public function login ($username, $password){
		$user = R::findOne('users', ' username LIKE ?', [$username]);
		$respond = array();
		if($user === NULL){
			$respond["error"]="Ese usuario no existe";
		}else{
			if($user->password === md5($password)){
				$respond['username'] = $user->username;
				$respond['id'] = $user->id_user;
			}else{
				$respond["error"]="Contraseña incorrecta";
			}
		}
		return json_encode($respond);
	}

	public function setUser($username, $password){

		$user = R::findOne('users', ' username LIKE ?', [$username]);

		if($user === NULL){
			$sql = 'INSERT INTO users (username, password, creation_date) 
	    	VALUES ("'.$username.'","'.md5($password).'","'.date('Y-m-d H:i:s').'")';

	    	R::exec($sql);
	    	$id = R::getInsertID();

	    	$respond["username"] = $username;
	    	$respond["id"] = $id;
		}else{
			$respond["error"] = "Ese usuario ya esta en uso";
		}
    	return json_encode($respond);
	}

	public function startgame($players){
		$sql = 'INSERT INTO games (date, winner) 
	    VALUES ("'.date('Y-m-d H:i:s').'",12)';
	    R::exec($sql);
	    $id = R::getInsertID();

	    foreach ($players as $key => $player) {
	    	$sql = 'INSERT INTO games_has_users (id_game, id_user, score) 
	    	VALUES ('.$id.','.$player->id.',0)';
	    	R::exec($sql);
	    }
	    return $id;
	}

	public function getUserData(){
		$id = $_SESSION['user_id'];
		$user = R::findOne('users', ' id_user LIKE ?', [$id]);
		$tpl = new stdClass;
		$tpl->user->name = $user->username;
		$tpl->user->id = $id;
		$sql = 'SELECT ghu.id_game, ghu.id_user, ghu.score, games.date, users.username as winner
		FROM games_has_users AS ghu 
		LEFT JOIN games ON ghu.id_game = games.id_game
		LEFT JOIN users ON games.winner = users.id_user
		WHERE
		ghu.id_user='.$id;
		$rows = R::getAll( $sql );
		$tpl->user->games = $rows;
		return $tpl;
	}

	public function saveGame($obj){
		foreach ($obj->players as $key => $player) {
			$sql = "UPDATE games_has_users
					SET score = ".$player->score."
					WHERE id_game = ".$obj->game_id." AND
					id_user = ".$player->id;
			$x = R::exec($sql);
			print_r($x);
		}
		$sql = "UPDATE games
				SET winner = ".$obj->winner."
				WHERE id_game = ".$obj->game_id;
		$y = R::exec($sql);
		print_r($y);

	}

}