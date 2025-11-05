// utils/sendSMS.ts
export default async function sendSMS(to: string, body: string) {
  const accountSid = 'AC26d169f8d7bfaa3fd798ee2988ba7db8';
  const authToken = '693fb7e1a39d5f61f73d7e355d33ab0b';
  const twilioPhoneNumber = '+18286225172';

  console.log('Twilio credentials:', {
    accountSid: accountSid ? 'Set' : 'Missing',
    authToken: authToken ? 'Set' : 'Missing',
    twilioPhoneNumber: twilioPhoneNumber || 'Missing',
  });

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const data = new URLSearchParams({
    To: to,
    From: twilioPhoneNumber,
    Body: body,
  });

  try {
    console.log('Sending SMS:', { to, from: twilioPhoneNumber, body });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', {
        status: response.status,
        error: result.message,
        code: result.code,
      });
      throw new Error(`Failed to send SMS: ${result.message} (Code: ${result.code})`);
    }

    console.log('SMS sent successfully:', {
      sid: result.sid,
      to: result.to,
      status: result.status,
    });
    return result;
  } catch (error: any) {
    console.error('Twilio fetch error:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}