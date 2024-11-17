const hiddenBar = document.getElementById('hidden-bar');
const settingButton = document.getElementById('setting-button');
const crossBar = document.getElementById('cross-bar');
const webview = document.getElementById('webview');
const nav = document.getElementById('nav');

let urls = []; // 提取的urls变量
let favs = [];
let urlFavs = {}; // 存储的网址

const storage = browser.storage.local;

// 格式化URL，确保以http(s)开头
const formatUrl = (url) => {
    if (url && !url.startsWith('http')) {
        return 'https://' + url;
    }
    return url;
};

const loadConfigs = async () => {
    try {
        const result = await storage.get('urlFavs');
        urlFavs = result?.urlFavs || {};
        urls = Object.keys(urlFavs);
        favs = Object.values(urlFavs).map(fav => fav.icon); // 获取自定义的图标
    } catch (error) {
        console.error('加载配置出错:', error);
    }
};

const loadPage = (index) => {
    const addUrl = formatUrl(urls[index]);
    webview.src = addUrl ? addUrl : './options.html'; // 如果没有网址，则加载空白页
};

const loadFavs = (favs) => {
    hiddenBar.innerHTML = ''; // 清空之前的收藏夹显示
    favs.forEach((fav, index) => {
        const divElement = document.createElement('div');
        divElement.classList.add('box');
        const imgElement = document.createElement('img');
        imgElement.src = fav;
        imgElement.addEventListener('error', (_) => {
            imgElement.src = './icons/icon.png'; // 加载失败用默认图标替代
        });
        divElement.appendChild(imgElement);
        hiddenBar.appendChild(divElement);

        // 生成一个圆点指示器，并添加到nav中
        const dotElement = document.createElement('div');
        dotElement.classList.add('dot');
        if (index === 0) {
            dotElement.classList.add('active');
        }
        nav.appendChild(dotElement);
    });
}

// 用于初始化的函数
const init = async () => {
    await loadConfigs(); // 等待urlFavs加载
    loadPage(0); // 加载第一个网址
    loadFavs(favs); // 加载收藏夹

    const boxes = document.querySelectorAll('.box');
    const dots = document.querySelectorAll('.dot');

    boxes.forEach((box, index) => {
        box.addEventListener('click', () => {
            loadPage(index); // 加载对应的网址
            document.querySelector('.active').classList.remove('active'); // 移除当前激活的点
            dots[index].classList.add('active'); // 添加新的激活的圆点
        });
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            loadPage(index); // 加载对应的网址
            document.querySelector('.active').classList.remove('active'); // 移除当前激活的圆点
            dot.classList.add('active'); // 添加新的激活的圆点
        });
    });
};

settingButton.addEventListener('click', () => {
    if (webview.src.startsWith('http')) {
        webview.src = './options.html';
    } else {
        loadPage(0);
    }
});

crossBar.addEventListener('mousemove', (event) => {
    hiddenBar.style.display = event.clientY < 100 ? 'flex' : 'none'; // 根据鼠标位置显示或隐藏
    hiddenBar.style.zIndex = hiddenBar.style.display === 'flex' ? 20 : 0;
});

hiddenBar.addEventListener('mouseleave', () => {
    hiddenBar.style.display = 'none'; // 鼠标移出隐藏 bar
});

// 当文档加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
