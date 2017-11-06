///
///     Socket.io Connect
///
const socket = io('https://webrtcbk.herokuapp.com/');

var speed, turn, target_speed, target_turn;
var control_speed = 0; 
var control_turn = 0;
var count = 0;
var key_count = 0;

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
var oldSpeed = 0;
var oldTurn = 0;
peer.on('connection', function(conn) {
  // Receive messages
      conn.on('data', function(data) {
      //console.log('Received: ', data);
      if (stream_flag==false)
      {
        const id = data;
        console.log('start server streaming to id ...'+id);        
        stream_flag = true;
        console.log('flag'+stream_flag);
       // init_ros();
        /*openStream()
          .then(stream => {
          //  playStream('localStream', stream);
          const call = peer.call(id, stream);
          // call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });*/

        
    } //end of if
      
     else {
        key_count++;

        if (true){
          console.log("count:"+count);

          if (key_count === 100) {
            key_count =0;
            console.log("RECONNECT ROSLIB NOW");
           // rbServer.close();
            /*rbServer = new ROSLIB.Ros({
            url : 'ws://localhost:9090'
             });*/
           /* rbServer = new ROSLIB.Ros({
                   url : 'ws://localhost:9090'
           }); // end of ROSLIB reconnect*/
          };
         // count = 0;
         oldKey = data;
          speed = Number(document.getElementById('linearXText').value);
      turn = Number(document.getElementById('angularZText').value)
      switch (data) {
        case 73:  //forward
        //console.log('move forward');  
        console.log("forward");
        target_speed = speed;
        target_turn = 0;
        count++;
        break;
        
        case 188: //backward
        console.log('move backward');
        target_speed = -speed;
        target_turn = 0;
        break;

        case 74: //turn left
        console.log('turn left');
        target_speed = 0;
        target_turn = turn;
        break;

        case 76: //turn right
        console.log('turn right');
        target_speed = 0;
        target_turn = -turn;
        break;

        case 75: //stop
        console.log("stop");
        target_speed = 0;
        target_turn = 0;
        break;
       
        default: 
        {
          console.log('out of desired key '+data)
        }; //end of default
      }; //emd of switch
    //  console.log('max'+Math.max(5,3));
      for (count = 0;count <=10; count++){
          if (target_speed > control_speed)
                control_speed = Math.min( target_speed, control_speed + 0.02 );
            else if (target_speed < control_speed)
                control_speed = Math.max( target_speed, control_speed - 0.02 );
            else
                control_speed = target_speed;

            if (target_turn > control_turn)
                control_turn = Math.min( target_turn, control_turn + 0.1 );
            else if (target_turn < control_turn)
                control_turn = Math.max( target_turn, control_turn - 0.1 );
            else
                control_turn = target_turn;

            if (/*(oldSpeed !== control_speed)||(oldTurn !== control_turn)*/ true){
            var twist = new ROSLIB.Message({
                 linear : {
                 x : control_speed,
                 y : 0.0,
                 z : 0.0
                },
                angular : {
                x : 0.0,
                y : 0.0,
                z : control_turn
                }
            });

            cmdVelTopic.publish(twist);
            oldTurn = control_turn;
            oldSpeed = control_speed;

          }; //end of different speed check

        /*twist.linear.x = control_speed;
        twist.angular.z = control_turn;
*/
        // Publish the message 
        
      //  console.log('target_speed = '+target_speed);
      // console.log('target_turn = '+target_turn);
      };//end of for loop


    };  //end of else
        }
      
     }); //end of data receive event
}); //end of connection event



//================================================================================================
///
///     use nodejs
///
// This function connects to the rosbridge server running on the local computer on port 9090

/*var SerialPort = require('serialport');
var port = new SerialPort('~/dev/ttyACM0', {
  baudRate: 115200
});
*/












//================================================================================================
///
///     Use ROSLIB for publishing cmd/Twist topic
///
// This function connects to the rosbridge server running on the local computer on port 9090





var rbServer = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
 });

// This function is called upon the rosbridge connection event
 rbServer.on('connection', function() {
     // Write appropriate message to #feedback div when successfully connected to rosbridge
     var fbDiv = document.getElementById('feedback');
     fbDiv.innerHTML += "<p>Connected to websocket server.</p>";
 });

// This function is called when there is an error attempting to connect to rosbridge
rbServer.on('error', function(error) {
    // Write appropriate message to #feedback div upon error when attempting to connect to rosbridge
    var fbDiv = document.getElementById('feedback');
    fbDiv.innerHTML += "<p>Error connecting to websocket server.</p>";
});

// This function is called when the connection to rosbridge is closed
rbServer.on('close', function() {
    // Write appropriate message to #feedback div upon closing connection to rosbridge
    var fbDiv = document.getElementById('feedback');
    fbDiv.innerHTML += "<p>Connection to websocket server closed.</p>";
 });

// These lines create a topic object as defined by roslibjs
var cmdVelTopic = new ROSLIB.Topic({
    ros : rbServer,
    name : '/cmd_vel_mux/input/teleop',
    messageType : 'geometry_msgs/Twist'
});

// These lines create a message that conforms to the structure of the Twist defined in our ROS installation
// It initalizes all properties to zero. They will be set to appropriate values before we publish this message.




//================================================================================================

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


/* This function:
 - retrieves numeric values from the text boxes
 - assigns these values to the appropriate values in the twist message
 - publishes the message to the cmd_vel topic.
 */
function pubMessage() {
    /**
    Set the appropriate values on the twist message object according to values in text boxes
    It seems that turtlesim only uses the x property of the linear object 
    and the z property of the angular object
    **/
    var linearX = 0.0;
    var angularZ = 0.0;

    // get values from text input fields. Note for simplicity we are not validating.
    linearX = 0 + Number(document.getElementById('linearXText').value);
    angularZ = 0 + Number(document.getElementById('angularZText').value);

    // Set the appropriate values on the message object
    twist.linear.x = linearX;
    twist.angular.z = angularZ;

    // Publish the message 
    cmdVelTopic.publish(twist);
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