import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as $ from 'jquery';


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: [  './chat-window.component.css']//, '../../assets/css/materialize.min.css'],
  //encapsulation: ViewEncapsulation.None // Remove Added css rules 
  
})




export class ChatWindowComponent implements OnInit {
 

  constructor() { 
   
  }

  
  
  ngOnInit(): void {
    let language = "english";
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

    let current_chat = {"title": "test chat", "chat_date": date, "user_id": "9", "messages": []};  // JSON FOR CURRENT CHAT
  
    console.log("Loaded Component chat-window.");

    

    // JQUERY
    $("#test-button").click(function(){
      console.log("TEST BUTTON");
    });
    

    // Update chat box language on DOM load
    $("#select-language").change(function(){
      var e = (document.getElementById('select-language')) as HTMLSelectElement;
      language = e.options[e.selectedIndex].value;
      
      console.log("Selected language: ",language);
  
      if (language === "croatian"){
          document.getElementById('label-title').innerText = "IT Chet Bot";
          (<HTMLInputElement>document.getElementById('keypad')).placeholder = "Unesite poruku ovde...";
      } else if (language === "english" || language === "detect-language"){
          document.getElementById('label-title').innerText = "IT Chat Bot";
          (<HTMLInputElement>document.getElementById('keypad')).placeholder = "Type a message...";
      }
    });

    let print_chat = function() {
      console.log(current_chat);
    }

    // SAVE CHAT
    $("#button-save-chat").click(function(){
      console.log("Saving Chat..");
      print_chat();
  
      // FLASK Backend
  
      $.ajax({
            url: 'http://localhost:5000/save_chat',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(current_chat),
            success: function (){
                console.log("Successful Flask Interaction");
            },
            error: function () {
                console.log("Bad Flask Interaction");
            }
      })
  
    });

    let setUserResponse = function(val) {
  
  
      var UserResponse = '<img class="userAvatar" src=' + "../../assets/images/userAvatar2.jpg" + '><p class="userMsg">' + val + ' </p><div class="clearfix"></div>'; 
      
      $(UserResponse).appendTo('.chats').show('slow');
      console.log(document.getElementById("chats"));
      $(".usrInput").val('');
      scrollToBottomOfResults();
      $('.suggestions').remove();
    
    };

    // on input/text enter--------------------------------------------------------------------------------------
    $('.usrInput').on('keyup keypress', function (e) {
      var keyCode = e.keyCode || e.which;
      var text = $(".usrInput").val();
      if (keyCode === 13) {
        if (text == "" || $.trim(text) == '') {
          e.preventDefault();
          return false;
        } else {
          $(".usrInput").blur();
          setUserResponse(text);
          send(text);
          e.preventDefault();
          return false;
        }
      }
    });

    let scrollToBottomOfResults = function(){
      let terminalResultsDiv = document.getElementById('chats');
      terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
    };


    // Toggle Chatbot
    $('.btn-launch').click(function () {
      $('.btn-launch').toggle();
      $('.widget').toggle();
      
      scrollToBottomOfResults();
    });
    
    $('#close').click(function () {
      $('.btn-launch').toggle();
      $('.widget').toggle();
    });

    let send = function(message) {
      // Translate to eng
      var lang = "en-en";
      var msg = message;
      
      if (language === "croatian") {
          lang = "hr-en";
      }
      ///
      $.ajax({
          async: false,
          type: 'GET',
          url: "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200315T145501Z.12e53a205e5b7908.bb57f26be5facec37525226623fb2ac9f280e169&text="+message+"&lang="+lang,
          success: function(data){
              msg = JSON.stringify(data.text);
              msg = msg.substring(2, msg.length-2); // remove the [" "]
              console.log("SUCCESSFUL TRANSLATION: ", msg);
          }
  
  
      });
      //
      message = msg;
      console.log("User Message:", message)
  
      // Save message to current_chat json
      today = new Date();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      current_chat.messages.push({"content": message, "msg_time": time, "part_id": "9"});
  
      // Rasa
      $.ajax({
      url: 'http://localhost:5005/webhooks/rest/webhook',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        "message": message,
        "sender": "Me"
      }),
      success: function (data, textStatus) {
        if(data != null){
            setBotResponse(data);
        }
        console.log("Rasa Response: ", data, "\n Status:", textStatus)
      },
      error: function (errorMessage) {
        setBotResponse("");
        console.log('Error' + errorMessage);
  
      }
      });
    };
  
    
    
  
    let setBotResponse = function(val) {
      setTimeout(function () {
        if (val.length < 1) {
          //if there is no response from Rasa
          msg = 'I couldn\'t get that. Let\'s try something else!';
    
          var BotResponse = '<img class="botAvatar" src="../../assets/images/botAvatar2.png"><p class="botMsg">' + msg + '</p><div class="clearfix"></div>';
          $(BotResponse).appendTo('.chats').hide().fadeIn(1000);
    
        } else {
          //if we get response from Rasa
          for (let i = 0; i < val.length; i++) {
            //check if there is text message
            if (val[i].hasOwnProperty("text")) {
    
                        var msg = val[i].text;
    
                        var lang = "en-en";
    
                        if (language === "croatian") {
                            lang = "en-hr";
                        }
    
    
                        ///
                        $.ajax({
                            async: false,
                            type: 'GET',
                            url: "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200315T145501Z.12e53a205e5b7908.bb57f26be5facec37525226623fb2ac9f280e169&text="+val[i].text+"&lang="+lang,
                            success: function(data){
                                msg = JSON.stringify(data.text);
                                msg = msg.substring(2, msg.length-2); // remove the [" "]
                                console.log("SUCCESSFUL TRANSLATION: ", msg);
                            }
    
    
                        });
    
                        ///
                        // Save message to current_chat json
                      today = new Date();
                      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                      current_chat.messages.push({"content": msg, "msg_time": time, "part_id": "12"});
    
                      console.log("MSG: ", msg);
    
              var BotResponse = '<img class="botAvatar" src="../../assets/images/botAvatar2.png"><p class="botMsg">' + msg + '</p><div class="clearfix"></div>';
              $(BotResponse).appendTo('.chats').hide().fadeIn(1000);
            }
    
            //check if there is an image
            if (val[i].hasOwnProperty("image")) {
              var BotResponse = '<div class="singleCard">' +
                '<img class="imgcard" src="' + val[i].image + '">' +
                '</div><div class="clearfix">'
              $(BotResponse).appendTo('.chats').hide().fadeIn(1000);
            }
    
           
    
          }
          scrollToBottomOfResults();
        }
    
      }, 500);
    };

    
  }

  

  
  
  
}

