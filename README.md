## Distributed-File-System 

The node.js example app teaches the very basics of how to work with Contentful:

- consume content from the Contentful Delivery and Preview APIs
- model content
- edit content through the Contentful web app

The app demonstrates how decoupling content from its presentation enables greater flexibility and facilitates shipping higher quality software more quickly.

<a href="https://the-example-app-nodejs.herokuapp.com/" target="_blank"><img src="https://images.contentful.com/qz0n5cdakyl9/4GZmvrdodGM6CksMCkkAEq/700a527b8203d4d3ccd3c303c5b3e2aa/the-example-app.png" alt="Screenshot of the example app"/></a>

You can see a hosted version of `The node.js example app` on <a href="https://the-example-app-nodejs.contentful.com/" target="_blank">Heroku</a>.

## What is Contentful?

[Contentful](https://www.contentful.com) provides a content infrastructure for digital teams to power content in websites, apps, and devices. Unlike a CMS, Contentful was built to integrate with the modern software stack. It offers a central hub for structured content, powerful management and delivery APIs, and a customizable web app that enable developers and content creators to ship digital products faster.

## Requirements

* Docker
* Docker Compose
* Docker Engine
* Git

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

Here you can run the index.html file as a live server. You might need to change the baseUrl to point to your server path port 80 in the following lines at the beginning of frontend.js:

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

You do not require the health monitor running to run the backend services. The health monitor periodically checks if any of our docker services is down and respawns the service that is down. 

```bash
cd healthMonitor
npm i
npm start
```