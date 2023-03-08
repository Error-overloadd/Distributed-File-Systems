let generalRequest =new axios.create({
    baseURL:"http://localhost:3002/",
    crossDomain: true
})
let requestConfig = {
    baseURL:"http://localhost:3002/",
    crossDomain: true
}
let loginUser = false;

/*
* ====================================================================
* User Handling part
* ====================================================================
* */

function addJWT(post){
    const userID = localStorage.getItem('userID')
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && userID){
        post.headers.Authorization =  'Bearer'+' '+ accessToken;
        post.data = post.data || new FormData();
        post.data.append('userID',userID);
    }
    return post;
}
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
    generalRequest({
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


function userLogin(){
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#pass").value;
    let email = document.querySelector("#email").value;
    console.log(email+"\n"+password);
    generalRequest({
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
            const newTokenTime = new Date().getTime().toString();
            localStorage.setItem('userID', userID);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenTime',newTokenTime);
            document.querySelector("#loginStatus").innerHTML="login success";
            console.log("#############");
            console.log("tokenTime");
            console.log(newTokenTime);
            console.log("user ID")
            console.log(userID);
            console.log("accessToken:")
            console.log(accessToken);
            console.log("refreshToken");
            console.log(refreshToken);
            console.log("#############");
            loginUser = true;
        }
    }).catch(function (error){
        document.querySelector("#loginStatus").innerHTML="login failed"+"<br>"+error.message
    })

}

function logout(){
    if (localStorage.getItem("accessToken") !== null){;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenTime');
        localStorage.removeItem('userID');
    }
    document.querySelector("#loginStatus").innerHTML="Not Login yet";
}

function checkisLogin() {
    const expiredTime = 3500;
    const accessToken = localStorage.getItem('accessToken');
    const tokenTime = localStorage.getItem('tokenTime');
    const timeDiffInSec = (new Date().getTime() - tokenTime) / 1000;
    if (accessToken && timeDiffInSec < expiredTime) {
        loginUser = true;
        document.querySelector("#loginStatus").innerHTML="login success";
    }
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
    generalRequest({
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
    document.querySelector("#uploadFileStatus").innerHTML = "";
    if (document.querySelector("#uploadFile").files.length === 0){
        alert("please choose a file");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    updateToken();
    if (loginUser){
        const newRequest = axios.create(requestConfig);
        newRequest.interceptors.request.use(addJWT);
        newRequest.post('addFile',formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if(res.status >= 200 && res.status < 300){
                document.querySelector("#uploadFileStatus").innerHTML= res.data;
            }else{
                document.querySelector("#uploadFileStatus").innerHTML="error:"+ res.data;
            }
        }).catch(error => {
            console.log(error);
        });
    }else{
        alert("please login");
    }

}
/*
* request for delete file on server
* can be done by login user only
* */

function deleteFile(){
    let fileName =document.querySelector("#deleteFileName").value;
    document.querySelector("#deleteFileStatus").innerHTML = "";
    if(loginUser){
        updateToken();
        const newRequest = axios.create(requestConfig);
        newRequest.interceptors.request.use(addJWT);
        newRequest.delete('deleteByFilename',{
            params: {
                fileName:fileName
            }
        }).then(res=>{
            if(res.status >= 200 && res.status < 300){
                console.log("file deleted");
                document.querySelector("#deleteFileStatus").innerHTML=res.data;
            }
        }).catch(function (error){
            document.querySelector("#deleteFileStatus").innerHTML=error.message;
        })
    }else{
        alert("please login");
    }

}


async function fetchFiles(){
    if (loginUser == false){
        alert("please login");
    }else {
        updateToken();
        const newRequest = axios.create(requestConfig);
        newRequest.interceptors.request.use(addJWT);
        newRequest({
            method: 'get',
            url: "fetchFiles",
        }).then(res => {
            if (res.status >= 200 && res.status < 300) {
                console.log("fetchFiles succeed! \n"+res.data);
            }
        }).catch(function (error) {
            console.log("fetchFiles failed! \n"+error.message);
        })
    }
}

/*
* function for updating access token before accessing resources
* */

function updateToken(){
    const expiredTime = 3500;
    const refreshToken = localStorage.getItem('refreshToken');
    const userID = localStorage.getItem('userID');
    const tokenTime = localStorage.getItem('tokenTime');
    const timeDiffInSec = (new Date().getTime() - tokenTime)/1000;
    if (timeDiffInSec > expiredTime){
        generalRequest({
            method: 'post',
            url: "token",
            data:{
                userID:userID,
                token:refreshToken
            }
        }).then(res=>{
            if(res.status === 200){
                const accessToken = res.data.accessToken;
                const newTokenTime = new Date().getTime().toString();
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('tokenTime',newTokenTime);
                console.log("Updated access Token");
                console.log(accessToken);
                console.log(newTokenTime);
                console.log("#############");
            }
        }).catch(function (error){
            alert("Token failed, please try login again"+"\n"+error.message);
        })
    }else{
        console.log("token not expired yet");
    }
}
checkisLogin();

