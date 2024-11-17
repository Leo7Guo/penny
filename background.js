// 修改请求头的代码保持不变
// browser.webRequest.onBeforeSendHeaders.addListener(
//     function (details) {
//         for (let header of details.requestHeaders) {
//             if (header.name.toLowerCase() === 'user-agent') {
//                 header.value = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
//             }
//         }
//         return { requestHeaders: details.requestHeaders };
//     },
//     { urls: ["<all_urls>"] },
//     ["blocking", "requestHeaders"]
// );

// 监听快捷键并触发 popup
browser.commands.onCommand.addListener((command) => {
    if (command === "popup") {
        browser.browserAction.openPopup();
    }
});
