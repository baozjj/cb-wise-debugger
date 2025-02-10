
function log(message) {
  fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    const userIP = data.ip || "null"; // 获取到的 IP 地址
    message += ` - (IP: ${userIP})`;

    fetch(`http://baozj.top/api/log?message=${encodeURIComponent(message)}`)
      .then((response) => response.text())
      .then((data) => {
        console.log("Log recorded:", data);
      })
      .catch((error) => {
        console.error("Error recording log:", error);
      });
  })
  .catch(() => {
    console.error("Error fetching IP address.");
  });
}

// 初始化插件状态
document.addEventListener("DOMContentLoaded", function () {
  // 从 chrome.storage.local 中读取状态
  chrome.storage.local.get(
    ["fontSize", "darkModeEnabled", "sanMarkerEnabled"],
    function (data) {
      // 字体大小状态同步
      const selectedSize = data.fontSize || "medium";
      document.querySelectorAll(".font-size-option").forEach((option) => {
        option.classList.toggle(
          "selected",
          option.getAttribute("data-size") === selectedSize
        );
      });
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: changeFontSize,
          args: [selectedSize],
        });
      });

      // 深色模式状态同步
      const isDarkMode = data.darkModeEnabled || false;
      document.getElementById("theme-switch").checked = isDarkMode;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleDarkMode,
          args: [isDarkMode],
        });
      });

      // TTS模式状态同步
      const isTtsMode = data.ttsModeEnabled || false;
      document.getElementById("tts-switch").checked = isTtsMode;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleTtsMode,
          args: [isTtsMode],
        });
      });

      // San 卡标记状态同步
      const isMarkerOn = data.sanMarkerEnabled || false;
      document.getElementById("san-marker-switch").checked = isMarkerOn;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleSanCardMarkers,
          args: [isMarkerOn],
        });
      });
    }
  );
});

// 字体大小切换功能
document.querySelectorAll(".font-size-option").forEach((option) => {
  option.addEventListener("click", function () {
    // 移除所有选中的样式
    document
      .querySelectorAll(".font-size-option")
      .forEach((opt) => opt.classList.remove("selected"));

    // 添加选中的样式
    this.classList.add("selected");

    const selectedSize = this.getAttribute("data-size");

    let message = `Font size changed to: ${selectedSize}`;
    log(message);

    // 保存状态到 storage
    chrome.storage.local.set({ fontSize: selectedSize });

    // 同步到页面
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: changeFontSize,
        args: [selectedSize],
      });
    });
  });
});

// 保留原有的 changeFontSize 函数逻辑
function changeFontSize(size) {
  const rootElement = document.documentElement;
  const bodyElement = document.body;

  const sizeMap = {
    small: "86px",
    medium: "100px",
    large: "106px",
    "x-large": "134px",
  };

  const sizeClassMap = {
    small: "font-size-0",
    medium: "font-size-1",
    large: "font-size-2",
    "x-large": "font-size-3",
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
            if (rule.style.fontSize && rule.style.fontSize.includes("px")) {
              const fontSizeInPx = parseFloat(rule.style.fontSize);
              const fontSizeInRem = fontSizeInPx / 100;
              rule.style.fontSize = `${fontSizeInRem}rem`; // 转换为 rem
            }

            // 检查 line-height
            if (rule.style.lineHeight && rule.style.lineHeight.includes("px")) {
              const lineHeightInPx = parseFloat(rule.style.lineHeight);
              const lineHeightInRem = lineHeightInPx / 100;
              rule.style.lineHeight = `${lineHeightInRem}rem`; // 转换为 rem
            }
          }
        }
      } catch (e) {
        console.warn("无法访问样式表规则:", sheet.href, e);
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
document.getElementById("theme-switch").addEventListener("change", function () {
  const isDarkMode = this.checked;

  // 保存状态到 storage
  chrome.storage.local.set({ darkModeEnabled: isDarkMode });

  let message = `DarkMode isDarkMode: ${isDarkMode}`;
  log(message)

  // 同步到页面
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: toggleDarkMode,
      args: [isDarkMode],
    });
  });
});

function toggleDarkMode(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add("c-darkmode", "darkmode", "cos-dark");
  } else {
    document.body.classList.remove("c-darkmode", "darkmode", "cos-dark");
  }
}

// TTS模式切换功能
document.getElementById("tts-switch").addEventListener("change", function () {
  const isTtsMode = this.checked;

  let message = `TTS Mode isTtsMode: ${isTtsMode}`;
  log(message)

  // 保存状态到 storage
  chrome.storage.local.set({ ttsModeEnabled: isTtsMode });

  // 同步到页面
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: toggleTtsMode,
      args: [isTtsMode],
    });
  });
});

function toggleTtsMode(isTtsMode) {
  if (isTtsMode) {
    document.body.classList.add("cos-ttsmode");
  } else {
    document.body.classList.remove("cos-ttsmode");
  }
}

