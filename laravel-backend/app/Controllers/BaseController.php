<?php

namespace App\Controllers;

use App\Core\Response;

class BaseController
{
    protected function sendSuccess($data, $message = 'Success', $code = 200)
    {
        Response::success($data, $message, $code);
    }

    protected function sendError($message, $code = 400, $errors = null)
    {
        Response::error($message, $code, $errors);
    }

    protected function validate($data, $rules)
    {
        $errors = [];

        foreach ($rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $value = $data[$field] ?? null;

            foreach ($rules as $rule) {
                if ($rule === 'required' && empty($value)) {
                    $errors[$field][] = "The $field field is required";
                }
                
                if (strpos($rule, 'max:') === 0 && strlen($value) > (int)substr($rule, 4)) {
                    $max = substr($rule, 4);
                    $errors[$field][] = "The $field field must not exceed $max characters";
                }
                
                if ($rule === 'email' && !empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field][] = "The $field field must be a valid email address";
                }
                
                if ($rule === 'integer' && !empty($value) && !is_numeric($value)) {
                    $errors[$field][] = "The $field field must be an integer";
                }
            }
        }

        return empty($errors) ? null : $errors;
    }
}
