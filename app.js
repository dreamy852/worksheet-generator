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

  function updateYear() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function updatePreview() {
    if (!paperPreviewEl) return;
    
    // 如果有生成的问题，显示预览
    if (window.GeneratedQuestions && Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length > 0) {
      var formData = collectForm();
      var logoDataUrl = logoPreviewEl && logoPreviewEl.src && logoPreviewEl.src !== window.location.href ? logoPreviewEl.src : null;
      var htmlContent = generateWorksheetHTML(window.GeneratedQuestions, {
        centre: formData.centre,
        topic: formData.subject,
        logoDataUrl: logoDataUrl
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
    html.push('<div style="font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 2cm; max-width: 800px; margin: 0; font-size: 14px; line-height: 1.6; box-sizing: border-box; background: #ffffff;" class="worksheet-content">');
    
    // 标题（包含logo）
    html.push('<div style="text-align: center; margin-bottom: 30px;">');
    if (meta.logoDataUrl) {
      html.push('<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">');
      html.push('<img src="' + escapeHtml(meta.logoDataUrl) + '" style="height: 48px; width: auto; max-width: 120px; object-fit: contain;" alt="Logo">');
      html.push('</div>');
    }
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
        // Add extra spacing after every 4 questions
        var extraMarginBottom = ((idx + 1) % 4 === 0 && idx < list.length - 1) ? '40px' : '20px';
        html.push('<li style="margin-bottom: ' + extraMarginBottom + ';">');
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
    html.push('<div style="font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 2cm; max-width: 800px; margin: 0; font-size: 14px; line-height: 1.6; box-sizing: border-box; background: #ffffff;" class="solution-content">');
    
    // 标题（包含logo）
    html.push('<div style="text-align: center; margin-bottom: 30px;">');
    if (meta.logoDataUrl) {
      html.push('<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">');
      html.push('<img src="' + escapeHtml(meta.logoDataUrl) + '" style="height: 48px; width: auto; max-width: 120px; object-fit: contain;" alt="Logo">');
      html.push('</div>');
    }
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
        // Add extra spacing after every 4 questions
        var extraMarginBottom = ((idx + 1) % 4 === 0 && idx < list.length - 1) ? '45px' : '25px';
        html.push('<li style="margin-bottom: ' + extraMarginBottom + ';">');
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
  // 生成单个section的HTML（用于PDF，每个section单独一页）
  function generateSectionHTML(level, questions, meta, isSolution, sectionLabels, showHeader) {
    var html = [];
    html.push('<div style="font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 0; width: 800px; font-size: 14px; line-height: 1.6; box-sizing: border-box; background: #ffffff;">');
    html.push('<div style="padding: 2cm;">'); // Inner div for content padding
    
    // 标题（包含logo）- 只在第一页显示
    if (showHeader) {
      html.push('<div style="text-align: center; margin-bottom: 30px;">');
      if (meta.logoDataUrl) {
        html.push('<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">');
        html.push('<img src="' + escapeHtml(meta.logoDataUrl) + '" style="height: 48px; width: auto; max-width: 120px; object-fit: contain;" alt="Logo">');
        html.push('</div>');
      }
      html.push('<h1 style="font-size: 24px; font-weight: bold; margin: 0;">' + escapeHtml(meta.topic || (isSolution ? "Solution" : "Worksheet")) + (isSolution ? ' - 解答' : '') + '</h1>');
      html.push('<p style="margin: 10px 0 0 0; color: #666;">' + escapeHtml(meta.centre || "Tutorial Centre") + '</p>');
      html.push('</div>');
    }
    
    // Section标题和内容
    html.push('<h2 style="font-size: 18px; font-weight: bold; background: #1e40af; color: white; padding: 10px; margin: 0 0 15px 0;">' + 
              (sectionLabels[level] || level) + (isSolution ? ' 解答' : '') + '</h2>');
    html.push('<ol style="margin: 0; padding-left: 25px;">');
    
    questions.forEach(function(q, idx) {
      // Add extra spacing after every 4 questions
      var baseMargin = isSolution ? '25px' : '20px';
      var extraMarginBottom = ((idx + 1) % 4 === 0 && idx < questions.length - 1) ? (isSolution ? '45px' : '40px') : baseMargin;
      html.push('<li style="margin-bottom: ' + extraMarginBottom + ';">');
      html.push('<div style="margin-bottom: 8px;">' + textToHtml(q.text) + '</div>');
      
      if (q.type === "MC" && Array.isArray(q.options) && q.options.length > 0) {
        html.push('<ul style="list-style-type: none; padding-left: 20px; margin: 10px 0;">');
        q.options.forEach(function(opt) {
          html.push('<li style="margin: 5px 0;">' + textToHtml(opt) + '</li>');
        });
        html.push('</ul>');
      }
      
      if (isSolution) {
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
      } else {
        // 答题空间
        if (q.type === "Long") {
          html.push('<div style="margin-top: 15px; min-height: 150px; border-top: 1px solid #ddd; padding-top: 10px;"></div>');
        } else {
          html.push('<div style="margin-top: 10px; min-height: 40px; border-top: 1px solid #ddd; padding-top: 5px;"></div>');
        }
      }
      
      html.push('</li>');
    });
    
    html.push('</ol>');
    html.push('</div>'); // Close inner padding div
    html.push('</div>'); // Close outer container
    return html.join("");
  }

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
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      var pageWidth = 210; // A4 width in mm
      var pageHeight = 297; // A4 height in mm
      var margin = 20; // 2cm = 20mm margin
      var contentWidth = pageWidth - (margin * 2); // 170mm content width
      var contentHeight = pageHeight - (margin * 2); // 257mm content height per page
      
      var groups = groupByDifficulty(questions);
      var sectionLabels = { "Basic": "基礎", "Intermediate": "中級", "Advanced": "高級" };
      var levels = ["Basic", "Intermediate", "Advanced"];
      
      // 为每个section生成单独的页面（顺序执行，每个section新页开始）
      for (var i = 0; i < levels.length; i++) {
        var level = levels[i];
        var list = groups[level] || [];
        if (!list.length) continue;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        // 创建临时容器用于这个section
        var container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = "800px";
        container.style.backgroundColor = "#ffffff";
        container.style.padding = "0";
        container.style.margin = "0";
        
        var sectionHTML = generateSectionHTML(level, list, meta, isSolution, sectionLabels, i === 0);
        container.innerHTML = sectionHTML;
        document.body.appendChild(container);
        
        // 等待MathJax渲染
        if (hasMathJax() && MathJax.typesetPromise) {
          try {
            await MathJax.typesetPromise([container]);
          } catch (e) {
            console.warn("MathJax rendering error:", e);
          }
        }
        await new Promise(function(r) { setTimeout(r, 300); });
        
        // 转换为canvas
        var canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800,
          windowWidth: 800,
          backgroundColor: "#ffffff"
        });
        
        // 计算图片尺寸（HTML中已包含2cm padding，所以图片填充整个页面）
        var imgWidth = pageWidth; // 210mm - fill full page width
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 如果内容超过一页，需要分页
        if (imgHeight <= pageHeight) {
          // 单页足够，直接添加（填充整个页面，边距已在HTML中）
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
        } else {
          // 需要多页，分割canvas
          var sourceY = 0;
          var remainingHeight = imgHeight;
          var pageCount = 0;
          
          while (remainingHeight > 0) {
            if (pageCount > 0) {
              pdf.addPage();
            }
            pageCount++;
            
            var pageImgHeight = Math.min(remainingHeight, pageHeight);
            var sourceCanvasHeight = (pageImgHeight / imgHeight) * canvas.height;
            
            // 创建临时canvas用于当前页面
            var pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = sourceCanvasHeight;
            var pageCtx = pageCanvas.getContext("2d");
            pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceCanvasHeight, 0, 0, canvas.width, sourceCanvasHeight);
            
            pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, pageImgHeight);
            
            sourceY += sourceCanvasHeight;
            remainingHeight -= pageImgHeight;
          }
        }
        
        // 清理
        document.body.removeChild(container);
      }

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
    var questionCounter = 0; // Global counter to ensure uniqueness
    
    // Generate diverse questions based on topic and difficulty
    function generateQuestion(difficulty, type, topic) {
      questionCounter++;
      var qNum = questionCounter;
      
      // Topic detection
      var topicLower = (topic || "").toLowerCase();
      var notesLower = (formData.notes || "").toLowerCase();
      var combinedText = topicLower + " " + notesLower;
      var isIndices = /indices?|指數|指數律/.test(combinedText);
      var isAlgebra = /algebra|代數|equation|方程/.test(combinedText);
      var isCalculus = /calculus|微積分|integral|積分|derivative|導數/.test(combinedText);
      var isGeometry = /geometry|幾何|triangle|三角形/.test(combinedText);
      var isEnglish = /english|英文|grammar|語法|sentence|句子|vocabulary|詞彙|tense|時態|verb|動詞/.test(combinedText);
      
      var text, solution, mcOpts, answer, marks, teacherNotes;
      
      // Generate based on difficulty and topic
      if (isIndices) {
        // Law of indices questions
        if (difficulty === "Basic") {
          if (type === "MC") {
            var base1 = 2 + (qNum % 3);
            var exp1 = 3 + (qNum % 2);
            var exp2 = 2 + (qNum % 2);
            text = lang === "zh" ? "計算 $"+base1+"^{"+exp1+"} \\times "+base1+"^{"+exp2+"}$" : "Calculate $"+base1+"^{"+exp1+"} \\times "+base1+"^{"+exp2+"}$";
            var correct = Math.pow(base1, exp1 + exp2);
            var opt1 = correct;
            var opt2 = Math.pow(base1, exp1) + Math.pow(base1, exp2);
            var opt3 = Math.pow(base1, exp1 * exp2);
            var opt4 = correct + 1;
            mcOpts = ["A) $" + opt1 + "$", "B) $" + opt2 + "$", "C) $" + opt3 + "$", "D) $" + opt4 + "$"];
            answer = "A";
            solution = lang === "zh" ? "使用指數律：$"+base1+"^{"+exp1+"} \\times "+base1+"^{"+exp2+"} = "+base1+"^{"+exp1+"+"+exp2+"} = "+base1+"^{"+(exp1+exp2)+"} = "+correct+"$" 
                      : "Using law of indices: $"+base1+"^{"+exp1+"} \\times "+base1+"^{"+exp2+"} = "+base1+"^{"+exp1+"+"+exp2+"} = "+correct+"$";
          } else {
            var base2 = 3 + (qNum % 3);
            var exp3 = 4 + (qNum % 2);
            text = lang === "zh" ? "簡化 $( "+base2+"^{"+exp3+"} )^2$" : "Simplify $( "+base2+"^{"+exp3+"} )^2$";
            var result = Math.pow(base2, exp3 * 2);
            solution = lang === "zh" ? "使用指數律：$( "+base2+"^{"+exp3+"} )^2 = "+base2+"^{"+exp3+" \\times 2} = "+base2+"^{"+(exp3*2)+"} = "+result+"$"
                      : "Using law of indices: $( "+base2+"^{"+exp3+"} )^2 = "+base2+"^{"+exp3+" \\times 2} = "+result+"$";
            marks = 4;
          }
        } else if (difficulty === "Intermediate") {
          if (type === "MC") {
            var base3 = 2 + (qNum % 2);
            var exp4 = 5 + (qNum % 3);
            var exp5 = 2 + (qNum % 2);
            text = lang === "zh" ? "計算 $\\frac{"+base3+"^{"+exp4+"}}{"+base3+"^{"+exp5+"}}$" : "Calculate $\\frac{"+base3+"^{"+exp4+"}}{"+base3+"^{"+exp5+"}}$";
            var correct2 = Math.pow(base3, exp4 - exp5);
            mcOpts = ["A) $" + correct2 + "$", "B) $" + (correct2 - 1) + "$", "C) $" + (correct2 + 1) + "$", "D) $" + Math.pow(base3, exp4 + exp5) + "$"];
            answer = "A";
            solution = lang === "zh" ? "$\\frac{"+base3+"^{"+exp4+"}}{"+base3+"^{"+exp5+"}} = "+base3+"^{"+exp4+"-"+exp5+"} = "+base3+"^{"+(exp4-exp5)+"} = "+correct2+"$"
                      : "$\\frac{"+base3+"^{"+exp4+"}}{"+base3+"^{"+exp5+"}} = "+base3+"^{"+exp4+"-"+exp5+"} = "+correct2+"$";
          } else {
            var base4 = 2 + (qNum % 3);
            var exp6 = 3 + (qNum % 2);
            text = lang === "zh" ? "化簡 $\\sqrt{"+base4+"^{"+exp6+"}}$" : "Simplify $\\sqrt{"+base4+"^{"+exp6+"}}$";
            var result2 = Math.pow(base4, exp6 / 2);
            solution = lang === "zh" ? "$\\sqrt{"+base4+"^{"+exp6+"}} = "+base4+"^{\\frac{"+exp6+"}{2}} = "+base4+"^{"+(exp6/2)+"} = "+result2+"$"
                      : "$\\sqrt{"+base4+"^{"+exp6+"}} = "+base4+"^{\\frac{"+exp6+"}{2}} = "+result2+"$";
            marks = 5;
          }
        } else { // Advanced
          if (type === "MC") {
            var base5 = 2 + (qNum % 2);
            var base6 = 3 + (qNum % 2);
            var exp7 = 2 + (qNum % 2);
            text = lang === "zh" ? "計算 $("+base5+" \\times "+base6+")^{"+exp7+"}$" : "Calculate $("+base5+" \\times "+base6+")^{"+exp7+"}$";
            var correct3 = Math.pow(base5 * base6, exp7);
            mcOpts = ["A) $" + correct3 + "$", "B) $" + (correct3 - base5) + "$", "C) $" + (Math.pow(base5, exp7) * Math.pow(base6, exp7)) + "$", "D) $" + (correct3 + 10) + "$"];
            answer = "C";
            solution = lang === "zh" ? "$("+base5+" \\times "+base6+")^{"+exp7+"} = "+base5+"^{"+exp7+"} \\times "+base6+"^{"+exp7+"} = "+correct3+"$"
                      : "$("+base5+" \\times "+base6+")^{"+exp7+"} = "+base5+"^{"+exp7+"} \\times "+base6+"^{"+exp7+"} = "+correct3+"$";
          } else {
            var base7 = 2 + (qNum % 2);
            var exp8 = 6 + (qNum % 3);
            var exp9 = 3 + (qNum % 2);
            text = lang === "zh" ? "簡化 $\\frac{("+base7+"^{"+exp8+"})^2}{"+base7+"^{"+exp9+"}}$" : "Simplify $\\frac{("+base7+"^{"+exp8+"})^2}{"+base7+"^{"+exp9+"}}$";
            var result3 = Math.pow(base7, exp8 * 2 - exp9);
            solution = lang === "zh" ? "$\\frac{("+base7+"^{"+exp8+"})^2}{"+base7+"^{"+exp9+"}} = \\frac{"+base7+"^{"+(exp8*2)+"}}{"+base7+"^{"+exp9+"}} = "+base7+"^{"+(exp8*2)+"-"+exp9+"} = "+result3+"$"
                      : "$\\frac{("+base7+"^{"+exp8+"})^2}{"+base7+"^{"+exp9+"}} = "+base7+"^{"+(exp8*2)+"-"+exp9+"} = "+result3+"$";
            marks = 6;
          }
        }
        teacherNotes = lang === "zh" ? "提示：應用指數律的相關規則。" : "Tip: Apply the relevant laws of indices.";
      } else if (isAlgebra) {
        // Algebra questions
        if (difficulty === "Basic") {
          if (type === "MC") {
            var a1 = 2 + (qNum % 3);
            var b1 = 3 + (qNum % 4);
            text = lang === "zh" ? "求解 $x + " + a1 + " = " + (a1 + b1) + "$" : "Solve $x + " + a1 + " = " + (a1 + b1) + "$";
            var ans1 = b1;
            mcOpts = ["A) $" + ans1 + "$", "B) $" + (ans1 + 1) + "$", "C) $" + (ans1 - 1) + "$", "D) $" + (ans1 + 2) + "$"];
            answer = "A";
            solution = lang === "zh" ? "$x = " + (a1 + b1) + " - " + a1 + " = " + ans1 + "$" : "$x = " + (a1 + b1) + " - " + a1 + " = " + ans1 + "$";
          } else {
            var a2 = 3 + (qNum % 2);
            var b2 = 5 + (qNum % 3);
            text = lang === "zh" ? "求解 $2x - " + a2 + " = " + b2 + "$" : "Solve $2x - " + a2 + " = " + b2 + "$";
            var ans2 = (b2 + a2) / 2;
            solution = lang === "zh" ? "$2x = " + b2 + " + " + a2 + " = " + (b2 + a2) + "$, 所以 $x = " + ans2 + "$" : "$2x = " + (b2 + a2) + "$, so $x = " + ans2 + "$";
            marks = 4;
          }
        } else if (difficulty === "Intermediate") {
          if (type === "MC") {
            var a3 = 2 + (qNum % 2);
            var b3 = 1 + (qNum % 2);
            var c3 = 6 + (qNum % 4);
            text = lang === "zh" ? "求解 $" + a3 + "x + " + b3 + " = " + c3 + "$" : "Solve $" + a3 + "x + " + b3 + " = " + c3 + "$";
            var ans3 = (c3 - b3) / a3;
            mcOpts = ["A) $" + ans3 + "$", "B) $" + (ans3 + 1) + "$", "C) $" + (ans3 - 1) + "$", "D) $" + (ans3 * 2) + "$"];
            answer = "A";
            solution = lang === "zh" ? "$" + a3 + "x = " + c3 + " - " + b3 + " = " + (c3 - b3) + "$, 所以 $x = " + ans3 + "$" : "$" + a3 + "x = " + (c3 - b3) + "$, so $x = " + ans3 + "$";
          } else {
            var a4 = 1 + (qNum % 2);
            var b4 = 5 + (qNum % 3);
            var c4 = 6 + (qNum % 4);
            text = lang === "zh" ? "因式分解 $x^2 + " + b4 + "x + " + c4 + "$" : "Factorize $x^2 + " + b4 + "x + " + c4 + "$";
            // Find factors
            var factor1 = 2 + (qNum % 2);
            var factor2 = c4 / factor1;
            solution = lang === "zh" ? "$x^2 + " + b4 + "x + " + c4 + " = (x + " + factor1 + ")(x + " + factor2 + ")$" : "$x^2 + " + b4 + "x + " + c4 + " = (x + " + factor1 + ")(x + " + factor2 + ")$";
            marks = 5;
          }
        } else { // Advanced
          if (type === "MC") {
            var a5 = 2 + (qNum % 2);
            var b5 = 3 + (qNum % 2);
            var c5 = 1 + (qNum % 2);
            text = lang === "zh" ? "求解 $" + a5 + "x^2 + " + b5 + "x + " + c5 + " = 0$" : "Solve $" + a5 + "x^2 + " + b5 + "x + " + c5 + " = 0$";
            var disc = b5 * b5 - 4 * a5 * c5;
            var ans4 = disc >= 0 ? ((-b5 + Math.sqrt(disc)) / (2 * a5)).toFixed(2) : "無實數解";
            mcOpts = ["A) $" + ans4 + "$", "B) $2$", "C) $3$", "D) $4$"];
            answer = "A";
            solution = lang === "zh" ? "使用二次公式：$x = \\frac{-" + b5 + " \\pm \\sqrt{" + disc + "}}{" + (2 * a5) + "}$" : "Using quadratic formula: $x = \\frac{-" + b5 + " \\pm \\sqrt{" + disc + "}}{" + (2 * a5) + "}$";
          } else {
            var a6 = 1 + (qNum % 2);
            var b6 = 6 + (qNum % 3);
            var c6 = 8 + (qNum % 4);
            text = lang === "zh" ? "解方程組：$\\begin{cases} x + y = " + b6 + " \\\\ x - y = " + (b6 - 4) + " \\end{cases}$" : "Solve the system: $\\begin{cases} x + y = " + b6 + " \\\\ x - y = " + (b6 - 4) + " \\end{cases}$";
            var xVal = (b6 + (b6 - 4)) / 2;
            var yVal = b6 - xVal;
            solution = lang === "zh" ? "相加：$2x = " + (2 * xVal) + "$，所以 $x = " + xVal + "$，$y = " + yVal + "$" : "$x = " + xVal + "$, $y = " + yVal + "$";
            marks = 6;
          }
        }
        teacherNotes = lang === "zh" ? "提示：注意解方程的步驟和方法。" : "Tip: Pay attention to the steps and methods for solving equations.";
      } else if (isEnglish) {
        // English/Grammar questions
        var grammarTopics = [
          {q: lang === "zh" ? "選擇正確的動詞形式：I ___ to the store yesterday. (go)" : "Choose the correct verb form: I ___ to the store yesterday. (go)",
           opts: ["went", "go", "goes", "going"],
           ans: "A",
           sol: lang === "zh" ? "過去時使用 'went'。" : "Use 'went' for past tense."},
          {q: lang === "zh" ? "選擇正確的代詞：This is ___ book. (my/mine)" : "Choose the correct pronoun: This is ___ book. (my/mine)",
           opts: ["my", "mine", "I", "me"],
           ans: "A",
           sol: lang === "zh" ? "'my' 是形容詞性物主代詞，修飾名詞。" : "'my' is a possessive adjective that modifies nouns."},
          {q: lang === "zh" ? "選擇正確的介詞：She is good ___ mathematics. (at/in/on)" : "Choose the correct preposition: She is good ___ mathematics. (at/in/on)",
           opts: ["at", "in", "on", "for"],
           ans: "A",
           sol: lang === "zh" ? "固定搭配：be good at something。" : "Fixed expression: be good at something."},
          {q: lang === "zh" ? "選擇正確的時態：He ___ TV every evening. (watch)" : "Choose the correct tense: He ___ TV every evening. (watch)",
           opts: ["watches", "watch", "watching", "watched"],
           ans: "A",
           sol: lang === "zh" ? "第三人稱單數現在時使用 'watches'。" : "Third person singular present tense uses 'watches'."},
          {q: lang === "zh" ? "選擇正確的比較級：This book is ___ than that one. (interesting)" : "Choose the correct comparative: This book is ___ than that one. (interesting)",
           opts: ["more interesting", "interestinger", "most interesting", "interesting"],
           ans: "A",
           sol: lang === "zh" ? "多音節形容詞使用 'more' 構成比較級。" : "Multi-syllable adjectives use 'more' to form comparatives."},
          {q: lang === "zh" ? "選擇正確的冠詞：I saw ___ elephant at the zoo. (a/an/the)" : "Choose the correct article: I saw ___ elephant at the zoo. (a/an/the)",
           opts: ["an", "a", "the", "no article"],
           ans: "A",
           sol: lang === "zh" ? "'elephant' 以元音開頭，使用 'an'。" : "'elephant' starts with a vowel sound, use 'an'."},
          {q: lang === "zh" ? "選擇正確的詞序：___ do you go to school?" : "Choose the correct word order: ___ do you go to school?",
           opts: ["How often", "How often do", "How do often", "Do how often"],
           ans: "A",
           sol: lang === "zh" ? "疑問詞 'How often' 在句首。" : "Question word 'How often' comes at the beginning."},
          {q: lang === "zh" ? "選擇正確的被動語態：The letter ___ by him yesterday. (write)" : "Choose the correct passive voice: The letter ___ by him yesterday. (write)",
           opts: ["was written", "written", "was writing", "writes"],
           ans: "A",
           sol: lang === "zh" ? "過去時被動語態：was/were + past participle。" : "Past tense passive: was/were + past participle."}
        ];
        
        if (difficulty === "Basic") {
          if (type === "MC") {
            var grammarIdx = (qNum - 1) % grammarTopics.length;
            var grammarQ = grammarTopics[grammarIdx];
            text = grammarQ.q;
            mcOpts = grammarQ.opts.map(function(opt, i) {
              return String.fromCharCode(65 + i) + ") " + opt;
            });
            answer = grammarQ.ans;
            solution = grammarQ.sol;
          } else {
            var longGrammarTasks = [
              lang === "zh" ? "將以下句子改寫為過去時：'She goes to school every day.'" : "Rewrite the following sentence in past tense: 'She goes to school every day.'",
              lang === "zh" ? "將以下句子改寫為否定句：'I have finished my homework.'" : "Rewrite the following sentence as a negative: 'I have finished my homework.'",
              lang === "zh" ? "用適當的介詞填空：'She is interested ___ learning English.'" : "Fill in the blank with the appropriate preposition: 'She is interested ___ learning English.'",
              lang === "zh" ? "將以下句子改寫為疑問句：'They are playing football.'" : "Rewrite the following sentence as a question: 'They are playing football.'",
              lang === "zh" ? "改正以下句子的錯誤：'He don't like apples.'" : "Correct the error in the following sentence: 'He don't like apples.'"
            ];
            text = longGrammarTasks[(qNum - 1) % longGrammarTasks.length];
            solution = lang === "zh" ? "答案示例：（請根據具體題目提供完整答案）" : "Sample answer: (Please provide a complete answer based on the specific question)";
            marks = 4;
          }
        } else if (difficulty === "Intermediate") {
          if (type === "MC") {
            var grammarIdx2 = (qNum + 2) % grammarTopics.length;
            var grammarQ2 = grammarTopics[grammarIdx2];
            text = grammarQ2.q;
            mcOpts = grammarQ2.opts.map(function(opt, i) {
              return String.fromCharCode(65 + i) + ") " + opt;
            });
            answer = grammarQ2.ans;
            solution = grammarQ2.sol;
          } else {
            var longGrammarTasks2 = [
              lang === "zh" ? "將以下句子改寫為間接引語：'She said, \"I am tired.\"'" : "Rewrite the following sentence in reported speech: 'She said, \"I am tired.\"'",
              lang === "zh" ? "將以下句子改寫為被動語態：'Someone stole my bicycle.'" : "Rewrite the following sentence in passive voice: 'Someone stole my bicycle.'",
              lang === "zh" ? "用適當的條件句填空：'If it ___ (rain), we will stay at home.'" : "Fill in the blank with the appropriate conditional: 'If it ___ (rain), we will stay at home.'",
              lang === "zh" ? "將以下句子改寫為完成時：'I do my homework.'" : "Rewrite the following sentence in perfect tense: 'I do my homework.'",
              lang === "zh" ? "改正以下句子的錯誤：'Neither of the students are present.'" : "Correct the error in the following sentence: 'Neither of the students are present.'"
            ];
            text = longGrammarTasks2[(qNum - 1) % longGrammarTasks2.length];
            solution = lang === "zh" ? "答案示例：（請根據具體題目提供完整答案）" : "Sample answer: (Please provide a complete answer based on the specific question)";
            marks = 5;
          }
        } else { // Advanced
          if (type === "MC") {
            var grammarIdx3 = (qNum + 4) % grammarTopics.length;
            var grammarQ3 = grammarTopics[grammarIdx3];
            text = grammarQ3.q;
            mcOpts = grammarQ3.opts.map(function(opt, i) {
              return String.fromCharCode(65 + i) + ") " + opt;
            });
            answer = grammarQ3.ans;
            solution = grammarQ3.sol;
          } else {
            var longGrammarTasks3 = [
              lang === "zh" ? "將以下句子改寫為強調句型：'I met him yesterday.'" : "Rewrite the following sentence using emphasis: 'I met him yesterday.'",
              lang === "zh" ? "將以下句子改寫為倒裝句：'I have never seen such a beautiful sunset.'" : "Rewrite the following sentence using inversion: 'I have never seen such a beautiful sunset.'",
              lang === "zh" ? "用適當的虛擬語氣填空：'I wish I ___ (be) a bird.'" : "Fill in the blank with the appropriate subjunctive: 'I wish I ___ (be) a bird.'",
              lang === "zh" ? "將以下句子改寫為非限制性定語從句：'My teacher is very kind. She helps me a lot.'" : "Rewrite the following using a non-restrictive relative clause: 'My teacher is very kind. She helps me a lot.'",
              lang === "zh" ? "改正以下句子的錯誤：'The number of students have increased.'" : "Correct the error in the following sentence: 'The number of students have increased.'"
            ];
            text = longGrammarTasks3[(qNum - 1) % longGrammarTasks3.length];
            solution = lang === "zh" ? "答案示例：（請根據具體題目提供完整答案）" : "Sample answer: (Please provide a complete answer based on the specific question)";
            marks = 6;
          }
        }
        teacherNotes = lang === "zh" ? "提示：注意英語語法規則和句型結構。" : "Tip: Pay attention to English grammar rules and sentence structures.";
      } else {
        // Default: Mixed topics
        var topics = [
          {text: lang === "zh" ? "計算 $2^{" + (3 + qNum % 3) + "} \\times 2^{" + (2 + qNum % 2) + "}$" : "Calculate $2^{" + (3 + qNum % 3) + "} \\times 2^{" + (2 + qNum % 2) + "}$", 
           sol: lang === "zh" ? "$2^{" + (5 + qNum % 5) + "} = " + Math.pow(2, 5 + qNum % 5) + "$" : "$2^{" + (5 + qNum % 5) + "} = " + Math.pow(2, 5 + qNum % 5) + "$"},
          {text: lang === "zh" ? "求解 $x + " + (2 + qNum % 5) + " = " + (7 + qNum % 5) + "$" : "Solve $x + " + (2 + qNum % 5) + " = " + (7 + qNum % 5) + "$",
           sol: lang === "zh" ? "$x = " + (5 + qNum % 5) + "$" : "$x = " + (5 + qNum % 5) + "$"},
          {text: lang === "zh" ? "計算 $\\sqrt{" + ((4 + qNum % 10) * (4 + qNum % 10)) + "}$" : "Calculate $\\sqrt{" + ((4 + qNum % 10) * (4 + qNum % 10)) + "}$",
           sol: lang === "zh" ? "$\\sqrt{" + ((4 + qNum % 10) * (4 + qNum % 10)) + "} = " + (4 + qNum % 10) + "$" : "$\\sqrt{" + ((4 + qNum % 10) * (4 + qNum % 10)) + "} = " + (4 + qNum % 10) + "$"}
        ];
        var topicIdx = qNum % topics.length;
        text = topics[topicIdx].text;
        solution = topics[topicIdx].sol;
        if (type === "MC") {
          var ansVal = 5 + qNum % 10;
          mcOpts = ["A) $" + ansVal + "$", "B) $" + (ansVal + 1) + "$", "C) $" + (ansVal - 1) + "$", "D) $" + (ansVal + 2) + "$"];
          answer = "A";
        } else {
          marks = difficulty === "Basic" ? 4 : (difficulty === "Intermediate" ? 5 : 6);
        }
        teacherNotes = lang === "zh" ? "提示：仔細思考問題的解決方法。" : "Tip: Think carefully about the solution method.";
      }
      
      return {
        id: String(idx++),
        difficulty: difficulty,
        type: type,
        language: lang,
        text: text,
        textTeX: "",
        options: type === "MC" ? (mcOpts || []) : [],
        answer: type === "MC" ? (answer || "A") : "",
        solution: solution || "",
        solutionTeX: type === "Long" ? "" : "",
        marks: marks || (type === "MC" ? 2 : (difficulty === "Basic" ? 4 : (difficulty === "Intermediate" ? 5 : 6))),
        teacher_notes: teacherNotes || (lang === "zh" ? "提示：仔細思考。" : "Tip: Think carefully.")
      };
    }
    
    var counts = formData.counts;
    var topic = formData.subject || "";
    
    [["Basic", counts.mcBasic], ["Intermediate", counts.mcIntermediate], ["Advanced", counts.mcAdvanced]].forEach(function (pair) {
      var level = pair[0];
      var count = pair[1];
      for (var i = 0; i < count; i++) {
        out.push(generateQuestion(level, "MC", topic));
      }
    });
    
    [["Basic", counts.longBasic], ["Intermediate", counts.longIntermediate], ["Advanced", counts.longAdvanced]].forEach(function (pair) {
      var level = pair[0];
      var count = pair[1];
      for (var i = 0; i < count; i++) {
        out.push(generateQuestion(level, "Long", topic));
      }
    });
    
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
    lines.push("You are an expert education content writer specializing in creating high-quality educational questions and answers.");
    var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
    if (language === "zh") {
      lines.push("Generate all content in Traditional Chinese (繁體中文).");
    } else {
      lines.push("Generate all content in English.");
    }
    lines.push("Subject: " + (subject || "General") + ".");
    lines.push("Topic: " + (topic || subject || "General") + ".");
    if (notes && notes.trim()) {
      lines.push("Additional requirements or constraints: " + notes.trim() + ".");
    }
    lines.push("");
    lines.push("Output format: Return ONLY valid JSON with this exact structure: {\"questions\": [array of question objects]}");
    lines.push("");
    lines.push("Each question object must include these fields:");
    lines.push("- id: unique identifier (string or number)");
    lines.push("- difficulty: \"Basic\", \"Intermediate\", or \"Advanced\"");
    lines.push("- type: \"MC\" (Multiple Choice) or \"Long\" (Long Answer)");
    lines.push("- language: \"" + (language === "zh" ? "zh" : "en") + "\"");
    lines.push("- text: the question text (use LaTeX math delimiters $ for inline math and $$ for display math if needed)");
    lines.push("- options: array of exactly 4 strings for MC questions (empty array for Long questions)");
    lines.push("- answer: the correct option letter (A/B/C/D) for MC, empty string for Long");
    lines.push("- solution: detailed solution or answer explanation");
    lines.push("- marks: number of marks allocated");
    lines.push("- teacher_notes: helpful notes for teachers (optional)");
    lines.push("");
    lines.push("Rules for Multiple Choice questions:");
    lines.push("- Provide exactly 4 options labeled A, B, C, D");
    lines.push("- Answer field should be the correct option letter (A, B, C, or D)");
    lines.push("- All options should be plausible and avoid ambiguity");
    lines.push("- Use appropriate formatting for the subject (e.g., LaTeX for math, proper formatting for other subjects)");
    lines.push("");
    lines.push("Rules for Long Answer questions:");
    lines.push("- Include step-by-step solution in the \"solution\" field");
    lines.push("- Provide clear mark scheme or solution approach");
    lines.push("- Add helpful \"teacher_notes\" for complex steps");
    lines.push("");
    plan.forEach(function (p) {
      lines.push("Generate " + p.count + " " + p.difficulty + " level " + (p.type === "MC" ? "multiple choice" : "long answer") + " question(s) about " + (topic || subject) + ".");
    });
    lines.push("");
    lines.push("Important: Respond with ONLY the JSON object, no additional text or explanation before or after.");
    return lines.join("\n");
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
          { role: "system", content: "You are an expert education content writer specializing in creating high-quality educational questions and answers." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    }).then(function (r) {
      if (!r.ok) {
        return r.json().then(function(errData) {
          return Promise.reject(errData);
        }).catch(function() {
          return Promise.reject({ error: { message: "HTTP " + r.status + " " + r.statusText } });
        });
      }
      return r.json();
    });
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
    if (!apiKey) {
      generateBtn.disabled = false;
      var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      var errorMsg = ui === "zh-hant" 
        ? "錯誤：需要 DeepSeek API 金鑰才能生成題目。請在 API 設定中輸入您的 API 金鑰。" 
        : "Error: DeepSeek API key is required to generate questions. Please enter your API key in the API Settings section.";
      showStatus(errorMsg);
      setTimeout(hideStatus, 5000);
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
    showStatus("Generating questions with DeepSeek API...");
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve({ timeout: true }); }, 30000); // Increased to 30 seconds
    });
    Promise.race([deepseekRequest(prompt, apiKey), timeout]).then(function (res) {
      if (res && res.timeout) {
        generateBtn.disabled = false;
        var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
        var timeoutMsg = ui === "zh-hant"
          ? "錯誤：API 請求超時。請檢查網絡連接並重試，或稍後再試。"
          : "Error: API request timed out. Please check your network connection and try again, or try again later.";
        showStatus(timeoutMsg);
        setTimeout(hideStatus, 5000);
        return;
      }
      // Check for API errors
      if (res && res.error) {
        generateBtn.disabled = false;
        var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
        var errorMsg = res.error.message || (ui === "zh-hant" ? "API 錯誤" : "API Error");
        var fullErrorMsg = ui === "zh-hant"
          ? "錯誤：API 請求失敗 - " + errorMsg + "。請檢查您的 API 金鑰是否正確。"
          : "Error: API request failed - " + errorMsg + ". Please check if your API key is correct.";
        showStatus(fullErrorMsg);
        setTimeout(hideStatus, 5000);
        return;
      }
      var questions = parseQuestions(res);
      if (!questions.length) {
        generateBtn.disabled = false;
        var ui = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
        var parseErrorMsg = ui === "zh-hant"
          ? "錯誤：無法解析 API 響應。請重試或檢查 API 響應格式。"
          : "Error: Could not parse API response. Please try again or check the API response format.";
        showStatus(parseErrorMsg);
        setTimeout(hideStatus, 5000);
        return;
      }
      window.GeneratedQuestions = questions;
      statusTextEl.textContent = "Questions have been generated";
      var ui2 = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      if (completeBarEl && completeTextEl) {
        completeTextEl.textContent = ui2 === "zh-hant" ? "工作紙生成已完成！" : "Worksheet generation is completed!";
        completeBarEl.classList.remove("hidden");
      }
      buildTeXAssets(window.GeneratedQuestions).then(function () {
        updatePreview(); // Update preview after questions are generated
        statusTextEl.textContent = ui2 === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetPdfBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui2 === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionPdfBtn.disabled = false;
        }, 400);
      }).finally(function () {
        generateBtn.disabled = false;
      });
      setTimeout(hideStatus, 1200);
    }).catch(function (err) {
      generateBtn.disabled = false;
      var ui3 = uiLangEl && uiLangEl.value ? uiLangEl.value : "en";
      var errorMsg = ui3 === "zh-hant"
        ? "錯誤：無法連接到 API 服務器。請檢查您的網絡連接和 API 金鑰，然後重試。錯誤信息：" + (err.message || String(err))
        : "Error: Could not connect to API server. Please check your network connection and API key, then try again. Error: " + (err.message || String(err));
      showStatus(errorMsg);
      setTimeout(hideStatus, 5000);
      console.error("API request error:", err);
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
    generateWithDeepSeek();
  });

  downloadWorksheetPdfBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    var logoDataUrl = logoPreviewEl && logoPreviewEl.src && logoPreviewEl.src !== window.location.href ? logoPreviewEl.src : null;
    await generatePDF(questions, {
      centre: formData.centre,
      topic: formData.subject,
      logoDataUrl: logoDataUrl
    }, false);
  });

  downloadSolutionPdfBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    var logoDataUrl = logoPreviewEl && logoPreviewEl.src && logoPreviewEl.src !== window.location.href ? logoPreviewEl.src : null;
    await generatePDF(questions, {
      centre: formData.centre,
      topic: formData.subject,
      logoDataUrl: logoDataUrl
    }, true);
  });

  updateYear();
  updatePreview();
  applyUILanguage();
});
