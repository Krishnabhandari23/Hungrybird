<?php

namespace App\Core;

class Request
{
    private $method;
    private $uri;
    private $data;
    private $query;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = $this->parseUri();
        $this->query = $_GET;
        $this->data = $this->parseBody();
    }

    private function parseUri()
    {
        $uri = $_SERVER['REQUEST_URI'];
        $uri = parse_url($uri, PHP_URL_PATH);
        
        // Remove base path if running in subdirectory
        $scriptName = dirname($_SERVER['SCRIPT_NAME']);
        if ($scriptName !== '/') {
            $uri = substr($uri, strlen($scriptName));
        }
        
        return $uri ?: '/';
    }

    private function parseBody()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $body = file_get_contents('php://input');
            return json_decode($body, true) ?: [];
        }
        
        if ($this->method === 'POST') {
            return $_POST;
        }
        
        if ($this->method === 'PUT' || $this->method === 'DELETE') {
            $body = file_get_contents('php://input');
            parse_str($body, $data);
            return $data;
        }
        
        return [];
    }

    public function getMethod()
    {
        return $this->method;
    }

    public function getUri()
    {
        return $this->uri;
    }

    public function input($key, $default = null)
    {
        return $this->data[$key] ?? $default;
    }

    public function all()
    {
        return $this->data;
    }

    public function query($key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function has($key)
    {
        return isset($this->data[$key]);
    }

    public function hasQuery($key)
    {
        return isset($this->query[$key]);
    }
}
