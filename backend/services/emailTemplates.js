// backend/services/emailTemplates.js

export const welcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RedNova</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <tr>
          <td style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">RedNova</h1>
            <p style="color: #fca5a5; margin: 5px 0 0 0; font-size: 14px;">BloodBridge Initiative</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 30px; color: #333333;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Thank you for joining the <strong>RedNova</strong> network. You have successfully verified your identity and secured your account.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Whether you are here to be a hero by donating blood or seeking help for a loved one, your presence strengthens our community.
            </p>
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
              <tr>
                <td align="center">
                  <a href="https://rednovavital.tech" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              "The gift of blood is a gift to someone's life."
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2025 RedNova Inc. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">India</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};


export const contactUsTemplate = (identity, frequency, transmission) => {
  return `
    <div style="font-family: 'Courier New', monospace; background-color: #000000; color: #e0e0e0; padding: 40px; border: 1px solid #333;">
      
      <div style="border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="color: #dc2626; margin: 0; letter-spacing: 2px;">REDNOVA SUPPORT :: TICKET OPENED</h2>
        <p style="color: #4ade80; font-size: 14px; margin-top: 10px;">✅ We have received your concern.</p>
      </div>

      <p style="color: #fff; font-size: 16px; margin-bottom: 30px;">
        Greetings <strong>${identity}</strong>,
        <br><br>
        This is an automated confirmation that your query has been logged in our system. 
        Our agents are currently reviewing your data and working on a resolution. 
        You can expect a response shortly.
      </p>

      <div style="background-color: #111; border: 1px solid #333; padding: 20px; border-left: 4px solid #dc2626; margin-bottom: 30px;">
        <p style="color: #888; font-size: 12px; margin-top: 0; text-transform: uppercase;">Your Submitted Issue:</p>
        <p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #fff;">"${transmission}"</p>
      </div>

      <div style="border-top: 1px solid #333; pt-20px; text-align: center; color: #444; font-size: 10px; margin-top: 40px;">
        <p>REDNOVA COMMAND CENTER [SECTOR 7]</p>
        <p>Ref: #${Date.now().toString().slice(-6)} // Status: PROCESSING</p>
      </div>
    </div>
  `;
};



