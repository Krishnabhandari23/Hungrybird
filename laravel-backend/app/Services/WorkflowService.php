<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\Lead;
use App\Models\Client;
use App\Models\Activity;

class WorkflowService
{
    protected $workflowModel;

    public function __construct()
    {
        $this->workflowModel = new Workflow();
    }

    /**
     * Trigger workflows for a specific event
     */
    public function trigger($event, $data)
    {
        try {
            error_log("Workflow triggered: {$event}");

            $workflows = $this->workflowModel->getActiveByTrigger($event);

            foreach ($workflows as $workflow) {
                if ($this->evaluateConditions($workflow['conditions'], $data)) {
                    $this->executeActions($workflow['actions'], $data);
                    error_log("Workflow executed: ID {$workflow['id']}, Event: {$event}");
                }
            }
        } catch (\Exception $e) {
            error_log("Workflow error: " . $e->getMessage());
        }
    }

    /**
     * Evaluate workflow conditions
     */
    protected function evaluateConditions($conditions, $data)
    {
        if (empty($conditions)) {
            return true; // No conditions means always run
        }

        $conditions = is_string($conditions) ? json_decode($conditions, true) : $conditions;

        if (empty($conditions)) {
            return true;
        }

        foreach ($conditions as $condition) {
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? '=';
            $value = $condition['value'] ?? null;

            if (!$field || !isset($data[$field])) {
                continue;
            }

            $dataValue = $data[$field];

            $result = $this->compareValues($dataValue, $operator, $value);

            if (!$result) {
                return false; // AND logic - all conditions must pass
            }
        }

        return true;
    }

    /**
     * Compare two values based on an operator
     */
    protected function compareValues($dataValue, $operator, $value)
    {
        switch ($operator) {
            case '=':
            case '==':
                return $dataValue == $value;
            case '!=':
                return $dataValue != $value;
            case '>':
                return $dataValue > $value;
            case '>=':
                return $dataValue >= $value;
            case '<':
                return $dataValue < $value;
            case '<=':
                return $dataValue <= $value;
            case 'contains':
                return stripos($dataValue, $value) !== false;
            case 'not_contains':
                return stripos($dataValue, $value) === false;
            case 'starts_with':
                return stripos($dataValue, $value) === 0;
            case 'ends_with':
                return substr($dataValue, -strlen($value)) === -strlen($value);
            default:
                return false;
        }
    }

    /**
     * Execute workflow actions
     */
    protected function executeActions($actions, $data)
    {
        $actions = is_string($actions) ? json_decode($actions, true) : $actions;

        if (empty($actions)) {
            return;
        }

        foreach ($actions as $action) {
            $type = $action['type'] ?? null;

            if (!$type) {
                continue;
            }

            try {
                switch ($type) {
                    case 'update_field':
                        $this->updateField($action, $data);
                        break;
                    case 'send_email':
                        $this->sendEmail($action, $data);
                        break;
                    case 'create_activity':
                        $this->createActivity($action, $data);
                        break;
                    case 'send_notification':
                        $this->sendNotification($action, $data);
                        break;
                    default:
                        error_log("Unknown action type: {$type}");
                }
            } catch (\Exception $e) {
                error_log("Action execution error ({$type}): " . $e->getMessage());
            }
        }
    }

    /**
     * Update a field on the entity
     */
    protected function updateField($action, $data)
    {
        $field = $action['field'] ?? null;
        $value = $action['value'] ?? null;

        if (!$field || !isset($data['id'])) {
            return;
        }

        // Determine entity type
        $entityType = $this->determineEntityType($data);
        if (!$entityType) {
            return;
        }

        $updateData = [$field => $value];

        if ($entityType === 'lead') {
            $leadModel = new Lead();
            $leadModel->update($data['id'], $updateData);
            error_log("Updated lead {$data['id']}: {$field} = {$value}");
        } elseif ($entityType === 'client') {
            $clientModel = new Client();
            $clientModel->update($data['id'], $updateData);
            error_log("Updated client {$data['id']}: {$field} = {$value}");
        }
    }

    /**
     * Send an email (simulated)
     */
    protected function sendEmail($action, $data)
    {
        $to = $action['to'] ?? $data['email'] ?? null;
        $subject = $action['subject'] ?? 'Notification';
        $message = $action['message'] ?? '';

        if (!$to) {
            error_log("Cannot send email: no recipient address");
            return;
        }

        // Replace placeholders in subject and message
        $subject = $this->replacePlaceholders($subject, $data);
        $message = $this->replacePlaceholders($message, $data);

        // In production, use mail() or a library like PHPMailer
        // For now, just log the email
        error_log("Email sent to {$to}: {$subject}");
        error_log("Message: {$message}");

        // Uncomment to actually send email:
        // mail($to, $subject, $message);
    }

    /**
     * Create an activity record
     */
    protected function createActivity($action, $data)
    {
        $type = $action['activity_type'] ?? 'note';
        $description = $action['description'] ?? '';

        $description = $this->replacePlaceholders($description, $data);

        $entityType = $this->determineEntityType($data);
        if (!$entityType || !isset($data['id'])) {
            return;
        }

        $activityModel = new Activity();
        $activityModel->create([
            'parent_type' => $entityType,
            'parent_id' => $data['id'],
            'type' => $type,
            'summary' => $description,
            'date' => date('Y-m-d')
        ]);

        error_log("Activity created for {$entityType} {$data['id']}: {$description}");
    }

    /**
     * Send a notification (simulated)
     */
    protected function sendNotification($action, $data)
    {
        $message = $action['message'] ?? '';
        $message = $this->replacePlaceholders($message, $data);

        // In production, implement actual notification system
        error_log("Notification: {$message}");
    }

    /**
     * Replace placeholders in text with actual data
     */
    protected function replacePlaceholders($text, $data)
    {
        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $text = str_replace("{{$key}}", $value, $text);
            }
        }
        return $text;
    }

    /**
     * Determine entity type from data
     */
    protected function determineEntityType($data)
    {
        if (isset($data['converted_to_client_id'])) {
            return 'lead';
        } elseif (isset($data['converted_from_lead_id'])) {
            return 'client';
        }
        // Fallback: check if record exists in either table
        return null;
    }
}
