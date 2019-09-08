const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // XMLHttpRequest to get new reddit posts
const fs = require('fs');
discord = require("discord.js"); // declaring discord usage
const dClient = new discord.Client({forceFetchUsers: true});  // making a new discord client
const leagueHook = new discord.WebhookClient("hidden" , "hidden"); // making the league of legends bot server hook
const shamia = new discord.Client();
const Toby = new discord.Client();
const Alexis = new discord.Client();
var date = new Date(); // new date object
var commands = { // commands that spout out text
	ayy : "el em ayo",
	gay : "use to say someone is gay use !gay", 
	"hangman" : "play !hangman",
	"leaderboard" : "get !leaderboard",
	"fuck you" : "use !fuck you",
	"shamia" : "shamia is great, use !shamia"
}
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; // list of months for a readable human date in the console logs
var inGame = false;
var game;
var checkIfWantG = false;
var wantsS = false;
function slice(word , start , finish) {
	var ret = "";
	for (var i = start; i < finish; i++) {
		ret += word[i];
	}
	return ret;
}
async function addToJson(user , points = 0) {
	var userz = JSON.parse(fs.readFileSync("leaderBoard.json")); 
	var userId = user.id;
	if (!userz.users[userId]) {
		userz.users[userId] = {username: user.username , id: user.id , points: points};
	} else {
		var point = userz.users[userId].points + points;
		userz.users[userId] = {username: user.username , id: user.id , points: point};
	}
	
	fs.writeFile("leaderBoard.json" , JSON.stringify(userz));
	return true;
}


function getJson() {
	return JSON.parse(fs.readFileSync("leaderBoard.json"));
}

function killRandomGame(game) {
	delete game.author;
	delete game.room;
	delete game.guessesLeft;
	delete game.randInt;
}
function killGame(game , des , ingame) {
	delete game.room;
	delete game.author;
	delete game.rightLetters;
	delete game.wrongGuesses;
	delete game.correctGuesses;
	delete game.guessesLeft;
	delete game.word;
	if (ingame != "inGame") {
		inGame = false;
	}
	wantsS = false;
	
	checkIfWantG = false;	
	
}


function sortFunction(a, b) {
    return a - b;
}
function askForSay(msg) {
	msg.channel.send("Would you like to try and solve it? (Y for yes / N for no)").catch((error)=>{});
	checkIfWantG = true;
}

