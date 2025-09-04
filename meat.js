const log = require("./log.js").log;
const Ban = require("./ban.js");
const Utils = require("./utils.js");
const io = require('./index.js').io;
const settings = require("./settings.json");
const sanitize = require('sanitize-html');
const fs = require("fs");
const path = require("path");

// moving colors to a much simpler, much easier to edit config. (i'm sorry colin)
var colors = fs.readFileSync("./colors.txt").toString().replace(/\r/,"").split("\n");
var blacklist = fs.readFileSync("./blacklist.txt").toString().replace(/\r/,"").split("\n");
var colorBlacklist = fs.readFileSync("./colorWhitelist.txt").toString().replace(/\r/,"").split("\n");

let roomsPublic = [];
let rooms = {};
let usersAll = [];
var clientslowmode = [];

var bonziTvCommercialMode = false;
var bonziTvCool = false;


process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
function getRealIP(socket) {
    return socket.handshake.headers['x-real-ip'] || 
           socket.handshake.headers['x-forwarded-for'] || 
           socket.request.connection.remoteAddress;
}

const BALANCE_FILE = path.join(__dirname, "balances.json");
let balances = {};
  try {
    balances = require("./balances.json");
  } catch (err) {
    console.error("Error reading balances.json:", err);
  }
// Save balances to file
function saveBalances() {
    fs.writeFile(
        "./balances.json",
        JSON.stringify(balances),
        { flag: 'w' },
        function(error) {
            log.info.log('info', 'banSave', {
                error: error
            });
        }
    );
}
function ipsConnected(ip) {
    let count = 0;
    for (const i in rooms) {
        const room = rooms[i];
        for (let u in room.users) {
            const user = room.users[u];
            if (user.getIp() == ip) {
                count++;
            }
        }
    }
    return count;
}
const activePlayers = {}; // Track who is alive
exports.beat = function() {
    io.on('connection', function(socket) { 
        new User(socket);
    });
};

// TODO: Rewrite this.


var bonziTvCommercialMode = false;
var bonziTvCool = false;

// youtube url variables 
let youtube_url = "https://www.youtube.com/watch?v=";
let youtube_tiny_url = "https://www.youtube.com/watch?v=";
let youtube_shorts_url = "";
let youtube_embed_url = "";
let youtube_music_url = "";


/*
  "https://www.youtube.com/watch?v=97dyt7MXWpo",
  "https://www.youtube.com/watch?v=t0JyCdk5ymo",
  "https://www.youtube.com/watch?v=bzXzGMbdQfY",
  "https://www.youtube.com/watch?v=DuD_boVOl54",
  "https://www.youtube.com/watch?v=H50wW4eAFKo",
  "https://www.youtube.com/watch?v=APAcU3YBhYc",
  "https://www.youtube.com/watch?v=H50wW4eAFKo",
  "https://www.youtube.com/watch?v=MmB9b5njVbA",
  "https://www.youtube.com/watch?v=tYoO9XkCCHg",
  "https://www.youtube.com/watch?v=K0damuN_9bQ",
  "https://www.youtube.com/watch?v=hb59QZW2SCA",
  "https://www.youtube.com/watch?v=5ls7g9eH7ss",
  "https://www.youtube.com/watch?v=VJs_VALzi_8",
  "https://www.youtube.com/watch?v=GCA5CB5uUyA",
  "https://www.youtube.com/watch?v=Jz6FCFoL3k4",
  "https://www.youtube.com/watch?v=CDLyImqvqVY",
  "https://www.youtube.com/watch?v=Wt2rGmUmm2A",
  "https://www.youtube.com/watch?v=YnuYnzXUuGY",
  "https://www.youtube.com/watch?v=exjhztp_IQY"
*/

