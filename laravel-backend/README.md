# Lead-Client CRM - Laravel/PHP Backend

This is a complete conversion of the HungryBird CRM from Node.js to Laravel/PHP. All functionality has been preserved and migrated to the new tech stack.

## Tech Stack

### Backend
- **PHP 8.1+**
- **Laravel 10.x** (custom lightweight implementation)
- **MySQL 5.7+**

### Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**

## Project Structure

```
laravel-backend/
├── app/
│   ├── Console/
│   │   └── Kernel.php                    # Console kernel (scheduler)
│   ├── Exceptions/
│   │   └── Handler.php                   # Exception handler
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php            # Base controller
│   │   │   └── Api/
│   │   │       ├── LeadController.php    # Lead CRUD + conversion
│   │   │       ├── ClientController.php  # Client CRUD
│   │   │       ├── ActivityController.php # Activity management
│   │   │       └── WorkflowController.php # Workflow automation
│   │   ├── Middleware/
│   │   │   └── RedirectIfAuthenticated.php
│   │   └── Kernel.php                    # HTTP kernel
│   ├── Models/
│   │   ├── Lead.php                      # Lead model with relationships
│   │   ├── Client.php                    # Client model
│   │   ├── Activity.php                  # Activity model (polymorphic)
│   │   └── Workflow.php                  # Workflow model
│   ├── Providers/
│   │   ├── AppServiceProvider.php        # App service provider
│   │   └── RouteServiceProvider.php      # Route service provider
│   ├── Services/
│   │   └── WorkflowService.php           # Workflow automation engine
│   └── Traits/
│       ├── ApiResponse.php               # API response helper
│       └── SoftDeletes.php               # Custom soft delete trait
├── bootstrap/
│   └── app.php                           # Application bootstrap
├── config/
│   ├── app.php                           # Application configuration
│   ├── cors.php                          # CORS configuration
│   ├── database.php                      # Database configuration
│   └── logging.php                       # Logging configuration
├── public/
│   ├── frontend/                         # Frontend files (HTML, CSS, JS)
│   │   ├── css/
│   │   ├── js/
│   │   └── *.html
│   ├── .htaccess                         # Apache rewrite rules
│   └── index.php                         # Entry point
├── routes/
│   ├── api.php                           # API routes
│   ├── console.php                       # Console routes
│   └── web.php                           # Web routes
├── .env                                  # Environment variables
├── .env.example                          # Environment template
├── composer.json                         # PHP dependencies
└── README.md                             # This file
```

## Installation Instructions

### Prerequisites
- **XAMPP** (Apache + MySQL + PHP 8.1+)
- **Composer** (PHP dependency manager)
- MySQL database named `lead_client_crm`

### Step 1: Install Composer (if not already installed)

Download and install Composer from: https://getcomposer.org/download/

### Step 2: Install Dependencies

```bash
cd c:\xampp\htdocs\HungryBird\laravel-backend
composer install
```

### Step 3: Configure Database

1. Start XAMPP (Apache and MySQL)
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. The database `lead_client_crm` should already exist from your Node.js setup
4. If not, import the schema: `database/schema.sql`

### Step 4: Configure Environment

The `.env` file is already configured with default XAMPP settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lead_client_crm
DB_USERNAME=root
DB_PASSWORD=
```

Update these if your MySQL credentials are different.

### Step 5: Generate Application Key (Optional)

```bash
php artisan key:generate
```

Or manually set a base64 encoded key in `.env`:
```
APP_KEY=base64:YXNkZmFzZGZhc2RmYXNkZmFzZGZhc2RmYXNkZmFzZGZhc2RmYXNkZg==
```

### Step 6: Configure Apache (if needed)

Make sure `mod_rewrite` is enabled in XAMPP.

Edit `c:\xampp\apache\conf\httpd.conf`:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

### Step 7: Access the Application

**Backend API:**
- Base URL: `http://localhost/HungryBird/laravel-backend/public/api`
- Health Check: `http://localhost/HungryBird/laravel-backend/public/api/`

**Frontend:**
- Landing Page: `http://localhost/HungryBird/laravel-backend/public/frontend/landing.html`
- Dashboard: `http://localhost/HungryBird/laravel-backend/public/frontend/index.html`
- Leads: `http://localhost/HungryBird/laravel-backend/public/frontend/leads.html`
- Clients: `http://localhost/HungryBird/laravel-backend/public/frontend/clients.html`
- Workflows: `http://localhost/HungryBird/laravel-backend/public/frontend/workflows.html`

## API Endpoints

