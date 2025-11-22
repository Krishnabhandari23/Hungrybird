<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait SoftDeletes
{
    /**
     * Boot the soft deleting trait for a model.
     */
    protected static function bootSoftDeletes()
    {
        static::addGlobalScope('notDeleted', function (Builder $builder) {
            $builder->whereNull('deleted_at');
        });
    }

    /**
     * Soft delete the model.
     */
    public function delete()
    {
        if ($this->fireModelEvent('deleting') === false) {
            return false;
        }

        $this->deleted_at = now();
        $saved = $this->save();

        if ($saved) {
            $this->fireModelEvent('deleted', false);
        }

        return $saved;
    }

    /**
     * Restore a soft-deleted model.
     */
    public function restore()
    {
        if ($this->fireModelEvent('restoring') === false) {
            return false;
        }

        $this->deleted_at = null;
        $exists = $this->save();

        if ($exists) {
            $this->fireModelEvent('restored', false);
        }

        return $exists;
    }

    /**
     * Force delete the model.
     */
    public function forceDelete()
    {
        return parent::delete();
    }

    /**
     * Determine if the model has been soft-deleted.
     */
    public function trashed()
    {
        return !is_null($this->deleted_at);
    }
}
