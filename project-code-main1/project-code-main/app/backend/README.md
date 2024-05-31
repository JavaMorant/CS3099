# Backend

## Running the backend

Backend is a `Flask` app using the `Python` programming language. The setup is using `pipenv` as the package manager. To start the backend, there are two options:

The backend can be run with the following flags:

- `-d` (development) - sets the `APP_ENV` environment variable and tells the backend that it is running in a 'development' mode.
- `n` (no authentication) - setts the `APP_AUTH_TYPE` environment variable to `NONE` to indicate that the backend should not use any authentication. This is useful for testing the backend without having to deal with authentication.
- `b` (build) - this makes sure that the backend is built before running it. This flag should be used always unless there were no new changes made to the backend since the last time it was built.

### Start backend separately

This is the preferred option. To start the backend separately, simply run the `start-backend`script from the `backend` folder. This will start the backend server  and will automatically check for any errors. However, to see the actual page, you need to start the frontend as well. See the frontend README for more information. But in short to do this you should run the `start-frontend` script from the `frontend` folder. Note that on Windows you need to run the `start-backend.ps1` file and on Linux and macOS you need to run the `start-backend.sh` file. The same is true for frontend as well.

### Start backend and frontend together

If you want to start the backend and frontend together, you can run the `start` script from the `app` folder. This will start the backend and frontend together.

## Technology stack

The backend uses the following technologies:

- `Flask` as the backend framework
- `Python` as the programming language
- `pipenv` as the package manager
- `openapi` as the API specification. It allows for easy definition of the API. It also allows for easy generation of the API client, which is used in the frontend to communicate with the backend. For more information about `openapi`, see [here](https://swagger.io/specification/).

## Backend structure

- The root of the backend contains the backend files common to all groups. To prevent merge conflicts, the backend is designed right now for each group to develop each backend for their visualisation. These APIs from each of the backends will then simply be merged into the main backend with a single import, allowing the frontend to see all the backend APIs at once.
- The root of the backend contains the following folders:
    - The `auth` folder contains the authentication files for the backend. This includes the `auth.py` file, which contains the authentication logic.
    - The `services` folder defines the services used by the authentication logic.
    - The `utils` folder defines some simple utilities used for running the app.
    - The `domain` folder defines the types used in the backend API - `endpoints`. These types include the types of the parameters the API endpoints take as well as the types of the responses the API endpoints return. See the `domain/model.py` and `groupxx_backend/endpoints/user.py` files for more information.
- The root of the folder also contains the `config.py` file which reads some environment variables and sets the configuration constants for the app. This is the place where all constants relating the configuration of the project should be placed.

### `groupxx_backend` folder

- The `groupxx_backend` is linked to the main backend via `import groupxx_backend.app` in `backend/app.py` file. This imports all the endpoints defined in the `app.py` file in the `groupxx_backend`. Whenever a new API endpoint is defined in the `groupxx_backend` it should be imported in the `app.py` file which will then be automatically imported in the `backend/app.py` file and therefore visible to the frontend.

- The `groupxx_backend` folder contains the backend files for each group. Each group should have their own folder, which contains the backend files for their visualisation. The backend files should be structured as follows:
  - There is only a single folder in the `groupxx_backend` folder, which is the `endpoints` folder. This folder contains all the API endpoints of the `groupxx`'s backend.

#### `endpoints` folder

The `endpoints` folder defines all the API endpoints a group wants to expose to the frontend. All the endpoints should be marked protected by the `@protected` decorator. This ensures that they cannot be accessed without the proper authentication token. To define the path the frontend should make a request to talk to the given endpoint use the `app.<method>(<path>)` syntax. The folder is made into a package by the `__init__.py` file. This allows other files to easily import the endpoints defined in the `endpoints` folder.

Other than the `endpoints` folder the backend can be set up with any kind of file structure that suits the group.
