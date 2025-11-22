<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\WorkflowService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(WorkflowService::class, function ($app) {
            return new WorkflowService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
