<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$csvFile = 'leads.csv';
$timestamp = date('Y-m-d H:i:s');

// Get data from POST
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$choir_name = $_POST['choir_name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';

// Create CSV header if file doesn't exist
if (!file_exists($csvFile)) {
    $header = ['Timestamp', 'First Name', 'Last Name', 'Choir Name', 'Email', 'Phone'];
    $fp = fopen($csvFile, 'w');
    fputcsv($fp, $header);
    fclose($fp);
}

// Append new lead
$data = [$timestamp, $first_name, $last_name, $choir_name, $email, $phone];
$fp = fopen($csvFile, 'a');
fputcsv($fp, $data);
fclose($fp);

echo json_encode(['success' => true, 'message' => 'Lead saved']);
?>