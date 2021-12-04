<?php

$MC_apiKey = ''; // Your MailChimp API Key
$MC_listId = ''; // Your MailChimp List ID

if( isset( $_GET['list'] ) AND $_GET['list'] != '' ) {
	$MC_listId = $_GET['list'];
}

if( $_SERVER['REQUEST_METHOD'] == 'POST' ) {
	if( $_POST['sf-email'] != '' ) {

		$email = isset( $_POST['sf-email'] ) ? $_POST['sf-email'] : '';
		$datacenter = explode( '-', $MC_apiKey );
		$submit_url = "https://" . $datacenter[1] . ".api.mailchimp.com/3.0/lists/" . $MC_listId . "/members/" ;

		$data = array(
			'email_address' => $email,
			'status' => 'pending' // "subscribed", "unsubscribed", "cleaned", "pending"
		);

		$payload = json_encode($data);

		$auth = base64_encode( 'user:' . $MC_apiKey );

		$header   = array();
		$header[] = 'Content-type: application/json; charset=utf-8';
		$header[] = 'Authorization: Basic ' . $auth;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $submit_url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 10);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

		$result = curl_exec($ch);
		curl_close($ch);
		$data = json_decode($result);
		
		if ( isset( $data->status ) AND $data->status == 'subscribed' ){
			echo '{ "alert": "success", "message": "You have been successfully subscribed to our email list." }';
		} else if ( isset( $data->status ) AND $data->status == 'pending' ){
			echo '{ "alert": "success", "message": "We have sent you a confirmation email." }';
		} else {
			echo '{ "alert": "error", "message": "' . $data->title . '" }';
		}
	} else {
		echo '{ "alert": "error", "message": "Please fill up all the fields and try again." }';
	}
} else {
	echo '{ "alert": "error", "message": "An unexpected error occured. Please try again later." }';
}

?>