// San 卡标记功能
document
  .getElementById("san-marker-switch")
  .addEventListener("change", function () {
    const isMarkerOn = this.checked;
    let message = `San Marker isMarkerOn: ${isMarkerOn}`;
    log(message)

    // 保存状态到 storage
    chrome.storage.local.set({ sanMarkerEnabled: isMarkerOn });

    // 同步到页面
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleSanCardMarkers,
        args: [isMarkerOn],
      });
    });
  });

function toggleSanCardMarkers(enabled) {
  const sanCards = document.querySelectorAll("[tpl][new_srcid]");

  if (enabled) {
    sanCards.forEach((card) => {
      const tpl = card.getAttribute("tpl");
      const newSrcid = card.getAttribute("new_srcid");

      if (!card.querySelector(".san-card-marker")) {
        // 创建标记容器
        const marker = document.createElement("div");
        marker.className = "san-card-marker";

        // 创建内容
        marker.innerHTML = `
          <div style="flex: 1; display: flex; align-items: center; gap: 26px;">
            <span class="san-card-tpl" style="cursor: pointer; color: #4fc3f7; font-size: 14px; font-weight: 600;">名称: ${tpl}</span>
            <span class="san-card-new-srcid" style="cursor: pointer; color: #4fc3f7; font-size: 14px; font-weight: 600;">srcid: ${newSrcid}</span>
          </div>
          <div class="san-card-vscode" title="打开文件" style="
            cursor: pointer;
            width: 46px;
            height: 16px;
            background-color: #4fc3f7;
            color: white;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 3px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease, transform 0.3s ease;
          ">VSCode</div>
        `;

        // 设置卡片根节点的定位
        card.style.position = "relative";

        // 添加标记样式
        marker.style.cssText = `
          position: absolute;
          top: -4px;
          left: 8px;
          right: 8px;
          padding: 1px 12px;
          font-size: 10px;
          color: white;
          background-color: rgba(0, 0, 0, 0.7); /* 深灰半透明背景 */
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        `;

        // 添加到卡片
        card.appendChild(marker);

        // 点击 tpl 名称，复制内容
        marker.querySelector(".san-card-tpl").addEventListener("click", () => {
          copyToClipboard(tpl);
          let message = `copyTql: ${tpl}`;
          // log(message);


          fetch("https://api.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => {
            const userIP = data.ip || "null"; // 获取到的 IP 地址
            message += ` - (IP: ${userIP})`;
        
            fetch(`http://baozj.top/api/log?message=${encodeURIComponent(message)}`)
              .then((response) => response.text())
              .then((data) => {
                console.log("Log recorded:", data);
              })
              .catch((error) => {
                console.error("Error recording log:", error);
              });
          })
          .catch(() => {
            console.error("Error fetching IP address.");
          });
          showFeedback("卡片名称已复制！", "success");
        });

        // 点击 new_srcid，复制内容
        marker
          .querySelector(".san-card-new-srcid")
          .addEventListener("click", () => {
            copyToClipboard(newSrcid);
            let message = `copyScrid: ${newSrcid}`;
            // log(`copyScrid: ${newSrcid}`);

            fetch("https://api.ipify.org?format=json")
            .then((response) => response.json())
            .then((data) => {
              const userIP = data.ip || "null"; // 获取到的 IP 地址
              message += ` - (IP: ${userIP})`;
          
              fetch(`http://baozj.top/api/log?message=${encodeURIComponent(message)}`)
                .then((response) => response.text())
                .then((data) => {
                  console.log("Log recorded:", data);
                })
                .catch((error) => {
                  console.error("Error recording log:", error);
                });
            })
            .catch(() => {
              console.error("Error fetching IP address.");
            });
            showFeedback("卡片 ID 已复制！", "success");
          });

        // 点击 "V" 打开文件
        marker
          .querySelector(".san-card-vscode")
          .addEventListener("click", () => {
            // 显示“正在打开文件...”提示
            const loadingMessage = showFeedback("正在打开文件...", "loading");

            let message = `openFile: tpl=${tpl}, newSrcid: ${newSrcid}`;
            // log(message);


            fetch("https://api.ipify.org?format=json")
            .then((response) => response.json())
            .then((data) => {
              const userIP = data.ip || "null"; // 获取到的 IP 地址
              message += ` - (IP: ${userIP})`;
          
              fetch(`http://baozj.top/api/log?message=${encodeURIComponent(message)}`)
                .then((response) => response.text())
                .then((data) => {
                  console.log("Log recorded:", data);
                })
                .catch((error) => {
                  console.error("Error recording log:", error);
                });
            })
            .catch(() => {
              console.error("Error fetching IP address.");
            });

            chrome.runtime.sendMessage(
              { type: "openFile", srcid: tpl },
              (response) => {
                if (chrome.runtime.lastError || !response.success) {
                  console.error(
                    "Message Error:",
                    chrome.runtime.lastError?.message || response.error
                  );
                  updateFeedback(
                    loadingMessage,
                    "文件打开失败，请检查配置。",
                    "error"
                  );
                } else {
                  updateFeedback(loadingMessage, "文件已成功打开！", "success");
                  console.log("Response from background:", response);
                }
              }
            );
          });
      }
    });
  } else {
    document
      .querySelectorAll(".san-card-marker")
      .forEach((marker) => marker.remove());
  }

  // 复制到剪贴板
  function copyToClipboard(text) {
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  // 显示提示框
  function showFeedback(message, type) {
    const feedbackBox = document.createElement("div");
    feedbackBox.textContent = message;

    const colors = {
      success: "rgba(76, 175, 80, 0.9)", // 成功绿色
      error: "rgba(239, 83, 80, 0.9)", // 错误红色
      loading: "rgba(33, 150, 243, 0.9)", // 加载蓝色
    };

    feedbackBox.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      opacity: 0;
      animation: fadeInOut 3s ease-in-out;
    `;

    document.body.appendChild(feedbackBox);

    // 动态添加动画样式
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => feedbackBox.remove(), 3000);
    return feedbackBox;
  }

  // 更新提示框内容
  function updateFeedback(element, message, type) {
    const colors = {
      success: "rgba(76, 175, 80, 0.9)", // 成功绿色
      error: "rgba(239, 83, 80, 0.9)", // 错误红色
    };

    element.textContent = message;
    element.style.backgroundColor = colors[type];
    setTimeout(() => element.remove(), 3000);
  }
}
// Aladdin
// 监听搜索按钮点击事件
document.getElementById("search-btn").addEventListener("click", function () {
  // 获取用户输入的内容
  const inputValue = document.getElementById("san-card-name").value.trim();

  // 如果输入为空，提示用户输入内容
  if (!inputValue) {
    alert("请输入 Aladdin 卡名称或 scrid");
    return;
  }

  // 判断输入的是san卡名称还是scrid
  let url = "";
  if (isNaN(inputValue)) {
    // 输入的是San卡名称，拼接template参数
    url = `https://pt.baidu-int.com/api/digger/topquery?template=${encodeURIComponent(
      inputValue
    )}&size=200`;
  } else {
    // 输入的是scrid，拼接scrid参数
    url = `https://pt.baidu-int.com/api/digger/topquery?scrid=${encodeURIComponent(
      inputValue
    )}&size=200`;
  }

  // 打开新页面
  window.open(url, "_blank");
});


// 新增的脚本逻辑
document.getElementById('parse-btn').addEventListener('click', () => {
  try {
    const input = document.getElementById('json-input').value;
    const parsed = outputGenericBugSummary(JSON.parse(input));
    document.getElementById('parsed-content').textContent = parsed;
    document.getElementById('json-modal').style.display = 'flex';
  } catch (e) {
    alert('JSON解析错误: ' + e.message);
  }
});

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('json-modal').style.display = 'none';
});

document.getElementById('json-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
  }
});



function outputGenericBugSummary(data) {
  
  if (!data || !data._source) {
      return "错误：数据格式无效"
  }

  const s = data._source;

  // 解析时间戳为本地时间字符串
  const timestamp = typeof s["@timestamp"] === "number"
    ? new Date(s["@timestamp"]).toLocaleString()
    : s["@timestamp"] || "未知";

  // 获取并解码页面 URL（若包含中文参数）
  const rawUrl = (s.info && s.info.pageUrl) || s.pageurl || "未知";
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch (e) {
    decodedUrl = rawUrl;
  }

  // 提取错误信息和堆栈
  const errorMsg = (s.info && s.info.msg) || "无错误信息";
  const errorStack = (s.info && s.info.stack) || "无堆栈信息";

  // 提取 Hook 字段，并给出通用说明：
  // 该字段通常标识错误发生时的代码触发点，
  // 如计算属性、生命周期钩子、或其它事件回调函数等，
  // 具体内容取决于实际业务代码。
  const hook = (s.info && s.info.hook) || "未提供";
  const hookExplanation = `：${hook}`;

  // 组装输出摘要
  const summary = `
【日志信息】
  - 日志ID: ${s.lid || "N/A"}
  - 进程/版本: ${s.pid || "N/A"}
  - 发生时间: ${timestamp}
  - 客户端 IP: ${s.ip || "未知"}

【复现环境】
  - 页面 URL: ${decodedUrl}
  - 操作系统: ${s.os || "未知"}
  - 浏览器类型: ${s.browser || "未知"}
  - User Agent: ${s.useragent || "未知"}
  - 环境标识: ${(s.info && s.info.env) || (s.dim && s.dim.env) || "未知"}

【错误详情】
  - 错误信息: ${errorMsg}
  - 错误触发入口函数: ${hookExplanation}
  - 错误堆栈: ${errorStack}
`;

  console.log(summary);
  return summary;
}

