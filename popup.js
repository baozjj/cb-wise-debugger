// 字体大小切换功能
document.querySelectorAll('.font-size-option').forEach(option => {
  option.addEventListener('click', function() {
    // 移除所有选中的样式
    document.querySelectorAll('.font-size-option').forEach(opt => opt.classList.remove('selected'));
    
    // 添加选中的样式
    this.classList.add('selected');
    
    const selectedSize = this.getAttribute('data-size');
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: changeFontSize,
        args: [selectedSize]
      });
    });
  });
});

function changeFontSize(size) {
  let rootElement = document.documentElement;
  let bodyElement = document.body;

  // 清除可能存在的所有 font-size-* class
  ['font-size-0', 'font-size-1', 'font-size-2', 'font-size-3'].forEach(cls => {
    bodyElement.classList.remove(cls);
  });

  // 根据选择的大小设置新的 class 和字体大小
  switch(size) {
    case 'small':
      rootElement.style.fontSize = '80px';
      bodyElement.classList.add('font-size-0'); // 对应小
      break;
    case 'medium':
      rootElement.style.fontSize = '100px';
      bodyElement.classList.add('font-size-1'); // 对应标准
      break;
    case 'large':
      rootElement.style.fontSize = '121px';
      bodyElement.classList.add('font-size-2'); // 对应大
      break;
    case 'x-large':
      rootElement.style.fontSize = '134px';
      bodyElement.classList.add('font-size-3'); // 对应超大
      break;
  }
}

// 深色模式切换功能
document.getElementById('theme-switch').addEventListener('change', function() {
  const isDarkMode = this.checked;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
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

// 初始化开关状态（根据系统偏好设置）
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    function: getInitialTheme
  }, (results) => {
    const isDarkMode = results[0].result;
    document.getElementById('theme-switch').checked = isDarkMode;
  });
});

function getInitialTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}