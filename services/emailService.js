const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send temperature alert email
async function sendTemperatureAlert(userEmail, cityName, alertType, currentTemp, threshold) {
    const msg = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `🌡️ Temperature Alert: ${cityName}`,
        text: `
Temperature Alert for ${cityName}

Alert Type: ${alertType === 'high' ? 'High Temperature' : 'Low Temperature'}
Current Temperature: ${currentTemp}°F
Your Threshold: ${threshold}°F

This is an automated alert from your Weather Dashboard.
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; background: #0a0e27; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(0, 242, 254, 0.05); border: 2px solid #00f2fe; border-radius: 10px; padding: 30px; }
        h1 { color: #00f2fe; text-align: center; font-size: 28px; margin-bottom: 10px; }
        .alert-box { background: rgba(255, 68, 68, 0.1); border-left: 4px solid ${alertType === 'high' ? '#ef4444' : '#00f2fe'}; padding: 20px; margin: 20px 0; }
        .temp-large { font-size: 48px; font-weight: bold; color: #00f2fe; text-align: center; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0, 242, 254, 0.2); }
        .label { color: #94a3b8; }
        .value { color: #00f2fe; font-weight: bold; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌡️ Temperature Alert</h1>
        <p style="text-align: center; color: #94a3b8;">Alert for ${cityName}</p>
        
        <div class="alert-box">
            <h2 style="color: ${alertType === 'high' ? '#ef4444' : '#00f2fe'}; margin-top: 0;">
                ${alertType === 'high' ? '🔥 High Temperature Alert' : '❄️ Low Temperature Alert'}
            </h2>
        </div>
        
        <div class="temp-large">${currentTemp}°F</div>
        
        <div class="info-row">
            <span class="label">Current Temperature:</span>
            <span class="value">${currentTemp}°F</span>
        </div>
        <div class="info-row">
            <span class="label">Your Threshold:</span>
            <span class="value">${threshold}°F</span>
        </div>
        <div class="info-row">
            <span class="label">Alert Type:</span>
            <span class="value">${alertType === 'high' ? 'Temperature Too High' : 'Temperature Too Low'}</span>
        </div>
        
        <div class="footer">
            This is an automated alert from your Weather Dashboard.<br>
            You are receiving this because you set up temperature alerts for ${cityName}.
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`✓ Email sent to ${userEmail} for ${cityName} (${alertType} temp alert)`);
        return true;
    } catch (error) {
        console.error('✗ Error sending email:', error.message);
        if (error.response) {
            console.error('SendGrid error:', error.response.body);
        }
        return false;
    }
}

// Send test email
async function sendTestEmail(userEmail) {
    const msg = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Weather Dashboard - Test Email',
        text: 'Your Weather Dashboard email notifications are working correctly!',
        html: '<h1>Test Email</h1><p>Your Weather Dashboard email notifications are working correctly!</p>'
    };

    try {
        await sgMail.send(msg);
        console.log(`✓ Test email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('✗ Error sending test email:', error.message);
        if (error.response) {
            console.error('SendGrid error:', error.response.body);
        }
        return false;
    }
}

module.exports = {
    sendTemperatureAlert,
    sendTestEmail
};