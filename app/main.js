// Response for Uptime Robot
const http = require("http");
http
  .createServer(function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Discord bot is active now \n");
  })
  .listen(3000);

// Discord bot implements
const discord = require("discord.js");
const client = new discord.Client();

client.on("ready", message => {
  // botのステータス表示
  client.user.setPresence({ game: { name: "with discord.js" } });
  console.log("bot is ready!");
});

client.on("message", message => {
  // bot(自分)のメッセージには反応しない(これをしないと兵庫県警に捕まる)
  if (message.author.bot) {
    return;
  }
  // DMには応答しない
  if (message.channel.type == "dm") {
    return;
  }

  var msg = message;

  // botへのリプライは無視
  if (msg.isMemberMentioned(client.user)) {
    return;
  } else {
    //GASにメッセージを送信
    sendGAS(msg);
    return;
  }

  function sendGAS(msg) {
    // LINE Messaging API風の形式に仕立てる(GASでの場合分けが楽になるように)
    var jsonData = {
      events: [
        {
          type: "discord",
          name: message.author.username,
          message: message.content
        }
      ]
    };
    //GAS URLに送る
    post(process.env.GAS_URL, jsonData);
  }

  function post(url, data) {
    //requestモジュールを使う
    var request = require("request");
    var options = {
      uri: url,
      headers: { "Content-type": "application/json" },
      json: data,
      followAllRedirects: true
    };
    // postする
    request.post(options, function(error, response, body) {
      if (error != null) {
        msg.reply("更新に失敗しました");
        return;
      }

      var userid = response.body.userid;
      var channelid = response.body.channelid;
      var message = response.body.message;
      if (
        userid != undefined &&
        channelid != undefined &&
        message != undefined
      ) {
        var channel = client.channels.get(channelid);
        if (channel != null) {
          channel.send(message);
        }
      }
    });
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("please set ENV: DISCORD_BOT_TOKEN");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