dClient.on("ready" , function() {
	addToJson(this.user , 0);
});
var stop = false;
dClient.on("message" , function(msg) {
		if (!(msg.author.bot)) {

			if( checkIfWantG && inGame) {
				if (game.author == msg.author) {
					
						
					if (msg.content.toLowerCase() == "y" || wantsS) {
						if (wantsS) {
							if(game.solveIt(msg)) {game.end("win");killGame(game);} else {game.end("lose");killGame(game);inGame = false;}
							var stringSend = "";
							for ( i = 1; i < game.rightLetters.length;i+=2) {
									stringSend += game.rightLetters[i-1];
							}
							msg.channel.send("The correct answer was: " + stringSend);

						} else {
							wantsS = true;
							msg.channel.send("Send the solution now!").catch((error) => {});
							var stringSend = "";
							for ( i = 1; i < game.rightLetters.length;i+=2) {
									stringSend += game.rightLetters[i-1] ;
							}
							msg.channel.send("The correct answer was: " + stringSend);
						}
					} else {
						var stringSend = "";
						for ( i = 1; i < game.rightLetters.length;i+=2) {
								stringSend += game.rightLetters[i-1];
						}
						msg.channel.send("The correct answer was: " + stringSend);
						killGame(game);
					}
				}
				
			}

		 	if (inGame && game.guessesLeft > 0) { 
			 		if (game.room == msg.channel && game.author == msg.author) {
				 		if (slice(msg.content.toLowerCase() , 0 , 6) == "!solve") {
				 			if (game.solveIt(slice(msg.content , 7 , msg.content.length))) {
				 				for (var i = 0; i < game.word.length;i++) {
				 					game.correctGuesses[i] = game.word[i];
				 				}
				 				game.end("win" , null);
				 				game.displayCur("not beginning" , msg.author);
				 				stop = true;
				 				killGame(game);

				 			} else {
				 				game.guessesLeft -= 1;
				 			}
				 		}  else if (!msg.author.bot && game.guessesLeft > 0) {
				 			
							for (i = 0; i < msg.content.length && i < game.guessesLeft;i++) {
								
								if (!(game.wrongGuesses.indexOf(msg.content[i]) > -1) && !(game.correctGuesses.indexOf(msg.content[i]) > -1) ) {
									game.guess(msg.content[i]);
									if (game.checkVic()) {stop = true;break;}
								}
							}
							
							
						} else if (!msg.author.bot && game.guessesLeft <= 0) {
							game.end("lose");
							killGame(game , "checkIfDesG" , "inGame");
							stop = true;
						}
						if (!msg.author.bot && !stop) {
							game.displayCur("notBeginning" , msg.author);
					
						} else if (!msg.author.bot && stop) {
							stop = false;
						}
						if (game.guessesLeft == 0 && !checkIfWantG) {
							askForSay(msg);
						}
					
				}
		 	}
		 	switch (msg.content.toLowerCase()) {
		 		case "!hangman":
		 			msg.channel.send("Unavailable rn.");
		 			break;
			 		game = new Game(msg.channel , msg.author);
			 		console.log(game.rightLetters);
					inGame = true;
					msg.channel.send("Game: Hangman.\nPlayer: " + msg.author.username + ".\nHow to play: you can use the command `!solve word` \nif you feel like you know the answer,\nfor each wrong letter / solution you will get a \"wrong guess\"\nand every correct letter will appear in the word.\nWin condition: either guess every single letter, or guess the word using `!solve word`");;
					
					break;
				case "!ayy":
					msg.channel.send("el em eyo");
					msg.delete(0);
					break;
				case "!gay":
					msg.channel.send("gay");
					msg.delete(0);
					break;
		 		case "!leaderboard":
		 			msg.delete(0);
		 			var memberList = dClient.users.array(); // getting all members in the server ( that are online )
					var leaderboard = getJson();
					leaderboard = leaderboard.users;
					var arr = [];
					

					for (var member = 0; member < memberList.length; member++) { // looping through the array of members
						if (!(memberList[member].bot)) {
							
							var memberId = memberList[member].id;
							if (!leaderboard.hasOwnProperty( memberId.toString())) {
								addToJson(memberList[member] , 0);
							}
							
							//console.log(memberId + " " + typeof memberId + " Count: "+ member + "\n");
							arr.push( [ leaderboard[memberId].points , leaderboard[memberId].username ] ); 
							break;
						}
					}	
					var message = "";
					arr.sort(sortFunction);
					for (var i = 0; i < arr.length;i++) {
						if (i == 0) {
							message += "In the first place: " + arr[i][1] + " with " + arr[i][0] + " points.\n";
						} else if (i == 1) {
							message += "In the second place: " + arr[i][1] + " with " + arr[i][0] + " points.\n";
						} else if (i == 2) {
							message += "In the third place: " + arr[i][1] + " with " + arr[i][0] + " points.\n";
						} else {
							message += "The rest:\n" + arr[i][1] + " with " + arr[i][0] + " points\n";
						}
					}
					msg.channel.send(message);

					break;
				case "!shamia":
					msg.delete(0);
					shamia.channels.get(msg.channel.id).send("I LOVE SLIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIME" , {tts:true}).then(m => m.delete(0));

					break;
				case "!alexis":
					msg.delete(0);
					Alexis.channels.get(msg.channel.id).send("TODAY WE ARE GOING TO PLAY KAAAH UUUUH REGEL" , {tts:true}).then(m => m.delete(0));

					break;
				case "!shamiagay":
					msg.delete(0);
					shamia.channels.get(msg.channel.id).send("I AM GAY AND I LOVE EATING SLIME" , {tts:true}).then(m => m.delete(0));
					break;
				case "!all":
					msg.delete(0);
					Toby.channels.get(msg.channel.id).send("HOLY SHIT JESUS MCMUREE CHRIST" , {tts:true}).then(m => m.delete(0));
					shamia.channels.get(msg.channel.id).send("I AM GAY AND I LOVE EATING SLIME" , {tts:true}).then(m => m.delete(0));
					Alexis.channels.get(msg.channel.id).send("TODAY WE ARE GOING TO PLAY KAAOREGEL" , {tts:true}).then(m => m.delete(0));
					shamia.channels.get(msg.channel.id).send("I LOVE SLIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIME" , {tts:true}).then(m => m.delete(0));
					Toby.channels.get(msg.channel.id).send("HOLY SHIT" , {tts:true}).then(m => m.delete(0));

					
					break;
				case "!fuck you":

					msg.channel.send("Well then fuck you too" , {tts:true});
					break;
				default:
					if (msg.content.slice(0,5)== "!toby"){
						if (msg.content.slice(5,msg.length) == " adv") {
							msg.delete(0);
							Toby.channels.get(msg.channel.id).send("HOLY SHIT JESUS MCMUREE CHRIST" , {tts:true}).then(m => m.delete(0));
						} else {
							msg.delete(0);
							Toby.channels.get(msg.channel.id).send("HOLY SHIT" , {tts:true}).then(m => m.delete(0));
						}
					}
					
					
					break;
		 	}
			
			var deleting = true;
		  if (msg.member.roles.has("343025411913154560") && deleting) { // testing if member is an admin
		  	if (/^delete.{0,20}$/.test(msg.content) && ((parseInt(msg.content.slice(6 , msg.content.length))) < 10)) { // testing if the delete 
		  		deleting = false;
		  		
		  		var amountDel = parseInt(msg.content.slice(6 , msg.content.length)) + 1;
		  		msg.channel.fetchMessages({limit: amountDel}).then(messages => msg.channel.bulkDelete(messages)).then(console.log("Deleted " + amountDel + " messages in " + date.getFullYear() + " " + months[date.getMonth()] +" "+date.getDay() +" " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds())).catch((error) => {});
		  		msg.delete(0);
			  	
		  		deleting = true;
		  	} else if(msg.content.match(/^delete$/)) {
		  		msg.channel.send("The template for deleting a message is: delete {number of messages}").then(m => m.delete(1000)).catch((error) => {});
		  		msg.delete(1000);
		  	} else if (/^delete.{0,20}$/.test(msg.content) && ((parseInt(msg.content.slice(6 , msg.content.length))) >= 10)) {
		  		msg.channel.send("I CANnt HandlE MooRe tHan 10 Stahp").then(m => m.delete(1000)).catch((error) => {});
		  		msg.delete(1050);
		  		
		  	} 
		  } // end 
		  for (var command in commands) {
		  		if (msg.content.toLowerCase() == command) {
			  		msg.channel.send( commands[command] ).then(m => m.delete(0)).catch((error) => {})
					.then(console.log("Message sent in " + date.getFullYear() + " " + months[date.getMonth()] +" "+date.getDay() +" " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' : ' + "\"" + msg.content + "\"" +' - By ' + msg.author + " " + msg.author.username + " in room: " + msg.channel.name)).catch( (error) => {});
		  		}
		  	}
		  	switch(msg.content.toLowerCase()) {
		  	
			  	case "!commands":
				  	var Commandz = "The available commands are: \n";
				  	for (var command in commands) {
				  		Commandz += String(command) + " - " +commands[command] + "\n";
				  	}	
				  	msg.author.sendMessage(Commandz).catch((error)=>{}); 
				  	break;
			  	
			}
		console.log("Message sent in " + date.getFullYear() + " " + months[date.getMonth()] +" "+ date.getDay() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() +  ' : ' + "\"" + msg.content + "\"" +' - By ' + msg.author + " " + msg.author.username + " in room: " + msg.channel.name);
	}
		  
});

