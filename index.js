const Discord = require("discord.js")
const request = require("request")
const schedule = require('node-schedule')

const client = new Discord.Client()
require('dotenv').config()

const command = require("./commands.js")


const getToken = (url, callback) => {
    const options = {
        url: process.env.GET_TOKEN,
        json: true,
        body:{
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "client_credentials"
        }
    }

    request.post(options, (err, res, body) => {
        if(err){
            return console.log(err)
        }
        console.log("Satis: ${res.statusCode}")
        console.log(body)
        //console.log(body.access_token)

        callback(res)
    })
}


var AT = "";
getToken(process.env.GET_TOKEN, (res) => {
    AT = res.body.access_token
    return AT
})


var isLive = 0;

client.on("ready", () => {
    console.log("The client is ready!")

    command(client, ["ping", "test"], (message) => {
        message.channel.send("Pong!")
    })

    command(client, ["last stream"], (message) => {

        const getLastStream = (url, access_token, callback) => {

            const streamOptions = {
                url: process.env.GET_LAST_STREAM,
                method: "GET",
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": "Bearer " + access_token
                }
            }
        
            request.get(streamOptions, (err, res, body) => {
                if(err){
                    return console.log(err);
                }
                console.log("Status: ${res.statusCode}")
                console.log(JSON.parse(body).data[0])
                var link = JSON.parse(body).data[0].url
                var lastStream = JSON.parse(body).data[0].published_at
                var year = lastStream.substring(0, 4)
                var month = lastStream.substring(5,7)
                var day = lastStream.substring(8,10)
                var time = lastStream.substring(11,19)
                message.channel.send("Letzter Stream am " + day + "." + month + "." + year + " um " + time + " | Link: " + link)
                //2021-03-10T10:39:01Z
                
            })
        }


    getLastStream(process.env.GET_LAST_STREAM, AT, (response) => {
                
    })

    })

    const job = schedule.scheduleJob('* * * * *', function(){

    const startStream = (url, access_token, callback) => {

        const streamOptions = {
            url: process.env.GET_STREAMS,
            method: "GET",
            headers: {
                "Client-ID": process.env.CLIENT_ID,
                "Authorization": "Bearer " + access_token
            }
        }
    
        request.get(streamOptions, (err, res, body) => {
            if(err){
                return console.log(err);
            }
            console.log("Status: ${res.statusCode}")
            if(JSON.parse(body).data[0] != null){
                
                if(isLive == 0){
                    client.channels.cache.get(`818807516560883736`).send(`@everyone Kommt ran meine Freunde!!!! https://www.twitch.tv/trumpflp`)
                    isLive = 1
                    setTimeout(function(){
                        isLive = 0
                    }, 28800000)
                }
                
            }
            
        })
    }
    
        startStream(process.env.GET_STREAMS, AT, (response) => {
            
        });

    })

})


client.login(process.env.TOKEN)


