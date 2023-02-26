let resourcesServer =new axios.create({
    baseURL:"http://localhost:3001/",
    timeout:3000,
    dataType:'jsonp',
    crossDomain: true
})
let userName = "test1"
let passWord = "test1Password";
let loginUser = false;

/*
* ====================================================================
* User Handling part
* ====================================================================
* */
function userRegister(){
    resourcesServer({
        method:'post',
        url:"registerUser",
        data:{"userName":userName,"passWord":passWord}
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            console.log(res.data.toString())
        }
    }).catch(function (error){
        console.log(error.message)
    })
}

function userLogin(){
    resourcesServer({
        method:'post',
        url:"authenticateUser",
        data:{"userName":userName,"passWord":passWord}
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            console.log(res.data.toString())
        }
    }).catch(function (error){
        console.log(error.message)
    })
}


/*
* ====================================================================
* File Handling part
* ====================================================================
* */

/*
* getting file from server
* anyone can do that
* */

function getFile(fileName){
    console.log("test");
    resourcesServer({
        method:'GET',
        url:"getByFileName"+fileName
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            console.log(res.data)
        }
    }).catch(function (error){
        console.log(error.message)
    })
}

/*
* request for delete file on server
* can be done by login user only
* */

function deleteFile(fileName){
    if(loginUser){
        resourcesServer({
            method:'DELETE',
            url:"deleteByFileName"+fileName
        }).then(res=>{
            if(res.status >= 200 && res.status < 300){
                console.log(res.data)
            }
        }).catch(function (error){
            console.log(error.message)
        })
    }else{
        alert("please login");
    }

}

/*
* upload file on server
* can be done by login user only
* */
function uploadFile(fileName=""){
    if(loginUser){
        const formData=new FormData();
        resourcesServer({
            method:'POST',
            url:"saveFile"+fileName
        }).then(res=>{
            if(res.status >= 200 && res.status < 300){
                console.log(res.data)
            }
        }).catch(function (error){
            console.log(error.message)
        })
    }else{
        alert("please login");
    }
}