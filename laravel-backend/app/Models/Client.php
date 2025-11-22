<?php

namespace App\Models;

use App\Core\Database;

class Client
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function all($filters = [])
    {
        $sql = "SELECT * FROM clients WHERE deleted_at IS NULL";
        $params = [];

        if (!empty($filters['search'])) {
            $sql .= " AND (name LIKE ? OR company LIKE ? OR email LIKE ?)";
            $search = "%{$filters['search']}%";
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $sql .= " ORDER BY created_at DESC";

        return $this->db->query($sql, $params);
    }

    public function find($id)
    {
        $sql = "SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL";
        $result = $this->db->query($sql, [$id]);
        return $result[0] ?? null;
    }

    public function create($data)
    {
        $sql = "INSERT INTO clients (name, company, email, phone, converted_from_lead_id) 
                VALUES (?, ?, ?, ?, ?)";
        
        $this->db->execute($sql, [
            $data['name'],
            $data['company'] ?? null,
            $data['email'],
            $data['phone'] ?? null,
            $data['converted_from_lead_id'] ?? null
        ]);

        return $this->find($this->db->lastInsertId());
    }

    public function update($id, $data)
    {
        $sql = "UPDATE clients SET name = ?, company = ?, email = ?, phone = ? 
                WHERE id = ? AND deleted_at IS NULL";
        
        $this->db->execute($sql, [
            $data['name'],
            $data['company'] ?? null,
            $data['email'],
            $data['phone'] ?? null,
            $id
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $sql = "UPDATE clients SET deleted_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }
}
