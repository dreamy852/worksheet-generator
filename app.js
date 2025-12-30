document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  var form = document.getElementById("worksheetForm");
  var subjectEl = document.getElementById("subject");
  var centreEl = document.getElementById("centreName");
  var logoEl = document.getElementById("logo");
  var logoPreviewEl = document.getElementById("logoPreview");
  var mcBasicEl = document.getElementById("mcBasicCount");
  var mcInterEl = document.getElementById("mcIntermediateCount");
  var mcAdvEl = document.getElementById("mcAdvancedCount");
  var longBasicEl = document.getElementById("longBasicCount");
  var longInterEl = document.getElementById("longIntermediateCount");
  var longAdvEl = document.getElementById("longAdvancedCount");
  var notesEl = document.getElementById("notes");
  var apiKeyEl = document.getElementById("apiKey");
  var uiLangEl = document.getElementById("uiLang");
  var paperPreviewEl = document.getElementById("paperPreview");
  var statusBarEl = document.getElementById("statusBar");
  var statusTextEl = document.getElementById("statusText");
  var completeBarEl = document.getElementById("completeBar");
  var completeTextEl = document.getElementById("completeText");
  var generateBtn = document.getElementById("generateBtn");
  var downloadWorksheetPdfBtn = document.getElementById("downloadWorksheetPdfBtn");
  var downloadSolutionPdfBtn = document.getElementById("downloadSolutionPdfBtn");
  var downloadWorksheetTexBtn = document.getElementById("downloadWorksheetTexBtn");
  var downloadSolutionTexBtn = document.getElementById("downloadSolutionTexBtn");

  function updateYear() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function updatePreview() {
    if (!paperPreviewEl) return;
    
    // 如果有生成的问题，显示预览
    if (window.GeneratedQuestions && Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length > 0) {
      var formData = collectForm();
      var htmlContent = generateWorksheetHTML(window.GeneratedQuestions, {
        centre: formData.centre,
        topic: formData.subject
      });
      paperPreviewEl.innerHTML = htmlContent;
      
      // 触发 MathJax 重新渲染
      if (hasMathJax() && MathJax.typesetPromise) {
        MathJax.typesetPromise([paperPreviewEl]).catch(function(err) {
          console.warn("MathJax rendering error:", err);
        });
      }
    } else {
      // 显示占位文本
      var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      var placeholderText = ui === "zh-hant" 
        ? "<div style='text-align: center; padding: 40px; color: #999;'>點擊「生成工作紙」按鈕後，預覽將在此顯示</div>"
        : "<div style='text-align: center; padding: 40px; color: #999;'>Preview will appear here after generating the worksheet</div>";
      paperPreviewEl.innerHTML = placeholderText;
    }
    
    validateForm();
  }

  function validateForm() {
    var hasSubject = subjectEl.value.trim().length > 0;
    var hasCentre = centreEl.value.trim().length > 0;
    generateBtn.disabled = !(hasSubject && hasCentre);
  }

  function handleLogoUpload(file) {
    if (!file) {
      logoPreviewEl.style.display = "none";
      logoPreviewEl.removeAttribute("src");
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      logoPreviewEl.src = src;
      logoPreviewEl.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  }

  function showStatus(text) {
    statusTextEl.textContent = text;
    statusBarEl.classList.remove("hidden");
  }

  function hideStatus() {
    statusBarEl.classList.add("hidden");
  }


  function applyUILanguage() {
    var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
    var zh = ui === "zh-hant";
    function setText(selector, textEn, textZh) {
      var el = document.querySelector(selector);
      if (el) el.textContent = zh ? textZh : textEn;
    }
    setText('.brand-text', 'Worksheet Generator', '工作紙生成器');
    setText('label[for="subject"]', 'Topic/Subject', '主題/科目');
    setText('label[for="centreName"]', 'Tutorial Centre Name', '補習中心名稱');
    setText('label[for="logo"]', 'Logo Upload', '上載標誌');
    setText('.section-title', 'Worksheet Setup', '工作紙設定');
    setText('#distTitle', 'Question Distribution', '題型分配');
    setText('#langTitle', 'Interface Language', '介面語言');
    setText('#langLabel', 'Language', '語言');
    setText('#apiTitle', 'API Settings', 'API 設定');
    setText('label[for="mcBasicCount"]', 'MC Basic', '選擇題 基礎');
    setText('label[for="mcIntermediateCount"]', 'MC Intermediate', '選擇題 中級');
    setText('label[for="mcAdvancedCount"]', 'MC Advanced', '選擇題 高級');
    setText('label[for="longBasicCount"]', 'Long question Basic', '長答題 基礎');
    setText('label[for="longIntermediateCount"]', 'Long question Intermediate', '長答題 中級');
    setText('label[for="longAdvancedCount"]', 'Long question Advanced', '長答題 高級');
    setText('label[for="notes"]', 'Additional Notes', '附加說明');
    setText('label[for="uiLang"]', 'Language', '語言');
    setText('label[for="apiKey"]', 'DeepSeek API Key', 'DeepSeek API 金鑰');
    var genBtn = document.getElementById('generateBtn');
    if (genBtn) genBtn.textContent = zh ? '生成工作紙' : 'Generate Worksheet';
    var dlWPdf = document.getElementById('downloadWorksheetPdfBtn');
    if (dlWPdf) dlWPdf.textContent = zh ? '下載 PDF (工作紙)' : 'Download PDF (Worksheet)';
    var dlSPdf = document.getElementById('downloadSolutionPdfBtn');
    if (dlSPdf) dlSPdf.textContent = zh ? '下載 PDF (解答)' : 'Download PDF (Solution)';
    var dlWTex = document.getElementById('downloadWorksheetTexBtn');
    if (dlWTex) dlWTex.textContent = zh ? '下載 .tex (工作紙)' : 'Download .tex (Worksheet)';
    var dlSTex = document.getElementById('downloadSolutionTexBtn');
    if (dlSTex) dlSTex.textContent = zh ? '下載 .tex (解答)' : 'Download .tex (Solution)';
    var previewTitle = document.getElementById('previewTitle');
    if (previewTitle) previewTitle.textContent = zh ? '預覽' : 'Preview';
  }


  function hasMathJax() {
    return typeof MathJax !== "undefined" && MathJax && MathJax.tex2svg;
  }

  function texToSvgElement(tex) {
    try { return MathJax.tex2svg(String(tex)); } catch (e) { return null; }
  }

  function svgToPngDataUrl(svgEl, scale) {
    return new Promise(function (resolve) {
      try {
        var serializer = new XMLSerializer();
        var svgStr = serializer.serializeToString(svgEl);
        var svg64 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement("canvas");
          var w = Math.ceil(img.width * (scale || 2));
          var h = Math.ceil(img.height * (scale || 2));
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL("image/png")); } catch (e) { resolve(null); }
        };
        img.onerror = function () { resolve(null); };
        img.src = svg64;
      } catch (e) {
        resolve(null);
      }
    });
  }

  async function texToPng(tex) {
    if (!hasMathJax()) return null;
    var svg = texToSvgElement(tex);
    if (!svg) return null;
    return await svgToPngDataUrl(svg, 2);
  }


  function groupByDifficulty(questions) {
    var groups = { Basic: [], Intermediate: [], Advanced: [] };
    (questions || []).forEach(function (q) {
      var d = q.difficulty || "Basic";
      if (!groups[d]) groups[d] = [];
      groups[d].push(q);
    });
    return groups;
  }

  function buildPlaceholders(formData, language) {
    var out = [];
    var idx = 1;
    function add(count, difficulty, type) {
      for (var i = 0; i < count; i++) {
        out.push({
          id: String(idx++),
          difficulty: difficulty,
          type: type,
          language: language,
          text: (language === "zh" ? "题目占位符" : "Question placeholder") + " (" + difficulty + ", " + (type === "MC" ? "Multiple Choice" : "Long Answer") + ")",
          options: type === "MC" ? ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"] : [],
          answer: type === "MC" ? "A" : "",
          solution: "",
          marks: null,
          teacher_notes: ""
        });
      }
    }
    var counts = formData.counts;
    [["Basic", counts.mcBasic], ["Intermediate", counts.mcIntermediate], ["Advanced", counts.mcAdvanced]].forEach(function (pair) { add(pair[1], pair[0], "MC"); });
    [["Basic", counts.longBasic], ["Intermediate", counts.longIntermediate], ["Advanced", counts.longAdvanced]].forEach(function (pair) { add(pair[1], pair[0], "Long"); });
    return out;
  }


  function safeTex(s) {
    if (!s) return "";
    var str = String(s);
    var parts = str.split(/(\$[^$]+\$)/g);
    return parts.map(function (p) {
      if (p.startsWith("$") && p.endsWith("$")) return p;
      return p
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
    }).join("");
  }

  function generateTeX(questions, meta, isSolution) {
    var title = isSolution ? "Solution / Marking Scheme" : "Worksheet";
    var lines = [];
    lines.push("\\documentclass[12pt, a4paper]{article}");
    lines.push("\\usepackage{amsmath, amssymb}");
    lines.push("\\usepackage{xeCJK}");
    lines.push("% Note: If 'Microsoft JhengHei' is not available on your system, please change the font name below (e.g., 'PingFang TC' on Mac, 'Noto Sans CJK' on Linux).");
    lines.push("\\setCJKmainfont{Microsoft JhengHei}");
    lines.push("\\usepackage{geometry}");
    lines.push("\\geometry{left=2cm, right=2cm, top=2cm, bottom=2cm}");
    lines.push("\\usepackage{fancyhdr}");
    lines.push("\\pagestyle{fancy}");
    lines.push("\\fancyhf{}");
    lines.push("\\lhead{" + safeTex(meta.topic) + "}");
    lines.push("\\rhead{" + safeTex(meta.centre) + "}");
    lines.push("\\cfoot{\\thepage}");
    lines.push("\\setlength{\\parindent}{0pt}");
    lines.push("\\setlength{\\parskip}{1em}");
    lines.push("");
    lines.push("\\begin{document}");
    lines.push("\\begin{center}");
    lines.push("{\\Large \\textbf{" + safeTex(meta.topic) + " -- " + title + "}}");
    lines.push("\\end{center}");
    lines.push("");
    
    var groups = groupByDifficulty(questions);
    ["Basic", "Intermediate", "Advanced"].forEach(function(level) {
      var list = groups[level] || [];
      if (!list.length) return;
      lines.push("\\section*{" + level + "}");
      lines.push("\\begin{enumerate}");
      list.forEach(function(q) {
        lines.push("\\item " + safeTex(q.text));
        if (q.type === "MC" && q.options && q.options.length) {
          lines.push("\\begin{itemize}");
          q.options.forEach(function(opt) {
            lines.push("\\item " + safeTex(opt));
          });
          lines.push("\\end{itemize}");
        }
        if (isSolution) {
          lines.push("\\par \\textbf{Solution:} " + safeTex(q.solution));
          if (q.type === "MC") {
            lines.push("\\par \\textbf{Answer:} " + safeTex(q.answer));
          }
        } else {
          if (q.type === "Long") {
             lines.push("\\vspace{4cm}");
          } else {
             lines.push("\\vspace{1cm}");
          }
        }
        lines.push("");
      });
      lines.push("\\end{enumerate}");
    });
    lines.push("\\end{document}");
    return lines.join("\\n");
  }

  function downloadStringAsFile(content, filename) {
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 100);
  }

  // 将文本中的 LaTeX 公式转换为 HTML（保持 $...$ 格式，MathJax 已配置支持）
  function textToHtml(text) {
    if (!text) return "";
    var str = String(text);
    // 转义 HTML 特殊字符（但保留 $ 符号供 MathJax 使用）
    var parts = str.split(/(\$[^$]+\$)/g);
    return parts.map(function(part) {
      if (part.startsWith("$") && part.endsWith("$")) {
        // 这是 LaTeX 公式，保持原样（MathJax 会处理）
        return part;
      }
      // 转义普通文本
      var div = document.createElement("div");
      div.textContent = part;
      return div.innerHTML;
    }).join("");
  }

  // 生成工作表的 HTML 内容
  function generateWorksheetHTML(questions, meta) {
    var html = [];
    html.push('<div style="font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.6;" class="worksheet-content">');
    
    // 标题
    html.push('<div style="text-align: center; margin-bottom: 30px;">');
    html.push('<h1 style="font-size: 24px; font-weight: bold; margin: 0;">' + escapeHtml(meta.topic || "Worksheet") + '</h1>');
    html.push('<p style="margin: 10px 0 0 0; color: #666;">' + escapeHtml(meta.centre || "Tutorial Centre") + '</p>');
    html.push('</div>');

    var groups = groupByDifficulty(questions);
    var sectionLabels = { "Basic": "基礎", "Intermediate": "中級", "Advanced": "高級" };
    
    ["Basic", "Intermediate", "Advanced"].forEach(function(level) {
      var list = groups[level] || [];
      if (!list.length) return;
      
      html.push('<div style="margin: 30px 0;">');
      html.push('<h2 style="font-size: 18px; font-weight: bold; background: #1e40af; color: white; padding: 10px; margin: 0 0 15px 0;">' + 
                (sectionLabels[level] || level) + '</h2>');
      html.push('<ol style="margin: 0; padding-left: 25px;">');
      
      list.forEach(function(q, idx) {
        html.push('<li style="margin-bottom: 20px;">');
        html.push('<div style="margin-bottom: 8px;">' + textToHtml(q.text) + '</div>');
        
        if (q.type === "MC" && Array.isArray(q.options) && q.options.length > 0) {
          html.push('<ul style="list-style-type: none; padding-left: 20px; margin: 10px 0;">');
          q.options.forEach(function(opt) {
            html.push('<li style="margin: 5px 0;">' + textToHtml(opt) + '</li>');
          });
          html.push('</ul>');
        }
        
        // 答题空间
        if (q.type === "Long") {
          html.push('<div style="margin-top: 15px; min-height: 150px; border-top: 1px solid #ddd; padding-top: 10px;"></div>');
        } else {
          html.push('<div style="margin-top: 10px; min-height: 40px; border-top: 1px solid #ddd; padding-top: 5px;"></div>');
        }
        
        html.push('</li>');
      });
      
      html.push('</ol>');
      html.push('</div>');
    });
    
    html.push('</div>');
    return html.join("");
  }

  // 生成解答的 HTML 内容
  function generateSolutionHTML(questions, meta) {
    var html = [];
    html.push('<div style="font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.6;" class="solution-content">');
    
    // 标题
    html.push('<div style="text-align: center; margin-bottom: 30px;">');
    html.push('<h1 style="font-size: 24px; font-weight: bold; margin: 0;">' + escapeHtml(meta.topic || "Solution") + ' - 解答</h1>');
    html.push('<p style="margin: 10px 0 0 0; color: #666;">' + escapeHtml(meta.centre || "Tutorial Centre") + '</p>');
    html.push('</div>');

    var groups = groupByDifficulty(questions);
    var sectionLabels = { "Basic": "基礎", "Intermediate": "中級", "Advanced": "高級" };
    
    ["Basic", "Intermediate", "Advanced"].forEach(function(level) {
      var list = groups[level] || [];
      if (!list.length) return;
      
      html.push('<div style="margin: 30px 0;">');
      html.push('<h2 style="font-size: 18px; font-weight: bold; background: #1e40af; color: white; padding: 10px; margin: 0 0 15px 0;">' + 
                (sectionLabels[level] || level) + ' 解答</h2>');
      html.push('<ol style="margin: 0; padding-left: 25px;">');
      
      list.forEach(function(q, idx) {
        html.push('<li style="margin-bottom: 25px;">');
        html.push('<div style="margin-bottom: 8px;">' + textToHtml(q.text) + '</div>');
        
        if (q.type === "MC" && Array.isArray(q.options) && q.options.length > 0) {
          html.push('<ul style="list-style-type: none; padding-left: 20px; margin: 10px 0;">');
          q.options.forEach(function(opt) {
            html.push('<li style="margin: 5px 0;">' + textToHtml(opt) + '</li>');
          });
          html.push('</ul>');
        }
        
        // 答案和解答
        html.push('<div style="margin-top: 15px; padding: 10px; background: #f0f9ff; border-left: 4px solid #1e40af;">');
        if (q.type === "MC") {
          html.push('<p style="margin: 5px 0;"><strong>答案：</strong>' + escapeHtml(q.answer || "N/A") + '</p>');
        }
        if (q.solution) {
          html.push('<p style="margin: 5px 0;"><strong>解答：</strong>' + textToHtml(q.solution) + '</p>');
        }
        if (q.marks != null) {
          html.push('<p style="margin: 5px 0;"><strong>分數：</strong>' + escapeHtml(String(q.marks)) + '</p>');
        }
        html.push('</div>');
        
        html.push('</li>');
      });
      
      html.push('</ol>');
      html.push('</div>');
    });
    
    html.push('</div>');
    return html.join("");
  }

  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }


  // 生成 PDF
  async function generatePDF(questions, meta, isSolution) {
    if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
      alert("PDF library not loaded. Please refresh the page.");
      return;
    }
    if (typeof html2canvas === "undefined") {
      alert("html2canvas library not loaded. Please refresh the page.");
      return;
    }

    showStatus(isSolution ? "Generating solution PDF..." : "Generating worksheet PDF...");
    
    try {
      // 创建临时容器
      var container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "800px";
      container.style.backgroundColor = "#ffffff";
      var htmlContent = isSolution ? generateSolutionHTML(questions, meta) : generateWorksheetHTML(questions, meta);
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // 配置 MathJax 以自动渲染
      if (hasMathJax() && MathJax.typesetPromise) {
        try {
          await MathJax.typesetPromise([container]);
        } catch (e) {
          console.warn("MathJax rendering error:", e);
        }
      }
      
      // 额外等待确保渲染完成
      await new Promise(function(resolve) { setTimeout(resolve, 500); });

      // 使用 html2canvas 转换为 canvas
      var canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        windowWidth: 800
      });

      // 创建 PDF
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      var imgData = canvas.toDataURL("image/png");
      var imgWidth = 210; // A4 width in mm
      var pageHeight = 297; // A4 height in mm
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      var position = 0;

      // 添加第一页
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果需要多页
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 清理
      document.body.removeChild(container);

      // 保存
      var filename = isSolution ? "Solution.pdf" : "Worksheet.pdf";
      pdf.save(filename);
      
      hideStatus();
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF: " + error.message);
      hideStatus();
    }
  }

  function localGenerateQuestions(formData, lang) {
    var out = [];
    var idx = 1;
    function add(count, difficulty, type) {
      for (var i = 0; i < count; i++) {
        var baseText = lang === "zh" ? "求解方程" : "Solve the equation";
        var tex = i % 2 === 0 ? "x^2+5x+6=0" : "\\int_0^1 x^2\\,dx";
        var solTex = i % 2 === 0 ? "x=-2,\\;x=-3" : "\\frac{1}{3}";
        var mcOpts = ["A) $1$", "B) $2$", "C) $3$", "D) $4$"];
        var ans = "A";
        var text = baseText + ": $" + tex + "$";
        var solution = i % 2 === 0 ? "Factor to $(x+2)(x+3)=0$; roots $-2$ and $-3$." : "Integrate $x^2$ to $x^3/3$; evaluate at $1$ to get $1/3$.";
        out.push({
          id: String(idx++),
          difficulty: difficulty,
          type: type,
          language: lang,
          text: text,
          textTeX: tex,
          options: type === "MC" ? mcOpts : [],
          answer: type === "MC" ? ans : "",
          solution: solution,
          solutionTeX: type === "Long" ? solTex : "",
          marks: type === "Long" ? 6 : 2,
          teacher_notes: lang === "zh" ? "提示：注意基礎因式分解與定積分基礎。" : "Tip: Emphasize factoring basics and definite integral evaluation."
        });
      }
    }
    var counts = formData.counts;
    [["Basic", counts.mcBasic], ["Intermediate", counts.mcIntermediate], ["Advanced", counts.mcAdvanced]].forEach(function (pair) { add(pair[1], pair[0], "MC"); });
    [["Basic", counts.longBasic], ["Intermediate", counts.longIntermediate], ["Advanced", counts.longAdvanced]].forEach(function (pair) { add(pair[1], pair[0], "Long"); });
    return out;
  }

  async function buildTeXAssets(questions) {
    async function ensureReady() {
      var tries = 0;
      while (!hasMathJax() && tries < 50) {
        await new Promise(function (r) { setTimeout(r, 100); });
        tries++;
      }
      try {
        if (MathJax && MathJax.startup && MathJax.startup.promise) {
          await MathJax.startup.promise;
        }
      } catch (e) {}
    }
    await ensureReady();
    function extractFirstTeX(s) {
      var m = s.match(/\$([^$]+)\$/) || s.match(/\\\(([^)]+)\\\)/) || s.match(/\\\[([\s\S]+?)\\\]/);
      return m ? m[1] : null;
    }
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var textTex = q.textTeX || (typeof q.text === "string" ? extractFirstTeX(q.text) : null);
      if (textTex) {
        try { q._textImg = await texToPng(textTex); } catch (e) {}
      }
      if (Array.isArray(q.options)) {
        q._optionImgs = [];
        for (var j = 0; j < q.options.length; j++) {
          var raw = q.options[j];
          var tex = null;
          if (/\$.*\$/.test(raw)) {
            tex = raw.replace(/^\s*\$\s*|\s*\$\s*$/g, "");
          }
          if (tex) {
            try { q._optionImgs.push(await texToPng(tex)); } catch (e) { q._optionImgs.push(null); }
          } else {
            q._optionImgs.push(null);
          }
        }
      }
      var solutionTex = q.solutionTeX || (typeof q.solution === "string" ? extractFirstTeX(q.solution) : null);
      if (solutionTex) {
        try { q._solutionImg = await texToPng(solutionTex); } catch (e) {}
      }
    }
    return questions;
  }
  function getApiKey() {
    var k = apiKeyEl && apiKeyEl.value ? apiKeyEl.value.trim() : "";
    if (k) return k;
    if (typeof window.DEEPSEEK_API_KEY === "string" && window.DEEPSEEK_API_KEY.trim()) return window.DEEPSEEK_API_KEY.trim();
    var s = "";
    try { s = localStorage.getItem("deepseek_api_key") || ""; } catch (e) {}
    return s.trim();
  }

  function detectLanguage(text) {
    var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
    if (ui === "zh-hant") return "zh";
    var t = String(text || "");
    if (/[\u4e00-\u9fff]/.test(t)) return "zh";
    if (/Chinese|繁體中文|中文/i.test(t)) return "zh";
    return "en";
  }

  function buildPlan(counts) {
    var plan = [];
    [["Basic","mcBasic"],["Intermediate","mcIntermediate"],["Advanced","mcAdvanced"]].forEach(function(pair){
      var level = pair[0]; var key = pair[1];
      var c = Number(counts[key] || 0); if (c>0) plan.push({ difficulty: level, type: "MC", count: c });
    });
    [["Basic","longBasic"],["Intermediate","longIntermediate"],["Advanced","longAdvanced"]].forEach(function(pair){
      var level = pair[0]; var key = pair[1];
      var c = Number(counts[key] || 0); if (c>0) plan.push({ difficulty: level, type: "Long", count: c });
    });
    return plan;
  }

  function buildPrompt(subject, topic, notes, language, plan) {
    var lines = [];
    lines.push("Role: Expert education content writer.");
    var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
    if (language === "zh") {
      lines.push("Language: Traditional Chinese (繁體中文).");
    } else {
      lines.push("Language: English.");
    }
    lines.push("Subject: " + (subject || "General") + ".");
    lines.push("Topic: " + (topic || subject || "General") + ".");
    if (notes && notes.trim()) lines.push("Constraints: " + notes.trim() + ".");
    lines.push("Output only valid JSON with a root object {\"questions\": []}.");
    lines.push("Each question object must include: id, difficulty, type, language, text, options (for MC), answer, solution, marks, teacher_notes.");
    lines.push("Rules:");
    lines.push("For Multiple Choice: include exactly 4 options (A,B,C,D); answer is the correct option letter; options must be plausible; avoid ambiguity.");
    lines.push("For Long: include step-by-step solution and a concise mark scheme in \"solution\"; provide \"teacher_notes\" for difficult steps.");
    plan.forEach(function (p) {
      lines.push("Generate " + p.count + " " + p.difficulty + " " + subject + " " + (p.type === "MC" ? "multiple choice" : "long answer") + " questions about " + (topic || subject) + ".");
    });
    return lines.join(" ");
  }

  function deepseekRequest(prompt, apiKey) {
    return fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You generate high-quality educational questions and answers." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    }).then(function (r) { return r.json(); });
  }

  function tryExtractJson(text) {
    var s = String(text || "");
    try { return JSON.parse(s); } catch (e) {}
    var i = s.indexOf("{");
    var j = s.lastIndexOf("}");
    if (i !== -1 && j !== -1 && j > i) {
      var slice = s.substring(i, j + 1);
      try { return JSON.parse(slice); } catch (e) {}
    }
    return null;
  }

  function parseQuestions(response) {
    var c = "";
    try {
      c = (((response || {}).choices || [])[0] || {}).message || {};
      c = c.content || "";
    } catch (e) {}
    var obj = tryExtractJson(c);
    if (!obj || !obj.questions || !Array.isArray(obj.questions)) return [];
    var out = [];
    obj.questions.forEach(function (q, idx) {
      var id = q.id || String(idx + 1);
      var difficulty = q.difficulty || "";
      var type = q.type || "";
      var language = q.language || "";
      var text = q.text || "";
      var options = Array.isArray(q.options) ? q.options : [];
      var answer = q.answer || "";
      var solution = q.solution || "";
      var marks = q.marks != null ? q.marks : null;
      var notes = q.teacher_notes || "";
      out.push({ id: id, difficulty: difficulty, type: type, language: language, text: text, options: options, answer: answer, solution: solution, marks: marks, teacher_notes: notes });
    });
    return out;
  }

  function collectForm() {
    return {
      subject: subjectEl.value || "",
      centre: centreEl.value || "",
      counts: {
        mcBasic: Number(mcBasicEl.value || 0),
        mcIntermediate: Number(mcInterEl.value || 0),
        mcAdvanced: Number(mcAdvEl.value || 0),
        longBasic: Number(longBasicEl.value || 0),
        longIntermediate: Number(longInterEl.value || 0),
        longAdvanced: Number(longAdvEl.value || 0)
      },
      notes: notesEl.value || ""
    };
  }

  function generateWithDeepSeek() {
    var apiKey = getApiKey();
    // Disable actions during generation
    generateBtn.disabled = true;
    downloadWorksheetPdfBtn.disabled = true;
    downloadSolutionPdfBtn.disabled = true;
    downloadWorksheetTexBtn.disabled = true;
    downloadSolutionTexBtn.disabled = true;
    if (!apiKey) {
      var formDataNoKey = collectForm();
      var langNoKey = detectLanguage(formDataNoKey.subject + " " + formDataNoKey.notes);
      var localQsNoKey = localGenerateQuestions(formDataNoKey, langNoKey);
      window.GeneratedQuestions = localQsNoKey;
      statusTextEl.textContent = "Questions have been generated";
      // Build TeX assets then enable buttons
      buildTeXAssets(window.GeneratedQuestions).then(function () {
        var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
        statusTextEl.textContent = ui === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetPdfBtn.disabled = false;
        downloadWorksheetTexBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionPdfBtn.disabled = false;
          downloadSolutionTexBtn.disabled = false;
        }, 400);
      }).finally(function () {
        generateBtn.disabled = false;
      });
      var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      if (completeBarEl && completeTextEl) {
        completeTextEl.textContent = ui === "zh-hant" ? "工作紙生成已完成！" : "Worksheet generation is completed!";
        completeBarEl.classList.remove("hidden");
      }
      setTimeout(hideStatus, 1200);
      return;
    }
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var plan = buildPlan(formData.counts);
    if (!plan.length) {
      showStatus("No questions requested");
      generateBtn.disabled = false;
      return;
    }
    var prompt = buildPrompt(formData.subject, formData.subject, formData.notes, lang, plan);
    showStatus("Generating questions...");
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve({ timeout: true }); }, 8000);
    });
    Promise.race([deepseekRequest(prompt, apiKey), timeout]).then(function (res) {
      if (res && res.timeout) {
        var localQs = localGenerateQuestions(formData, lang);
        window.GeneratedQuestions = localQs;
        statusTextEl.textContent = "Questions have been generated";
        var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
        if (completeBarEl && completeTextEl) {
          completeTextEl.textContent = ui === "zh-hant" ? "工作紙生成已完成！" : "Worksheet generation is completed!";
          completeBarEl.classList.remove("hidden");
        }
        return buildTeXAssets(window.GeneratedQuestions).then(function () {
          updatePreview(); // Update preview after questions are generated
          statusTextEl.textContent = ui === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
          downloadWorksheetPdfBtn.disabled = false;
          downloadWorksheetTexBtn.disabled = false;
          setTimeout(function () {
            statusTextEl.textContent = ui === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
            downloadSolutionPdfBtn.disabled = false;
            downloadSolutionTexBtn.disabled = false;
          }, 400);
        }).finally(function () {
          generateBtn.disabled = false;
        });
        return;
      }
      var questions = parseQuestions(res);
      if (!questions.length) {
        var localQs2 = localGenerateQuestions(formData, lang);
        window.GeneratedQuestions = localQs2;
        statusTextEl.textContent = "Questions have been generated";
      } else {
        window.GeneratedQuestions = questions;
        statusTextEl.textContent = "Questions have been generated";
      }
      var ui2 = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      if (completeBarEl && completeTextEl) {
        completeTextEl.textContent = ui2 === "zh-hant" ? "工作紙生成已完成！" : "Worksheet generation is completed!";
        completeBarEl.classList.remove("hidden");
      }
      buildTeXAssets(window.GeneratedQuestions).then(function () {
        updatePreview(); // Update preview after questions are generated
        statusTextEl.textContent = ui2 === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetPdfBtn.disabled = false;
        downloadWorksheetTexBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui2 === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionPdfBtn.disabled = false;
          downloadSolutionTexBtn.disabled = false;
        }, 400);
      }).finally(function () {
        generateBtn.disabled = false;
      });
      setTimeout(hideStatus, 1200);
    }).catch(function (err) {
      var localQs3 = localGenerateQuestions(formData, lang);
      window.GeneratedQuestions = localQs3;
      statusTextEl.textContent = "Questions have been generated";
      var ui3 = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      if (completeBarEl && completeTextEl) {
        completeTextEl.textContent = ui3 === "zh-hant" ? "工作紙生成已完成！" : "Worksheet generation is completed!";
        completeBarEl.classList.remove("hidden");
      }
      buildTeXAssets(window.GeneratedQuestions).then(function () {
        updatePreview(); // Update preview after questions are generated
        statusTextEl.textContent = ui3 === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetPdfBtn.disabled = false;
        downloadWorksheetTexBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui3 === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionPdfBtn.disabled = false;
          downloadSolutionTexBtn.disabled = false;
        }, 400);
      }).finally(function () {
        generateBtn.disabled = false;
      });
    }).finally(function () {
      // handled in branches
    });
  }

  subjectEl.addEventListener("input", updatePreview);
  centreEl.addEventListener("input", updatePreview);
  mcBasicEl.addEventListener("input", updatePreview);
  mcInterEl.addEventListener("input", updatePreview);
  mcAdvEl.addEventListener("input", updatePreview);
  longBasicEl.addEventListener("input", updatePreview);
  longInterEl.addEventListener("input", updatePreview);
  longAdvEl.addEventListener("input", updatePreview);
  notesEl.addEventListener("input", updatePreview);
  uiLangEl.addEventListener("change", function () { applyUILanguage(); updatePreview(); });
  logoEl.addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    handleLogoUpload(file);
  });

  generateBtn.addEventListener("click", function () {
    if (generateBtn.disabled) return;
    // Disable downloads immediately
    downloadWorksheetPdfBtn.disabled = true;
    downloadSolutionPdfBtn.disabled = true;
    downloadWorksheetTexBtn.disabled = true;
    downloadSolutionTexBtn.disabled = true;
    generateWithDeepSeek();
  });

  downloadWorksheetPdfBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    await generatePDF(questions, {
      centre: formData.centre,
      topic: formData.subject
    }, false);
  });

  downloadSolutionPdfBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    await generatePDF(questions, {
      centre: formData.centre,
      topic: formData.subject
    }, true);
  });

  downloadWorksheetTexBtn.addEventListener("click", function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    var tex = generateTeX(questions, {
      centre: formData.centre,
      topic: formData.subject
    }, false);
    downloadStringAsFile(tex, "Worksheet.tex");
  });

  downloadSolutionTexBtn.addEventListener("click", function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    var tex = generateTeX(questions, {
      centre: formData.centre,
      topic: formData.subject
    }, true);
    downloadStringAsFile(tex, "Solution.tex");
  });

  updateYear();
  updatePreview();
  applyUILanguage();
});
