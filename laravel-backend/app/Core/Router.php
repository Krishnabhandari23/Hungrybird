<?php

namespace App\Core;

class Router
{
    private $routes = [];

    public function get($path, $handler)
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post($path, $handler)
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put($path, $handler)
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete($path, $handler)
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute($method, $path, $handler)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(Request $request)
    {
        $method = $request->getMethod();
        $uri = $request->getUri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = $this->convertPathToRegex($route['path']);
            
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Remove full match
                
                try {
                    $response = $this->callHandler($route['handler'], $matches, $request);
                    Response::json($response);
                    return;
                } catch (\Exception $e) {
                    Response::json([
                        'success' => false,
                        'message' => 'Server error',
                        'error' => $e->getMessage()
                    ], 500);
                    return;
                }
            }
        }

        // No route found
        Response::json([
            'success' => false,
            'message' => 'Endpoint not found'
        ], 404);
    }

    private function convertPathToRegex($path)
    {
        $path = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $path);
        return '#^' . $path . '$#';
    }

    private function callHandler($handler, $params, $request)
    {
        if (is_callable($handler)) {
            return call_user_func_array($handler, $params);
        }

        if (is_array($handler)) {
            list($class, $method) = $handler;
            $controller = new $class();
            return call_user_func_array([$controller, $method], array_merge([$request], $params));
        }

        throw new \Exception("Invalid route handler");
    }
}
