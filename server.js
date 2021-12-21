const express = require("express");
const cors = require("cors");
const WebSocket = require('ws');
const axios = require("axios");

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Hello User!" });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

const url = 'ws://localhost:2020'
const connection = new WebSocket(url)

connection.onopen = () => {
    connection.send('Message From Client')
}

connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
}

connection.onmessage = (e) => {
    const data = JSON.parse(e.data);

    axios
        .get('http://localhost:3001/api/sensors/')
        .then(res => {

            const sensor = res.data.find( ({ x_coordinate, y_coordinate }) => x_coordinate === data.sensordata[0]["x-coord"] && y_coordinate === data.sensordata[0]["y-coord"])

            if (sensor === undefined) {
                console.log("SENSOR:   " + data.sensordata[0]["x-coord"] +"-"+ data.sensordata[0]["y-coord"]);

                axios
                    .post('http://localhost:3001/api/sensors', {
                        floor_id: 1,
                        x_coordinate: data.sensordata[0]["x-coord"],
                        y_coordinate: data.sensordata[0]["y-coord"],
                        flagged_faulty: null
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            }

            axios
                .post('http://localhost:3002/api/sensorlogs', {
                    x_coordinate : data.sensordata[0]["x-coord"],
                    y_coordinate : data.sensordata[0]["y-coord"],
                    humidity: data.sensordata[0]["humidity"],
                    temperature: data.sensordata[0]["temperature"],
                    up_time:  data.sensordata[0]["uptime"],
                })
                .catch((error) => {
                    console.error(error)
                })
        })
        .catch((error) => {
            console.error(error)
        })
}