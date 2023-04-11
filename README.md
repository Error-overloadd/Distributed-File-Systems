# Distributed-File-System 

## Requirements

* Docker
* Docker Compose
* Docker Engine
* Git
* npm


*Note: All cd paths and commands are relative to the root Distributed-File-Systems folder*
## Initial setup

Clone the repo.

```bash
git clone https://github.com/Error-overloadd/Distributed-File-Systems.git
cd Distributed-File-Systems
```

## Run the backend using docker compose

To run the application, we use docker compose to generate docker containers. We first need to run rabbitmq container as other containers need to connect to it.

```bash
cd backend/docker
docker compose up -d --build rabbitmq
```

Once the rabbitmq container is up, we can run the other containers.

```bash
docker compose up -d --build
```

*Note: If you are running docker compose v1.x.x, you need to use docker-compose instead*

## Run the frontend HTML client

```bash
cd frontend
```

Here you can run the index.html file as a live server. You might need to change the baseUrl to point to "http://localhost:5000/" or "http://64.225.105.170/"  depending on where you intend to connect, in the following lines at the beginning of frontend.js. The version you are getting is connecting to localhost currently:

```javascript
let generalRequest =new axios.create({
    baseURL:"http://64.225.105.170/",
    crossDomain: true
})
let requestConfig = {
    baseURL:"http://64.225.105.170/",
    crossDomain: true
}
```

## Running the health monitor

You do not require the health monitor running to run the backend services. The health monitor periodically checks if any of our docker services is down and respawns the service that is down. Depending on the operating system you will need to rename the nginx container name.
On windows machines use "docker-nginx-1" and in linux machines use "docker_nginx_1" in the required_containers list.

```bash
cd healthMonitor
npm i
npm start
```