///
///     Socket.io Connect
///
const socket = io('https://webrtcbk.herokuapp.com/');

$('#div-chat').hide();
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
    host: 'peerjsbk.herokuapp.com/',
    secure: true,
    port: 443
    });
peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NEW_USER_ASSIGN', { name: username, peerId: id });
    });
});


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
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
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

/*openStream()
.then(stream => playStream('localStream',stream));*/

///
///     Call-On-Click Handler
///
$('#ulUser').on('click','li',function() {
    const id =$(this).attr('id');
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});