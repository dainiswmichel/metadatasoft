<?php
// Store files outside the web root for security
$data_directory = dirname(__DIR__) . '/data/';

// Configuration
$csv_file = $data_directory . 'waitlist-entries.csv';
$ip_log_file = $data_directory . 'submission_ips.log';

// Create data directory if it doesn't exist
if (!file_exists($data_directory)) {
    mkdir($data_directory, 0755, true);
}

// IP-based rate limiting
function checkIPLimit($ip_log_file) {
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $current_date = date('Y-m-d');
    
    // Create file if it doesn't exist
    if (!file_exists($ip_log_file)) {
        file_put_contents($ip_log_file, '');
        chmod($ip_log_file, 0600); // Secure permissions - owner read/write only
    }
    
    // Read the IP log
    $ip_log = file_get_contents($ip_log_file);
    $ip_log_lines = explode("\n", trim($ip_log));
    
    // Check if this IP has submitted today
    foreach ($ip_log_lines as $line) {
        if (empty($line)) continue;
        
        list($logged_date, $logged_ip) = explode(',', $line);
        if ($logged_ip === $ip_address && $logged_date === $current_date) {
            return false; // Already submitted today
        }
    }
    
    // Add this IP to the log
    file_put_contents($ip_log_file, "$current_date,$ip_address\n", FILE_APPEND);
    return true; // Can submit
}

// Check IP submission limit
if (!checkIPLimit($ip_log_file)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'You have already submitted a form today. Please try again tomorrow.'
    ]);
    exit;
}

// Get the data from POST
$timestamp = isset($_POST['timestamp']) ? $_POST['timestamp'] : date('Y-m-d H:i:s');
$name = isset($_POST['name']) ? $_POST['name'] : '';
$phone = isset($_POST['phone']) ? $_POST['phone'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';
$ip = $_SERVER['REMOTE_ADDR'];

// Validate the data
if (empty($name) || empty($phone) || empty($email)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

// Check if the CSV file exists
$file_exists = file_exists($csv_file);

// Open the file for writing (append mode)
$file = fopen($csv_file, 'a');

// If the file was just created, add the header row
if (!$file_exists) {
    fputcsv($file, ['Timestamp', 'Name', 'Phone', 'Email', 'IP Address']);
    chmod($csv_file, 0600); // Secure permissions - owner read/write only
}

// Write the data
fputcsv($file, [$timestamp, $name, $phone, $email, $ip]);

// Close the file
fclose($file);

// Return success
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Waitlist entry recorded'
]);
?>