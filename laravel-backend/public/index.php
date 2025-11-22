<?php

// Simple PHP API - No Laravel Framework Required
// Redirects to API or serves welcome page

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// If requesting API, forward to api.php
if (strpos($path, '/api') === 0 || strpos($path, '/api') !== false) {
    require __DIR__ . '/api.php';
    exit;
}

// If requesting frontend files, let Apache handle them
if (strpos($path, '/frontend/') !== false) {
    return false; // Let Apache serve the file
}

// Otherwise show welcome page
if (file_exists(__DIR__ . '/welcome.html')) {
    readfile(__DIR__ . '/welcome.html');
} else {
    header('Location: /HungryBird/laravel-backend/public/frontend/landing.html');
}
exit;
