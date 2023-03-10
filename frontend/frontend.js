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
// TEST: WORK
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
            // console.log("It works rn")
             console.log(res)
        }
    }).catch(function (error){
        if (error.status === 404){

        }else{
            console.log(error.message)
        }

    })


}
//TEST: WORK
function userLogin(){
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
    let password = document.querySelector("#pass").value;
    let email = document.querySelector("#email").value;
    console.log(email+"\n"+password);
     resourcesServer({
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
            loginUser = true;
        }
    }).catch(function (error){
        document.querySelector("#loginStatus").innerHTML="login failed"+"<br>"+error.message
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

// function getFile(){
//     let fileName = document.querySelector("#getFileName").value;
//     resourcesServer({
//         method:'GET',
//         url:"getByFileName/",
//         responseType: 'arraybuffer',
//         params: {
//             fileName:fileName
//         }
//     }).then(res=>{
//         if(res.status >= 200 && res.status < 300){
//             const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
//             console.log(res.data.length);
//             const source = document.createElement('a'); //a tag for downloading
//             source.download = fileName;
//             source.href = downloadUrl;
//             document.body.appendChild(source);
//             source.click();
//             document.body.removeChild(source);
//         }
//     }).catch(function (error){
//         document.querySelector("#getFileStatus").innerHTML=error.message;
//     })
// }

// To creat function get file by id
function getFileById(){
    let fileid=document.querySelector("#getFileName").value;
    console.log(fileid);
    resourcesServer({
        methdo:'GET',
        url:"getByFileId",
        responseType:'arraybuffer',
        params:{
            fileid:fileid

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
//UPLOADFILE: WORK
function uploadFile(){
    let file =document.querySelector("#uploadFile").files[0]
    const formData = new FormData();
    formData.append('file', file);
    console.log(file.length);
    const token = localStorage.getItem('accessToken');
    
    console.log("This is test:",token);
       
    resourcesServer({
        method:'post',
        url:"upload",
        data:formData,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        if(res.status >= 200 && res.status < 300){
            document.querySelector("#uploadFileStatus").innerHTML=res.data;
            window.alert("The file uploaded successful !! ")
        }
    }).catch(error => {
        console.log(error);
        window.alert("The file cant upload it rn, please try again!")
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


async function fetchFiles(){
    if (loginUser == false){
        alert("please login");
    }else {
        //await updateToken();
        const userID = localStorage.getItem('userID');
        const token = localStorage.getItem('accessToken');
        console.log("This is test:",userID);
        console.log("This is test:",token);
       
        resourcesServer({
            // method: 'post',
            // url: "fetchFiles",
            // headers:{Authorization: `Bearer ${token}`}
            method: 'POST',
            url: "fetchFiles",
            headers:{Authorization: `Bearer ${token}` }
            
        }).then(res => {
            if (res.status >= 200 && res.status < 300) {
                console.log("fetchFiles succeed! \n"+res.data);
            }
        }).catch(function (error) {
            console.log("fetchFiles failed! \n"+error.message);
           // console.log(headers);
        })
    }
}

/*
* function for updating access token before accessing resources
* */

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
            // console.log("Updated access Token");
            // console.log(accessToken);
            // console.log("#############");
        }
    }).catch(function (error){
        alert("Token failed, please try login again"+"\n"+error.message);
    })

}