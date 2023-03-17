
let generalRequest =new axios.create({
    baseURL:"http://localhost:5000/",
    crossDomain: true
})
let requestConfig = {
    baseURL:"http://localhost:5000/",
    crossDomain: true
}
//unit is in second
const expiredTime = 600;

let loginUser = false;

/*
* ====================================================================
* User Handling part
* ====================================================================
* */

function addJWT(post){
    //const userID = localStorage.getItem('userID')
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken){
        post.headers.Authorization =  'Bearer'+' '+ accessToken;
        //post.data = post.data || new FormData();
        //post.data.append('userID',userID);
    }
    return post;
}
function userRegister(){
    let userName = document.querySelector("#name").value
    let passWord = document.querySelector("#pass").value;
    let email = document.querySelector("#email").value;
    let datas={
        email: email,
        password: passWord,
        name: userName,
        isAdmin: false
    }
    console.log(typeof(passWord),typeof(userName),typeof(email));
    generalRequest({
        method: 'post',
        url: "registerUser/",
        headers: {
            'content-type': "application/json"
        },
        data:JSON.stringify(datas)
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            alert("Register succeed");
            console.log("Register succeed");
            console.log(res)
            userLogin();
        }
    }).catch(function (error){
        if (error.status === 404){
        }else{
            console.log(error.message)
        }
    })
}


function userLogin(){
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
            localStorage.setItem('email',email);
            document.querySelector("#loginStatus").innerHTML="login as:" + email ;
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
        if(error.response.status === 400){
            document.querySelector("#loginStatus").innerHTML="Password is wrong";
        }else if(error.response.status === 404){
            document.querySelector("#loginStatus").innerHTML="user not existed";
        }else{
            document.querySelector("#loginStatus").innerHTML="login failed"+"<br>"+error.message
        }

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
    const accessToken = localStorage.getItem('accessToken');
    const tokenTime = localStorage.getItem('tokenTime');
    const timeDiffInSec = (new Date().getTime() - tokenTime) / 1000;
    if (accessToken) {
        if (timeDiffInSec < expiredTime){
            const email = localStorage.getItem('email');
            loginUser = true;
            localStorage.setItem('tokenTime','0');
            updateToken();
            document.querySelector("#loginStatus").innerHTML="login as "+ email;
        }else{
            logout();
        }

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
    let fileid = document.querySelector("#getFileName").value;
        generalRequest({
            method:'GET',
            url:"getFileById/"+fileid,
            responseType: 'blob'

    }).then(res=>{
                if(res.status >= 200 && res.status < 300){
                    const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
                    const source = document.createElement('a'); //a tag for downloading
                    const fileName = res.headers['content-disposition'].match(/filename="?([^"]+)"?/)[1];
                    console.log(fileName);
                    console.log(encodeURIComponent(fileName));
                    source.download = encodeURIComponent(fileName);
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
*Get FileList from server
*
 */
//GETFILELIST： WORK（Update）
function getFileList(){
    const fileList =  document.querySelector("#fileList");
    generalRequest({
        method:'GET',
        url:"getFileList/"
    }).then(res=>{
        if(res.status >= 200 && res.status < 300){
            eraseFileList()
            for (let file of res.data){
                const newRow = fileList.insertRow();
                newRow.innerHTML=
                    '<td>'+ file.fileId +'</td>' +
                    '<td>'+ file.name +'</td>' +
                    '<td>'+ file.size +'</td>' +
                    '<td>'+ file.content_type +'</td>' +
                    '<td>'+ file.created_date +'</td>' +
                    '<td>'+ file.fileserver +'</td>' +
                    '<td>'+ file.path +'</td>'
            }
            console.log(res.data);
        }
    }).catch(function (error){
       console.log (error.message);
    })

    function eraseFileList(){
        while (fileList.rows.length > 1) {
            fileList.deleteRow(1);
        }
    }
}

/*
* upload file on server
* can be done by login user only
* */
//UPLOADFILE: WORK (Update)
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
        newRequest.post('upload',formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress:(progressEvent) => {
                let completed = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                document.querySelector("#uploadFileStatus").innerHTML = "uploading" + completed + '%';
            }
        }).then(res => {
            if(res.status >= 200 && res.status < 300){
                document.querySelector("#uploadFileStatus").innerHTML= "upload succeed!";
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
    let fileid =document.querySelector("#deleteFileName").value;
    document.querySelector("#deleteFileStatus").innerHTML = "";
    if(loginUser){
        updateToken();
        const newRequest = axios.create(requestConfig);
        newRequest.interceptors.request.use(addJWT);
        newRequest.delete('deleteFileById/'+fileid,{
            /*
            params: {
                id:fileid
            }*/
        }).then(res=>{
            if(res.status >= 200 && res.status < 300){
                console.log("file deleted");
                document.querySelector("#deleteFileStatus").innerHTML="file deleted";
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