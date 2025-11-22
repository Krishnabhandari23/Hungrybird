<?php

namespace App\Models;

use App\Core\Database;

class Workflow
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function all()
    {
        $sql = "SELECT * FROM workflows ORDER BY created_at DESC";
        $results = $this->db->query($sql);
        
        // Decode JSON fields
        foreach ($results as &$workflow) {
            if ($workflow['conditions']) {
                $workflow['conditions'] = json_decode($workflow['conditions'], true);
            }
            if ($workflow['actions']) {
                $workflow['actions'] = json_decode($workflow['actions'], true);
            }
        }
        
        return $results;
    }

    public function find($id)
    {
        $sql = "SELECT * FROM workflows WHERE id = ?";
        $result = $this->db->query($sql, [$id]);
        $workflow = $result[0] ?? null;
        
        if ($workflow) {
            if ($workflow['conditions']) {
                $workflow['conditions'] = json_decode($workflow['conditions'], true);
            }
            if ($workflow['actions']) {
                $workflow['actions'] = json_decode($workflow['actions'], true);
            }
        }
        
        return $workflow;
    }

    public function create($data)
    {
        $sql = "INSERT INTO workflows (trigger_event, conditions, actions, is_active) 
                VALUES (?, ?, ?, ?)";
        
        $this->db->execute($sql, [
            $data['trigger_event'],
            json_encode($data['conditions'] ?? null),
            json_encode($data['actions']),
            $data['is_active'] ?? 1
        ]);

        return $this->find($this->db->lastInsertId());
    }

    public function update($id, $data)
    {
        $sql = "UPDATE workflows SET trigger_event = ?, conditions = ?, actions = ?, is_active = ? 
                WHERE id = ?";
        
        $this->db->execute($sql, [
            $data['trigger_event'],
            json_encode($data['conditions'] ?? null),
            json_encode($data['actions']),
            $data['is_active'] ?? 1,
            $id
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM workflows WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    public function getActiveByTrigger($triggerEvent)
    {
        $sql = "SELECT * FROM workflows WHERE trigger_event = ? AND is_active = 1";
        $results = $this->db->query($sql, [$triggerEvent]);
        
        // Decode JSON fields
        foreach ($results as &$workflow) {
            if ($workflow['conditions']) {
                $workflow['conditions'] = json_decode($workflow['conditions'], true);
            }
            if ($workflow['actions']) {
                $workflow['actions'] = json_decode($workflow['actions'], true);
            }
        }
        
        return $results;
    }
}
