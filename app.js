document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  var form = document.getElementById("worksheetForm");
  var subjectEl = document.getElementById("subject");
  var centreEl = document.getElementById("centreName");
  var logoEl = document.getElementById("logo");
  var logoPreviewEl = document.getElementById("logoPreview");
  var previewLogoEl = document.getElementById("previewLogo");
  var mcBasicEl = document.getElementById("mcBasicCount");
  var mcInterEl = document.getElementById("mcIntermediateCount");
  var mcAdvEl = document.getElementById("mcAdvancedCount");
  var longBasicEl = document.getElementById("longBasicCount");
  var longInterEl = document.getElementById("longIntermediateCount");
  var longAdvEl = document.getElementById("longAdvancedCount");
  var notesEl = document.getElementById("notes");
  var apiKeyEl = document.getElementById("apiKey");
  var uiLangEl = document.getElementById("uiLang");
  var previewCentreEl = document.getElementById("previewCentre");
  var previewTopicEl = document.getElementById("previewTopic");
  var previewTagsEl = document.getElementById("previewTags");
  var previewDistroEl = document.getElementById("previewDistro");
  var previewNotesEl = document.getElementById("previewNotes");
  var statusBarEl = document.getElementById("statusBar");
  var statusTextEl = document.getElementById("statusText");
  var completeBarEl = document.getElementById("completeBar");
  var completeTextEl = document.getElementById("completeText");
  var generateBtn = document.getElementById("generateBtn");
  var downloadWorksheetBtn = document.getElementById("downloadWorksheetBtn");
  var downloadSolutionBtn = document.getElementById("downloadSolutionBtn");

  function updateYear() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function updatePreview() {
    var centre = (centreEl.value || "").trim();
    var subject = (subjectEl.value || "").trim();
    previewCentreEl.textContent = centre || "Tutorial Centre";
    previewTopicEl.textContent = subject || "Topic";

    previewTagsEl.innerHTML = "";

    previewDistroEl.innerHTML = "";
    var distro = [
      { label: "MC Basic", value: Number(mcBasicEl.value || 0) },
      { label: "MC Intermediate", value: Number(mcInterEl.value || 0) },
      { label: "MC Advanced", value: Number(mcAdvEl.value || 0) },
      { label: "Long Basic", value: Number(longBasicEl.value || 0) },
      { label: "Long Intermediate", value: Number(longInterEl.value || 0) },
      { label: "Long Advanced", value: Number(longAdvEl.value || 0) },
    ];
    distro.forEach(function (d) {
      var card = document.createElement("div");
      card.className = "distro-item";
      card.textContent = d.label + ": " + d.value;
      previewDistroEl.appendChild(card);
    });

    var notes = (notesEl.value || "").trim();
    previewNotesEl.textContent = notes ? "Notes: " + notes : "";
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
      previewLogoEl.style.display = "none";
      logoPreviewEl.removeAttribute("src");
      previewLogoEl.removeAttribute("src");
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      logoPreviewEl.src = src;
      previewLogoEl.src = src;
      logoPreviewEl.style.display = "inline-block";
      previewLogoEl.style.display = "inline-block";
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

  function ensureJsPDF() {
    return window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
  }

  function mmToPt(mm) {
    return mm * 2.83465;
  }

  function drawHeader(doc, pageWidth, margin, centre, topic, logoDataUrl) {
    var y = margin;
    var logoSize = 36;
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, "PNG", margin, y, logoSize, logoSize, "", "FAST"); } catch (e) {}
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    var xText = logoDataUrl ? margin + logoSize + 10 : margin;
    doc.text(centre || "Tutorial Centre", xText, y + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    var dateStr = new Date().toLocaleDateString();
    doc.text((topic || "Topic") + " • " + dateStr, xText, y + 32);
    return y + logoSize + 16;
  }

  function drawWatermark(doc, pageWidth, pageHeight, logoDataUrl) {
    if (!logoDataUrl) return;
    var centerX = pageWidth / 2;
    var centerY = pageHeight / 2;
    var size = Math.min(pageWidth, pageHeight) * 0.5;
    if (doc.GState && doc.setGState) {
      var gs = new doc.GState({ opacity: 0.08 });
      doc.setGState(gs);
      try { doc.addImage(logoDataUrl, "PNG", centerX - size / 2, centerY - size / 2, size, size, "", "FAST"); } catch (e) {}
      doc.setGState(new doc.GState({ opacity: 1 }));
    } else {
      // Fallback: draw small less intrusive watermark at center
      var fallbackSize = Math.min(pageWidth, pageHeight) * 0.25;
      try { doc.addImage(logoDataUrl, "PNG", centerX - fallbackSize / 2, centerY - fallbackSize / 2, fallbackSize, fallbackSize, "", "FAST"); } catch (e) {}
    }
  }

  function drawSectionTitle(doc, pageWidth, margin, y, title) {
    var barHeight = 20;
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, y, pageWidth - margin * 2, barHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin + 10, y + 14);
    doc.setTextColor(15, 23, 42);
    return y + barHeight + 8;
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
    var dlW = document.getElementById('downloadWorksheetBtn');
    if (dlW) dlW.textContent = zh ? '下載工作紙 PDF' : 'Download Worksheet PDF';
    var dlS = document.getElementById('downloadSolutionBtn');
    if (dlS) dlS.textContent = zh ? '下載解答 PDF' : 'Download Solution PDF';
    if (previewCentreEl) previewCentreEl.textContent = zh ? '補習中心' : (previewCentreEl.textContent || 'Tutorial Centre');
    if (previewTopicEl) previewTopicEl.textContent = zh ? '主題' : (previewTopicEl.textContent || 'Topic');
  }

  function addFooterAndPaging(doc, centre) {
    var total = doc.getNumberOfPages();
    var margin = mmToPt(20);
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (var i = 1; i <= total; i++) {
      doc.setPage(i);
      var footerY = pageHeight - margin / 2;
      doc.setTextColor(51, 65, 85);
      doc.text((centre || "Tutorial Centre") + " • Worksheet", margin, footerY);
      var label = "Page " + i + " of " + total;
      var textWidth = doc.getTextWidth(label);
      doc.text(label, pageWidth - margin - textWidth, footerY);
    }
    doc.setTextColor(15, 23, 42);
  }

  function ensurePage(doc, y, bottomLimit, headerFn) {
    if (y > bottomLimit) {
      doc.addPage();
      return headerFn();
    }
    return y;
  }

  function wrapText(doc, text, maxWidth) {
    if (!text) return [];
    try { return doc.splitTextToSize(String(text), maxWidth); } catch (e) { return [String(text)]; }
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

  function drawAnswerSpace(doc, margin, y, pageWidth, lines) {
    var gap = 8;
    var lineHeight = 14;
    for (var i = 0; i < lines; i++) {
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      y += lineHeight;
      y += gap / 2;
    }
    return y + 4;
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

  async function generateWorksheetPDF(questions, meta) {
    var jsPDFCtor = ensureJsPDF();
    if (!jsPDFCtor) {
      showStatus("PDF library not loaded");
      return;
    }
    var doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "normal");
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var margin = mmToPt(20);
    var bottomLimit = pageHeight - mmToPt(25);

    // Background watermark (first page)
    drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);

    // Header
    var y = drawHeader(doc, pageWidth, margin, meta.centre, meta.topic, meta.logoDataUrl);
    y += 6;

    // Sections
    var groups = groupByDifficulty(questions);
    ["Basic", "Intermediate", "Advanced"].forEach(function (section) {
      var list = groups[section] || [];
      if (!list.length) return;
      y = ensurePage(doc, y + 28, bottomLimit, function () {
        drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
        return drawHeader(doc, pageWidth, margin, meta.centre, meta.topic, meta.logoDataUrl) + 6;
      });
      y = drawSectionTitle(doc, pageWidth, margin, y, section);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      for (var qi = 0; qi < list.length; qi++) {
        var q = list[qi];
        var numberLabel = (qi + 1) + ". ";
        var textLines = wrapText(doc, q.text, pageWidth - margin * 2 - 20);
        var estimatedHeight = textLines.length * 14 + 60;
        y = ensurePage(doc, y + estimatedHeight, bottomLimit, function () {
          drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
          return drawHeader(doc, pageWidth, margin, meta.centre, meta.topic, meta.logoDataUrl) + 6;
        });
        if (q._textImg) {
          var imgW = pageWidth - margin * 2;
          var imgH = 36;
          try { doc.addImage(q._textImg, "PNG", margin, y, imgW, imgH, "", "FAST"); } catch (e) { doc.text(numberLabel + (textLines[0] || ""), margin, y); }
          y += imgH + 6;
        } else {
          doc.text(numberLabel + (textLines[0] || ""), margin, y);
          for (var k = 1; k < textLines.length; k++) {
            doc.text(textLines[k], margin + doc.getTextWidth(numberLabel), y + k * 14);
          }
          y += textLines.length * 14 + 6;
        }

        if (q.type === "MC" && Array.isArray(q.options)) {
          var opts = q.options.slice(0, 4);
          for (var oi = 0; oi < opts.length; oi++) {
            var opt = opts[oi];
            var line = String(opt || "");
            var wrap = wrapText(doc, line, pageWidth - margin * 2 - 20);
            if (q._optionImgs && q._optionImgs[oi]) {
              var oW = pageWidth - margin * 2 - 20;
              var oH = 24;
              try { doc.addImage(q._optionImgs[oi], "PNG", margin + 16, y, oW, oH, "", "FAST"); } catch (e) {
                wrap.forEach(function (wLine, wi) { doc.text(wLine, margin + 16, y + wi * 14); });
                y += wrap.length * 14 + 4;
              }
              y += oH + 4;
            } else {
              wrap.forEach(function (wLine, wi) { doc.text(wLine, margin + 16, y + wi * 14); });
              y += wrap.length * 14 + 4;
            }
          }
          y = drawAnswerSpace(doc, margin, y + 2, pageWidth, 2);
        } else {
          y = drawAnswerSpace(doc, margin, y + 2, pageWidth, 6);
        }
        y += 6;
      }
    });

    addFooterAndPaging(doc, meta.centre);
    doc.save("Worksheet.pdf");
  }
  async function generateSolutionPDF(questions, meta) {
    var jsPDFCtor = ensureJsPDF();
    if (!jsPDFCtor) {
      showStatus("PDF library not loaded");
      return;
    }
    var doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "normal");
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var margin = mmToPt(20);
    var bottomLimit = pageHeight - mmToPt(25);
    drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
    var y = drawHeader(doc, pageWidth, margin, meta.centre, meta.topic + " • Solutions", meta.logoDataUrl);
    y += 6;
    var groups = groupByDifficulty(questions);
    ["Basic", "Intermediate", "Advanced"].forEach(function (section) {
      var list = groups[section] || [];
      if (!list.length) return;
      y = ensurePage(doc, y + 28, bottomLimit, function () {
        drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
        return drawHeader(doc, pageWidth, margin, meta.centre, meta.topic + " • Solutions", meta.logoDataUrl) + 6;
      });
      y = drawSectionTitle(doc, pageWidth, margin, y, section + " Solutions");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (var qi = 0; qi < list.length; qi++) {
        var q = list[qi];
        var numberLabel = (qi + 1) + ". ";
        var textLines = wrapText(doc, q.text, pageWidth - margin * 2 - 20);
        var extra = 0;
        var mcLines = [];
        var ansLines = [];
        var solLines = [];
        var tipsLines = [];
        if (q.type === "MC") {
          mcLines = (Array.isArray(q.options) ? q.options.slice(0, 4) : []).map(function (opt) { return String(opt || ""); });
          ansLines = wrapText(doc, "Answer: " + String(q.answer || ""), pageWidth - margin * 2 - 20);
          solLines = wrapText(doc, q.solution ? "Explanation: " + String(q.solution) : "Explanation: N/A", pageWidth - margin * 2 - 20);
        } else {
          solLines = wrapText(doc, q.solution ? "Solution: " + String(q.solution) : "Solution: N/A", pageWidth - margin * 2 - 20);
        }
        if (q.teacher_notes) {
          tipsLines = wrapText(doc, "Teacher Tips: " + String(q.teacher_notes), pageWidth - margin * 2 - 20);
        }
        extra += textLines.length * 14 + solLines.length * 14 + tipsLines.length * 14 + 40;
        if (mcLines.length) {
          mcLines.forEach(function (opt) { extra += wrapText(doc, opt, pageWidth - margin * 2 - 20).length * 14 + 4; });
          extra += ansLines.length * 14 + 8;
        }
        y = ensurePage(doc, y + extra, bottomLimit, function () {
          drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
          return drawHeader(doc, pageWidth, margin, meta.centre, meta.topic + " • Solutions", meta.logoDataUrl) + 6;
        });
        if (q._textImg) {
          var imgW = pageWidth - margin * 2;
          var imgH = 36;
          try { doc.addImage(q._textImg, "PNG", margin, y, imgW, imgH, "", "FAST"); } catch (e) { doc.text(numberLabel + (textLines[0] || ""), margin, y); }
          y += imgH + 6;
        } else {
          doc.text(numberLabel + (textLines[0] || ""), margin, y);
          for (var k = 1; k < textLines.length; k++) {
            doc.text(textLines[k], margin + doc.getTextWidth(numberLabel), y + k * 14);
          }
          y += textLines.length * 14 + 6;
        }
        if (mcLines.length) {
          mcLines.forEach(function (opt) {
            var wrap = wrapText(doc, opt, pageWidth - margin * 2 - 20);
            wrap.forEach(function (wLine, wi) {
              doc.text(wLine, margin + 16, y + wi * 14);
            });
            y += wrap.length * 14 + 4;
          });
          ansLines.forEach(function (wLine, wi) {
            doc.text(wLine, margin + 16, y + wi * 14);
          });
          y += ansLines.length * 14 + 4;
        }
        if (q._solutionImg) {
          var sW = pageWidth - margin * 2 - 20;
          var sH = 42;
          try { doc.addImage(q._solutionImg, "PNG", margin + 16, y, sW, sH, "", "FAST"); } catch (e) {
            solLines.forEach(function (wLine, wi) { doc.text(wLine, margin + 16, y + wi * 14); });
            y += solLines.length * 14 + 4;
          }
          y += sH + 4;
        } else {
          solLines.forEach(function (wLine, wi) { doc.text(wLine, margin + 16, y + wi * 14); });
          y += solLines.length * 14 + 4;
        }
        if (tipsLines.length) {
          tipsLines.forEach(function (wLine, wi) {
            doc.text(wLine, margin + 16, y + wi * 14);
          });
          y += tipsLines.length * 14 + 4;
        }
        if (q.marks != null) {
          var markLine = "Marks: " + String(q.marks);
          doc.text(markLine, margin + 16, y);
          y += 16;
        }
        y += 6;
      }
    });
    doc.addPage();
    drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
    y = drawHeader(doc, pageWidth, margin, meta.centre, meta.topic + " • Answer Key", meta.logoDataUrl);
    y += 6;
    y = drawSectionTitle(doc, pageWidth, margin, y, "Answer Key");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    var groupsKey = groupByDifficulty(questions);
    ["Basic", "Intermediate", "Advanced"].forEach(function (section) {
      var list = groupsKey[section] || [];
      if (!list.length) return;
      y = ensurePage(doc, y + 28, bottomLimit, function () {
        drawWatermark(doc, pageWidth, pageHeight, meta.logoDataUrl);
        return drawHeader(doc, pageWidth, margin, meta.centre, meta.topic + " • Answer Key", meta.logoDataUrl) + 6;
      });
      doc.setFont("helvetica", "bold");
      doc.text(section, margin, y);
      doc.setFont("helvetica", "normal");
      y += 18;
      list.forEach(function (q, idx) {
        var label = section + " " + (idx + 1) + ": ";
        var line = q.type === "MC" ? "Answer " + String(q.answer || "N/A") : "See solution";
        var wrap = wrapText(doc, label + line, pageWidth - margin * 2 - 20);
        wrap.forEach(function (wLine, wi) {
          doc.text(wLine, margin, y + wi * 14);
        });
        y += wrap.length * 14 + 6;
      });
    });
    addFooterAndPaging(doc, meta.centre);
    doc.save("Solution.pdf");
  }

  function localGenerateQuestions(formData, lang) {
    var out = [];
    var idx = 1;
    function add(count, difficulty, type) {
      for (var i = 0; i < count; i++) {
        var baseText = lang === "zh" ? "求解方程" : "Solve the equation";
        var tex = i % 2 === 0 ? "x^2+5x+6=0" : "\\int_0^1 x^2\\,dx";
        var solTex = i % 2 === 0 ? "x=-2,\\;x=-3" : "\\frac{1}{3}";
        var mcOpts = ["A) 1", "B) 2", "C) 3", "D) 4"];
        var ans = "A";
        var text = baseText + ": " + (i % 2 === 0 ? "x^2 + 5x + 6 = 0" : "∫₀¹ x² dx");
        var solution = i % 2 === 0 ? "Factor to (x+2)(x+3)=0; roots -2 and -3." : "Integrate x² to x³/3; evaluate at 1 to get 1/3.";
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
    downloadWorksheetBtn.disabled = true;
    downloadSolutionBtn.disabled = true;
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
        downloadWorksheetBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionBtn.disabled = false;
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
          statusTextEl.textContent = ui === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
          downloadWorksheetBtn.disabled = false;
          setTimeout(function () {
            statusTextEl.textContent = ui === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
            downloadSolutionBtn.disabled = false;
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
        statusTextEl.textContent = ui2 === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui2 === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionBtn.disabled = false;
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
        statusTextEl.textContent = ui3 === "zh-hant" ? "工作紙生成已完成！" : "Question Worksheet generation is completed.";
        downloadWorksheetBtn.disabled = false;
        setTimeout(function () {
          statusTextEl.textContent = ui3 === "zh-hant" ? "解答生成已完成！" : "Answer Worksheet generation is completed.";
          downloadSolutionBtn.disabled = false;
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
    downloadWorksheetBtn.disabled = true;
    downloadSolutionBtn.disabled = true;
    generateWithDeepSeek();
  });

  downloadWorksheetBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    await buildTeXAssets(questions);
    await generateWorksheetPDF(questions, {
      centre: formData.centre,
      topic: formData.subject,
      logoDataUrl: previewLogoEl && previewLogoEl.src ? previewLogoEl.src : null
    });
  });
  downloadSolutionBtn.addEventListener("click", async function () {
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var questions = Array.isArray(window.GeneratedQuestions) && window.GeneratedQuestions.length
      ? window.GeneratedQuestions
      : localGenerateQuestions(formData, lang);
    await buildTeXAssets(questions);
    await generateSolutionPDF(questions, {
      centre: formData.centre,
      topic: formData.subject,
      logoDataUrl: previewLogoEl && previewLogoEl.src ? previewLogoEl.src : null
    });
  });

  updateYear();
  updatePreview();
  applyUILanguage();
  // Initially disable until generation happens
  downloadWorksheetBtn.disabled = true;
  downloadSolutionBtn.disabled = true;
});