function isInArray(value , array) {
	for (var i =0; i < array.length;i++) {
		if (array[i] == value) {
			return true;
		}
	}
	return false;
}

// var postId = [];
// setInterval(function() {
// var xhr = new XMLHttpRequest();
// xhr.onreadystatechange =function() {
// 	if (xhr.readyState == 4 && xhr.status == 200) {
// 		var redditPosts = JSON.parse(xhr.responseText);
// 		redditPosts = redditPosts.data.children;
		
// 		for (var i = 0;i < redditPosts.length; i++) {
			
// 			if (((Math.round(new Date().getTime() / 1000.0 * 1000) / 1000) - (Math.round(redditPosts[i].data.created_utc * 1000) / 1000)) <= 450 && !(isInArray(redditPosts[i].data.id , postId))) {
// 				leagueHook.send("A new league of legends thread has been submitted to the /r/leagueoflegends subreddit!");
// 				leagueHook.send("Title: " + redditPosts[i].data.title + "\n" + "Author: " + redditPosts[i].data.author + "\n" + "Link to the post: " + "https://www.reddit.com" +redditPosts[i].data.permalink);

// 				postId[postId.length] = redditPosts[i].data.id;
// 			}
// 		}
// 	}
// };
// xhr.open("GET" , "https://www.reddit.com/r/leagueoflegends/new.json?sort=new");
// xhr.send();

