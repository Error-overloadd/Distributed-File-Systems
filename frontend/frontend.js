let resourcesServer =new axios.create({
    baseURL:"http://localhost:3002/",
    crossDomain: true
})
let loginUser = true;

/*
* ====================================================================
* User Handling part
* ====================================================================
* */
function userRegister(){
    let userName = document.querySelector("#username").value
    let passWord = document.querySelector("#pass").value;
    let email = document.querySelector("#email").value;
    let datas ={
        name:userName,
        password:passWord,
        email:email,
        isAdmin:0

    }
    console.log(typeof(passWord),typeof(userName),typeof(email));
    console.log(JSON.stringify(datas));
    resourcesServer({
        method:'post',
        url:"registerUser/",
        headers:{
            'content-type':"application/json"
        },
       data:JSON.stringify(datas)
        // data:{id:12}
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            console.log("It works rn")
            console.log(res)
        }
    }).catch(function (error){
        if (error.status === 404){
        }else{
            console.log(error.message)
        }
    })
}


async function userLogin(){
    // let userName = document.querySelector("#username").value
    // let passWord = document.querySelector("#pass").value;
    // resourcesServer({
    //     method:'get',
    //     url:"authenticateUser",
    //     userName:userName,
    //     passWord:passWord
    // }).then(res=>{
    //     if(res.status >= 200 && res.status < 300){
    //         console.log(res.data.toString())
    //         loginUser=userName
    //     }
    // }).catch(function (error){
    //     console.log(error.message)
    // })
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#pass").value;
    let email = document.querySelector("#email").value;
    console.log(email+"\n"+password);
    await resourcesServer({
        method: 'post',
        url: "login",
        data:{
            email:email,
            password:password
        }
    }).then(res=>{
        if(res.status === 200){
            const userID = res.data.userID;
            const accessToken = res.data.accessToken;
            const refreshToken = res.data.refreshToken;
            localStorage.setItem('userID', userID);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            document.querySelector("#loginStatus").innerHTML="login success";
            console.log(accessToken);
            console.log("#############");
            console.log(refreshToken);
        }
    }).catch(function (error){
        document.querySelector("#loginStatus").innerHTML="login failed"+"<br>"+error.message
    })

    /*
    if(userName==="Derek Liu"&&passWord==="112233"&&email==="Derek.liu@gmail.com"){
        window.alert("Log in successful !!");
    }else{
        window.alert("You need make a accunt");
    }
    */
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

function getFile(){
    let fileName = document.querySelector("#getFileName").value;
    resourcesServer({
        method:'GET',
        url:"getByFileName/",
        responseType: 'arraybuffer',
        params: {
            fileName:fileName
        }
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
            console.log(res.data.length);
            const source = document.createElement('a'); //a tag for downloading
            source.download = fileName;
            source.href = downloadUrl;
            document.body.appendChild(source);
            source.click();
            document.body.removeChild(source);
        }
    }).catch(function (error){
        document.querySelector("#getFileStatus").innerHTML=error.message;
    })
}
/*
* upload file on server
* can be done by login user only
* */
function uploadFile(){
    let file =document.querySelector("#uploadFile").files[0]
    const formData = new FormData();
    formData.append('file', file);
    console.log(file.length);
    resourcesServer({
        method:'post',
        url:"addFile",
        data:formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        if(res.status >= 200 && res.status < 300){
            document.querySelector("#uploadFileStatus").innerHTML=res.data;
        }
    }).catch(error => {
        console.log(error);
    });
}

/*
* request for delete file on server
* can be done by login user only
* */

function deleteFile(){
    let fileName =document.querySelector("#deleteFileName").value;
    //const message =  document.querySelector('.chat_box').value;
    if(loginUser){
        resourcesServer({
            method:'delete',
            url:"deleteByFilename",
            params: {
                fileName:fileName
            }
        }).then(res=>{
            if(res.status >= 200 && res.status < 300){
                document.querySelector("#deleteFileStatus").innerHTML=res.data;
            }
        }).catch(function (error){
            document.querySelector("#deleteFileStatus").innerHTML=error.message;
        })
    }else{
        alert("please login");
    }

}

function updateToken(){
    const refreshToken = localStorage.getItem('refreshToken');
    const userID = localStorage.getItem('userID');
    resourcesServer({
        method: 'post',
        url: "token",
        data:{
            userID:userID,
            token:refreshToken
        }
    }).then(res=>{
        if(res.status === 200){
            const accessToken = res.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            console.log("Updated access Token");
            console.log(accessToken);
            console.log("#############");
        }
    }).catch(function (error){
        alert("Token failed, please try login again"+"\n"+error.message);
    })

}