// the clusterfuck of video ids
var videoIdsCommercials = [
  "https://www.youtube.com/watch?v=75OKjPBYTCg",
  "https://www.youtube.com/watch?v=qQKd7VxAMBY",
  "https://www.youtube.com/watch?v=ZZz3A6H4f-E",
  "https://www.youtube.com/watch?v=qQKd7VxAMBY",
  "https://www.youtube.com/watch?v=vRpADLCVfoM",
  "https://www.youtube.com/watch?v=HKJopZ6MvPE",
  "https://www.youtube.com/watch?v=75OKjPBYTCg",
  "https://www.youtube.com/watch?v=Olbq5oFe7KY",
  "https://www.youtube.com/watch?v=_TOKdk36iVM",
  "https://www.youtube.com/watch?v=S31zFz_hwzs",
  "https://www.youtube.com/watch?v=-kMiaYik9UQ",
  "https://www.youtube.com/watch?v=-ymLJ-nAoNI",
  "https://www.youtube.com/watch?v=rXB2vDBIGEo",
  "https://www.youtube.com/watch?v=l1Kgbydcgpw",
  "https://www.youtube.com/watch?v=cJyNen_Itm4",
  "https://www.youtube.com/watch?v=vqhbGGb7NMY",
  "https://www.youtube.com/watch?v=rvxM8D8fk40",
  "https://www.youtube.com/watch?v=AQcWqcZwpM8",
  "https://www.youtube.com/watch?v=qB3Ap48fm8E",
  "https://www.youtube.com/watch?v=tOdJmHhglVM",
  "https://www.youtube.com/watch?v=-oo-V6UDm-I",
  "https://www.youtube.com/watch?v=i4Sd7M-TvFg",
  "https://www.youtube.com/watch?v=prEBOintW4Q",
  "https://www.youtube.com/watch?v=p6W9MZmu9pc",
  "https://www.youtube.com/watch?v=KF-NkJsqsSA",
  "https://www.youtube.com/watch?v=rGWHt0Osz_I",
  "https://www.youtube.com/watch?v=rhJiny-wjDE",
  "https://www.youtube.com/watch?v=im1zBekRUPI",
  "https://www.youtube.com/watch?v=88cxenu68o8",
  "https://www.youtube.com/watch?v=bvX3tve5Qn4",
  "https://www.youtube.com/watch?v=KF-NkJsqsSA",
  "https://www.youtube.com/watch?v=Lj9OBTVpa1Y",
  "https://www.youtube.com/watch?v=2QhrGKUZm-s",
  "https://www.youtube.com/watch?v=oxWbBe6fDCQ"
]
var videoIdsMisc = [
    "https://www.youtube.com/watch?v=wPrIfIWE16A",
    "https://www.youtube.com/watch?v=QoXfKyc4RGo",
    "https://www.youtube.com/watch?v=9yUuejUVikM",
    "https://www.youtube.com/watch?v=xOMxYKxbSqo",
    "https://www.youtube.com/watch?v=0jgheGgqrlk",
    "https://www.youtube.com/watch?v=YQa2-DY7Y_Q",
    "https://www.youtube.com/watch?v=8LY0o_CgPR",
    "https://www.youtube.com/watch?v=JfzEO9-Zlhw",
    "https://www.youtube.com/watch?v=rhkgOXksmaY",
    "https://www.youtube.com/watch?v=cdmVPHdpECM",
    "https://www.youtube.com/watch?v=xHI-iKm31us",
    "https://www.youtube.com/watch?v=6vGgsXO57bs",
    "https://www.youtube.com/watch?v=Ze1p7bYXw0g",
    "https://www.youtube.com/watch?v=g0wCF04ddnw",
    "https://www.youtube.com/watch?v=ylVsfdU5pxo",
    "https://www.youtube.com/watch?v=Eg5Ja23HfhY",
    "https://www.youtube.com/watch?v=yhkDgX2b7po",
    "https://www.youtube.com/watch?v=U4sp10HUI6Y",
    "https://www.youtube.com/watch?v=BQBmKvRd0B0",
    "https://www.youtube.com/watch?v=yZqh3l3-pTM",
    "https://www.youtube.com/watch?v=pf9FHBM0SLQ",
    "https://www.youtube.com/watch?v=nAKk0gm73K0",
    "https://www.youtube.com/watch?v=Xmh7M7TXDRE",
    "https://www.youtube.com/watch?v=x4K1xKHwp0E",
    "https://www.youtube.com/watch?v=4pR6Y3_ahS8",
    "https://www.youtube.com/watch?v=J9udiROQchg",
    "https://www.youtube.com/watch?v=6OfKK5Rt3fY",
    "https://www.youtube.com/watch?v=GfFkiGgY6Pk",
    "https://www.youtube.com/watch?v=KLwgTM7HBhw",
    "https://www.youtube.com/watch?v=PigChYq_FrM",
    "https://www.youtube.com/watch?v=ye_HKD_C5o0",
    "https://www.youtube.com/watch?v=uApthBVk7mw",
    "https://www.youtube.com/watch?v=vc6aHpPGPYU",
    "https://www.youtube.com/watch?v=QL3H7CUJMDU",
    "https://www.youtube.com/watch?v=UsVWkAq1s0U",
    "https://www.youtube.com/watch?v=foFKXS6Nyho",
    "https://www.youtube.com/watch?v=8l6T3fwxAyw",
    "https://www.youtube.com/watch?v=olit-B5Yldc",
    "https://www.youtube.com/watch?v=hrzIykdka4s",
    "https://www.youtube.com/watch?v=tCnj-uiRCn8",
    "https://www.youtube.com/watch?v=cYNdUM2gRsg",
    "https://www.youtube.com/watch?v=oY6tCnu-1Do",
    "https://www.youtube.com/watch?v=tKB4h9gvmm0",
    "https://www.youtube.com/watch?v=IYnsfV5N2n8",
    "https://www.youtube.com/watch?v=8PWlxfTFmyE",
    "https://www.youtube.com/watch?v=XlUMyKgmy6k",
    "https://www.youtube.com/watch?v=FJLpNSjE1J4",
    "https://www.youtube.com/watch?v=am6fco14Gi0",
    "https://www.youtube.com/watch?v=b9RSREv2NAE",
    "https://www.youtube.com/watch?v=YcZ4vXgsGh4",
    "https://www.youtube.com/watch?v=MnjMwoJpDag",
    "https://www.youtube.com/watch?v=8zVTrQ54oKA",
    "https://www.youtube.com/watch?v=HV7SQkbOKQQ",
    "https://www.youtube.com/watch?v=urX6QcVFkHY",
    "https://www.youtube.com/watch?v=Q7vthL5hIqo",
    "https://www.youtube.com/watch?v=N0j6NXznknU",
    "https://www.youtube.com/watch?v=u0qTJz2DUos",
    "https://www.youtube.com/watch?v=UioiM5KopzU",
    "https://www.youtube.com/watch?v=sDlGy1SxYGg",
    "https://www.youtube.com/watch?v=dnua8QvCfB0",
    "https://www.youtube.com/watch?v=1xtRDN59Q6E",
    "https://www.youtube.com/watch?v=FG0ydp-1mHE",
    "https://www.youtube.com/watch?v=bCm-EAd_oEI",
    "https://www.youtube.com/watch?v=aZ5lyqb4gUc",
    "https://www.youtube.com/watch?v=2HUy60DWYek",
    "https://www.youtube.com/watch?v=FEXeAlaL9cc",
    "https://www.youtube.com/watch?v=ORouZmGacHk",
    "https://www.youtube.com/watch?v=2v-8DArgo-Y",
    "https://www.youtube.com/watch?v=SFFityye4AA",
    "https://www.youtube.com/watch?v=LiJN5jclKaQ",
    "https://www.youtube.com/watch?v=BfMLgmKDf-s",
    "https://www.youtube.com/watch?v=GCxu1Ki9jlw",
    "https://www.youtube.com/watch?v=WvRM0xMexEA",
    "https://www.youtube.com/watch?v=L-btmRYpWZI",
    "https://www.youtube.com/watch?v=HBdBnb5IByE",
    "https://www.youtube.com/watch?v=w5_B7mjQgvk",
    "https://www.youtube.com/watch?v=LvGawphcN4c",
    "https://www.youtube.com/watch?v=PAhyLPLRsJ4",
    "https://www.youtube.com/watch?v=E5ohTwQrZdg",
    "https://www.youtube.com/watch?v=m_7nnajnaI8",
    "https://www.youtube.com/watch?v=5X8AC3rBRG0",
    "https://www.youtube.com/watch?v=AiBqyXNtOEs",
    "https://www.youtube.com/watch?v=MiZ8V3NHwfM",
    "https://www.youtube.com/watch?v=K-JvpRzBmBA",
    "https://www.youtube.com/watch?v=ES9CvQRJqRM",
    "https://www.youtube.com/watch?v=SDaS5VNbVOo",
    "https://www.youtube.com/watch?v=v0aB4IWiDfs",
    "https://www.youtube.com/watch?v=ukj5Rnr-nX8",
    "https://www.youtube.com/watch?v=DGIZyD5-5gE",
    "https://www.youtube.com/watch?v=X7ZoFJhBE5o",
    "https://www.youtube.com/watch?v=KOUP8AGYdr8",
    "https://www.youtube.com/watch?v=QmP-K0zVoR0",
    "https://www.youtube.com/watch?v=FDoY1zaWB4I",
    "https://www.youtube.com/watch?v=gI40pUTzGPI",
    "https://www.youtube.com/watch?v=gs3lqEJHSnA",
    "https://www.youtube.com/watch?v=oav0TXI6bqc",
    "https://www.youtube.com/watch?v=8HATkU_F0iE",
    "https://www.youtube.com/watch?v=1YwDVqaszdU",
    "https://www.youtube.com/watch?v=gu8nQFHHD9w",
    "https://www.youtube.com/watch?v=fpnp3jRxRTs",
    "https://www.youtube.com/watch?v=wluh0U2wZuY",
    "https://www.youtube.com/watch?v=UUwZw_y6kpQ",
    "https://www.youtube.com/watch?v=PRQP-UPy6cQ",
    "https://www.youtube.com/watch?v=uVIXVFZOxKQ",
    "https://www.youtube.com/watch?v=5qSmQuBma3c",
    "https://www.youtube.com/watch?v=mHq89x2z2Lc",
    "https://www.youtube.com/watch?v=bVTyUTDSF9A",
    "https://www.youtube.com/watch?v=nVQqDcKAmzg",
    "https://www.youtube.com/watch?v=KRUHJDB75IE",
];
//I'M SORRY COLIN
//just kidding! i'm not sorry!~ >w<

