// 初始化插件状态
document.addEventListener('DOMContentLoaded', function () {
  // 从 chrome.storage.local 中读取状态
  chrome.storage.local.get(['fontSize', 'darkModeEnabled', 'sanMarkerEnabled'], function (data) {
    // 字体大小状态同步
    const selectedSize = data.fontSize || 'medium';
    document.querySelectorAll('.font-size-option').forEach(option => {
      option.classList.toggle('selected', option.getAttribute('data-size') === selectedSize);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: changeFontSize,
        args: [selectedSize]
      });
    });

    // 深色模式状态同步
    const isDarkMode = data.darkModeEnabled || false;
    document.getElementById('theme-switch').checked = isDarkMode;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleDarkMode,
        args: [isDarkMode]
      });
    });

    // San 卡标记状态同步
    const isMarkerOn = data.sanMarkerEnabled || false;
    document.getElementById('san-marker-switch').checked = isMarkerOn;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleSanCardMarkers,
        args: [isMarkerOn]
      });
    });
  });
});

// 字体大小切换功能
document.querySelectorAll('.font-size-option').forEach(option => {
  option.addEventListener('click', function () {
    // 移除所有选中的样式
    document.querySelectorAll('.font-size-option').forEach(opt => opt.classList.remove('selected'));

    // 添加选中的样式
    this.classList.add('selected');

    const selectedSize = this.getAttribute('data-size');

    // 保存状态到 storage
    chrome.storage.local.set({ fontSize: selectedSize });

    // 同步到页面
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: changeFontSize,
        args: [selectedSize]
      });
    });
  });
});

// 保留原有的 changeFontSize 函数逻辑
function changeFontSize(size) {
  const rootElement = document.documentElement;
  const bodyElement = document.body;

  const sizeMap = {
    'small': '86px',
    'medium': '100px',
    'large': '106px',
    'x-large': '134px'
  };

  const sizeClassMap = {
    'small': 'font-size-0',
    'medium': 'font-size-1',
    'large': 'font-size-2',
    'x-large': 'font-size-3'
  };

  const setFontSize = (size) => {
    bodyElement.classList.remove(...Object.values(sizeClassMap)); // 清除可能存在的所有font-size-* class
    rootElement.style.fontSize = sizeMap[size];
    bodyElement.classList.add(sizeClassMap[size]);
  };

  const replaceClassPxWithRem = () => {
    const styleSheets = document.styleSheets; // 获取页面的所有样式表

    // 遍历所有样式表
    for (const sheet of styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules; // 获取所有规则
        if (!rules) continue;

        // 遍历样式规则
        for (const rule of rules) {
          if (rule.style) {
            // 检查 font-size
            if (rule.style.fontSize && rule.style.fontSize.includes('px')) {
              const fontSizeInPx = parseFloat(rule.style.fontSize);
              const fontSizeInRem = fontSizeInPx / 100;
              rule.style.fontSize = `${fontSizeInRem}rem`; // 转换为 rem
            }

            // 检查 line-height
            if (rule.style.lineHeight && rule.style.lineHeight.includes('px')) {
              const lineHeightInPx = parseFloat(rule.style.lineHeight);
              const lineHeightInRem = lineHeightInPx / 100;
              rule.style.lineHeight = `${lineHeightInRem}rem`; // 转换为 rem
            }
          }
        }
      } catch (e) {
        console.warn('无法访问样式表规则:', sheet.href, e);
      }
    }
  };

  setFontSize(size);
  if (!window.hasExecuted) {
    window.hasExecuted = true; // 设置状态为已执行
    replaceClassPxWithRem(); // 调用该函数来更新页面上的字体大小
  }
}

// 深色模式切换功能
document.getElementById('theme-switch').addEventListener('change', function () {
  const isDarkMode = this.checked;

  // 保存状态到 storage
  chrome.storage.local.set({ darkModeEnabled: isDarkMode });

  // 同步到页面
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: toggleDarkMode,
      args: [isDarkMode]
    });
  });
});

function toggleDarkMode(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add('c-darkmode', 'darkmode', 'cos-dark');
  } else {
    document.body.classList.remove('c-darkmode', 'darkmode', 'cos-dark');
  }
}

// San 卡标记功能
document.getElementById('san-marker-switch').addEventListener('change', function () {
  const isMarkerOn = this.checked;

  // 保存状态到 storage
  chrome.storage.local.set({ sanMarkerEnabled: isMarkerOn });

  // 同步到页面
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: toggleSanCardMarkers,
      args: [isMarkerOn]
    });
  });
});

function toggleSanCardMarkers(enabled) {
  const sanCards = document.querySelectorAll('[tpl][new_srcid]');
  if (enabled) {
    sanCards.forEach(card => {
      const tpl = card.getAttribute('tpl');
      const newSrcid = card.getAttribute('new_srcid');
      if (!card.querySelector('.san-card-marker')) {
        // 创建标记容器
        const marker = document.createElement('div');
        marker.className = 'san-card-marker';

        // 创建内容
        marker.innerHTML = `
          <span class="san-card-tpl">tpl: ${tpl}</span>
          <span class="san-card-new-srcid">new_srcid: ${newSrcid}</span>
        `;

        // 设置卡片根节点的定位
        card.style.position = 'relative';

        // 添加标记样式
        marker.style.cssText = `
          position: absolute;
          top: -28px;
          left: 8px;
          right: 8px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: bold;
          color: white;
          background-color: rgba(0, 0, 0, 0.85);
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;

        // 添加到卡片
        card.appendChild(marker);
      }
    });
  } else {
    document.querySelectorAll('.san-card-marker').forEach(marker => marker.remove());
  }
}


