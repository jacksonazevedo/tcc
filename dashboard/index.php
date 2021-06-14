<?php
// Definindo os cabeçalhos de resposta da API
header('Content-Type: application/json; charset=utf-8 ');
        header("Access-Control-Allow-Origin: *");
        header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
// Instanciando a classe de fachada
require_once "controllers/FrontController.php";
new FrontController();