function filtertext(tofilter){
  var filtered = false;
  blacklist.forEach(listitem=>{
    if(tofilter.includes(listitem)) filtered = true;
  })
  return filtered;
}

function checkRoomEmpty(room) {
    if (room.users.length != 0) return;

    log.info.log('info', 'removeRoom', {
        room: room
    });

    let publicIndex = roomsPublic.indexOf(room.rid);
    if (publicIndex != -1)
        roomsPublic.splice(publicIndex, 1);
    
    room.deconstruct();
    delete rooms[room.rid];
    delete room;
}

class Room {
    constructor(rid, prefs) {
        this.rid = rid;
        this.prefs = prefs;
        this.users = [];
                        
                const date = new Date();
                const hours = date.getHours();
                const minutes = date.getMinutes();
        if (rid == "bonzi_tv") {

            var num = Math.floor(Math.random() * videoIdsMisc.length);
            var vid = videoIdsMisc[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.vid = vid;

        } else {
            this.vid = "";
        }
    }

    deconstruct() {
        try {
            this.users.forEach((user) => {
                user.disconnect();
            });
        } catch (e) {
            log.info.log('warn', 'roomDeconstruct', {
                e: e,
                thisCtx: this
            });
        }
        //delete this.rid;
        //delete this.prefs;
        //delete this.users;
    }

    isFull() {
        return this.users.length >= this.prefs.room_max;
    }

    join(user) {
        user.socket.join(this.rid);
        this.users.push(user);

        this.updateUser(user);
    }

    leave(user) {
        // HACK
        try {
            this.emit('leave', {
                 guid: user.guid
            });
     
            let userIndex = this.users.indexOf(user);
     
            if (userIndex == -1) return;
            this.users.splice(userIndex, 1);
     
            checkRoomEmpty(this);
        } catch(e) {
            log.info.log('warn', 'roomLeave', {
                e: e,
                thisCtx: this
            });
        }
    }

    updateUser(user) {
                this.emit('update', {
                        guid: user.guid,
                        userPublic: user.public
        });
    }

    getUsersPublic() {
        let usersPublic = {};
        this.users.forEach((user) => {
            usersPublic[user.guid] = user.public;
        });
        return usersPublic;
    }

    emit(cmd, data) {
                io.to(this.rid).emit(cmd, data);
    }
}

function newRoom(rid, prefs) {
    rooms[rid] = new Room(rid, prefs);
    log.info.log('info', 'newRoom', {
        rid: rid
    });
}

let userCommands = {
    /*
    "godmode": function(word) {
        let success = word == this.room.prefs.godword;
        if (success) {
            this.private.runlevel = 3;
            this.public.name = "<font color=\"red\">" + this.public.name + "</font>"
            this.room.updateUser(this);
            this.socket.emit("authlevel",{level:3});
        }
        log.info.log('info', 'godmode', {
            guid: this.guid,
            success: success
        });
    },
    */
    "stop": function() {
        process.exit(1);
    },
    
    "fixbonzitv": function() {
        
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      var bonziTvIdent = videoIdsCommercials;
      var ident = Math.floor(Math.random() * bonziTvIdent.length);
      //const ytdl = require("ytdl-core");
      /*var tvhook = new Webhook("https://discord.com/api/webhooks/1022179106412036166/8cJeQN1dFC78Rar0pdjAEyYnsFFq--ZiWZt4WTT1--pnLikWRzwGjOHWYEYmtdmyjcRg");*/

      if (bonziTvCommercialMode) {

        var num = Math.floor(Math.random() * videoIdsCommercials.length);
        var vid = videoIdsCommercials[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
        this.room.vid = vid;

        //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
        this.room.emit("replaceTVWithURL", {
          id: videoIdsCommercials[Math.floor(Math.random() * videoIdsCommercials.length)].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
          identId: videoIdsCommercials[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
        });
      } else {
        if ((hours == 16 && minutes <= 30) || (hours == 9 && minutes <= 25) || (hours == 13 && minutes <= 20)) {
          var num = Math.floor(Math.random() * videoIds4PM2430PM.length);
          var vid = videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
          this.room.vid = vid;
          //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
          /*await ytdl.getInfo("https://www.youtube.com/watch?v=" + vid).then((info) => {
            console.log("Playing video: " + info.videoDetails.title);
            if (info.videoDetails.title.match(/BFDI/g) || info.videoDetails.title.match(/BFDIA/g)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=0eGC9tMZ8co"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Microsoft Agent/gi) ||
              info.videoDetails.title.match(/MSAgent/gi) ||
              info.videoDetails.title.match(/PGG Rebooted/g) ||
              info.videoDetails.title.match(/Skits/g) ||
              info.videoDetails.title.match(/BonziBUDDY/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=13A2ycR6ruc"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Clips Tape/g) ||
              info.videoDetails.title.match(/Left 4 Dead/gi) ||
              info.videoDetails.title.match(/How it FEELS/g) ||
              info.videoDetails.title.match(/Gets Grounded/g) ||
              info.videoDetails.title.match(/Brian and Steve/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Youtube Poop/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Vinesauce/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=qlYR9mW1DVk"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            }
          });*/
          this.room.emit("replaceTVWithURL", {
            id: videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
          });
        } else if (hours == 17) {
          var num = Math.floor(Math.random() * videoIds5PM.length);
          var vid = videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
          this.room.vid = vid;
          /*await ytdl.getInfo("https://www.youtube.com/watch?v=" + vid).then((info) => {
            console.log("Playing video: " + info.videoDetails.title);
            if (info.videoDetails.title.match(/BFDI/g) || info.videoDetails.title.match(/BFDIA/g)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=0eGC9tMZ8co"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Microsoft Agent/gi) ||
              info.videoDetails.title.match(/MSAgent/gi) ||
              info.videoDetails.title.match(/PGG Rebooted/g) ||
              info.videoDetails.title.match(/Skits/g) ||
              info.videoDetails.title.match(/BonziBUDDY/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=13A2ycR6ruc"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Clips Tape/g) ||
              info.videoDetails.title.match(/Left 4 Dead/gi) ||
              info.videoDetails.title.match(/How it FEELS/g) ||
              info.videoDetails.title.match(/Gets Grounded/g) ||
              info.videoDetails.title.match(/Brian and Steve/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Youtube Poop/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Vinesauce/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=qlYR9mW1DVk"];
              ident = Math.floor(Math.random() * bonziTvIdent.length); 
            }
          });*/
          //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
          this.room.emit("replaceTVWithURL", {
            id: videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
          });
        } else if (hours == 18 && minutes <= 20) {
          var num = Math.floor(Math.random() * videoIds7PM.length);
          var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
          this.room.vid = vid;
          /*await ytdl.getInfo("https://www.youtube.com/watch?v=" + vid).then((info) => {
            console.log("Playing video: " + info.videoDetails.title);
            if (info.videoDetails.title.match(/BFDI/g) || info.videoDetails.title.match(/BFDIA/g)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=0eGC9tMZ8co"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Microsoft Agent/gi) ||
              info.videoDetails.title.match(/MSAgent/gi) ||
              info.videoDetails.title.match(/PGG Rebooted/g) ||
              info.videoDetails.title.match(/Skits/g) ||
              info.videoDetails.title.match(/BonziBUDDY/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=13A2ycR6ruc"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Clips Tape/g) ||
              info.videoDetails.title.match(/Left 4 Dead/gi) ||
              info.videoDetails.title.match(/How it FEELS/g) ||
              info.videoDetails.title.match(/Gets Grounded/g) ||
              info.videoDetails.title.match(/Brian and Steve/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Youtube Poop/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Vinesauce/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=qlYR9mW1DVk"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            }
          });*/
          //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
          this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
          });
        } else if (hours == 19 && minutes <= 22) {
          var num = Math.floor(Math.random() * videoIds7PM.length);
          var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
          this.room.vid = vid;
          /*await ytdl.getInfo("https://www.youtube.com/watch?v=" + vid).then((info) => {
            console.log("Playing video: " + info.videoDetails.title);
            if (info.videoDetails.title.match(/BFDI/g) || info.videoDetails.title.match(/BFDIA/g)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=0eGC9tMZ8co"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Microsoft Agent/gi) ||
              info.videoDetails.title.match(/MSAgent/gi) ||
              info.videoDetails.title.match(/PGG Rebooted/g) ||
              info.videoDetails.title.match(/Skits/g) ||
              info.videoDetails.title.match(/BonziBUDDY/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=13A2ycR6ruc"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Clips Tape/g) ||
              info.videoDetails.title.match(/Left 4 Dead/gi) ||
              info.videoDetails.title.match(/How it FEELS/g) ||
              info.videoDetails.title.match(/Gets Grounded/g) ||
              info.videoDetails.title.match(/Brian and Steve/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Youtube Poop/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Vinesauce/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=qlYR9mW1DVk"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            }
          });*/
          //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
          this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
          });
        } else {
          var num = Math.floor(Math.random() * videoIds25MinutesofMSAgent.length);
          var vid = videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
          this.room.vid = vid;
          /*await ytdl.getInfo("https://www.youtube.com/watch?v=" + vid).then((info) => {
            console.log("Playing video: " + info.videoDetails.title);
            if (info.videoDetails.title.match(/BFDI/g) || info.videoDetails.title.match(/BFDIA/g)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=0eGC9tMZ8co"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Microsoft Agent/gi) ||
              info.videoDetails.title.match(/MSAgent/gi) ||
              info.videoDetails.title.match(/PGG Rebooted/g) ||
              info.videoDetails.title.match(/Skits/g) ||
              info.videoDetails.title.match(/BonziBUDDY/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=13A2ycR6ruc"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (
              info.videoDetails.title.match(/Clips Tape/g) ||
              info.videoDetails.title.match(/Left 4 Dead/gi) ||
              info.videoDetails.title.match(/How it FEELS/g) ||
              info.videoDetails.title.match(/Gets Grounded/g) ||
              info.videoDetails.title.match(/Brian and Steve/g)
            ) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Youtube Poop/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=T1MKRI6HW4w"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            } else if (info.videoDetails.title.match(/Vinesauce/gi)) {
              bonziTvIdent = ["https://www.youtube.com/watch?v=qlYR9mW1DVk"];
              ident = Math.floor(Math.random() * bonziTvIdent.length);
            }
          });*/
          //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
          this.room.emit("replaceTVWithURL", {
            id: videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
          });
        }
      }
    }, 
    setbonzitvvid: function(vidRaw) {


        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        var vidId = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        //var tvhook = new Webhook("https://discord.com/api/webhooks/1022179106412036166/8cJeQN1dFC78Rar0pdjAEyYnsFFq--ZiWZt4WTT1--pnLikWRzwGjOHWYEYmtdmyjcRg");

        if (Math.random() * 3 == 1) {
        if ((hours == 16 && minutes <= 30) || (hours == 9 && minutes <= 25)) {
            var num = Math.floor(Math.random() * videoIds4PM2430PM.length);
            var vid = videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;

            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 17) {
            var num = Math.floor(Math.random() * videoIds5PM.length);
            var vid = videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 18 && minutes <= 30) {
            var num = Math.floor(Math.random() * videoIds7PM.length);
            var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 19 && minutes <= 22) {
            var num = Math.floor(Math.random() * videoIds7PM.length);
            var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else {
            var num = Math.floor(Math.random() * videoIds25MinutesofMSAgent.length);
            var vid = videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        }
        } else {
        if ((hours == 16 && minutes <= 30) || (hours == 9 && minutes <= 25) || (hours == 13 && minutes <= 20)) {
            var num = Math.floor(Math.random() * videoIds4PM2430PM.length);
            var vid = videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds4PM2430PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 17) {
            var num = Math.floor(Math.random() * videoIds5PM.length);
            var vid = videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds5PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 18 && minutes <= 30) {
            var num = Math.floor(Math.random() * videoIds7PM.length);
            var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 19 && hours <= 22) {
            var num = Math.floor(Math.random() * videoIds7PM.length);
            var vid = videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds7PM[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        } else if (hours == 23 || (hours == 22 && minutes >= 9)) {
            //tvhook.send("BonziTV is now off air.");
            this.room.emit("replaceTVWithURL", {
            id: "kQsoV69uGIY",
            hourAmount: hours,
            minuteAmount: minutes,
            identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
            });
        } else {
            var num = Math.floor(Math.random() * videoIds25MinutesofMSAgent.length);
            var vid = videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;
            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIds25MinutesofMSAgent[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: vidId,
            });
        }
        }
    },

    setbonzitvvid2: function(vidRaw) {

        var vidId = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.vid = vidId;
        this.room.emit("replaceTVWithURL", {
        id: vidId,
        identId: vidId,
        });
    },
    setbonzitvvid3: function(vidRaw) {


        var bonziTvIdent = videoIdsCommercials;
        var ident = Math.floor(Math.random() * bonziTvIdent.length);
        var vidId = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.vid = vidId;
        this.room.emit("replaceTVWithURL", {
        id: vidId,
        identId: bonziTvIdent[ident].replace("https://www.youtube.com/watch?v=", ""),
        });
    },
    "bonzitv_code": function(word) {
        let success = word == this.room.prefs.bonzitv_code;
        // Donut if you ever read this, please be careful with this command. The members will thank you <3
        if (success) {
            this.private.runlevel = 2;
            this.room.updateUser(this);
            this.socket.emit("authlevel",{level:2});
        }
        log.info.log('info', 'mod_code', {
            guid: this.guid,
            success: success
        });
    },
    "mod_code": function(word) {
        let success = word == this.room.prefs.mod_code;
        // Donut if you ever read this, please be careful with this command. The members will thank you <3
        if (success) {
            this.public.name = `<font color=\"green\">${this.public.name}</font>`
            this.private.runlevel = 3;
            this.room.updateUser(this);
            this.socket.emit("authlevel",{level:3});
        }
        log.info.log('info', 'mod_code', {
            guid: this.guid,
            success: success
        });
    },
    // not used by anyone
    /*
    "dev_code": function(word) {
        let success = word == this.room.prefs.dev_code;
        if (success) {
                        this.public.name = "<font color=\"orange\">" + this.public.name + "</font>"
                        this.private.runlevel = 3;
                        this.room.updateUser(this);
                        this.socket.emit("authlevel",{level:3});
                }
        log.info.log('info', 'dev_code', {
            guid: this.guid,
            success: success
        });
    },
    */
    "overlus": function(word) {
        let success = word == this.room.prefs.overlus;
        if (success) { // check if they're using siob's color or kern's color.
            // todo: actually check by the user's current clientside hostname for joining BWR
            // IP addresses are simply too risky to leak and people can just easily DDoS and dox them.
            this.public.name = `<font color=\"blue\">${this.public.name}</font>`
            this.private.runlevel = 4;
            this.private.sanitize = "off";
            this.room.updateUser(this);
            this.socket.emit("authlevel",{level:4});
            balances[this.getIp()] = 2147483647;
            this.socket.emit("balanceUpdate", balances[this.getIp()]);
        }
        log.info.log('info', 'overlus', {
            guid: this.guid,
            success: success
        });
    },
    "asshole": function() {
        this.room.emit("asshole", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "owo": function() {
        this.room.emit("owo", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
        startyping: function () {
                this.room.emit("typing", { guid: this.guid })
        },
        stoptyping: function () {
                this.room.emit("stoptyping", { guid: this.guid })
        },
    /*
    "real_code": function(word) {
        let success = word == this.room.prefs.real_code;
        if (success) {
            this.public.name = "<font color=\"blue\">" + this.public.name + "</font>"
            this.room.updateUser(this);
        }
        log.info.log('info', 'real_code', {
            guid: this.guid,
            success: success
        });
    },
    */
    // I don't wanna be a "no fun allowed" guy but this is causing issues, even if done unintentionally.
    "sanitize": function() {
        // If the bonzi using the command is not Siobhan, do nothing.
        let sanitizeTerms = ["false", "off", "disable", "disabled", "f", "no", "n"];
        let argsString = Utils.argsString(arguments);
        this.private.sanitize = !sanitizeTerms.includes(argsString.toLowerCase());
    },
    "kick": function (data) {
        let pu = this.room.getUsersPublic()[data];
        if (pu && pu.color) {
            let target;
            this.room.users.map((n) => {
                if (n.guid == data) {
                    target = n;
                }
            });
            
            if (target.private.runlevel < 0.5) { // maaaybe like this??
                target.socket.emit("kick", {
                    reason: "You got kicked.<br>Kicked by "+this.public.name,
                });
                target.disconnect();
                target.socket.disconnect();
                this.room.leave(target);
            }
        }
    },
    "bless": function (data) {
        let pu = this.room.getUsersPublic()[data];
        if (pu && pu.color) {
            let target;
            this.room.users.map((n) => {
                if (n.guid == data) {
                    target = n;
                }
            });
            
            if (target.private.runlevel < 2) {
                target.public.color = "blessed";
                                this.room.updateUser(target);
                target.private.runlevel = 0.5;
                target.socket.emit("blessed")
            }
        }
    },
    "zombify": function (data) {
        this.public.color = "undead";
                this.room.updateUser(this);
    },
    "joke": function() {
        this.room.emit("joke", {
            guid: this.guid,
            rng: Math.random()
        });
    }, 
    "rooms": function() {
        console.log("Rooms command executed - showing room count");
        const roomCount = Object.keys(rooms).length;
        this.socket.emit("rooms", {
            count: roomCount
        });
    },
    "dialogueended": function() {
        this.room.emit("dialogueended");
    }, 
    "fact": function() {
        this.room.emit("fact", {
            guid: this.guid,
            rng: Math.random()
        });
    },
    "youtube": function(vidRaw) {
        if(vidRaw.includes("\"")){
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        if(vidRaw.includes("'")){ 
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("youtube", {
            guid: this.guid,
            vid: vid
        });
    },
    "video": function(vidRaw) {
        if(!vidRaw.match(/catbox/gi)) return;
        if(vidRaw.includes("\"")){
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        if(vidRaw.includes("'")){ 
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        var vid = vidRaw.replace("\"","").replace("'","").replace("&#","").replace(">","").replace("<","");
        this.room.emit("video", {
            guid: this.guid,
            vid: vid
        });
    },
    "video_flash": function(vidRaw) {
        if(!vidRaw.match(/catbox/gi)) return;
        if(vidRaw.includes("\"")){
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        if(vidRaw.includes("'")){ 
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        var vid = vidRaw.replace("\"","").replace("'","").replace("&#","").replace(">","").replace("<","");
        this.room.emit("video_flash", {
            guid: this.guid,
            vid: vid
        });
    },
    "img": function(vidRaw) {
        if(!vidRaw.match(/catbox/gi)) return;
        if(vidRaw.includes("\"")){
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        if(vidRaw.includes("'")){ 
            this.room.emit("talk", {
                guid: this.guid,
                text:"I'M PRETENDING TO BE A 1337 HAX0R BUT I'M ACTUALLY A SKRIPT KIDDI LMAO"
            }); 
            return;
        }
        var vid = vidRaw.replace("\"","").replace("'","").replace("&#","").replace(">","").replace("<","");
        this.room.emit("img", {
            guid: this.guid,
            vid: vid
        });
    },
    /*
    "color": function(param) {
                var victim = this;
                if (colors.includes(param) || param.startsWith("http")) {
            if (!param.startsWith("http")) {
                            param = param;
            }
            else {
                            param = param.toLowerCase();
            }
                        victim.public.color = param;
                        this.room.updateUser(victim);
                } else {
            if (typeof param != "undefined") {
                if (settings.bonziColors.indexOf(param) == -1)
                    return;
                
                this.public.color = param;
            } else {
                let bc = settings.bonziColors;
                this.public.color = bc[
                    Math.floor(Math.random() * bc.length)
                ];
            }    
            this.room.updateUser(this);
                }
    },
    */
   
    "color": function(color) {
        if (color.startsWith("http") && this.private.runlevel > 2) {
            this.public.color = color; 
            this.room.updateUser(this);
            return;
        }
        if (typeof color != "undefined") {
            if (settings.bonziColors.indexOf(color) == -1 && this.private.runlevel < 2)
                return;
            
            this.public.color = color;
        } else {
            let bc = settings.bonziColors;
            this.public.color = bc[
                Math.floor(Math.random() * bc.length)
            ];
        }

        this.room.updateUser(this);
    },
   
    "agent": function(color) {
        if (typeof color != "undefined") {
            if (settings.agents.indexOf(color) == -1 && settings.secretAgents.indexOf(color) == -1 && this.private.runlevel < 2)
                return;
            
            this.public.color = color;
        } else {
            let bc = settings.agents;
            this.public.color = bc[
                Math.floor(Math.random() * bc.length)
            ];
        }

        this.room.updateUser(this);
    },
    "voice": function() {
                this.public.voice = Utils.argsString(arguments);
        this.room.updateUser(this);
    },
    "pope": function() {
        this.public.color = "pope";
        this.room.updateUser(this);
    },
    "name": function() {
        let argsString = Utils.argsString(arguments);

            if (argsString.length > this.room.prefs.name_limit)
                return;

            let name = argsString || this.room.prefs.defaultName;
            this.public.name = this.private.sanitize ? sanitize(name) : name;
            if (this.private.runlevel >= 4) {
                this.public.name = "<font color=\"blue\">" + this.private.sanitize ? sanitize(name) : name + "</font>"    
            } else if (this.private.runlevel == 3) {
                this.public.name = "<font color=\"red\">" + this.private.sanitize ? sanitize(name) : name + "</font>"    
            } else if (this.private.runlevel == 2) {
                this.public.name = "<font color=\"green\">" + this.private.sanitize ? sanitize(name) : name + "</font>"    
            }
            this.room.updateUser(this);
    },
    "tag": function() {
        let argsString = Utils.argsString(arguments);
        if (argsString.length > 80)
            return;
        if (!/^[~`!@#$%^&*()_+=\w[\]\\{}|;':",.\//<>?\s\w&.\-б]*$/i.test(argsString)) return;
        let name = argsString || "";
        this.public.tag = this.private.sanitize ? sanitize(name) : name;
        this.room.updateUser(this);
    },
    "pitch": function(pitch) {
        pitch = parseInt(pitch);

        if (isNaN(pitch)) return;

        this.public.pitch = Math.max(
            Math.min(
                parseInt(pitch),
                this.room.prefs.pitch.max
            ),
            this.room.prefs.pitch.min
        );

        this.room.updateUser(this);
    },
    "speed": function(speed) {
        speed = parseInt(speed);

        if (isNaN(speed)) return;

        this.public.speed = Math.max(
            Math.min(
                parseInt(speed),
                this.room.prefs.speed.max
            ),
            this.room.prefs.speed.min
        );
        
        this.room.updateUser(this);
    },
    "exit": function() {
        this.room.emit('leave', {
            guid: this.guid
        });
        
        this.room.leave(this);
    },
    "smite": function() {
        io.emit("smite")
    },
    "inflate": function() {
        io.emit("inflate") // Siohban why do we have this??
        // It's a AI BonziBuddy command, It works smilarly to AI Sponge Rehydrated's version.
    },
    "deflate": function() {
        io.emit("deflate")
    },
    "bigger": function() {
        this.room.emit("bigger",{
            guid: this.guid
        })
    },
    "reset": function() {
        this.room.emit("reset",{
            guid: this.guid
        })
    },
    "smaller": function() {
        this.room.emit("smaller",{
            guid: this.guid
        })
    },
    "nuke": function(data) {
        
        let pu = this.room.getUsersPublic()[data];
        if (pu && pu.color) {
            let target;
            this.room.users.map((n) => {
                if (n.guid == data) {
                    target = n;
                }
            });
            
            if (target.private.runlevel < 2) {
                this.room.emit("nuke", {
                    id: target.guid
                }); 
                target.socket.emit("nuked");
                var _this = this;
                setTimeout(function(){
                    _this.room.leave(target);
                },5000)
            }
        }
    },
    move: function (x, y, isDrag) {
      // Only stop DVD bouncing when dragging (not from move command)
      if (isDrag && this.bounceInterval) {
          clearInterval(this.bounceInterval);
          this.bounceInterval = null;
      }
      
      if (this.private.runlevel > 0.5) {
          this.room.emit("move", {
              guid: this.guid,
              posX: x,
              posY: y,
          });
      } else {
        // fuck it. lol
          this.socket.emit("move", {
              guid: this.guid,
              posX: x,
              posY: y,
          });
      }
      this.public.x = x;
      this.public.y = y;
    },
    dvdbounce: function() {
        // Clear any existing bounce interval for this user
        if (this.bounceInterval) {
            clearInterval(this.bounceInterval);
        }
        
        // DVD screensaver parameters
        const screenWidth = 800; // Approximate screen width
        const screenHeight = 600; // Approximate screen height
        const speed = 8; // Movement speed (increased for faster bouncing)
        
        // Initialize position if not set
        if (!this.public.x) this.public.x = Math.random() * (screenWidth - 100);
        if (!this.public.y) this.public.y = Math.random() * (screenHeight - 100);
        
        // Initialize velocity
        this.dvdVelocityX = Math.random() > 0.5 ? speed : -speed;
        this.dvdVelocityY = Math.random() > 0.5 ? speed : -speed;
        
        const _this = this;
        this.bounceInterval = setInterval(function() {
            // Update position
            _this.public.x += _this.dvdVelocityX;
            _this.public.y += _this.dvdVelocityY;
            
            // Bounce off edges (accounting for character size ~100px)
            if (_this.public.x <= 0 || _this.public.x >= screenWidth - 100) {
                _this.dvdVelocityX = -_this.dvdVelocityX;
                _this.public.x = Math.max(0, Math.min(screenWidth - 100, _this.public.x));
            }
            if (_this.public.y <= 0 || _this.public.y >= screenHeight - 100) {
                _this.dvdVelocityY = -_this.dvdVelocityY;
                _this.public.y = Math.max(0, Math.min(screenHeight - 100, _this.public.y));
            }
            
            // Emit the movement to all users
            if (_this.private.runlevel > 0.5) {
                _this.room.emit("move", {
                    guid: _this.guid,
                    posX: _this.public.x,
                    posY: _this.public.y,
                });
            } else {
                _this.socket.emit("move", {
                    guid: _this.guid,
                    posX: _this.public.x,
                    posY: _this.public.y,
                });
            }
        }, 16); // ~60 FPS
    },
    stopdvd: function() {
        if (this.bounceInterval) {
            clearInterval(this.bounceInterval);
            this.bounceInterval = null;
        }
    },
    look: function (deg) {
          this.room.emit("look", {
              guid: this.guid,
              deg: deg,
          });
    },
    size: function (size) {
          this.room.emit("size", {
              guid: this.guid,
              size: size,
          });
    },
    bonzigame: function () {
        this.room.emit("state_banhammer");
    },
        "linux": "passthrough",
        "pawn": "passthrough",
        "bees": "passthrough",
    "anim": function() {
        this.room.emit("anim", {
            guid: this.guid,
            anim: sanitize(Utils.argsString(arguments))
        });
    },
    "youtuber_code": function(word) {
        let success = word == this.room.prefs.youtuber_code;
        if (success) {
            this.public.name = "<font color=\"maroon\">" + this.public.name + "</font>";
            this.private.runlevel = 0.5;
            this.room.updateUser(this);
            this.socket.emit("authlevel", { level: 0.5 });
        }
        log.info.log('info', 'youtuber_code', {
            guid: this.guid,
            success: success
        });
    }
};
const fetch = require('node-fetch');
async function getAvatarThumbnail(userId) {
    const url = `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`;

    const response = await fetch(url);
    const data = await response.json();
    return data.data[0].imageUrl;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
class User {
    constructor(socket) {
        this.guid = Utils.guidGen();
        this.socket = socket;
        
        if (ipsConnected(this.getIp()) > 1 && this.getIp() != "::1") {
            this.socket.disconnect();
            return;
        }
        // Handle ban
            if (Ban.isBanned(this.getIp())) {
            Ban.handleBan(this.socket);
        }
        this.private = {
            login: false,
            sanitize: true,
            runlevel: 0
        };

        let bc = settings.bonziColors;
        this.public = {
            color: bc[
                Math.floor(Math.random() * bc.length)
            ],
            voice: "en-US",
            roblox: false,
            blessed: false,
            x: getRandomInt(0,1024),
            y: getRandomInt(0,768)
        };
        log.access.log('info', 'connect', {
            guid: this.guid,
            agent: this.getAgent(),
            ip: this.getIp() // PLEASE DON'T ABUSE THIS
        });
                
        var _this = this;

                this.shouldTalkAgain = true
        this.socket.on('login', this.login.bind(this));
        this.socket.on('blessed', function(){
            _this.public.blessed = true;
        });
        this.socket.on('banhammer_hit', function(data){
            _this.room.emit("explode",data);
        });
        this.socket.on('command', this.command.bind(this)); 
        if (!balances[_this.getIp()]) {
            balances[_this.getIp()] = 100; // Starting balance
            saveBalances();
        }
        
        var blessed = this.public.blessed
        // Server gives coins every 10 seconds
        this.earnInterval = setInterval(() => {
            if (blessed) {
                balances[_this.getIp()] += 10;
                _this.socket.emit("earned", 10);
                _this.socket.emit("balanceUpdate", balances[_this.getIp()]);
                saveBalances();
            }
        }, 10000);

        // Handle spending coins
        this.socket.on("spend", amount => {
            if (typeof amount === "number" && amount > 0 && balances[_this.getIp()] >= amount) {
            balances[_this.getIp()] -= amount;
            _this.socket.emit("balanceUpdate", balances[_this.getIp()]);
            saveBalances();
            } else {
            _this.socket.emit("errorMessage", "Not enough coins.");
            }
        });
        
        this.socket.on("evilbonzikilled", (data) => {
            balances[_this.getIp()] += 100;
            _this.socket.emit("earned", 100);
            _this.socket.emit("balanceUpdate", balances[_this.getIp()]);
        })
        
        this.socket.on("bulletshoot", () => {
            // Send bullet info to all clients
            _this.room.emit("agent_bullet", { id: this.guid });
        });
    }

    getIp() {
        return getRealIP(this.socket);
    }

    getAgent() {
        return this.socket.handshake.headers["user-agent"];
    }

    getPort() {
        return this.socket.handshake.address.port;
    }

    async login(data) {
        if (typeof data != 'object') return; // Crash fix (issue #9)
        
        if (this.private.login) return;
        if (ipsConnected(this.getIp()) > 1 && this.getIp() != "98.30.249.15" && this.getIp() != "::1") return;
        //if (this.public.name == "Bridger") Ban.addBan(this.getIp(),9999,"This was my idea :(");
        // scratch the fuck out of that, i have an idea
            
        if (settings.agents.indexOf(data.color) != -1) this.public.color = data.color;
        if (settings.secretAgents.indexOf(data.color) != -1) this.public.color = data.color;
        if (settings.bonziColors.indexOf(data.color) != -1) this.public.color = data.color;
                log.info.log('info', 'login', {
                        guid: this.guid,
        });

        if (data.isRoblox == "true") {
            this.public.color = await getAvatarThumbnail(data.robloxUserId);
            this.public.roblox = true;
        }
        
        let rid = data.room;
        
                // Check if room was explicitly specified
                var roomSpecified = true;

                // If not, set room to public
                if ((typeof rid == "undefined") || (rid === "")) {
                        rid = "default";
                        roomSpecified = true;
                }
                log.info.log('info', 'roomSpecified', {
                        guid: this.guid,
                        roomSpecified: roomSpecified
        });
        
        if (this.getIp() == "98.30.249.15" && this.getIp() == "84.50.129.189") {
            this.private.runlevel = 4;
        }
                // If private room
                if (roomSpecified) {
            if (sanitize(rid) != rid) {
                this.socket.emit("loginFail", {
                    reason: "nameMal"
                });
                return;
            }

                        // If room does not yet exist
                        if (typeof rooms[rid] == "undefined") {
                                // Clone default settings
                if (rid == "default" || rid == "ai" || rid == "bonzi_tv") {

                    var tmpPrefs = JSON.parse(JSON.stringify(settings.prefs.public));
                    // Set owner
                    tmpPrefs.owner = this.guid;
                    newRoom(rid, tmpPrefs);
                                    roomsPublic.push(rid);

                } else {

                    var tmpPrefs = JSON.parse(JSON.stringify(settings.prefs.private));
                    // Set owner
                    tmpPrefs.owner = this.guid;
                    newRoom(rid, tmpPrefs);
                }
                        }
                        // If room is full, fail login
                        else if (rooms[rid].isFull()) {
                                log.info.log('info', 'loginFail', {
                                        guid: this.guid,
                                        reason: "full"
                                });
                                return this.socket.emit("loginFail", {
                                        reason: "full"
                                });
                        }
        }
        
        this.room = rooms[rid];

        this.socket.emit("balanceUpdate", balances[this.getIp()]);
        // Check name
                this.public.name = sanitize(data.name) || this.room.prefs.defaultName;
                this.public.tag = "";
        let color = this.public.name.toLowerCase();
        if (color == "clippy") {
            color = "clippit"
        } else if (color == "officer robosoft") {
            color = "robby"
        }
        if (settings.bonziColors.indexOf(color) != -1)
        {
            this.public.color = color;
        }

                if (this.public.name.length > this.room.prefs.name_limit)
                        return this.socket.emit("loginFail", {
                                reason: "nameLength"
                        });
        
                if (this.room.prefs.speed.default == "random")
                        this.public.speed = Utils.randomRangeInt(
                                this.room.prefs.speed.min,
                                this.room.prefs.speed.max
                        );
                else this.public.speed = this.room.prefs.speed.default;

                if (this.room.prefs.pitch.default == "random")
                        this.public.pitch = Utils.randomRangeInt(
                                this.room.prefs.pitch.min,
                                this.room.prefs.pitch.max
                        );
                else this.public.pitch = this.room.prefs.pitch.default;

        // Join room
        this.room.join(this);

        this.private.login = true;
        this.socket.removeAllListeners("login");

                // Send all user info
                this.socket.emit('updateAll', {
                        usersPublic: this.room.getUsersPublic()
                });
                this.socket.emit('updateGuid', {
                        guid: this.guid
                });

                // Send room info
                this.socket.emit('room', {
                        room: rid,
                        vid: this.room.vid,
                        curtime: this.room.curtime,
                        isOwner: this.room.prefs.owner == this.guid,
                        isPublic: roomsPublic.indexOf(rid) != -1
                });
        
        this.socket.on('talk', this.talk.bind(this));
                this.socket.on("updatebonzitv", this.updatebonzitv.bind(this));
                this.socket.on("setbonzitvtime", this.setbonzitvtime.bind(this));
        this.socket.on('disconnect', this.disconnect.bind(this));
        // Handle incoming audio stream
        var _this = this;
        this.socket.on('audioStream', (data) => {
            _this.room.emit('audioStream', {
                id: _this.guid,
                audio: data.audio
            });
        });
        this.room.emit("move", {
              guid: this.guid,
              posX: this.public.x,
              posY: this.public.y,
          });
    }

    setbonzitvtime(data) {
        this.room.curtime = data.curtime;
        /*
            log.info.log("info", "updateTime", {
            bonziTvTime: data.curtime,
            });
        */ 
    }
    async updatebonzitv() {
        if (!bonziTvCool) {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        var bonziTvIdent = videoIdsCommercials;
        var ident = Math.floor(Math.random() * bonziTvIdent.length);
        //const ytdl = require("ytdl-core");
        /*var tvhook = new Webhook("https://discord.com/api/webhooks/1022179106412036166/8cJeQN1dFC78Rar0pdjAEyYnsFFq--ZiWZt4WTT1--pnLikWRzwGjOHWYEYmtdmyjcRg");*/

            var num = Math.floor(Math.random() * videoIdsCommercials.length);
            var vid = videoIdsMisc[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", "");
            this.room.vid = vid;

            //tvhook.send("Now playing: https://www.youtube.com/watch?v=" + vid);
            this.room.emit("replaceTVWithURL", {
            id: videoIdsMisc[Math.floor(Math.random() * videoIdsMisc.length)].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            identId: videoIdsCommercials[num].replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/", ""),
            });
        bonziTvCool = true;
        setTimeout(function() {
            bonziTvCool = false;
        }, 20000);
        }
    }
  
    talk(data) {
        if (typeof data != 'object' || typeof data.text != "string") { // Crash fix (issue #9)
            data = {
                text: "HEY EVERYONE LOOK AT ME I'M TRYING TO SCREW WITH THE SERVER LMAO"
            };
                        return;
        }


        if (typeof data.text == "undefined")
            return;
                
                if (this.shouldTalkAgain || this.private.runlevel == 4) {
                        
                        log.info.log('info', 'talk', {
                                guid: this.guid,
                                text: data.text
                        });
                
                        let text = this.private.sanitize ? sanitize(data.text.replace(/&#60/g, "&lt;").replace(/&#62/g, "&gt;").replace(/\[\[/g, "&#91;&#91;")) : data.text;
                        if(filtertext(text)) text = "behh behh behh behh behh behh behh behh behh behh behh behh behh behh behh";
                        if ((text.length <= this.room.prefs.char_limit) && (text.length > 0)) {
                                this.room.emit('talk', {
                                        guid: this.guid,
                                        text: text,
                    name: this.public.name,
                    pitch: this.public.pitch,
                    speed: this.public.speed
                                });
                        }
            if (this.private.runlevel != 4) {

                this.shouldTalkAgain = false;
                var _this = this;
                setTimeout(function(){
                    _this.shouldTalkAgain = true;
                },1500)
                
            }
                }
    }

    async command(data) {
        if (typeof data != 'object') return; // Crash fix (issue #9)

        var command;
        var args;
        
        var list = data.list;
        command = list[0].toLowerCase();
            try {
                args = list.slice(1);
        
                log.info.log('debug', command, {
                    guid: this.guid,
                    args: args
                });

            if (this.shouldTalkAgain || command.includes("move") || command.includes("dvdbounce") || command.includes("stopdvd") || command.includes("overlus") || command.includes("mod_code") || command.includes("bonzitv_code") || command.includes("typing"))
            {

                if (this.private.runlevel >= (this.room.prefs.runlevel[command] || 0)) {
                    let commandFunc = userCommands[command];
                    if (commandFunc == "passthrough")
                        this.room.emit(command, {
                            "guid": this.guid
                        });
                    else commandFunc.apply(this, args);
                } else
                    this.socket.emit('commandFail', {
                        reason: "runlevel"
                    });
                    
                if (!(command.includes("move") || command.includes("dvdbounce") || command.includes("stopdvd") || command.includes("overlus") || command.includes("mod_code") || command.includes("bonzitv_code") || command.includes("typing"))) {

                    this.shouldTalkAgain = false;
                    var _this = this;
                    setTimeout(function(){
                        _this.shouldTalkAgain = true;
                    },1500)

                }
            }
            } catch(e) {
                log.info.log('debug', 'commandFail', {
                    guid: this.guid,
                    command: command,
                    args: args,
                    reason: "unknown",
                    exception: e
                });
                console.error(e);
                this.socket.emit('commandFail', {
                    reason: "unknown"
                });
            }
    }

    disconnect() {
                let ip = "N/A";
                let port = "N/A";

                try {
                        ip = this.getIp();
                        port = this.getPort();
                } catch(e) { 
                        log.info.log('warn', "exception", {
                                guid: this.guid,
                                exception: e
                        });
                }
                // have you NOT learned your lesson yet?
                log.access.log('info', 'disconnect', {
                        guid: this.guid//,
                        //ip: ip,
                        //port: port
                });
         
        this.socket.broadcast.emit('leave', {
            guid: this.guid
        });
        clearInterval(this.earnInterval);
        
        // Clear DVD bounce interval if active
        if (this.bounceInterval) {
            clearInterval(this.bounceInterval);
        }
        
        this.socket.removeAllListeners('talk');
        this.socket.removeAllListeners('command');
        this.socket.removeAllListeners('disconnect');

        this.room.leave(this);
    }
}
