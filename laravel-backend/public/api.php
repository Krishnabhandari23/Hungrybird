<?php

// Pure PHP Router - No Framework Required
// This file handles all API routing

// Start output buffering to prevent any output before JSON response
ob_start();

// Suppress PHP warnings in production (they would break JSON)
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
ini_set('display_errors', '0');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload classes
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Request.php';
require_once __DIR__ . '/../app/Core/Response.php';
require_once __DIR__ . '/../app/Controllers/BaseController.php';
require_once __DIR__ . '/../app/Controllers/LeadController.php';
require_once __DIR__ . '/../app/Controllers/ClientController.php';
require_once __DIR__ . '/../app/Controllers/ActivityController.php';
require_once __DIR__ . '/../app/Controllers/WorkflowController.php';
require_once __DIR__ . '/../app/Services/WorkflowService.php';
require_once __DIR__ . '/../app/Models/Lead.php';
require_once __DIR__ . '/../app/Models/Client.php';
require_once __DIR__ . '/../app/Models/Activity.php';
require_once __DIR__ . '/../app/Models/Workflow.php';

use App\Core\Router;
use App\Core\Request;
use App\Controllers\LeadController;
use App\Controllers\ClientController;
use App\Controllers\ActivityController;
use App\Controllers\WorkflowController;

$router = new Router();
$request = new Request();

// Root endpoint
$router->get('/api', function() {
    return [
        'success' => true,
        'message' => 'Lead-Client CRM API is running'
    ];
});

// Lead routes
$router->get('/api/leads', [LeadController::class, 'index']);
$router->post('/api/leads', [LeadController::class, 'store']);
$router->get('/api/leads/{id}', [LeadController::class, 'show']);
$router->put('/api/leads/{id}', [LeadController::class, 'update']);
$router->delete('/api/leads/{id}', [LeadController::class, 'destroy']);
$router->post('/api/leads/{id}/convert', [LeadController::class, 'convert']);

// Client routes
$router->get('/api/clients', [ClientController::class, 'index']);
$router->post('/api/clients', [ClientController::class, 'store']);
$router->get('/api/clients/{id}', [ClientController::class, 'show']);
$router->put('/api/clients/{id}', [ClientController::class, 'update']);
$router->delete('/api/clients/{id}', [ClientController::class, 'destroy']);

// Activity routes
$router->get('/api/activities', [ActivityController::class, 'index']);
$router->post('/api/activities', [ActivityController::class, 'store']);
$router->delete('/api/activities/{id}', [ActivityController::class, 'destroy']);

// Workflow routes
$router->get('/api/workflows', [WorkflowController::class, 'index']);
$router->post('/api/workflows', [WorkflowController::class, 'store']);
$router->put('/api/workflows/{id}', [WorkflowController::class, 'update']);
$router->delete('/api/workflows/{id}', [WorkflowController::class, 'destroy']);

// Handle the request with error handling
try {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    $router->dispatch($request);
    
    // Flush the output buffer
    if (ob_get_level()) {
        ob_end_flush();
    }
} catch (\Exception $e) {
    // Clear any output
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Send error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
    
    // Log the error
    error_log("API Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    if (ob_get_level()) {
        ob_end_flush();
    }
}
