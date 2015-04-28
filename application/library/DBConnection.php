<?php

require 'rb.php';

class DBConnection{
	
	public function __construct(){
		R::setup( 'mysql:host=localhost:3306; dbname=fibbage','service', 'S3rv1c3' );
	}
	

	public function login ($username, $password){
		$user = R::findOne('users', ' username LIKE ?', [$username]);
		if($user === NULL){
			return FALSE;
		}else{
			if($user->password === md5($password)){
				session_start();
				$_SESSION['user_id']=$user->id_user;
				$_SESSION['username']=$user->username;
				$_SESSION['acceso']='ok';
				return TRUE;
			}else{
				return FALSE;
			}
		}
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

}