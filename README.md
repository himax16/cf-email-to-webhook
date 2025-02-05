# CloudFlare Email to Webhook

Simple CloudFlare Workers to forward emails to Discord webhook.

## Usage

1. Create a CloudFlare Account.
2. Clone this repository.
3. Install [CloudFlare Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).
4. Set the worker secrets using `npx wrangler secret put <key>` or through the CloudFlare dashboard:

    - `WEBHOOK_URL`: The Discord webhook URL.
    - `IN_ADD` (*optional*): The sender email address to accept emails from. If not set, all emails will be accepted.
    - `OUT_ADD` (*optional*): The recipient email address to forward emails to. If not set, no emails will be forwarded.
    - `PREVIEW_LENGTH` (*optional*): The maximum length of the email preview in the Discord message. Default is 400 characters if not set.

> [!CAUTION]  
> Make sure that `PREVIEW_LENGTH` less than the Discord message limit (2000 characters) including the extra line.

5. Deploy the worker with `npx wrangler deploy`.
6. Configure the [email rule actions](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#email-rule-actions) to "Send to a Worker".
