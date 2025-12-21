import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();
// --- CONFIGURATION (Replace these with your details) ---

// 1. From Twilio Console Dashboard (Account Info)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// 2. The Link you just copied from Twilio Assets
const voiceUrl = 'https://rednova-5448.twil.io/REDNOVA_voice.mp3';

// 3. Phone Numbers (Use standard format like +91...)
const myVerifiedNumber = '+919279670355'; // Your personal mobile number
const twilioUSNumber = '+15707540703';   // The US number you "bought" on Twilio

// -------------------------------------------------------

const client = twilio(accountSid, authToken);

console.log("Attempting to call", myVerifiedNumber, "...");

async function makeCall() {
  try {
    const call = await client.calls.create({
      // This tells Twilio to play your MP3 immediately
      twiml: `<Response><Play>${voiceUrl}</Play></Response>`,
      to: myVerifiedNumber,
      from: twilioUSNumber,
    });

    console.log("✅ Success! Call initiated.");
    console.log("Call SID:", call.sid);
    console.log("Check your phone now!");

  } catch (error) {
    console.error("❌ Error making call:");
    console.error(error.message);
    
    if (error.code === 21210) {
      console.log("Tip: This error usually means the 'to' number is not verified yet.");
    }
    if (error.code === 21608) {
        console.log("Tip: This is a 'Trial' account restriction. Ensure you are calling your own verified number.");
    }
  }
}


export { makeCall };