// } , 200);
var wordBank = ["measure","receive","teeth","drip","illustrious", "cars", "profit", "racial", "greet", "warlike", "bone", "dad", "statement", "somber", "fanatical", "match", "daily", "grate", "weather", "scattered"];
function GuessTheNumber(room , author) {
	this.room = room;
	this.author = author;
	this.randInt = Math.floor(Math.random() * 100);
	this.guessesLeft = 10;
	this.solve = function(guess) {
		if (guess === this.randInt) {
			this.end("win");
		}
	}
	this.end = function(Cond) {
		if (Cond == "win") {
			var id = this.author.id;
			var users = getJson().users[id].points;
			this.room.send(
			  "Congratulations! You have won the game!\nFor winning with "
			 + this.guessesLeft + 
			 " guesses left you have received "
			  + (parseInt(this.guessesLeft) + 1).toString() + 
			  " points, Your current points: " + users.toString() + 
			  ".\nIn order to look at the leaderboard of points use the command `!leaderboard`.\nTo find out how to earn points use `!earning`." +
			  "\nTo play again just use the command `!hangman` or you can also play Guess The Number using the command `!gtn`"
			  );
		}
		killRandomGame(this , null , null);
	}
}
function Game(room , author) {
	this.room = room;
	this.author = author;
	this.rightLetters = [];
	this.guessesLeft = 5;
	this.correctGuesses = [];
	this.wrongGuesses = [];
	this.word = wordBank[Math.floor(Math.random() * wordBank.length)];
	this.checkVic = function() {
		this.numNot = 0;
		for (var i = 0; i < this.word.length;i++) {
			if (!(isInArray(this.word[i] , this.correctGuesses))) {
				this.numNot += 1;
			}
		}
		if (this.numNot == 0) {
			addToJson(this.author , this.guessesLeft + 1);
			this.end("win" , "killGame");
			return true;
		}
	};
	for (var i =0; i< this.word.length;i++) {
		this.rightLetters.push(this.word[i]);
		this.rightLetters.push(this.word[i].toUpperCase());
	}
	this.guess= function(guess) {
		
		if (isInArray(guess , this.word)) {
			this.correctGuesses.push(guess);
		} else {
			this.wrongGuesses.push(guess);
			this.guessesLeft -= 1;
		}
		
		return;
	};
	this.solveIt= function(solution) {
		if (solution == this.word) {
			return true;
		} else {
			return false;
		}
	};
	this.end= function(Cond ,kill) {
		if (Cond == "win") {
			// addToJson(this.author , this.guessesLeft + 1);
			var id = this.author.id;
			var userz = JSON.parse(fs.readFileSync("leaderBoard.json")); 
			console.log(userz);
			//var userz = getJson();
			
			//var pts = userz.users[id].points;
			// this.room.send(
			// 	"Congratulations! You have won the game!\nFor winning with "
			//  + this.guessesLeft + 
			//  " guesses left you have received "
			//   + (parseInt(this.guessesLeft) + 1).toString() + 
			//   " points, Your current points: " + pts.toString() + 
			//   ".\nIn order to look at the leaderboard of points use the command `!leaderboard`.\nTo find out how to earn points use `!earning`." +
			//   "\nTo play again just use the command `!hangman` or you can also play Guess The Number using the command `!gtn`"
			//   );
			
		} else {
			this.room.send("Oh, you lost! Feel free to try again!").catch((error)=>{});
		}
		if (kill == "killGame") {
			killGame(this , null , null);
		}
		return;
	};
	this.restart= function() {
		this.guessesLeft = 5;
		this.word = wordBank[Math.floor(Math.random() * wordBank.length)];
	};
	this.displayCur = function(state , msg) {
		this.finStr = "";
		for (var l = 0; l < this.word.length;l++) {
			if (isInArray(this.word[l] , this.correctGuesses)) {
				this.finStr += " " + "__" +this.word[l] +"__"+ " ";	
			} else {
				this.finStr += " " + "\\_" + " ";
			}
			
		}
		if (state != "begin" && !msg.bot) {
			if (this.wrongGuesses.length > 0) {
				this.chars = "";
				for (var i = 0; i < this.wrongGuesses.length;i++) {
					this.chars += "~~" + this.wrongGuesses[i] + "~~" + " ";
				}
				this.room.send("Wrong characters inputted: " + this.chars);
			}
			this.room.send("Guesses left: " + this.guessesLeft);
			this.room.send("Current word: " + this.finStr.slice(this.finStr , this.finStr.length)).catch((error)=>{});
		} else if (state == "begin" && !msg.bot) {
			this.room.send("Guesses left: " + this.guessesLeft);
			this.room.send("Current word: " + this.finStr.slice(this.finStr , this.finStr.length)).catch((error)=>{});
		}
	};


	this.room.send(Turns.turn0).then(this.displayCur("begin" , this.author)).catch((error)=>{});
	return;
	
}

var hook = new discord.WebhookClient("343391716767825933" , "rPdG2D54mFkWThA7eLE1bFbpk__AWIOVi5jviuaGGW_-x5tNjLvXavhMRUCZkq3QScse");

var Turns = {
	constructor() {
		var turn0;
		var turn1;
		var turn2;
		var turn3;
	},
	turn0: `
	\   _  \ _ ____
	|   |
	|   |
	|   
	|
	|  `+"\n"+ "\\___/_____\\_______\______\\_______" 
	+ "\n" +
	 "|                     |\n" + 
	  "|\\________\\________\\________|" ,

};
shamia.login("NDE1MjYwNTI3NjE5NzM1NTYy.DWzVBg.hCf14KmdijVmdJno1g12iHmJiqs");
dClient.login("MzQzMDE0OTEyOTc4NzE0NjI2.DGYBDQ.aCy_cjwt4N8sjtKgJM-WYAWi93g"); 
Toby.login("NDE1NTc5MTQ5NTM3OTAyNjE1.DW39ww.Nr8QPk7TcWL354XEqeoeKot4xsc");
Alexis.login("NDE1NTgyMzQ5NTI3MzUxMjk3.DW4A8g.QH0QGQg4HDC4Lumz_66nUYDdNIo");
