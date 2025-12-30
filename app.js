document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  var form = document.getElementById("worksheetForm");
  var subjectEl = document.getElementById("subject");
  var centreEl = document.getElementById("centreName");
  var logoEl = document.getElementById("logo");
  var logoPreviewEl = document.getElementById("logoPreview");
  var previewLogoEl = document.getElementById("previewLogo");
  var mcEl = document.getElementById("qtMC");
  var longEl = document.getElementById("qtLong");
  var basicEl = document.getElementById("basicCount");
  var interEl = document.getElementById("intermediateCount");
  var advEl = document.getElementById("advancedCount");
  var notesEl = document.getElementById("notes");
  var apiKeyEl = document.getElementById("apiKey");
  var previewCentreEl = document.getElementById("previewCentre");
  var previewTopicEl = document.getElementById("previewTopic");
  var previewTagsEl = document.getElementById("previewTags");
  var previewDistroEl = document.getElementById("previewDistro");
  var previewNotesEl = document.getElementById("previewNotes");
  var statusBarEl = document.getElementById("statusBar");
  var statusTextEl = document.getElementById("statusText");
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

    var tags = [];
    if (mcEl.checked) tags.push("Multiple Choice");
    if (longEl.checked) tags.push("Long Answer");
    previewTagsEl.innerHTML = "";
    tags.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = t;
      previewTagsEl.appendChild(chip);
    });

    previewDistroEl.innerHTML = "";
    var distro = [
      { label: "Basic", value: Number(basicEl.value || 0) },
      { label: "Intermediate", value: Number(interEl.value || 0) },
      { label: "Advanced", value: Number(advEl.value || 0) }
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
    var hasType = mcEl.checked || longEl.checked;
    generateBtn.disabled = !(hasSubject && hasCentre && hasType);
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
    var types = formData.types;
    var counts = formData.counts;
    ["basic", "intermediate", "advanced"].forEach(function (levelKey, idxLevel) {
      var diffName = ["Basic", "Intermediate", "Advanced"][idxLevel];
      var c = Number(counts[levelKey] || 0);
      if (!c) return;
      if (types.mc && types.long) {
        var a = Math.floor(c / 2);
        var b = c - a;
        add(a, diffName, "MC");
        add(b, diffName, "Long");
      } else if (types.mc) {
        add(c, diffName, "MC");
      } else if (types.long) {
        add(c, diffName, "Long");
      }
    });
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
        var numberLabel = (idx + 1) + ". ";
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
        var numberLabel = (idx + 1) + ". ";
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
          teacher_notes: lang === "zh" ? "提示：注意基础因式分解与定积分基础。" : "Tip: Emphasize factoring basics and definite integral evaluation."
        });
      }
    }
    var types = formData.types;
    var counts = formData.counts;
    ["basic", "intermediate", "advanced"].forEach(function (levelKey, idxLevel) {
      var diffName = ["Basic", "Intermediate", "Advanced"][idxLevel];
      var c = Number(counts[levelKey] || 0);
      if (!c) return;
      if (types.mc && types.long) {
        var a = Math.floor(c / 2);
        var b = c - a;
        add(a, diffName, "MC");
        add(b, diffName, "Long");
      } else if (types.mc) {
        add(c, diffName, "MC");
      } else if (types.long) {
        add(c, diffName, "Long");
      }
    });
    return out;
  }

  async function buildTeXAssets(questions) {
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      if (q.textTeX) {
        try { q._textImg = await texToPng(q.textTeX); } catch (e) {}
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
      if (q.solutionTeX) {
        try { q._solutionImg = await texToPng(q.solutionTeX); } catch (e) {}
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
    var t = String(text || "");
    if (/[\u4e00-\u9fff]/.test(t)) return "zh";
    if (/Chinese/i.test(t)) return "zh";
    return "en";
  }

  function buildPlan(types, counts) {
    var selected = [];
    if (types.mc) selected.push("MC");
    if (types.long) selected.push("Long");
    var plan = [];
    ["Basic", "Intermediate", "Advanced"].forEach(function (level) {
      var c = Number(counts[level.toLowerCase()] || 0);
      if (!c) return;
      if (selected.length === 1) {
        plan.push({ difficulty: level, type: selected[0], count: c });
      } else if (selected.length === 2) {
        var a = Math.floor(c / 2);
        var b = c - a;
        plan.push({ difficulty: level, type: "MC", count: a });
        plan.push({ difficulty: level, type: "Long", count: b });
      }
    });
    return plan;
  }

  function buildPrompt(subject, topic, notes, language, plan) {
    var lines = [];
    lines.push("Role: Expert education content writer.");
    lines.push("Language: " + (language === "zh" ? "Chinese" : "English") + ".");
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
      types: { mc: mcEl.checked, long: longEl.checked },
      counts: {
        basic: Number(basicEl.value || 0),
        intermediate: Number(interEl.value || 0),
        advanced: Number(advEl.value || 0)
      },
      notes: notesEl.value || ""
    };
  }

  function generateWithDeepSeek() {
    var apiKey = getApiKey();
    if (!apiKey) {
      var formDataNoKey = collectForm();
      var langNoKey = detectLanguage(formDataNoKey.subject + " " + formDataNoKey.notes);
      var localQsNoKey = localGenerateQuestions(formDataNoKey, langNoKey);
      window.GeneratedQuestions = localQsNoKey;
      statusTextEl.textContent = "Generated " + localQsNoKey.length + " local questions";
      setTimeout(hideStatus, 1200);
      return;
    }
    var formData = collectForm();
    var lang = detectLanguage(formData.subject + " " + formData.notes);
    var plan = buildPlan(formData.types, formData.counts);
    if (!plan.length) {
      showStatus("No questions requested");
      return;
    }
    var prompt = buildPrompt(formData.subject, formData.subject, formData.notes, lang, plan);
    showStatus("Generating questions...");
    generateBtn.disabled = true;
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve({ timeout: true }); }, 8000);
    });
    Promise.race([deepseekRequest(prompt, apiKey), timeout]).then(function (res) {
      if (res && res.timeout) {
        var localQs = localGenerateQuestions(formData, lang);
        window.GeneratedQuestions = localQs;
        statusTextEl.textContent = "Generated " + localQs.length + " local questions";
        return;
      }
      var questions = parseQuestions(res);
      if (!questions.length) {
        var localQs2 = localGenerateQuestions(formData, lang);
        window.GeneratedQuestions = localQs2;
        statusTextEl.textContent = "Generated " + localQs2.length + " local questions";
      } else {
        window.GeneratedQuestions = questions;
        statusTextEl.textContent = "Generated " + questions.length + " questions";
      }
      setTimeout(hideStatus, 1200);
    }).catch(function (err) {
      var localQs3 = localGenerateQuestions(formData, lang);
      window.GeneratedQuestions = localQs3;
      statusTextEl.textContent = "Generated " + localQs3.length + " local questions";
    }).finally(function () {
      generateBtn.disabled = false;
    });
  }

  subjectEl.addEventListener("input", updatePreview);
  centreEl.addEventListener("input", updatePreview);
  mcEl.addEventListener("change", updatePreview);
  longEl.addEventListener("change", updatePreview);
  basicEl.addEventListener("input", updatePreview);
  interEl.addEventListener("input", updatePreview);
  advEl.addEventListener("input", updatePreview);
  notesEl.addEventListener("input", updatePreview);
  logoEl.addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    handleLogoUpload(file);
  });

  generateBtn.addEventListener("click", function () {
    if (generateBtn.disabled) return;
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
});
