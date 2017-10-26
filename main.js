///
///     Socket.io Connect
///
const socket = io('https://webrtcbk.herokuapp.com/');

$('#div-chat').hide();

///
///     Deply TURN Server via Ajax
///
let customConfig;
$.ajax ({
             url: "https://global.xirsys.net/_turn/tranloi2512.github.io/",
             type: "PUT",
             async: false,
             headers: {
               "Authorization": "Basic " + btoa("tranloi2512:1504b54e-a2d9-11e7-b628-1c12c2a160ac")
             },
             success: function (res){
              // console.log("ICE List: "+res.v.iceServers);
               customConfig=res.v.iceServers;
               //console.log('ICE server from customConfig'+customConfig);
             }
        });


///
///     Get Online User List From Socket.io Server
///
socket.on('ONLINE_USER_LIST',arrUserInfo => {
    $('#div-chat').show();
    $('#div-assign').hide();
    arrUserInfo.forEach(user =>{
        const {name,peerId} = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
     });

    socket.on('NEW_USER',user => {
        const {name,peerId} = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });
    
    socket.on('USER_DISCONNECT',peerId => {
        $(`#${peerId}`).remove();
    });
});

///
///     Check Dupplicate User Name
///
socket.on('ASSIGN_FAIL',() =>{
    alert('This UserName Is Already Assigned!');
});

///
///		Creat Peerjs Connect
///
var peer = new Peer({
       key: 'peerjs', 
       host: 'peerjsbk.herokuapp.com', 
       secure: true, 
       port: 443,
       config: customConfig
       });
    peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NEW_USER_ASSIGN', { name: username, peerId: id });
    });
});

var stream_flag=false;
peer.on('connection', function(conn) {
  // Receive messages
      conn.on('data', function(data) {
      console.log('Received: ', data);
      if (stream_flag==false)
      {
        const id = data;
        console.log('start server streaming to id ...'+id);        
        stream_flag = true;
        console.log('flag'+stream_flag);
        openStream()
          .then(stream => {
          //  playStream('localStream', stream);
          const call = peer.call(id, stream);
          // call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });

        
    }; //end of if
      
     /* 
      switch (data) {
        case '#start':
        console.log('start streaming');
        const id =$(this).attr('id');
        console.log('caller id:' +id);
        break;
      }; //emd of switch*/
     }); //end of data receive event
}); //end of connection event




///
///     Window Closing Handler
///
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};


///
///		Caller Event Handler
///
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

///
///		Callee Event Handler
///
peer.on('call', call => {
    console.log('Received Call Request...Start Streaming')
    openStream()
    .then(stream => {
        call.answer(stream);
       // playStream('localStream', stream);  //Dont display local stream on server side

        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

///
///     Sign Up UserName for Socket.io
///


///
///		Get Media Stream
///
function openStream(){
	const config = {audio:false,video:true};
	return navigator.mediaDevices.getUserMedia(config);
}

///
///		Play Media on canvas
///
function playStream(idVideoTag,stream){
	const video = document.getElementById(idVideoTag);
	video.srcObject = stream;
	video.play();
}



///
///     Call-On-Click Handler
///
var remoteID;

$('#ulUser').on('click','li',function() {
    const id =$(this).attr('id');
    remoteID=id;
    openStream()
    .then(stream => {
      //  playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});