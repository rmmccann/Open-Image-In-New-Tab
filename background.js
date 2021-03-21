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

	// embedded images
	if(imageUrl.startsWith("imap://") || imageUrl.startsWith("pop://") || imageUrl.startsWith("mailbox://"))
	{
		var currentTab = (await browser.tabs.query({active: true, currentWindow: true}))[0];
		var currentMessage = await browser.messageDisplay.getDisplayedMessage(currentTab.id);
		var currentMessageRaw = await browser.messages.getRaw(currentMessage.id);

		var parser = new postalMime.default();
		var parsedEmail = await parser.parse(currentMessageRaw);

		var parsedUrl = new URL(imageUrl);
		var filename = parsedUrl.searchParams.get("filename");

		parsedEmail.attachments.forEach(function(attachment) {
			if(attachment.filename === filename)
			{
				imageUrl = URL.createObjectURL(new Blob([attachment.content], {type: attachment.mimeType}));
			}
		});
	}

	browser.tabs.create({
		active: false,
		url: imageUrl
	});
}