### Leads
- `GET /api/leads` - Get all leads (with filters: status, source, search)
- `POST /api/leads` - Create a new lead
- `GET /api/leads/{id}` - Get a specific lead
- `PUT /api/leads/{id}` - Update a lead
- `DELETE /api/leads/{id}` - Soft delete a lead
- `POST /api/leads/{id}/convert` - Convert lead to client

### Clients
- `GET /api/clients` - Get all clients (with search filter)
- `POST /api/clients` - Create a new client
- `GET /api/clients/{id}` - Get a specific client
- `PUT /api/clients/{id}` - Update a client
- `DELETE /api/clients/{id}` - Soft delete a client

### Activities
- `GET /api/activities` - Get all activities (with filters: parent_type, parent_id, type)
- `POST /api/activities` - Create a new activity
- `DELETE /api/activities/{id}` - Soft delete an activity

### Workflows
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create a new workflow
- `PUT /api/workflows/{id}` - Update a workflow
- `DELETE /api/workflows/{id}` - Delete a workflow

## Features

### 1. Lead Management
- Create, read, update, delete leads
- Track lead status, source, and assignments
- Filter and search capabilities
- Convert leads to clients

### 2. Client Management
- Full CRUD operations for clients
- Track converted leads
- Search functionality

### 3. Activity Tracking
- Log activities for both leads and clients
- Support for calls, emails, meetings, notes, etc.
- Polymorphic relationship with leads/clients

### 4. Workflow Automation
- Create custom workflows with triggers
- Support for multiple conditions (equals, not_equals, contains, etc.)
- Multiple action types:
  - Update status
  - Assign to user
  - Create activity
  - Auto-convert lead to client
  - Send notification

### 5. Soft Delete
- All main entities support soft deletion
- Data is never permanently lost
- Can be restored if needed

## Differences from Node.js Version

### Architecture
- **Node.js**: Express.js with route-based architecture
- **Laravel**: MVC pattern with Service layer

### Database Access
- **Node.js**: Direct MySQL queries with mysql2
- **Laravel**: Eloquent ORM with Models

### Routing
- **Node.js**: Separate route files per resource
- **Laravel**: Centralized API routes with resource grouping

### Response Format
- Both versions maintain the same JSON response format:
```json
{
  "success": true/false,
  "message": "...",
  "data": {...}
}
```

### Workflow Engine
- Logic is identical, just refactored from JavaScript to PHP
- All workflow features preserved

## Development

### Debugging
- Logs are written to `storage/logs/laravel.log`
- Set `APP_DEBUG=true` in `.env` for detailed errors

### Adding New Features
1. Create Model in `app/Models/`
2. Create Controller in `app/Http/Controllers/Api/`
3. Add routes in `routes/api.php`
4. Update WorkflowService if automation needed

## Production Deployment

### For Shared Hosting
1. Upload all files to public_html or similar
2. Point domain to `public/` directory
3. Update `.env` with production database credentials
4. Update `API_BASE_URL` in `public/frontend/js/config.js`

### For VPS/Cloud
1. Install PHP 8.1+, MySQL, Apache/Nginx
2. Clone/upload the repository
3. Run `composer install --no-dev`
4. Configure web server to point to `public/` directory
5. Set proper permissions (775 for directories, 664 for files)
6. Update environment variables

### Apache Virtual Host Example
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/laravel-backend/public

    <Directory /path/to/laravel-backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Troubleshooting

### Issue: 404 on API routes
**Solution:** Enable mod_rewrite in Apache and check .htaccess file exists in public/

### Issue: Database connection errors
**Solution:** Verify MySQL is running and credentials in .env are correct

### Issue: CORS errors
**Solution:** CORS is configured to allow all origins. Check browser console for specific errors.

### Issue: Composer not found
**Solution:** Install Composer globally: https://getcomposer.org/download/

## Testing

Test the API using the provided test page:
```
http://localhost/HungryBird/laravel-backend/public/frontend/test-api.html
```

Or use tools like Postman/Insomnia with the endpoints listed above.

## Support

For issues or questions:
1. Check the logs in `storage/logs/laravel.log`
2. Verify database schema matches `database/schema.sql`
3. Ensure all dependencies are installed via Composer

## Migration Notes

This Laravel backend is a **complete functional replacement** for the Node.js backend. All features, endpoints, and behaviors have been preserved. The frontend works identically with both backends - just change the `API_BASE_URL` in config.js.

### Key Conversion Points:
- Express routes → Laravel API routes
- Node.js callbacks → PHP functions
- mysql2 promises → Eloquent ORM
- Node.js modules → Laravel services
- dotenv → Laravel .env
- console.log → Log facade

The API contract remains the same, ensuring frontend compatibility.
