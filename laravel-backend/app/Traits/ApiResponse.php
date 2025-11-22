<?php

namespace App\Traits;

trait ApiResponse
{
    /**
     * Send a success response
     */
    protected function sendSuccess($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Send an error response
     */
    protected function sendError($message, $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if (!is_null($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
