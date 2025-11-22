<?php

namespace App\Controllers;

use App\Core\Request;
use App\Models\Lead;
use App\Services\WorkflowService;

class LeadController extends BaseController
{
    protected $leadModel;
    protected $workflowService;

    public function __construct()
    {
        $this->leadModel = new Lead();
        $this->workflowService = new WorkflowService();
    }

    public function index(Request $request)
    {
        try {
            $filters = [];
            if ($request->hasQuery('status')) $filters['status'] = $request->query('status');
            if ($request->hasQuery('source')) $filters['source'] = $request->query('source');
            if ($request->hasQuery('search')) $filters['search'] = $request->query('search');

            $leads = $this->leadModel->all($filters);
            $this->sendSuccess($leads, 'Leads retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve leads', 500, $e->getMessage());
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

            $lead = $this->leadModel->create($data);
            $this->workflowService->trigger('lead_created', $lead);
            $this->sendSuccess($lead, 'Lead created successfully', 201);
        } catch (\Exception $e) {
            $this->sendError('Failed to create lead', 500, $e->getMessage());
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $lead = $this->leadModel->find($id);
            if (!$lead) {
                $this->sendError('Lead not found', 404);
                return;
            }
            $this->sendSuccess($lead, 'Lead retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve lead', 500, $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $lead = $this->leadModel->find($id);
            if (!$lead) {
                $this->sendError('Lead not found', 404);
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

            $oldStatus = $lead['status'];
            $updatedLead = $this->leadModel->update($id, $data);

            if ($oldStatus !== $updatedLead['status']) {
                $this->workflowService->trigger('status_updated', $updatedLead);
            }

            $this->sendSuccess($updatedLead, 'Lead updated successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to update lead', 500, $e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $lead = $this->leadModel->find($id);
            if (!$lead) {
                $this->sendError('Lead not found', 404);
                return;
            }

            $this->leadModel->delete($id);
            $this->sendSuccess(null, 'Lead deleted successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to delete lead', 500, $e->getMessage());
        }
    }

    public function convert(Request $request, $id)
    {
        try {
            $lead = $this->leadModel->find($id);
            if (!$lead) {
                $this->sendError('Lead not found', 404);
                return;
            }

            if ($lead['converted_to_client_id']) {
                $this->sendError('Lead already converted to client', 400);
                return;
            }

            $client = $this->leadModel->convertToClient($id);
            $this->workflowService->trigger('lead_converted', $lead);
            $this->sendSuccess($client, 'Lead converted to client successfully', 201);
        } catch (\Exception $e) {
            $this->sendError('Failed to convert lead', 500, $e->getMessage());
        }
    }
}
