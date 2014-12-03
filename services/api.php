<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

 	require_once("Rest.inc.php");
	
	class API extends REST {
	
		public $data = "";
		
		const DB_SERVER = "127.0.0.1";
		const DB_USER = "root";
		const DB_PASSWORD = "";
		const DB = "azdigital";

		// const DB_SERVER = "localhost";
		// const DB_USER = "root";
		// const DB_PASSWORD = "n2vd33p";
		// const DB = "azdigital";


		private $db = NULL;
		private $mysqli = NULL;
		public function __construct(){
			parent::__construct();			// Init parent contructor
			$this->dbConnect();					// Initiate Database connection
		}
		
		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
			if ($this->mysqli->connect_errno) {
			    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
			}
		}
		
		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0)
				$this->$func();
			else
				$this->response('',404); // If the method not exist with in this class "Page not found".
		}
				
		private function login(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$email = $this->_request['email'];		
			$password = $this->_request['pwd'];
			if(!empty($email) and !empty($password)){
				if(filter_var($email, FILTER_VALIDATE_EMAIL)){
					$query="SELECT uid, name, email FROM users WHERE email = '$email' AND password = '".md5($password)."' LIMIT 1";
					$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

					if($r->num_rows > 0) {
						$result = $r->fetch_assoc();	
						// If success everythig is good send header as "OK" and user details
						$this->response($this->json($result), 200);
					}
					$this->response('', 204);	// If no records "No Content" status
				}
			}
			
			$error = array('status' => "Failed", "msg" => "Invalid Email address or Password");
			$this->response($this->json($error), 400);
		}
		
		private function clients(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$query="SELECT distinct clientNumber, firstName, lastName, phone, address, cell, city, postalCode, email, province, dateOfBirth, gender, homeType, notes, referalType, referalText FROM clients order by clientNumber";
			$query="SELECT * FROM clients";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function client(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			//$id = (int)$this->_request['id'];
			$clientNumber = (int)$this->_request['clientNumber'];
			if(isset($this->_request['table'])) {
				$table = $this->_request['table'];
				$query="SELECT * FROM $table WHERE clientNumber = $clientNumber";
				if($table == "services") {
					$query=$query ." AND invoiceNumber = (SELECT MAX(invoiceNumber) FROM services)";
				}
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0){
					$result = array();
					while($row = $r->fetch_assoc()){
						$result[] = $row;
					}
					$this->response($this->json($result), 200);
				}
			}
			else {
				$query="SELECT distinct * from clients WHERE clientNumber = $clientNumber";
					$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
					if($r->num_rows > 0) {
						$result = $r->fetch_assoc();	
						$this->response($this->json($result), 200); // send user details
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}
		
		private function insertClient(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$client = json_decode(file_get_contents("php://input"),true);
			$column_names = array('firstName', 'lastName', 'phone', 'address', 'cell', 'city',
									'postalCode', 'email', 'province', 'dateOfBirth', 'gender', 'homeType', 'notes', 'referalType', 'referalText');
			$keys = array_keys($client);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the client received. If blank insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $client[$desired_key];
				}
				$columns = $columns.$desired_key.',';
				$values = $values."'".$$desired_key."',";
			}
			$query = "INSERT INTO clients (".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($client)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Client Created Successfully.", "data" => $client);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}
		private function updateClient(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$client = json_decode(file_get_contents("php://input"),true);
			$id = (int)$client['id'];
			$column_names = array('firstName', 'lastName', 'phone', 'address', 'cell', 'city',
									'postalCode', 'email', 'province', 'dateOfBirth', 'gender', 'homeType', 'notes', 'referalType', 'referalText');
			$keys = array_keys($client['client']);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the client received. If key does not exist, insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $client['client'][$desired_key];
				}
				$columns = $columns.$desired_key."='".$$desired_key."',";
			}
			$query = "UPDATE clients SET ".trim($columns,',')." WHERE clientNumber=$id";
			if(!empty($client)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Client ".$id." Updated Successfully.", "data" => $client);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// "No Content" status
		}
		
		private function deleteClient(){
			if($this->get_request_method() != "DELETE"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){				
				$query="DELETE FROM clients WHERE clientNumber = $id";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Successfully deleted one record.");
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// If no records "No Content" status
		}

		/*****************************Services*******************************/
		private function insertService(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$service = json_decode(file_get_contents("php://input"),true);	
			$column_names = array('clientNumber', 'invoiceNumber', 'name', 'type', 'status', 'provider',
									'deviceType', 'deviceSubtype', 'monthlyCharge', 'activationCost', 'numUnits', 
									'unitCost','totalCost', 'phone', 'deactivationDate', 'notes');
			$keys = array_keys($service);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the service received. If blank insert blank into the array.
			   if(in_array($desired_key, $keys)) {
					$$desired_key = $service[$desired_key];
					$columns = $columns.$desired_key.',';
					$values = $values."'".$$desired_key."',";
				}
			}
			$query = "INSERT INTO services (".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($service)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Service Created Successfully.", "data" => $query);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}
		
		private function getServices(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$id = (int)$this->_request['invoiceID'];
			if($id > 0){
				$query="SELECT * FROM services WHERE invoiceNumber = $id ORDER BY serviceNumber";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0){
					$result = array();
					while($row = $r->fetch_assoc()){
						$result[] = $row;
					}
					$this->response($this->json($result), 200); // send user details
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}

		/*****************************Invoices*******************************/
		private function insertInvoice(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$inovice = json_decode(file_get_contents("php://input"),true);	
			$column_names = array('clientNumber', 'parentID', 'amountDue', 'amountPaid', 'method', 'dueDate', 'paidDate',
									'billingCycle', 'paidBy', 'createdBy', 'notes');
			$keys = array_keys($inovice);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the inovice received. If blank insert blank into the array.
			   if(in_array($desired_key, $keys)) {
					$$desired_key = $inovice[$desired_key];
					$columns = $columns.$desired_key.',';
					$values = $values."'".$$desired_key."',";
				}
			}
			$query = "INSERT INTO invoices (".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($inovice)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Invoice Created Successfully.", "data" => $query,
								 "lastInsertID" => $this->mysqli->insert_id );
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}

		private function updateInvoice(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$invoice = json_decode(file_get_contents("php://input"),true);
			$id = (int)$invoice['id'];
			$column_names =array('clientNumber', 'parentID', 'amountDue', 'amountPaid', 'method', 'dueDate', 'paidDate',
									'billingCycle', 'paidBy', 'createdBy', 'notes');
			$keys = array_keys($invoice['invoice']);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $invoice['invoice'][$desired_key];
				}
				$columns = $columns.$desired_key."='".$$desired_key."',";
			}
			$query = "UPDATE invoices SET ".trim($columns,',')." WHERE id=$id";
			if(!empty($invoice)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Invoice ".$id." Updated Successfully.", "data" => $invoice);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// "No Content" status
		}

		private function getAllInvoices(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$query="SELECT DISTINCT * FROM invoices JOIN clients ON invoices.clientNumber = clients.clientNumber ORDER BY id ";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}

		private function getInvoice(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){	
				$query="SELECT DISTINCT * FROM invoices JOIN clients ON invoices.clientNumber = clients.clientNumber WHERE id = $id ORDER BY id ";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0) {
					$result = $r->fetch_assoc();	
					$this->response($this->json($result), 200);
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}

		/*****************************Cards*******************************/
		private function insertCard(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$card = json_decode(file_get_contents("php://input"),true);	
			$column_names = array('clientNumber', 'name', 'number', 'month', 'year', 'security');
			$keys = array_keys($card);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the card received. If blank insert blank into the array.
			   if(in_array($desired_key, $keys)) {
					$$desired_key = $card[$desired_key];
					$columns = $columns.$desired_key.',';
					$values = $values."'".$$desired_key."',";
				}
			}
			$query = "INSERT INTO cards (".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($card)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Invoice Created Successfully.", "data" => $query);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
		}

		/*
		 *	Encode array into JSON
		*/
		private function json($data){
			if(is_array($data)){
				return json_encode($data);
			}
		}
	}
	
	// Initiiate Library
	
	$api = new API;
	$api->processApi();
?>