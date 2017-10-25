///
///     Socket.io Connect
///
const socket = io('https://webrtcbk.herokuapp.com/');
var remoteID='';

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
               console.log("ICE List: "+res.v.iceServers);
               customConfig=res.v.iceServers;
               console.log('customConfig: '+customConfig);
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


$('#connect').click(function() { 
console.log('connect click function in line 78')
var conn = peer.connect(remoteID);
console.log('remoteID in line 76',remoteID)

conn.on('open', function() {
  // Receive messages
  conn.on('data', function(data) {
    console.log('Received', data);
  });

  // Send messages
  conn.send("Hello! This is client's message!");
});
});




/*// Await connections from others
peer.on('connection', connect);
peer.on('error', function(err) {
console.log(err);
})

///
///     Handler Connection Object
///
function connect(c) {
  // Handle a chat connection.
  if (c.label === 'chat') { 
  console.log('C label = chat');
    var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
    var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
    var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
    chatbox.append(header);
    chatbox.append(messages);
    console.log("Message to send is: "+messages);
 
    // Select connection handler.
    chatbox.on('click', function() {
    console.log('chatbox click event');
      if ($(this).attr('class').indexOf('active') === -1) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
    $('.filler').hide();
    $('#connections').append(chatbox);
    c.on('data', function(data) {
      messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data +
        '</div>');
        });
        c.on('close', function() {
          alert(c.peer + ' has left the chat.');
          chatbox.remove();
          if ($('.connection').length === 0) {
            $('.filler').show();
          }
          delete connectedPeers[c.peer];
        });
  } 
  connectedPeers[c.peer] = 1;
}
*/

/*///
///     Hander Text - Chatting Event
///
var connectedPeers = {};

$(document).ready(function() {

  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }
  // Connect to a peer
  $('#connect').click(function() {      //Button Connect Click event
   // var requestedPeer = $('#rid').val();
    var requestedPeer = remoteID;
    console.log('Remote ID is:'+requestedPeer);
    if (!connectedPeers[requestedPeer]) {
      // Create 2 connections, one labelled chat and another labelled file.
      var c = peer.connect(requestedPeer, {
        label: 'chat',
        serialization: 'none',
        metadata: {message: 'hi i want to chat with you!'}
      });
      c.on('open', function() {
        connect(c);
      });
      c.on('error', function(err) { alert(err); });
    
    }
    connectedPeers[requestedPeer] = 1;
  });
  // Close a connection.
  $('#close').click(function() {        // Close Connect Event
    eachActiveConnection(function(c) {
      c.close();
    });
  });
  // Send a chat message to all active connections.
  $('#send').submit(function(e) {       //Send Message to Remote Peer 
    e.preventDefault();
    // For each active connection, send the message.
    var msg = $('#text').val();
    console.log('<< Send event >> Message to send is: '+msg);
    eachActiveConnection(function(c, $c) {
      if (c.label === 'chat') {
        c.send(msg);
        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
          + '</div>');
      }
    });
    $('#text').val('');
    $('#text').focus();
  });
  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    var actives = $('.active');
    var checkedIds = {};
    actives.each(function() {
      var peerId = $(this).attr('id');
      if (!checkedIds[peerId]) {
        var conns = peer.connections[peerId];
        for (var i = 0, ii = conns.length; i < ii; i += 1) {
          var conn = conns[i];
          fn(conn, $(this));
        }
      }
      checkedIds[peerId] = 1;
    });
  }
  
});*/


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
       // playStream('localStream', stream);
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
    remoteID=id;
    console.log('Click on User List');
    console.log('Call to remoteID: '+id);
    
    openStream()
    .then(stream => {
       // playStream('localStream', stream);
       const call = peer.call(id, stream);
       call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        
    });
});