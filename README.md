
---

# DataCollect

**DataCollect** is an image collection tool designed for AI training dataset preparation. It provides a web-based platform to collect images along with their labels (annotations) in an organized way. The system includes a backend server (built with [xlang](https://github.com/xlang-foundation/xlang) and SQLite) and a frontend web application (built with Vue.js) for users to upload images, manage labels/categories, and prepare a labeled dataset for machine learning tasks.

## Purpose

The primary goal of DataCollect is to simplify the process of gathering and organizing labeled images for AI and machine learning training. Instead of handling files and annotations manually, DataCollect offers a structured workflow to:

- **Collect Images:** Users can upload images through a web interface.
- **Label Data:** Each image can be tagged with one or more labels (categories) and grouped into zones (collections or datasets).
- **Prepare Datasets:** The tool organizes images and their metadata so they can be easily exported or used directly for training AI models.

This helps AI developers build robust training datasets with minimal effort, ensuring that images are consistently labeled and stored for further processing.

## Installation & Usage

Follow these steps to install and run the DataCollect project:

### 1. Prerequisites

- **xlang:** Ensure you have [xlang](https://github.com/xlang-foundation/xlang) installed on your system. *xlang* is the runtime required to execute `.x` files (the backend is written in this language). Download and install it from the provided link.
- **Nginx (optional, for HTTPS):** To deploy DataCollect in production or to access it via HTTPS, you should have Nginx (or another web server) installed for reverse proxying.

### 2. Download the Project

Clone the repository or download the project source code to your local machine:

```bash
git clone https://github.com/yourusername/DataCollect.git
```

*(Replace with the actual repository URL if different.)*

### 3. Initialize and Run the Backend

1. **Database Setup:**  
   The first time you run the backend, it will automatically create a SQLite database file (named `database` by default) and initialize the required tables.

2. **Start the Server:**  
   Navigate into the project directory and run the main backend script using xlang. Use the following command:
   ```bash
   xlang ./main.x
   ```
   This will start the DataCollect server on port **18080**.

3. **Static Frontend:**  
   The Vue.js frontend is served automatically by the backend. The server is configured to serve static files from the `./static` directory (the compiled frontend) and will deliver the `index.html` on the root URL. Make sure the `static` folder (containing the frontend build) is present in the project directory.

4. **Access the Application:**  
   Open a web browser and navigate to `http://localhost:18080` to access the DataCollect web interface. You can register new users or log in with the default admin account as described below.

### 4. Reverse Proxy with Nginx (HTTPS setup)

For a production setup or to enable HTTPS, it’s recommended to run DataCollect behind Nginx:

- **Configure Nginx:**  
  Set up an Nginx server block to listen on port 443 (HTTPS) and forward requests to the DataCollect backend on `localhost:18080`. For example, your Nginx configuration might include:

  ```nginx
  server {
      listen       443 ssl;
      server_name  your-domain.com;

      ssl_certificate      /path/to/fullchain.pem;
      ssl_certificate_key  /path/to/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:18080;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```

  Replace `your-domain.com` and the certificate paths with your actual values. This configuration directs all HTTPS traffic to the local DataCollect server.

- **Access via HTTPS:**  
  After configuring Nginx, access the application at `https://your-domain.com`.

### 5. Using DataCollect

- **Register or Log In:**  
  Upon accessing the web interface, you can register a new account or use the default **admin** account. By default, an administrator user is pre-created with:
  - **Username:** `admin`
  - **Password:** `admin123`

- **Admin Privileges:**  
  After logging in as **admin**, you can create new labels and zones (categories) for image tagging. Regular users can upload images, while admin users manage labels, zones, and user accounts.

- **Uploading Images:**  
  Once logged in, use the interface to upload images:
  1. Select a **Zone** (category or project grouping) and one or more **Labels**.
  2. Request a one-time upload token by calling the appropriate API endpoint.
  3. Submit the image file along with the token, selected zone, and labels.
  4. The server validates the upload, saves the image and its metadata, and returns a success message.

- **Viewing Data:**  
  Uploaded images and their metadata are stored on the server. The web interface or server logs can be used to verify the uploads.

## Dependencies

DataCollect is built with the following technologies:

| Component     | Technology                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Backend**   | [xlang](https://github.com/xlang-foundation/xlang) – an interpreter for executing `.x` files. The backend uses standard libraries for HTTP, SQLite, and YAML parsing. |
| **Frontend**  | Vue.js – a JavaScript framework for building the user interface. The frontend is a single-page application (SPA) compiled into static files. |
| **Database**  | SQLite – a file-based SQL database that is automatically initialized by the application.                              |
| **Web Server**| Nginx (optional) – used as a reverse proxy and TLS terminator for production deployments, forwarding requests to the backend. |

*Note:* xlang is the core dependency for executing the server code. Ensure that the version of xlang you use supports the necessary modules (HTTP, SQLite, YAML).

## System Architecture and Code Flow

DataCollect follows a typical client-server architecture with a RESTful API backend and a SPA frontend.

### Project Structure

- **`main.x`** – The entry point. It initializes the HTTP server, database, and API routes.
- **`server.x`** – Configures the HTTP server, serving static files from the `./static` directory.
- **`db.x`** – Handles database initialization with SQLite, creating tables for users, zones, and labels.
- **`auth.x`** – Contains authentication helpers to verify tokens.
- **`simple_hash.x`** – Provides password hashing and token generation/verification.
- **`random.x`** – Generates pseudo-random strings for salts and unique identifiers.
- **`fs.x`** – Utilities for file system operations (reading/writing files).
- **`api/user.x`** – Implements API endpoints for users, labels, zones, and file uploads.
- **`static/`** – Contains the compiled Vue.js frontend (HTML, CSS, JS files).

### How It Works

1. **Initialization:**  
   When `./main.x` runs, it initializes the database and HTTP server, then registers the API endpoints from `api/user.x` to handle user management, file uploads, and other functionalities.

2. **API Endpoints Overview:**

   **User Management:**
   - `POST /api/user/register`: Register a new user.
   - `POST /api/user/login`: Authenticate a user and return a session token.
   - `GET /api/user/list`: Retrieve a list of all users (requires authentication).
   - `POST /api/user/delete`: Delete a user account (admin only).

   **Zone (Dataset Category):**
   - `POST /api/zone/add`: Create a new zone (admin only).
   - `GET /api/zone/list`: List all zones.
   - `POST /api/zone/update`: Update an existing zone’s name (admin only).
   - `POST /api/zone/delete`: Delete a zone by ID (admin only).

   **Label (Image Tags):**
   - `POST /api/label/add`: Create a new label (admin only).
   - `GET /api/label/list`: Retrieve all labels.
   - `POST /api/label/update`: Rename an existing label (admin only).
   - `POST /api/label/delete`: Delete a label (admin only).

   **File Upload:**
   - `POST /api/user/sign-name`: Generate a one-time token for file uploads (authenticated users).
   - `POST /api/file/upload`: Upload an image along with metadata. The upload involves validating the token, checking the zone, filtering labels, saving the image file, and creating a corresponding JSON metadata file.

3. **Workflow Summary:**
   - **Setup:** Admin sets up labels and zones.
   - **User Registration & Login:** Users register and log in, obtaining tokens for authentication.
   - **Image Upload:** Authenticated users upload images by first obtaining a name token and then submitting the image file and related data.
   - **Data Preparation:** The server stores images and metadata on disk, which can later be aggregated into a dataset for training AI models.

## Dataset Preparation and Data Storage

DataCollect stores the uploaded images and metadata in a structured manner:

- **Image Files:**  
  Saved in a designated directory with a unique name based on a timestamp.

- **Metadata Files:**  
  Each image has an associated JSON file containing:
  - Original filename
  - Timestamp
  - Labels (as an array)
  - Zone information
  - Uploader name and token details
  - File path

These files can be aggregated and processed (e.g., by a script) to create a training dataset for AI models.

## Contribution Guidelines

Contributions to DataCollect are welcome! If you have ideas for improvements or find a bug, please follow these guidelines:

- **Issue Tracking:**  
  Open an issue on the repository with detailed information about the problem or feature request.

- **Fork & PR:**  
  1. Fork the repository.
  2. Create a new branch for your changes.
  3. Make your changes, ensuring code consistency and quality.
  4. Commit with clear messages.
  5. Open a Pull Request explaining your changes.

- **Code Review:**  
  Be receptive to feedback from maintainers.

- **Documentation:**  
  Update documentation as needed when making significant changes.

- **Community Conduct:**  
  Follow standard open-source community guidelines.

## License

This project is licensed under the **Apache License 2.0**. You are free to use, modify, and distribute this software in compliance with the license. See the [`LICENSE`](LICENSE) file for the full text of the license.

---

*Happy collecting and training! If you have any questions or need assistance, please open an issue on the repository.*