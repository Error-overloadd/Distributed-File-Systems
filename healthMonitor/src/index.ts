import Docker, { ContainerInfo } from 'dockerode';


const docker = new Docker();
const intervalTime = 3000; // check every 3 seconds

const { spawn } = require('child_process');
let dockerDirectory = "/root/Distributed-File-Systems/backend/docker"

setInterval(async () => {
  let dfs_dockers: ContainerInfo[] = []
  const containers = await docker.listContainers({all: true});
  containers.forEach(function(container){
    if (container.Names[0].includes("docker") || container.Names[0].includes("dfs") || container.Names[0].includes("fileserver") || container.Names[0].includes("rabbitmq") || container.Names[0].includes("dao"))
    {
      if (container.State==='running'){
        dfs_dockers.push(container)
      }
      
    }
  })
  console.log(dfs_dockers.length)
  if (dfs_dockers.length < 14 ){
    console.log("Starting containers that are down")
    
    const command = spawn('docker-compose', ['start'], {
      cwd: dockerDirectory
    });
    
    command.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });
    
    command.stderr.on('data', (data: any) => {
      console.error(`stderr: ${data}`);
    });
    
    command.on('close', (code: any) => {
      console.log(`child process exited with code ${code}`);
    });
    
  }
  else{
    console.log("All containers are running ")
  }
}, intervalTime);