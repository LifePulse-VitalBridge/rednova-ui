import { Resend } from 'resend';
import dotenv from 'dotenv';
import { contactUsTemplate } from '../services/emailTemplates.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (req, res) => {
  try {
    const { identity, frequency, transmission } = req.body;

    if (!identity || !frequency || !transmission) {
      return res.status(400).json({ message: "Transmission Incomplete: Missing Data Packets" });
    }

    console.log(`📡 Processing Support Ticket for: ${identity} (${frequency})`);

    const data = await resend.emails.send({
      // 1. FROM: Your Verified Domain
      from: 'RedNova Support <contact@rednovavital.tech>', 
      
      // 2. TO: The USER (So they get the "We are resolving..." receipt)
      to: frequency, 
      
      // 3. BCC: YOU (So you get a silent copy of their problem)
      bcc: 'contact@rednovavital.tech', 
      
      // 4. REPLY_TO: The User (So if you reply to the BCC, it goes to them)
      reply_to: frequency, 
      
      // 5. SUBJECT: Clear confirmation subject
      subject: `[Ticket #${Date.now().toString().slice(-6)}] We received your query`,
      
      html: contactUsTemplate(identity, frequency, transmission),
    });

    if (data.error) {
        console.error("Resend Error:", data.error);
        return res.status(500).json({ message: "Signal Jammed at Relay Station", error: data.error });
    }

    res.status(200).json({ 
      message: "Transmission Secure. Ticket confirmation sent to user.", 
      id: data.id 
    });

  } catch (error) {
    console.error("Contact Controller Error:", error);
    res.status(500).json({ message: "Critical Server Failure", error: error.message });
  }
};