<?php

namespace App\Controllers;

use App\Core\Request;
use App\Models\Activity;

class ActivityController extends BaseController
{
    protected $activityModel;

    public function __construct()
    {
        $this->activityModel = new Activity();
    }

    public function index(Request $request)
    {
        try {
            $filters = [];
            if ($request->hasQuery('parent_type')) $filters['parent_type'] = $request->query('parent_type');
            if ($request->hasQuery('parent_id')) $filters['parent_id'] = $request->query('parent_id');
            if ($request->hasQuery('type')) $filters['type'] = $request->query('type');

            $activities = $this->activityModel->all($filters);
            $this->sendSuccess($activities, 'Activities retrieved successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to retrieve activities', 500, $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $errors = $this->validate($data, [
                'parent_type' => 'required',
                'parent_id' => 'required|integer',
                'type' => 'required|max:50'
            ]);

            if ($errors) {
                $this->sendError('Validation Error', 400, $errors);
                return;
            }

            if (!in_array($data['parent_type'], ['lead', 'client'])) {
                $this->sendError('parent_type must be either "lead" or "client"', 400);
                return;
            }

            $activity = $this->activityModel->create($data);
            $this->sendSuccess($activity, 'Activity created successfully', 201);
        } catch (\Exception $e) {
            $this->sendError('Failed to create activity', 500, $e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $activity = $this->activityModel->find($id);
            if (!$activity) {
                $this->sendError('Activity not found', 404);
                return;
            }

            $this->activityModel->delete($id);
            $this->sendSuccess(null, 'Activity deleted successfully');
        } catch (\Exception $e) {
            $this->sendError('Failed to delete activity', 500, $e->getMessage());
        }
    }
}
