import axios from "axios";
import {checkServerIdentity} from "tls";

const timeout = 10000
export class DAOServerLE{
    id: number;
    address: string;
    isCoordinator: boolean;
    isAlive: boolean;

    constructor(id:number, address:string, isCoordinator:boolean, isAlive:boolean){
        this.id = id;
        this.address = address;
        this.isCoordinator = isCoordinator;
        this.isAlive = isAlive;
    }
    
}

export class leaderElection{

    servers: DAOServerLE[];
    
    constructor(servers: any) {
        this.servers = servers
    }

    public async updateList()
    {
        for (const server of this.servers) {
            await this.checkServerIsAlive(server);
        }
        return true
    }

    public async startElection(){
        console.log("start new leader election")
        //console.log(this.servers)
        //console.log("after update")
        let result = await this.updateList()
        //console.log(this.servers)
        if (result){
            let new_leader:any = this.findHighestServer()
            if(new_leader){
                new_leader.isCoordinator = true
       
                console.log("leader elected " + new_leader.address + ", adding to queue")
            }
        }
        console.log("Update after election")
        console.log(this.servers)
        console.log("Election done#####################################")

    }

    // return the address of the current leader
    public async getCurrentLeader() {
        const retryCount = this.servers.length;// limit the number of try to avoid freezing
        for (let i = 0; i < retryCount; i++){
            console.log("trying to find current coordinator, count:" + (i+1));
            const currCoordinator = this.servers.find(server => server.isCoordinator === true);
            if (currCoordinator){
                await this.checkServerIsAlive(currCoordinator);
                if(currCoordinator.isAlive){
                    // current coordinator is alive, return
                    console.log('Current coordinator is : '+ currCoordinator.id);
                    return currCoordinator.address;
                }else{
                    // current coordinator is dead
                    console.log('Coordinator is dead');
                    currCoordinator.isCoordinator = false;
                    await this.startElection();
                }
            }else{
                //No coordinator existed
                console.log('No coordinator found');
                await this.startElection();
            }
        }
        console.log('Maximum of try reached,cannot find coordinator');
        return null;
    }

    public findHighestServer(): DAOServerLE | null {
        let highestServerID = 0
        let highestServer: any = null
        this.servers.forEach(function (server) {
            if(server.isAlive){
                if(server.id>highestServerID){
                    highestServerID = server.id
                    highestServer = server
                }
            }

        });
        return highestServer 
      }

    public async checkServerIsAlive(server:any){
        try{
            console.log("check alive: "+server.address)
            await axios({
                method:'head',
                url: server.address
            })
                .then(res=>{
                    server.isAlive=true
                })
                .catch(err=>{
                    console.log(server.address+" is dead");
                    server.isAlive=false
                })
        }catch(error){
            console.log(error);
            server.isAlive=false
        }
        console.log(server.address+"is checked###################################")
    }
}
    
