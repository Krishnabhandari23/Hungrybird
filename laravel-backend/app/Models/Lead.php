<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Lead
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function all($filters = [])
    {
        $sql = "SELECT * FROM leads WHERE deleted_at IS NULL";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['source'])) {
            $sql .= " AND source = ?";
            $params[] = $filters['source'];
        }

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
        $sql = "SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL";
        $result = $this->db->query($sql, [$id]);
        return $result[0] ?? null;
    }

    public function create($data)
    {
        $sql = "INSERT INTO leads (name, company, email, phone, status, source, assigned_to) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $this->db->execute($sql, [
            $data['name'],
            $data['company'] ?? null,
            $data['email'],
            $data['phone'] ?? null,
            $data['status'] ?? 'new',
            $data['source'] ?? null,
            $data['assigned_to'] ?? null
        ]);

        return $this->find($this->db->lastInsertId());
    }

    public function update($id, $data)
    {
        $sql = "UPDATE leads SET name = ?, company = ?, email = ?, phone = ?, status = ?, source = ?, assigned_to = ? 
                WHERE id = ? AND deleted_at IS NULL";
        
        $this->db->execute($sql, [
            $data['name'],
            $data['company'] ?? null,
            $data['email'],
            $data['phone'] ?? null,
            $data['status'],
            $data['source'] ?? null,
            $data['assigned_to'] ?? null,
            $id
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $sql = "UPDATE leads SET deleted_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    public function convertToClient($id)
    {
        $lead = $this->find($id);
        if (!$lead || $lead['converted_to_client_id']) {
            return null;
        }

        // Create client
        $clientModel = new Client();
        $client = $clientModel->create([
            'name' => $lead['name'],
            'company' => $lead['company'],
            'email' => $lead['email'],
            'phone' => $lead['phone'],
            'converted_from_lead_id' => $lead['id']
        ]);

        // Update lead
        $sql = "UPDATE leads SET converted_to_client_id = ?, status = 'converted' WHERE id = ?";
        $this->db->execute($sql, [$client['id'], $id]);

        return $client;
    }
}
