const host='http://openfire.centralus.cloudapp.azure.com:9090/plugins/restapi/v1';

const axios=require('axios');

const callApi=(url,methodType,data,headers={})=>{
    return new Promise((resolve => {
        let headersAssign;
        if(Object.keys(headers).length){
            headersAssign=headers;
            headersAssign["Content-Type"]  = "application/json"
        }else{
            headersAssign=  {
                "Content-Type": "application/json"
            }
        }
        headersAssign['Authorization']= 'Basic YWRtaW46WEpobzRES3VCNEdr'
          //  headersAssign['Accept']= 'application/json';
        let request={
            method: methodType,
            url: host+url,
            headers:headersAssign
        };
        if(methodType.toLowerCase()==='post'){
            request['data']=data;
        }
        axios(request)
            .then(response => {
                  console.log('response response response response response',response.data)
                const serverResponse = response.data;
                    return  resolve([null,serverResponse]);

            })
            .catch(error => {
                   console.log(error,'error');
                return  resolve([error ,null]);
            });
    }))
}


const addUser=async (userDetails)=>{
    return new Promise(async (resolve) => {
        let url ='/users';
        const [err,response]=await callApi(url,'POST',userDetails,{});
        if(err){
              // console.log(err);
              // console.log(err.response);
               console.log(err);
            return resolve([err.response.data,response])
        }
         console.log(response,"response");
        return  resolve([null,response]);
    })

}
const addToRoom=async (userDetails)=>{
    return new Promise(async (resolve) => {
        let url ='/chatrooms/'+userDetails.room+'/members/'+userDetails.username;
        const [err,response]=await callApi(url,'POST',{},{});
        if(err){
              // console.log(err);
              // console.log(err.response);
               console.log(err);
            return resolve([err.response.data,response])
        }
         console.log(response,"response");
        return  resolve([null,response]);
    })
}
const createRoom=async (roomName)=>{
    return new Promise(async (resolve) => {
       let roomDetails= {
            "roomName": roomName,
            "naturalName": roomName,
            "description": "Chat Messages",
            "subject": "Chat Messages",
            "maxUsers": "0",
            "persistent": "true",
            "publicRoom": "true",
            "registrationEnabled": "true",
            "canAnyoneDiscoverJID": "true",
            "canOccupantsChangeSubject": "false",
            "canOccupantsInvite": "true",
            "canChangeNickname": "true",
            "logEnabled": "true",
            "loginRestrictedToNickname": "false",
            "membersOnly": "false",
            "moderated": "false",
           "broadcastPresenceRoles": [
               "moderator",
               "participant",
               "visitor"
           ],
        }
        let url ='/chatrooms';
        const [err,response]=await callApi(url,'POST',roomDetails,{});
        if(err){
              // console.log(err);
              // console.log(err.response);
               console.log(err);
            return resolve([err.response.data,response])
        }
         console.log(response,"response");
        return  resolve([null,response]);
    })

}
const deleteRoom=async (roomName)=>{
    return new Promise(async (resolve) => {
        let url ='/chatrooms/'+roomName;
        const [err,response]=await callApi(url,'DELETE',{},{});
        if(err){
            // console.log(err);
            // console.log(err.response);
            console.log(err);
            return resolve([err.response.data,response])
        }
        console.log(response,"response");
        return  resolve([null,response]);
    })
}
const getChatRooms=async ()=>{
    return new Promise(async (resolve) => {
        let url ='/chatrooms?search= ucf1zwc2v6dzq11buoltja0sluyyn0bkbbjlwbkudz1ndmqz';
        const [err,response]=await callApi(url,'GET',{},{});
        if(err){
            // console.log(err);
            // console.log(err.response);
            console.log(err);
            return resolve([err.response.data,response])
        }
        console.log(response,"response");
        return  resolve([null,response]);
    })
}
const inviteUser=async(chatRoom,user)=>{

    return new Promise(async (resolve) => {
        let url ='/chatrooms/'+chatRoom+'/invite/'+user;
        const [err,response]=await callApi(url,'POST',{},{});
        if(err){
            // console.log(err);
            // console.log(err.response);
            console.log(err);
            return resolve([err.response.data,response])
        }
        console.log(response,"response");
        return  resolve([null,response]);
    });
}


module.exports={addUser,addToRoom,createRoom,inviteUser,deleteRoom,getChatRooms}