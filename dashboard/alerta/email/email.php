<?php
$Nome		= "Alerta";	// Pega o valor do campo Nome
$Email		= "jacksonazevedosilva@gmail.com";	// Pega o valor do campo Email
$value= $_GET["value"];
$tipo= $_GET["tipo"];
$msg="";
switch ($tipo) {
    case "1":
        $msg="Alerta de temperatura: ";
        break;
    case "2":
        $msg="Alerta de gás: ";
        break;
}
$corpoEmail = $msg . $value;
// Variável que junta os valores acima e monta o corpo do email

//$corpoEmail 		= "Alerta de coleta, valor excedido: $value\n";
echo $corpoEmail; 
require_once("phpmailer/class.phpmailer.php");

define('GUSER', 'arduino.tcc.jackson@gmail.com');	// <-- Insira aqui o seu GMail
define('GPWD', '92263637');		// <-- Insira aqui a senha do seu GMail

function smtpmailer($para, $de, $de_nome, $assunto, $corpo) { 
	global $error;
	$mail = new PHPMailer();
	$mail->IsSMTP();		// Ativar SMTP
	$mail->SMTPDebug = 1;		// Debugar: 1 = erros e mensagens, 2 = mensagens apenas
	$mail->SMTPAuth = true;		// Autenticação ativada
	$mail->SMTPSecure = 'ssl';	// SSL REQUERIDO pelo GMail
	$mail->Host = 'smtp.gmail.com';	// SMTP utilizado
	$mail->Port = 465;  		// A porta 587 deverá estar aberta em seu servidor
	$mail->Username = GUSER;
	$mail->Password = GPWD;
	$mail->SetFrom($de, $de_nome);
	$mail->Subject = $assunto;
	$mail->Body = $corpo;
	$mail->AddAddress($para);
	if(!$mail->Send()) {
		$error = 'Mail error: '.$mail->ErrorInfo; 
		return false;
	} else {
		$error = 'Mensagem enviada!';
		return true;
	}
}


 if (smtpmailer($Email,GUSER, $Nome, 'Urgente!', $corpoEmail)) {
    http_response_code(200);
}else{
    if (!empty($error)) echo $error;
    http_response_code(400);
}

?>