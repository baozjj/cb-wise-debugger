/**
 * 解析 bug 报错 JSON
 * @param {Object} data - JSON 格式的 bug 报错信息
 * @returns {String} 格式化后的详细摘要
 */
function outputGenericBugSummary(data) {
    if (!data || !data._source) {
        console.log("错误：数据格式无效")
        return
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
  
  【错误详情】
    - 错误信息: ${errorMsg}
    - 错误堆栈: ${errorStack}
    - 错误触发入口函数: ${hookExplanation}
  
  【复现环境】
    - 页面 URL: ${decodedUrl}
    - 操作系统: ${s.os || "未知"}
    - 浏览器类型: ${s.browser || "未知"}
    - User Agent: ${s.useragent || "未知"}
    - 环境标识: ${(s.info && s.info.env) || (s.dim && s.dim.env) || "未知"}
  `;
  
    console.log(summary);
    return summary;
  }
  
  // 示例数据（请将 bugReportJSON 替换为实际数据）
  const bugReportJSON = {
    "_index": "spy-1_3-20250209",
    "_type": "_doc",
    "_id": "DVDc55QB4kuI1eGGnxNr",
    "_version": 1,
    "_score": null,
    "_source": {
      "lid": "6884378467772388387",
      "ip": "2409:893d:383:acc:b909:f93e:fa8f:e283",
      "@timestamp": 1739056777104,
      "pid": "1_3",
      "baiduid": "CCF6F686D866321F65B76B88DCE666DB:FG=1",
      "pageurl": "http://m.baidu.com/?s_j=1",
      "cookie": "BA_HECTOR=al0h8lagaga105a520a40g251mebv21jqest920; SG_FW_VER=2.23.0; iadlist=633320578354315; seClickID=acbcd8ea0f2e94c4; H_WISE_SIDS=110086_307086_1992049_626068_628198_631403_632163_632114_632144_632407_633359_633370_633613_634604_635511_636706_636861_632493_637511_637041_637570_636475_638047_638247_638263_638278_638271_638438_638542_638873_639045_639306_639422_633942_639614_637254_639648_639812_639975_640074_638578_640214_638853_640149_640147_640321_617671_640348_640354_627286_638336_640170_640389_640431_640446_637860_640491_639921_640451_640507_635380_640559_640587_640512_638941_638945_638938_640378_640662_639014_640519_640695_639959_639930_640799_640814_640811_640801_640803_640839_640850_640849_640853_640854_640794_640872_640918_8000092_8000099_8000124_8000135_8000149_8000153_8000169_8000178_8000184_1399125_1831671_1891106_1799709_12122826_13122820_11125368_12126545_13126744_12127599_12128364_15128367_13128371_12128987_14129081_15129379_13129746_12129395_12130066_14130323_16130354_18130369_15130489_11130633_16130695_16130711_12130782_13130829_14131015_12131031_18131114_11131216_12131420_19131685_16131978_16132159_13132297_14132309_18132334_11132398_13132413_11132568_12132664_16132719_14132747_16132593_13133058_12133025_13133044; PSTM=1720413320; H_PS_PSSID=61027_61734_61781_61890_61987_62010; ST=0; delPer=0; PSINO=1; SP_FW_VER=4.220.1; iadexlist=633320578354315; fontsize=1.00; BIDUPSID=7CDD82F189A9206138E5E30643BE4C31; BAIDULOCNEW=__100000_288_1739055565417_1; ab_sr=1.0.1_ZDVjNDIwMmI3MDc4NWMwZDc5MjlmODkxODAxY2U3OTYyMjRlMDJmYTU3OGQ1NmVkMjhlMDA5ZmE5YmJmNjNjNDUzNGExZWNmNmY2ZDRkYzcxNWViMjUyNWIyZmZlNjU4MGM0ZTY4MmZiZWVjYWVjMDVlNTA0NjE3M2NhNmU0NjBhM2Q5MGJjNTgwMmI2YzEwZjExMjY5NGVmODQxMmFiZTFmMzVhNjMyNGUyNjViZmFiOTA0ZWVhMmYwZmQ5ZDBlZTM5MWQ3NzQzZjFjOWFlMzAxM2JhMjczYjAzZjYyMzU=; BAIDUCUID=Ya-3u_ikHuleaHurlu2ji_uqB8_u8SuL_82talPSB8jRa2ucluSPt_ieQO5wiSOrJ67mA; matrixstyle=0; BAIDUID=CCF6F686D866321F65B76B88DCE666DB:FG=1; BDORZ=AE84CDB3A529C0F8A2B9DCDD1D18B695; WISE_HIS_PM=0; ZFY=QF4Rg:A7J6PRn6cUCqup:AQgEPaJh67zReHpom:A0MsirI:C; LOCNEWMATCH=1; toolmode=0; AFD_IP=223.104.194.140",
      "baiduapp": true,
      "cuid": "Ya-3u_ikHuleaHurlu2ji_uqB8_u8SuL_82talPSB8jRa2ucluSPt_ieQO5wiSOrJ67mA",
      "info": {
        "sids": "110086_307086_1992049_626068_628198_631403_632163_632114_632144_632407_633359_633370_633613_634604_635511_636706_636861_632493_637511_637041_637570_636475_638047_638247_638263_638278_638271_638438_638542_638873_639045_639306_639422_633942_639614_637254_639648_639812_639975_640074_638578_640214_638853_640149_640147_640321_617671_640348_640354_627286_638336_640170_640389_640431_640446_637860_640491_639921_640451_640507_635380_640559_640587_640512_638941_638945_638938_640378_640662_639014_640519_640695_639959_639930_640799_640814_640811_640801_640803_640839_640850_640849_640853_640854_640794_640872_640918_8000092_8000099_8000124_8000135_8000149_8000153_8000169_8000178_8000184_1399125_1831671_1891106_1799709_12122826_13122820_11125368_12126545_13126744_12127599_12128364_15128367_13128371_12128987_14129081_15129379_13129746_12129395_12130066_14130323_16130354_18130369_15130489_11130633_16130695_16130711_12130782_13130829_14131015_12131031_18131114_11131216_12131420_19131685_16131978_16132159_13132297_14132309_18132334_11132398_13132413_11132568_12132664_16132719_14132747_16132593_13133058_12133025_13133044",
        "tag": "anonymous component",
        "hook": "computed:dayList",
        "pageUrl": "https://m.baidu.com/s?tn=zbios&pu=sz%401320_480%2Ccuid%40928D7DCBC1DFA11620917BBA2D4DB981976DB5C93FIOKCEOJCA%2Ccua%401290_2796_iphone_13.83.5.10_0%2Cosname%40baiduboxapp%2Cctv%401%2Ccfrom%401099a%2Ccsrc%40home_box_txt&bd_page_type=1&word=%E6%97%A5%E5%8E%862025%E5%85%A8%E5%B9%B4%E6%97%A5%E5%8E%86%E8%A1%A8&sa=iks_1&ss=110000&p_nw=20&mpv=1&branchname=baiduboxapp&t_samp=preload_4_1004&from=1099a&sugid=182970594247304&ant_ct=42dpJqdTrlP6PbdOy54QbLlPIGN8q7WS5WKPshQB%2BVRoUWtBoCQORfYH4okZ1SKC&rsv_sug4=7736&rsv_pq=17390555720001234245&isid=730e3255afec8367bc0e5d927f343f9e&feedsa=178_0",
        "env": "www",
        "msg": "undefined is not an object (evaluating 'n.year')",
        "stack": "dayList@https://ms.bdstatic.com/se/static/ala_atom/app/ms_calendar_san/index_54ae190.js:1:82173\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:294:233\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:294:368\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:304:181\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:249:24\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:249:500\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:297:455\nm@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:212:49\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:297:178\nm@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:212:49\n@https://ms.bdstatic.com/se/static/js/bundles/lib_fec325a.js:297:149\n@https://ms.bds",
        "card": "ms_calendar_san",
        "mod": ""
      },
      "dim": {
        "type": "work",
        "env": "www",
        "card": "ms_calendar_san"
      },
      "group": "js",
      "os": "iOS",
      "sids": [
        "110086",
        "307086",
        "1992049",
        "626068",
        "628198",
        "631403",
        "632163",
        "632114",
        "632144",
        "632407",
        "633359",
        "633370",
        "633613",
        "634604",
        "635511",
        "636706",
        "636861",
        "632493",
        "637511",
        "637041",
        "637570",
        "636475",
        "638047",
        "638247",
        "638263",
        "638278",
        "638271",
        "638438",
        "638542",
        "638873",
        "639045",
        "639306",
        "639422",
        "633942",
        "639614",
        "637254",
        "639648",
        "639812",
        "639975",
        "640074",
        "638578",
        "640214",
        "638853",
        "640149",
        "640147",
        "640321",
        "617671",
        "640348",
        "640354",
        "627286",
        "638336",
        "640170",
        "640389",
        "640431",
        "640446",
        "637860",
        "640491",
        "639921",
        "640451",
        "640507",
        "635380",
        "640559",
        "640587",
        "640512",
        "638941",
        "638945",
        "638938",
        "640378",
        "640662",
        "639014",
        "640519",
        "640695",
        "639959",
        "639930",
        "640799",
        "640814",
        "640811",
        "640801",
        "640803",
        "640839",
        "640850",
        "640849",
        "640853",
        "640854",
        "640794",
        "640872",
        "640918",
        "8000092",
        "8000099",
        "8000124",
        "8000135",
        "8000149",
        "8000153",
        "8000169",
        "8000178",
        "8000184",
        "1399125",
        "1831671",
        "1891106",
        "1799709",
        "12122826",
        "13122820",
        "11125368",
        "12126545",
        "13126744",
        "12127599",
        "12128364",
        "15128367",
        "13128371",
        "12128987",
        "14129081",
        "15129379",
        "13129746",
        "12129395",
        "12130066",
        "14130323",
        "16130354",
        "18130369",
        "15130489",
        "11130633",
        "16130695",
        "16130711",
        "12130782",
        "13130829",
        "14131015",
        "12131031",
        "18131114",
        "11131216",
        "12131420",
        "19131685",
        "16131978",
        "16132159",
        "13132297",
        "14132309",
        "18132334",
        "11132398",
        "13132413",
        "11132568",
        "12132664",
        "16132719",
        "14132747",
        "16132593",
        "13133058",
        "12133025",
        "13133044"
      ],
      "useragent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 SP-engine/3.24.0 main/1.0 baiduboxapp/13.83.5.10 (Baidu; P2 18.1.1) NABar/1.0 themeUA=Theme/default",
      "baiduappVer": "13.83.5.10",
      "type": "except",
      "browser": "Baiduapp"
    },
    "fields": {
      "@timestamp": [
        "2025-02-08T23:19:37.104Z"
      ]
    },
    "highlight": {
      "info.card": [
        "@kibana-highlighted-field@ms_calendar_san@/kibana-highlighted-field@"
      ]
    },
    "sort": [
      1739056777104
    ]
  }
  
  // 调用函数，输出通用的摘要信息
  outputGenericBugSummary(bugReportJSON);
  