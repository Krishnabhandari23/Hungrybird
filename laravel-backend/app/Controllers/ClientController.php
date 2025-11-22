<?php

namespace App\Controllers;

use App\Core\Request;
use App\Models\Client;

class ClientController extends BaseController
{
    protected $clientModel;

    public function __construct()
    {
        $this->clientModel = new Client();
    }

    public function index(Request $request)
    {
        try {
            $filters = [];
            if ($request->hasQuery('search')) $filters['search'] = $request->query('search');

            $clients = $this->clientModel->all($filters);
            $this->sendSuccess($clients, 'Clients retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve clients', 500, $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $errors = $this->validate($data, [
                'name' => 'required|max:255',
                'email' => 'required|email|max:255'
            ]);

            if ($errors) {
                $this->sendError('Validation Error', 400, $errors);
                return;
            }

            $client = $this->clientModel->create($data);
            $this->sendSuccess($client, 'Client created successfully', 201);
        } catch (\Exception $e) {
            $this->sendError('Failed to create client', 500, $e->getMessage());
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $client = $this->clientModel->find($id);
            if (!$client) {
                $this->sendError('Client not found', 404);
                return;
            }
            $this->sendSuccess($client, 'Client retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve client', 500, $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $client = $this->clientModel->find($id);
            if (!$client) {
                $this->sendError('Client not found', 404);
                return;
            }

            $data = $request->all();
            $errors = $this->validate($data, [
                'name' => 'required|max:255',
                'email' => 'required|email|max:255'
            ]);

            if ($errors) {
                $this->sendError('Validation Error', 400, $errors);
                return;
            }

            $updatedClient = $this->clientModel->update($id, $data);
            $this->sendSuccess($updatedClient, 'Client updated successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to update client', 500, $e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $client = $this->clientModel->find($id);
            if (!$client) {
                $this->sendError('Client not found', 404);
                return;
            }

            $this->clientModel->delete($id);
            $this->sendSuccess(null, 'Client deleted successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to delete client', 500, $e->getMessage());
        }
    }
}
