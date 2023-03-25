browser.menus.create({
	title: "Open Image in New Tab",
	contexts: [
		"image"
	],
	onclick: openImageInNewTab
});

async function openImageInNewTab(info)
{
	var imageUrl = info.srcUrl;
	var parsedUrl = new URL(imageUrl);

	// embedded images
	if(["imap:", "pop:", "mailbox:"].includes(parsedUrl.protocol))
	{
		var currentTab = (await browser.tabs.query({active: true, currentWindow: true}))[0];
		var currentMessage = await browser.messageDisplay.getDisplayedMessage(currentTab.id);
		var currentMessageRaw = await browser.messages.getRaw(currentMessage.id);

		var parser = new postalMime.default();
		var parsedEmail = await parser.parse(currentMessageRaw);

		var filename = parsedUrl.searchParams.get("filename");
		var mimeType = parsedUrl.searchParams.get("type");

		parsedEmail.attachments.forEach(function(attachment) {
			if(attachment.filename === filename)
			{
				imageUrl = URL.createObjectURL(new Blob([attachment.content], {type: mimeType}));
			}
		});
	}

	browser.tabs.create({
		active: false,
		url: imageUrl
	});
}
