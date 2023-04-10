import Docker, { ContainerInfo } from 'dockerode';
import path from 'path';


const docker = new Docker();
const intervalTime = 3000; // check every 3 seconds

const { spawn } = require('child_process');
let dockerDirectory = "/root/Distributed-File-Systems/backend/docker"

const required_containers: string[] = [
'docker-nginx-1', 'fileserver_2',
'dfs_backend_3',  'dao_1',
'dfs_backend_2',  'dao_3',
'fileserver_3',   'dao_2',
'dfs_backend_1',  'fileserver_1',
'dfs_db_3',       'dfs_db_1',
'dfs_db_2',       'rabbitmq'
]

console.log(__dirname)
setInterval(async () => {
  let dfs_dockers: ContainerInfo[] = []
  let dfs_docker_running_names:string[] = []
  const containers = await docker.listContainers({all: true});
  containers.forEach(function(container){
    if (container.Names[0].includes("docker") || container.Names[0].includes("dfs") || container.Names[0].includes("fileserver") || container.Names[0].includes("rabbitmq") || container.Names[0].includes("dao"))
    {
      if (container.State==='running'){
        dfs_dockers.push(container)
        let running_name = container.Names[0]
        dfs_docker_running_names.push(running_name.substring(running_name.indexOf("/")+1))
      }
      
    }
  })
  console.log(dfs_dockers.length)
  if (dfs_dockers.length < 14 ){
    console.log("Starting containers that are down")
    let restart_container_list: string[] = []
    required_containers.forEach(element => {
      if(dfs_docker_running_names.includes(element)==false){
        restart_container_list.push(element)
      }

    });
    console.log("containers that need to be restarted:"+restart_container_list)
    let args = ['start']
    restart_container_list.forEach(element => {
      args.push(element)
    });
    const command = spawn('docker-compose', args, {
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