# MMU FYP PROJECT (2410)

This is the source code for the Volunteer Management Platform (VMP).

To setup this project:
1. Clone this git repository.
2. Use `npm -i` to install the necessary packages for both project folders.
3. Setup environment variable (.env) in the root of both folders.\
   Frontend:
   ```env
	 VITE_BACKEND_URL=Your Backend URL
   ```

	 Backend:
   ```env
   JWT_SECRETKEY=Your Secret Key
   MONGODB_URL=Your MongoDB URL
   PORT=8083
   ```
	
5. Run the project.\
	 Frontend:
   ```
	 npm run dev
   ```

	 Backend:
   ```
	 node index.js
   ```
