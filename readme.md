A todo mini-app within [Slack](www.slack.com), exposed as a */todo* slash-command.

This runs as a Node.js app, which listens for requests posted by a slash-command integration configured within Slack.

Built by Melvin at [Haystakt.com](www.haystakt.com/?utm_medium=engineering&utm_source=sneakertack&utm_content=github).

# App Setup

The code assumes deployment on

- Heroku
- MongoLab (as a Heroku addon)

Your mileage on other platforms may vary.

# Slack Integration

Create a custom Slash-command integration, register **/todo** as a command, and point it to *yourapp.com/slack/slash*. Use POST requests.

# Todo

- Write less flippant setup and integration instructions.
- Make the security token actually matter.
