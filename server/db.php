<?php
    $servername = "localhost:3306";
    $username = "icliphaw_clint";
    $password = "Lightnsound1";
    
    try {
      $pdo = new PDO("mysql:host=$servername;dbname=icliphaw_lotto_scanner_db", $username, $password,array(
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
            ));
      // set the PDO error mode to exception
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch(PDOException $e) {
      echo "DB Connection failed: " . $e->getMessage();
      console.log("DB Connection failed: " . $e->getMessage());
    }
?>