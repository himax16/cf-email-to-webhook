import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    // Get the Discord webhook from CF worker secrets
    const url = env.DISCORD_URL;
    if (!url) {
      throw new Error('Discord webhook URL not found in secrets');
    }

    // Get the inbound email address from CF worker secrets
    const inAdd = env.IN_ADD;
    const filterIn = (!inAdd || inAdd.length === 0) ? false : true;

    // Get the outbound email address from CF worker secrets
    const outAdd = env.OUT_ADD;
    const forwardOut = (!outAdd || outAdd.length === 0) ? false : true;

    // Set the preview length for the email body
    const previewLength = env.PREVIEW_LENGTH || 400;

    // Get the email sender and inbound addresses
    const emSender = message.from;
    const emAdd = message.to;

    // Check if the email is from the inbound address
    if (filterIn && emAdd !== inAdd) {
      console.log(`Ignoring email from ${emSender} to ${emAdd} as it is not from the inbound address ${inAdd}`);
      return;
    }
    console.log(`Received email from ${emSender} to ${emAdd}`);

    // Parse the email content
    const parsedEmail = await PostalMime.parse(message.raw);

    // Log the email content
    console.log('Subject: ', parsedEmail.subject);
    console.log('HTML: ', parsedEmail.html);
    console.log('Text: ', parsedEmail.text);

    // Get the email subject
    const emSubject = parsedEmail.subject || "No subject";

    // Get the email body
    let emBody = '';
    if (parsedEmail.text) {
      emBody += parsedEmail.text;
    } else if (parsedEmail.html) {
      emBody += '*No text content, showing HTML content*\n' + parsedEmail.html;
    }

    // Trim the body to the preview length
    if (emBody.length > previewLength) {
      emBody = emBody.substring(0, previewLength) + '\n... (*truncated*)';
    }

    // Set the message color
    let emColor = 3447003;

    // Construct JSON payload for Discord webhook
    const data = {
      username: "Email Notification",
      embeds: [
        {
          title: emSubject,
          description: emBody,
          color: emColor,
          fields: [
            {
              name: "From",
              value: emSender,
              inline: true
            },
            {
              name: "To",
              value: emAdd,
              inline: true
            },
            {
              name: "Received",
              value: new Date().toUTCString()
            }
          ]
        }
      ]
    }
    const payload = JSON.stringify(data);

    // Send the Webhook to Discord
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });
      if (!response.ok) {
        throw new Error(`Failed to send Discord webhook: ${response.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }

    // Forward the email if needed
    if (forwardOut) {
      console.log(`Forwarding email to ${outAdd}`);
      await message.forward(outAdd)
    }
  }
}
