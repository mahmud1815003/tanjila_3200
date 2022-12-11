const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');



const blinkLink_heart_rate = 'https://blynk.cloud/external/api/get?token=AgtJBsesVKvhjhkipRV6Nou0Bmu5KkhR&v0'
const blinkLink_SPO2 = 'https://blynk.cloud/external/api/get?token=AgtJBsesVKvhjhkipRV6Nou0Bmu5KkhR&v1'
const sensorData = 1000 //Blynk
const time = 1 //Minutes
const spreadSheetSendingTime = 60 * 1000 * time; //Spreadshset

app.get('/', (req, res) => {
    res.send("Hello Tanjila Tabassum Fateema");
})

const bpm = "BPM (Per 4 min)";
const spo2 = "SPO2 (Per 4 min)"



let data = [];

const getDataFromBlynkAPI = async () => {
    try {
        const bpm_data = await axios.get(blinkLink_heart_rate);
        const spo2_data = await axios.get(blinkLink_SPO2);
        console.log(`BPM: ${bpm_data.data}\nSPO2: ${spo2_data.data}\n\n------------------\n`);
        data.push({
            [bpm]: bpm_data.data,
            [spo2]: spo2_data.data,
        });
    } catch (error) {
        console.log('Error is: ' + error);
    }

}

const sendDataToSpreadSheetFromServer = async () => {
    try {
        const res = await axios.post(process.env.sheet_link, {
            data: data,
        });

    } catch (error) {
        console.log(error);
    }
}

setInterval(getDataFromBlynkAPI, sensorData);
setInterval(sendDataToSpreadSheetFromServer, spreadSheetSendingTime);


app.listen(process.env.port, () => {
    console.log(`Listening on port ${process.env.port}`);
})