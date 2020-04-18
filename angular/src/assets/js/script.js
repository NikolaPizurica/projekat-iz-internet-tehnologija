
$( document ).ready(function(){
	console.log("jQuery loaded.");
	console.log(document);
});

$("#test-button").click(function(){
	console.log("Test Button clicked");
});

console.log("script.js LOADED");

// GLOBALS
var language = "english"; // eng default

var current_chat = {"title": "test chat", "chat_date": "2020-4-17", "user_id": "9", "messages": []};  // JSON FOR CURRENT CHAT

/* Update chat box language on DOM load*/
$("#select-language").change(function(){
    var e = document.getElementById('select-language');
    language = e.options[e.selectedIndex].value;
    console.log("Selected Language: ", language);

    if (language === "croatian"){
        document.getElementById('label-title').innerText = "IT Chet Bot";
        document.getElementById('keypad').placeholder = "Unesite poruku ovde...";
    } else if (language === "english" || language === "detect-language"){
        document.getElementById('label-title').innerText = "IT Chat Bot";
        document.getElementById('keypad').placeholder = "Type a message...";
    }

});

$("#button-save-chat").click(function(){
    console.log("Saving Chat..");
    getChats();

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


// RUN WITH: rasa run -m models --enable-api --cors "*" --debug

//------------------------------------- Set user response------------------------------------
function setUserResponse(val) {


	var UserResponse = '<img class="userAvatar" src=' + "./static/img/userAvatar.jpg" + '><p class="userMsg">' + val + ' </p><div class="clearfix"></div>';
	$(UserResponse).appendTo('.chats').show('slow');
	$(".usrInput").val('');
	scrollToBottomOfResults();
	$('.suggestions').remove();

}

function getChats() {
    console.log(current_chat);
}

//---------------------------------- Scroll to the bottom of the chats-------------------------------
function scrollToBottomOfResults() {
	var terminalResultsDiv = document.getElementById('chats');
	terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}

function send(message) {
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
	current_chat.messages.push({"content": message, "msg_time": "19:13:24", "part_id": "9"});

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
}

async function translate(text, lang) {
    var msg = text
    $.get("https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200315T145501Z.12e53a205e5b7908.bb57f26be5facec37525226623fb2ac9f280e169&text="+text+"&lang="+lang, function(result){
            msg = JSON.stringify(result.text);
            console.log("TRANSLATED: ", msg);
            return msg;
     });


}

//------------------------------------ Set bot response -------------------------------------
function setBotResponse(val) {
	setTimeout(function () {
		if (val.length < 1) {
			//if there is no response from Rasa
			msg = 'I couldn\'t get that. Let\' try something else!';

			var BotResponse = '<img class="botAvatar" src="./static/img/botAvatar.png"><p class="botMsg">' + msg + '</p><div class="clearfix"></div>';
			$(BotResponse).appendTo('.chats').hide().fadeIn(1000);

		} else {
			//if we get response from Rasa
			for (i = 0; i < val.length; i++) {
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
	                current_chat.messages.push({"content": msg, "msg_time": "19:13:25", "part_id": "12"});

                    console.log("MSG: ", msg);

					var BotResponse = '<img class="botAvatar" src="./static/img/botAvatar.png"><p class="botMsg">' + msg + '</p><div class="clearfix"></div>';
					$(BotResponse).appendTo('.chats').hide().fadeIn(1000);
				}

				//check if there is an image
				if (val[i].hasOwnProperty("image")) {
					var BotResponse = '<div class="singleCard">' +
						'<img class="imgcard" src="' + val[i].image + '">' +
						'</div><div class="clearfix">'
					$(BotResponse).appendTo('.chats').hide().fadeIn(1000);
				}

				//check if there is  button message
				if (val[i].hasOwnProperty("buttons")) {
					addSuggestion(val[i].buttons);
				}

			}
			scrollToBottomOfResults();
		}

	}, 500);
}




// ------------------------------------------ Toggle chatbot -----------------------------------------------
$('#profile_div').click(function () {
	$('.profile_div').toggle();
	$('.widget').toggle();
	scrollToBottomOfResults();
});

$('#close').click(function () {
	$('.profile_div').toggle();
	$('.widget').toggle();
});


// ------------------------------------------ Suggestions -----------------------------------------------

function addSuggestion(textToAdd) {
	setTimeout(function () {
		var suggestions = textToAdd;
		var suggLength = textToAdd.length;
		$(' <div class="singleCard"> <div class="suggestions"><div class="menu"></div></div></diV>').appendTo('.chats').hide().fadeIn(1000);
		// Loop through suggestions
		for (i = 0; i < suggLength; i++) {
			$('<div class="menuChips" data-payload=\''+(suggestions[i].payload)+'\'>' + suggestions[i].title + "</div>").appendTo(".menu");
		}
		scrollToBottomOfResults();
	}, 1000);
}


// on click of suggestions, get the value and send to rasa
$(document).on("click", ".menu .menuChips", function () {
	var text = this.innerText;
	var payload= this.getAttribute('data-payload');
	console.log("button payload: ",this.getAttribute('data-payload'))
	setUserResponse(text);
	send(payload);
	$('.suggestions').remove(); //delete the suggestions 
});
