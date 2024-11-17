const storage = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;

document.addEventListener('DOMContentLoaded', function () {
    const urlInputs = document.getElementById('urlInputs');
    const btnEdit = document.getElementById('editBtn');
    const btnAdd = document.getElementById('addBtn');
    const btnDel = document.getElementById('delBtn');
    let isEditable = false;

    loadUrlFavs();

    function loadUrlFavs() {
        storage.get('urlFavs', function (result) {
            const urlFavs = result?.urlFavs || {};
            console.log(urlFavs);
            Object.entries(urlFavs).forEach(([url, { icon }]) => {
                addNewInput(url, icon || getFaviconUrl(url));
            });
        });
    }

    btnEdit.addEventListener('click', function () {
        if (isEditable) {
            saveUrlFavs();
            window.location.reload();
        }
        isEditable = !isEditable;
        toggleEdit();
    });

    btnAdd.addEventListener('click', function () {
        addNewInput();
        isEditable = true;
        toggleEdit();
    });

    btnDel.addEventListener('click', function () {
        document.querySelectorAll('.deleteCheckbox:checked').forEach(checkbox => {
            checkbox.closest('div').remove();
        });
        updateInputs();
    });

    function addNewInput(initialUrl = '', initialFavicon = '') {
        const newInputDiv = document.createElement('div');
        const icon = createIcon(initialFavicon);
        const newInput = createUrlInput(initialUrl);
        const checkbox = createCheckbox();
        const moveupBtn = createMoveUpButton(newInputDiv);

        newInputDiv.append(icon, newInput, checkbox, moveupBtn);
        urlInputs.appendChild(newInputDiv);
        
        newInput.addEventListener('blur', () => {
            icon.src = getFaviconUrl(newInput.value);
        });

        moveupBtnClickHandler(moveupBtn, newInputDiv);
        newInput.addEventListener('input', saveUrlFavs);
    }

    function createIcon(initialFavicon) {
        const icon = document.createElement('img');
        icon.className = 'urlIcon';
        icon.alt = ' ';
        icon.src = initialFavicon;

        icon.onerror = () => {
            icon.src = './icons/edit.png';
        };
        return icon;
    }

    function createUrlInput(initialUrl) {
        const newInput = document.createElement('input');
        newInput.className = 'urlInput';
        newInput.type = 'text';
        newInput.placeholder = 'Enter URL';
        newInput.value = initialUrl;
        newInput.disabled = true;
        return newInput;
    }

    function createCheckbox() {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'deleteCheckbox';
        checkbox.disabled = true;
        return checkbox;
    }

    function createMoveUpButton(newInputDiv) {
        const moveupBtn = document.createElement('button');
        moveupBtn.disabled = true;
        moveupBtn.classList.add('moveup-btn');
        moveupBtn.innerHTML = '&#x21E7;';
        return moveupBtn;
    }

    function moveupBtnClickHandler(moveupBtn, selectedDiv) {
        let clickTimer = null;

        moveupBtn.addEventListener('click', function () {
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                return;
            }

            clickTimer = setTimeout(() => {
                moveUp(selectedDiv);
                saveUrlFavs();
                clickTimer = null;
            }, 300);
        });

        moveupBtn.addEventListener('dblclick', function () {
            clearTimeout(clickTimer);
            moveToTop(selectedDiv);
            saveUrlFavs();
        });
    }

    function moveUp(selectedDiv) {
        const parent = selectedDiv.parentNode;
        if (selectedDiv.previousElementSibling) {
            parent.insertBefore(selectedDiv, selectedDiv.previousElementSibling);
        }
    }

    function moveToTop(selectedDiv) {
        const parent = selectedDiv.parentNode;
        parent.insertBefore(selectedDiv, parent.firstChild);
    }

    function updateInputs() {
        // 更新输入框逻辑，这里原先的 label 更新逻辑已去掉
    }

    function isValidUrl(url) {
        const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+(:\d+)?(\/[\w-./?%&=]*)?)$/;
        return pattern.test(url);
    }

    function updateUrlFavIcon(url, iconSrc) {
        storage.get('urlFavs', function (result) {
            const urlFavs = result?.urlFavs || {};
            if (urlFavs[url]) {
                urlFavs[url].icon = iconSrc;
                saveUrlFavs(urlFavs);
            }
        });
    }

    function saveUrlFavs() {
        const urlFavs = {};
        document.querySelectorAll('.urlInput').forEach(input => {
            const url = input.value.trim();
            if (isValidUrl(url)) {
                urlFavs[url] = { icon: input.previousElementSibling.src };
            }
        });

        storage.set({ urlFavs }, () => {
            const error = chrome?.runtime.lastError || browser?.runtime.lastError;
            if (error) {
                console.error("保存URL时出错:", error);
            }
        });
    }

    function toggleEdit() {
        const isDisabled = !isEditable;

        document.querySelectorAll('.urlInput, .deleteCheckbox, .moveup-btn').forEach(el => el.disabled = isDisabled);

        btnEdit.textContent = isEditable ? 'Save' : 'Edit';

        document.querySelectorAll('.urlIcon').forEach(icon => {
            icon.style.cursor = isEditable ? 'pointer' : 'default';
            icon.onclick = isEditable ? () => setIconClickEvent(icon) : null;
        });
    }

    function setIconClickEvent(icon) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    icon.src = e.target.result;
                    updateUrlFavIcon(icon.previousElementSibling.value, e.target.result);
                };
                reader.onerror = () => console.error("文件读取出错");
                reader.readAsDataURL(file);
            }
        });

        icon.parentNode.appendChild(fileInput);
        icon.onclick = () => fileInput.click();
    }

    function getFaviconUrl(url) {
        return `https://${url.replace(/^https?:\/\//, '')}/favicon.ico`;
    }
});
