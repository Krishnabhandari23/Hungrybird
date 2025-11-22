<?php

namespace App\Models;

use App\Core\Database;

class Activity
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function all($filters = [])
    {
        $sql = "SELECT * FROM activities WHERE deleted_at IS NULL";
        $params = [];

        if (!empty($filters['parent_type'])) {
            $sql .= " AND parent_type = ?";
            $params[] = $filters['parent_type'];
        }

        if (!empty($filters['parent_id'])) {
            $sql .= " AND parent_id = ?";
            $params[] = $filters['parent_id'];
        }

        if (!empty($filters['type'])) {
            $sql .= " AND type = ?";
            $params[] = $filters['type'];
        }

        $sql .= " ORDER BY created_at DESC";

        return $this->db->query($sql, $params);
    }

    public function find($id)
    {
        $sql = "SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL";
        $result = $this->db->query($sql, [$id]);
        return $result[0] ?? null;
    }

    public function create($data)
    {
        $sql = "INSERT INTO activities (parent_type, parent_id, type, summary, date) 
                VALUES (?, ?, ?, ?, ?)";
        
        $this->db->execute($sql, [
            $data['parent_type'],
            $data['parent_id'],
            $data['type'],
            $data['summary'] ?? null,
            $data['date'] ?? null
        ]);

        return $this->find($this->db->lastInsertId());
    }

    public function delete($id)
    {
        $sql = "UPDATE activities SET deleted_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }
}
