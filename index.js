//External Libraries
const express = require("express");
const app = express();
const axios = require('axios');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

//Port Number
const port = 5000;

//sheet api
const sheet_link='https://sheetdb.io/api/v1/3rd76tpvgrs1t';


//Data From Blink
const blinkLink_heart_rate = 'https://blynk.cloud/external/api/get?token=AgtJBsesVKvhjhkipRV6Nou0Bmu5KkhR&v0'
const blinkLink_SPO2 = 'https://blynk.cloud/external/api/get?token=AgtJBsesVKvhjhkipRV6Nou0Bmu5KkhR&v1'
const sensorData = 1000 //Blynk
const time = 1 //Minutes
const spreadSheetSendingTime = 60 * 1000 * time; //Spreadshset
const thresholdForBPM = 160; //Alert for hightest BPM
const thresholdForSOP2_1 = 90; //Alert for lowest SPO2
const thresholdForSOP2_2 = 20; //Alert for lowest SPO2

//Email Sending Information
const CLIENT_ID = '262572844775-3c02l4bp0fgcup2tpg5amb8a1atmhpt9.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04Q5lIYCvn5-ACgYIARAAGAQSNwF-L9IrcWnD2TjPtjKiLL6KJQkM9oNwExEv1fAQdWyLpHkE0CCGyAm3KlCaH23r1uXsbYZkGB4';
const senderEmail = 'tanjila1815009@gmail.com';
const receiverEmail = 'fateema1815009@stud.kuet.ac.bd';

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


//Server at http://localhost:5000
app.get('/', (req, res) => {
    res.send("Hello Tanjila Tabassum Fateema");
})

//Data Port
const bpm = "BPM (Per 4 min)";
const spo2 = "SPO2 (Per 4 min)"


//Data Storage
let data = [];


//Get Data from Blink Method
const getDataFromBlynkAPI = async () => {
    try {
        const bpm_data = await axios.get(blinkLink_heart_rate);
        const spo2_data = await axios.get(blinkLink_SPO2);
        console.log(`BPM: ${bpm_data.data}\nSPO2: ${spo2_data.data}\n\n------------------\n`);
        if (bpm_data.data > thresholdForBPM || (spo2_data.data < thresholdForSOP2_1 && spo2_data.data > thresholdForSOP2_2)) {
            const email = await sendMail(bpm_data.data, spo2_data.data);
            console.log('Email has sent to the monitor');
        }
        data.push({
            [bpm]: bpm_data.data,
            [spo2]: spo2_data.data,
        });
    } catch (error) {
        console.log('Error is: ' + error);
    }

}


//Send Data to Google Spreadsheet
const sendDataToSpreadSheetFromServer = async () => {
    try {
        const res = await axios.post(sheet_link, {
            data: data,
        });
        data.length = 0;
        console.log('Data has Sent to Google SpreadSheet');
    } catch (error) {
        console.log(error);
    }
}

// //Periodic Function Call for Data Request and sending
setInterval(getDataFromBlynkAPI, sensorData);
setInterval(sendDataToSpreadSheetFromServer, spreadSheetSendingTime);

//Email Sender 
async function sendMail(rate,oxy) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: senderEmail,
                clientId: CLIENT_ID,
                clientSecret: CLEINT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: `Tanjila Tabassum Fateema <${senderEmail}>`,
            to: receiverEmail,
            subject: 'An Alert From Patient Monitoring Server',
            text: `Dear Monitor,\n\nPlease see the current data of your patient.\n\nBPM: ${rate}\nSPO2: ${oxy}\n\n--Tanjila Tabassum`,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }
}

//Server listening on port at 5000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})