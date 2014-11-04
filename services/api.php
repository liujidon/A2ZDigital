<?php
 	require_once("Rest.inc.php");
	
	class API extends REST {
	
		public $data = "";
		
		const DB_SERVER = "localhost";
		const DB_USER = "root";
		const DB_PASSWORD = "n2vd33p";
		const DB = "azdigital";

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
			$id = (int)$this->_request['id'];
			if($id > 0){	
				$query="SELECT distinct clientNumber, firstName, lastName, phone, address, cell, city, postalCode, email, province, dateOfBirth, gender, homeType, notes, referalType, referalText FROM clients where clientNumber=$id";
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
			$column_names = array('clientNumber', 'name', 'type', 'status', 'provider',
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