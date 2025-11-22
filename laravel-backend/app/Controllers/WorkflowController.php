<?php

namespace App\Controllers;

use App\Core\Request;
use App\Models\Workflow;

class WorkflowController extends BaseController
{
    protected $workflowModel;

    public function __construct()
    {
        $this->workflowModel = new Workflow();
    }

    public function index(Request $request)
    {
        try {
            $workflows = $this->workflowModel->all();
            $this->sendSuccess($workflows, 'Workflows retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve workflows', 500, $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $errors = $this->validate($data, [
                'trigger_event' => 'required|max:255'
            ]);

            if ($errors) {
                $this->sendError('Validation Error', 400, $errors);
                return;
            }

            if (!isset($data['actions'])) {
                $this->sendError('actions field is required', 400);
                return;
            }

            $workflow = $this->workflowModel->create($data);
            $this->sendSuccess($workflow, 'Workflow created successfully', 201);
        } catch (\Exception $e) {
            $this->sendError('Failed to create workflow', 500, $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $workflow = $this->workflowModel->find($id);
            if (!$workflow) {
                $this->sendError('Workflow not found', 404);
                return;
            }

            $data = $request->all();
            $errors = $this->validate($data, [
                'trigger_event' => 'required|max:255'
            ]);

            if ($errors) {
                $this->sendError('Validation Error', 400, $errors);
                return;
            }

            if (!isset($data['actions'])) {
                $this->sendError('actions field is required', 400);
                return;
            }

            $updatedWorkflow = $this->workflowModel->update($id, $data);
            $this->sendSuccess($updatedWorkflow, 'Workflow updated successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to update workflow', 500, $e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $workflow = $this->workflowModel->find($id);
            if (!$workflow) {
                $this->sendError('Workflow not found', 404);
                return;
            }

            $this->workflowModel->delete($id);
            $this->sendSuccess(null, 'Workflow deleted successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to delete workflow', 500, $e->getMessage());
        }
    }
}
