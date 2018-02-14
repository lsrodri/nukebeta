/*

Basic chat code based on socket.io GitHub sample

*/


$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#ddd', '#ddd', '#ddd', '#ddd',
    '#ddd', '#ddd', '#ddd', '#ddd',
    '#ddd', '#ddd', '#ddd', '#ddd'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.login.page'); // The login page
  var $homeLogo = $(".home-logo");
  var $chatPage = $('.chat.page'); // The chatroom page
  var $handsFree = $(".hands-free");
  var $mic = $(".mic");

  $handsFree.click(function(){
    toggleHandsFree();
  });

  $mic.click(function(){
    toggleMic();
  });  

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  var synth = window.speechSynthesis;

  /* 

  Speak function was adapted from Web Speech API's github sample 
  
  */

var handsFree = false;
var micEnabled = false;
var lastSpokenMessage = "";

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

function toggleHandsFree() {
  handsFree = !handsFree;
  $(".hands-free").toggleClass("hands-free-enabled");
}

function toggleMic() {
  micEnabled = !micEnabled;
  $(".mic").toggleClass("mic-enabled");
  if (micEnabled === true){
    testSpeech();
  } else {
    recognition.stop();
  }
}

  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = hello | howdy | hi | how | are | you | welcome | nuke ;';

  var recognition = new SpeechRecognition();
  /*var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;*/
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

function testSpeech() {

  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript;
    $('.inputMessage').val($('.inputMessage').val() + " " + speechResult);
    
    
    if (speechResult.indexOf("nuke") !== -1 || speechResult.indexOf("Nuke") !== -1 || speechResult.indexOf("Luke") !== -1) {
      $('.inputMessage').val($('.inputMessage').val().replace("Luke","").replace("nuke","").replace("Nuke",""));
      sendMessage();
    }

    //sendMessage();
    
    toggleMic();
  }

  recognition.onerror = function(event) {
    micEnabled = false;
  }

}

function speak(contents){

  if(handsFree === true && lastSpokenMessage !== contents) {

    lastSpokenMessage = contents;

    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (contents !== '') {
      var utterThis = new SpeechSynthesisUtterance(contents);
      utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
        toggleMic();
      }
      utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
      }
      /*var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
      for(i = 0; i < voices.length ; i++) {
        if(voices[i].name === selectedOption) {
          utterThis.voice = voices[i];
        }
      }*/
      //utterThis.pitch = pitch.value;
      //utterThis.rate = rate.value;
      synth.speak(utterThis);
    }

  }

}


  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "You are all alone here! ";
    } else {
      message += "There are " + data.numUsers + " users chatting at the moment";
    }
    log(message);
  }

myUsername = "";

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    myUsername = username;
    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $homeLogo.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
    speak(message);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);

    if(data.username != myUsername){
      if (data.message != "is currently typing" && data.message != " joined the chat!" && data.message != " left") {
        speak(data.username + " says " + data.message);
      } else {
        speak(data.username + data.message);
      }
    }
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is currently typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $(".join-button").click(function(e){
    setUsername();
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  $(".send-button").click(function(e){
    if (username) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    } else {
      setUsername();
    }
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "You have joined Nuke(Beta)";
    log(message, {
      prepend: true
    });
    speak(message);
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined the chat!');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });

});