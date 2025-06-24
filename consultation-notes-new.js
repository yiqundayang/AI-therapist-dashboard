// 咨询笔记页面功能 - iPad优化版本
class ConsultationNotesNew {
  constructor() {
    // 基础状态
    this.isRecording = false;
    this.startTime = null;
    this.timerInterval = null;
    this.transcriptMessages = [];
    
    // 画布相关
    this.notebookCanvas = null;
    this.notebookCtx = null;
    this.pureCanvas = null;
    this.pureCtx = null;
    this.currentTool = 'pen';
    this.currentColor = '#000000';
    this.currentSize = 3;
    this.isDrawing = false;
    this.lastPoint = { x: 0, y: 0 };
    this.canvasHistory = [];
    this.historyIndex = -1;
    
    // UI状态
    this.isAiAssistantOpen = false;
    this.isTranscriptOpen = false;
    this.selectedDuration = 60;
    this.currentNoteMode = 'text'; // 'text', 'drawing'
    
    // 正念冥想相关
    this.meditationTimer = null;
    this.meditationDuration = 0;
    this.meditationElapsed = 0;
    this.isPlaying = false;
    
    // AI助手拖拽相关
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    
    // 模态窗口
    this.pureCanvasModal = document.getElementById('pureCanvasModal');
    this.meditationModal = document.getElementById('meditationModal');
    this.checkoutModal = document.getElementById('checkoutModal');
    
    // 咨询工具按钮
    this.pureCanvasBtn = document.getElementById('pureCanvasBtn');
    this.meditationBtn = document.getElementById('meditationBtn');
    this.sandboxBtn = document.getElementById('sandboxBtn');
    this.endConsultationBtn = document.getElementById('endConsultationBtn');
    
    // 画板相关
    this.saveCanvasBtn = document.getElementById('saveCanvasBtn');
    this.hasCanvasContent = false;
    
    // 计时器
    this.sessionTimer = document.getElementById('sessionTimer');
    
    // 逐字稿标记状态
    this.isMarkingMode = false;
    this.markedMessages = [];
    this.transcriptPaused = false;
    this.pendingMessages = [];
    
    // 逐字稿滚动控制
    this.isUserScrolling = false;
    this.userScrollTimeout = null;
    this.autoScrollEnabled = true;
    
    // 当前被选中的消息
    this.currentSelectedMessage = null;
    
    this.initializeElements();
    this.initializeCanvas();
    this.initializeEventListeners();
    this.loadConsultationInfo();
    this.startTimer();
    this.simulateAiObservations();
    this.switchNoteMode('text'); // 设置初始模式
    
    // 调试信息
    setTimeout(() => {
      this.debugPageStatus();
    }, 1000);
  }

  initializeElements() {
    // 画布元素
    this.notebookCanvas = document.getElementById('notebookCanvas');
    this.pureCanvas = document.getElementById('pureCanvas');
    
    // 笔记本文本框
    this.notebookTextarea = document.getElementById('notebookTextarea');
    
    // 控制按钮
    this.transcriptBtn = document.getElementById('transcriptBtn');
    
    // AI助手元素
    this.aiAssistantPanel = document.getElementById('aiAssistantPanel');
    this.assistantHeader = document.getElementById('assistantHeader');
    this.assistantToggle = document.getElementById('assistantToggle');
    this.observationTitle = document.getElementById('observationTitle');
    this.statusTag = document.getElementById('statusTag');
    
    // 逐字稿元素
    this.transcriptPanel = document.getElementById('transcriptPanel');
    this.transcriptContent = document.querySelector('.transcript-content');
    this.transcriptStream = document.getElementById('transcriptStream');
    this.quickMarkBtn = document.getElementById('quickMarkBtn');
    this.endMarkBtn = document.getElementById('endMarkBtn');
    this.scrollIndicator = document.getElementById('scrollIndicator');
    
    // 咨询工具按钮
    this.sandboxBtn = document.getElementById('sandboxBtn');
    
    console.log('元素初始化完成:', {
      notebookTextarea: this.notebookTextarea,
      notebookCanvas: this.notebookCanvas
    });
  }

  initializeCanvas() {
    // 初始化笔记本画布
    this.initNotebookCanvas();
    
    // 初始化纯画板画布
    this.initPureCanvas();
  }

  initNotebookCanvas() {
    if (!this.notebookCanvas) return;
    
    this.notebookCtx = this.notebookCanvas.getContext('2d');
    this.resizeNotebookCanvas();
    
    // 设置画布样式
    this.notebookCtx.lineCap = 'round';
    this.notebookCtx.lineJoin = 'round';
    this.notebookCtx.strokeStyle = this.currentColor;
    this.notebookCtx.lineWidth = this.currentSize;
    
    // 保存初始状态
    this.saveCanvasState();
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      this.resizeNotebookCanvas();
    });
  }

  initPureCanvas() {
    if (!this.pureCanvas) return;
    
    this.pureCtx = this.pureCanvas.getContext('2d');
    this.resizePureCanvas();
    
    // 设置画布样式
    this.pureCtx.lineCap = 'round';
    this.pureCtx.lineJoin = 'round';
    this.pureCtx.strokeStyle = this.currentColor;
    this.pureCtx.lineWidth = this.currentSize;
  }

  resizeNotebookCanvas() {
    const rect = this.notebookCanvas.parentElement.getBoundingClientRect();
    
    // 保存当前画布内容
    const imageData = this.notebookCtx ? this.notebookCtx.getImageData(0, 0, this.notebookCanvas.width, this.notebookCanvas.height) : null;
    
    // 设置画布尺寸
    this.notebookCanvas.width = rect.width;
    this.notebookCanvas.height = rect.height;
    
    // 恢复画布内容
    if (imageData) {
      this.notebookCtx.putImageData(imageData, 0, 0);
    }
    
    // 重新设置绘图属性
    this.setCanvasStyle(this.notebookCtx);
  }

  resizePureCanvas() {
    if (!this.pureCanvas || !this.pureCanvas.parentElement) return;
    
    // 获取容器的实际尺寸
    const container = this.pureCanvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // 计算头部和工具栏的高度
    const header = document.querySelector('.canvas-header');
    const toolbar = document.querySelector('.canvas-toolbar');
    const headerHeight = header ? header.offsetHeight : 60;
    const toolbarHeight = toolbar ? toolbar.offsetHeight : 60;
    
    // 设置画布尺寸，确保不超出容器
    const canvasWidth = containerRect.width;
    const canvasHeight = Math.max(200, containerRect.height - headerHeight - toolbarHeight);
    
    // 保存当前画布内容（如果有的话）
    let imageData = null;
    if (this.pureCtx && this.hasCanvasContent) {
      try {
        imageData = this.pureCtx.getImageData(0, 0, this.pureCanvas.width, this.pureCanvas.height);
      } catch (e) {
        console.log('无法获取画布数据:', e);
      }
    }
    
    // 设置画布尺寸
    this.pureCanvas.width = canvasWidth;
    this.pureCanvas.height = canvasHeight;
    
    // 恢复画布内容
    if (imageData) {
      try {
        this.pureCtx.putImageData(imageData, 0, 0);
      } catch (e) {
        console.log('无法恢复画布数据:', e);
      }
    }
    
    // 重新设置绘图属性
    this.setCanvasStyle(this.pureCtx);
    
    console.log(`画布尺寸已调整: ${canvasWidth}x${canvasHeight}`);
  }

  setCanvasStyle(ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.currentColor;
    ctx.lineWidth = this.currentSize;
  }

  initializeEventListeners() {
    // 控制按钮事件
    this.transcriptBtn?.addEventListener('click', () => this.toggleTranscript());
    
    // AI助手面板控制
    this.assistantToggle?.addEventListener('click', () => this.toggleAssistantPanel());
    this.assistantHeader?.addEventListener('click', () => this.toggleAssistantPanel());
    
    // 收起状态下点击观察内容也能展开
    const sectionInfo = document.querySelector('.section-info');
    sectionInfo?.addEventListener('click', () => {
      if (this.aiAssistantPanel?.classList.contains('collapsed')) {
        this.toggleAssistantPanel();
      }
    });
    
    // 笔记模式切换
    const noteModeToolbar = document.querySelector('.note-mode-toolbar');
    noteModeToolbar?.addEventListener('click', (e) => {
      const button = e.target.closest('.mode-btn');
      if (button) {
        const mode = button.dataset.mode;
        this.switchNoteMode(mode);
      }
    });
    
    // 咨询工具事件
    this.pureCanvasBtn?.addEventListener('click', () => this.openPureCanvas());
    this.meditationBtn?.addEventListener('click', () => this.openMeditation());
    this.sandboxBtn?.addEventListener('click', () => this.openSandbox());
    this.endConsultationBtn?.addEventListener('click', () => this.showCheckoutModal());
    
    // 逐字稿滚动事件监听
    this.setupTranscriptScrollEvents();
    
    // 全局点击事件监听（用于取消选择）
    document.addEventListener('click', (e) => this.handleGlobalClick(e));
    
    // 模态窗口关闭
    this.setupModalEvents();
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  setupCanvasEvents(canvas, ctx) {
    if (!canvas || !ctx) return;
    
    // 鼠标事件
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e, ctx, canvas));
    canvas.addEventListener('mousemove', (e) => this.draw(e, ctx, canvas));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // 触摸事件 (iPad支持)
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.startDrawing(mouseEvent, ctx, canvas);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.draw(mouseEvent, ctx, canvas);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing();
    });
  }

  startDrawing(e, ctx, canvas) {
    // 在开始绘画前检查模式
    if (this.currentNoteMode !== 'drawing') return;
    
    this.isDrawing = true;
    this.hasCanvasContent = true;
    
    const targetCanvas = canvas || e.target;
    if (!targetCanvas) return;
    
    const rect = targetCanvas.getBoundingClientRect();
    this.lastPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // 设置绘图模式
    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = this.currentSize * 3;
    } else if (this.currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.currentSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.currentSize;
    }
  }

  draw(e, ctx, canvas) {
    if (!this.isDrawing) return;
    
    const targetCanvas = canvas || e.target;
    if (!targetCanvas) return;
    
    const rect = targetCanvas.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    ctx.beginPath();
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    this.lastPoint = currentPoint;
    
    // 如果是在纯画板上绘图，标记有内容
    if (ctx === this.pureCtx) {
      this.hasCanvasContent = true;
    }
  }

  stopDrawing() {
    this.isDrawing = false;
    this.saveCanvasState();
  }

  selectTool(tool) {
    this.currentTool = tool;
    
    // 更新工具按钮状态
    this.drawingTools.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
    
    // 更新光标
    const cursor = {
      'pen': 'crosshair',
      'eraser': 'grab',
      'highlighter': 'crosshair'
    }[tool] || 'default';
    
    if (this.notebookCanvas) this.notebookCanvas.style.cursor = cursor;
    if (this.pureCanvas) this.pureCanvas.style.cursor = cursor;
  }

  selectColor(color) {
    this.currentColor = color;
    
    // 更新颜色按钮状态
    this.colorBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-color="${color}"]`)?.classList.add('active');
    
    // 更新画布颜色
    if (this.notebookCtx) this.notebookCtx.strokeStyle = color;
    if (this.pureCtx) this.pureCtx.strokeStyle = color;
  }

  // 画布状态保存和恢复
  saveCanvasState() {
    if (!this.notebookCanvas) return;
    
    this.historyIndex++;
    if (this.historyIndex < this.canvasHistory.length) {
      this.canvasHistory.length = this.historyIndex;
    }
    this.canvasHistory.push(this.notebookCanvas.toDataURL());
  }

  setupActionTools() {
    document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clearCanvas());
    document.getElementById('saveBtn')?.addEventListener('click', () => this.saveNotes());
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreCanvasState();
    }
  }

  redo() {
    if (this.historyIndex < this.canvasHistory.length - 1) {
      this.historyIndex++;
      this.restoreCanvasState();
    }
  }

  restoreCanvasState() {
    if (!this.notebookCanvas || !this.canvasHistory[this.historyIndex]) return;
    
    const img = new Image();
    img.onload = () => {
      this.notebookCtx.clearRect(0, 0, this.notebookCanvas.width, this.notebookCanvas.height);
      this.notebookCtx.drawImage(img, 0, 0);
    };
    img.src = this.canvasHistory[this.historyIndex];
  }

  clearCanvas() {
    if (confirm('确定要清空画布吗？')) {
      this.notebookCtx?.clearRect(0, 0, this.notebookCanvas.width, this.notebookCanvas.height);
      this.saveCanvasState();
    }
  }

  // UI控制方法
  toggleAssistantPanel() {
    const isCollapsed = this.aiAssistantPanel?.classList.contains('collapsed');
    
    if (isCollapsed) {
      this.aiAssistantPanel?.classList.remove('collapsed');
      this.assistantToggle.textContent = '−';
    } else {
      this.aiAssistantPanel?.classList.add('collapsed');
      this.assistantToggle.textContent = '+';
    }
  }

  toggleTranscript() {
    this.isTranscriptOpen = !this.isTranscriptOpen;
    
    if (this.isTranscriptOpen) {
      this.transcriptPanel?.classList.add('show');
      this.transcriptBtn?.classList.add('active');
      
      // 开始逐字稿显示
      if (!this.isRecording) {
        this.startTranscriptDisplay();
      }
    } else {
      this.transcriptPanel?.classList.remove('show');
      this.transcriptBtn?.classList.remove('active');
    }
  }

  // 逐字稿功能
  loadHistoricalTranscript() {
    // 预加载的历史逐字稿内容
    const historicalMessages = [
      { speaker: '咨询师', content: '欢迎您来到今天的咨询，请先让我们回顾一下上次咨询的内容。', time: this.getHistoricalTime(-15) },
      { speaker: '来访者', content: '好的，上次我们主要谈到了我的睡眠问题和工作压力。', time: this.getHistoricalTime(-14) },
      { speaker: '咨询师', content: '是的，您提到最近几个月睡眠质量下降，主要是入睡困难。这周情况如何？', time: this.getHistoricalTime(-13) },
      { speaker: '来访者', content: '这周稍微好一些了，按照您建议的睡前放松练习，确实有帮助。但是我发现一个问题，就是当我白天工作压力特别大的时候，晚上即使做了放松练习，脑子里还是会不停地想工作的事情，想着明天要做什么，担心项目能不能按时完成，担心老板会不会不满意我的工作表现。有时候躺在床上两三个小时都睡不着，越想越焦虑，越焦虑越睡不着，形成了一个恶性循环。', time: this.getHistoricalTime(-12) },
      { speaker: '咨询师', content: '很好，看来放松技巧对您是有效的。那工作方面的压力呢？', time: this.getHistoricalTime(-11) },
      { speaker: '来访者', content: '工作压力还是比较大，特别是这个月有几个重要项目要完成。', time: this.getHistoricalTime(-10) },
      { speaker: '咨询师', content: '我理解。让我们今天重点探讨一下如何更好地管理工作压力。', time: this.getHistoricalTime(-9) }
    ];
    
    // 添加历史消息到逐字稿流
    historicalMessages.forEach(message => {
      this.addHistoricalMessage(message);
      this.transcriptMessages.push(message);
    });
    
    // 添加分隔线表示实时内容开始
    this.addTimeSeparator();
    
    // 滚动到底部，准备显示实时内容
    if (this.transcriptContent) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
      console.log('历史消息加载完成 - 滚动到底部，滚动位置:', this.transcriptContent.scrollTop, '总高度:', this.transcriptContent.scrollHeight);
    }
    
    console.log('已加载历史逐字稿内容，准备开始实时流式显示');
  }

  getHistoricalTime(minutesAgo) {
    const now = new Date();
    const historicalTime = new Date(now.getTime() + minutesAgo * 60000);
    return historicalTime.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  addHistoricalMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message historical';
    
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content">${message.content}</div>
      <div class="message-time">[${message.time}]</div>
    `;
    
    // 为历史消息也添加点击事件
    messageElement.style.cursor = 'pointer';
    messageElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleMessageClick(messageElement);
    });
    
    // 添加悬停效果
    messageElement.addEventListener('mouseenter', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '#f0f9ff';
      }
    });
    
    messageElement.addEventListener('mouseleave', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '';
      }
    });
    
    this.transcriptStream?.appendChild(messageElement);
  }

  addTimeSeparator() {
    const separator = document.createElement('div');
    separator.className = 'time-separator';
    separator.style.cssText = `
      display: flex;
      align-items: center;
      margin: 20px 0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
    `;
    
    separator.innerHTML = `
      <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
      <div style="padding: 0 16px; background: white;">实时逐字稿开始</div>
      <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
    `;
    
    this.transcriptStream?.appendChild(separator);
  }

  startTranscriptDisplay() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.simulateTranscription();
      
      // 初始化滚动指示器
      this.updateScrollIndicator('auto-scrolling', '自动跟随');
      
      console.log('开始显示逐字稿');
    }
  }

  resumeTranscriptWithCatchup() {
    // 处理暂停期间积累的消息
    if (this.pendingMessages.length > 0) {
      let index = 0;
      const catchupInterval = setInterval(() => {
        if (index < this.pendingMessages.length) {
          // 追赶时使用快速打字效果
          this.addTranscriptMessageWithFastTyping(this.pendingMessages[index]);
          index++;
        } else {
          clearInterval(catchupInterval);
          this.pendingMessages = [];
          // 恢复正常速度的逐字稿
          this.simulateTranscription();
        }
      }, 300); // 追赶速度：每0.3秒一条
    } else {
      // 直接恢复正常逐字稿
      this.simulateTranscription();
    }
  }

  addTranscriptMessageWithFastTyping(message) {
    // 创建消息容器
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message typing';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content"></div>
      <div class="message-time">[${time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 获取内容容器
    const contentElement = messageElement.querySelector('.message-content');
    
    // 开始快速打字效果（追赶模式）
    this.typeMessage(contentElement, message.content, () => {
      // 打字完成后的回调
      messageElement.classList.remove('typing');
      
      // 如果在标记模式下，为新消息添加点击事件
      if (this.isMarkingMode) {
        this.addClickEventToMessage(messageElement);
      }
    }, 20); // 快速打字：每个字符20ms
    
    // 自动滚动到底部
    if (this.transcriptContent) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
  }

  addMarkedToNotes() {
    if (this.markedMessages.length === 0) {
      // 显示温和的提示而不是alert
      this.showToast('没有标记的内容', 'warning');
      return;
    }
    
    // 由于标记已经自动添加到笔记，这里只需要显示提示
    this.showToast(`所有 ${this.markedMessages.length} 条标记内容已在笔记中`, 'info');
    
    // 可选：重新绘制所有内容以确保同步
    this.redrawAllMarkedContent();
  }

  drawMarkedContentOnCanvas() {
    if (!this.notebookCtx) return;
    
    const ctx = this.notebookCtx;
    const startY = 50;
    let currentY = startY;
    
    ctx.save();
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    
    // 添加标题
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('逐字稿标记内容:', 80, currentY);
    currentY += 30;
    
    this.markedMessages.forEach((msg, index) => {
      // 绘制分隔线
      if (index > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, currentY);
        ctx.lineTo(this.notebookCanvas.width - 80, currentY);
        ctx.stroke();
        currentY += 20;
      }
      
      // 绘制说话人和时间
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
      const headerText = `${msg.speaker} ${msg.time}${msg.isPartial ? ' [部分标记]' : ''}`;
      ctx.fillText(headerText, 80, currentY);
      currentY += 20;
      
      // 绘制内容
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      
      // 如果是部分标记，显示选中的文本和上下文
      let contentToDisplay = msg.content;
      if (msg.isPartial && msg.fullContent) {
        // 找到选中文本在完整内容中的位置
        const index = msg.fullContent.indexOf(msg.content);
        if (index !== -1) {
          const before = msg.fullContent.substring(0, index);
          const after = msg.fullContent.substring(index + msg.content.length);
          
          // 显示上下文（前后各20个字符）
          const contextBefore = before.length > 20 ? '...' + before.slice(-20) : before;
          const contextAfter = after.length > 20 ? after.slice(0, 20) + '...' : after;
          
          contentToDisplay = `${contextBefore}【${msg.content}】${contextAfter}`;
        }
      }
      
      const words = contentToDisplay.split('');
      let line = '';
      const maxWidth = this.notebookCanvas.width - 160;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 80, currentY);
          line = words[i];
          currentY += 20;
        } else {
          line = testLine;
        }
      }
      
      if (line !== '') {
        ctx.fillText(line, 80, currentY);
        currentY += 20;
      }
      
      // 绘制标签
      if (msg.emotionTags.length > 0 || msg.textTags.length > 0 || msg.customTags.length > 0) {
        currentY += 5;
        ctx.fillStyle = '#64748b';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        
        let tagsText = '标签: ';
        if (msg.emotionTags.length > 0) {
          tagsText += msg.emotionTags.join(' ') + ' ';
        }
        if (msg.textTags.length > 0) {
          tagsText += msg.textTags.join(', ') + ' ';
        }
        if (msg.customTags.length > 0) {
          tagsText += msg.customTags.join(', ');
        }
        
        ctx.fillText(tagsText, 80, currentY);
        currentY += 25;
      } else {
        currentY += 15;
      }
    });
    
    ctx.restore();
    this.saveCanvasState();
  }

  clearAllMarks() {
    this.markedMessages.forEach(msg => {
      this.unmarkMessage(msg.element);
    });
    this.markedMessages = [];
    this.addToNotesBtn.style.display = 'none';
  }

  simulateTranscription() {
    if (!this.isRecording) return;
    
    const messages = [
      { speaker: '咨询师', content: '今天我们继续探讨您的睡眠状况，最近有什么变化吗？' },
      { speaker: '来访者', content: '还是不太好，晚上总是很难入睡，脑子里想很多事情。' },
      { speaker: '咨询师', content: '我注意到您提到脑子里想很多事情，能具体说说都在想些什么吗？' },
      { speaker: '来访者', content: '主要是工作上的事情，还有家里的一些矛盾，感觉压力很大。' },
      { speaker: '咨询师', content: '听起来您承受了很多压力，这些压力是从什么时候开始变得明显的？' },
      { speaker: '来访者', content: '大概是两个月前吧，工作变得特别忙，家里老人身体也不好。' },
      { speaker: '咨询师', content: '两个月前确实是一个转折点，我们来一起探讨一下应对压力的方法。' },
      { speaker: '来访者', content: '好的，我很想学会怎么处理这些压力。' },
      { speaker: '咨询师', content: '我们可以从认知层面开始，您觉得这些压力中哪些是可以控制的？' },
      { speaker: '来访者', content: '嗯...工作上的事情我觉得还是有一些可以调整的空间的。' },
      { speaker: '咨询师', content: '很好，这是一个很重要的认识。那家庭方面呢？' },
      { speaker: '来访者', content: '家里的事情...我觉得我能做的就是多陪陪老人，但工作太忙了。' },
      { speaker: '咨询师', content: '我理解您的两难处境。让我们先从工作压力开始，您能描述一下具体是什么让您感到压力吗？' },
      { speaker: '来访者', content: '主要是项目的截止日期，还有和同事的沟通问题，有时候感觉很孤立。' },
      { speaker: '咨询师', content: '孤立感确实会加重压力。您在工作中有没有可以信任的同事或朋友？' },
      { speaker: '来访者', content: '有一两个吧，但大家都很忙，不太好意思总是麻烦别人。' },
      { speaker: '咨询师', content: '这种想法很常见，但适当的求助其实是健康的人际交往方式。' },
      { speaker: '来访者', content: '是吗？我一直觉得应该自己解决问题，不想给别人添麻烦。' },
      { speaker: '咨询师', content: '这种自立的态度很好，但过度的自立可能会让我们错过很多支持和帮助。' },
      { speaker: '来访者', content: '您说得对，我确实很少主动寻求帮助，总觉得这样显得自己很无能。' },
      { speaker: '咨询师', content: '这种感受很常见，很多人都有这样的想法。让我们来探讨一下这种想法的来源。' },
      { speaker: '来访者', content: '可能从小就被教育要独立，要自己解决问题，不要依赖别人。' },
      { speaker: '咨询师', content: '这种教育方式有它的价值，但也可能让我们过度苛求自己。您觉得呢？' },
      { speaker: '来访者', content: '确实是这样，我总是对自己要求很高，做不好就会很自责。' },
      { speaker: '咨询师', content: '自我要求高是好事，但过度的自责可能会影响我们的心理健康。' },
      { speaker: '来访者', content: '那我应该怎么调整这种想法呢？' },
      { speaker: '咨询师', content: '我们可以尝试一些认知重构的技巧，比如质疑这些负面想法的合理性。' },
      { speaker: '来访者', content: '听起来很有用，您能具体说说怎么做吗？' },
      { speaker: '咨询师', content: '当然。比如当您觉得"我很无能"时，可以问自己：这个想法有什么证据支持吗？' },
      { speaker: '来访者', content: '嗯，这样想想，其实我在工作上还是有一些成就的。' }
    ];
    
    // 使用循环索引，让消息可以循环播放
    const currentIndex = this.transcriptMessages.length % messages.length;
    const currentMessage = messages[currentIndex];
    
    // 说话间隔时间：咨询师思考时间较短，来访者思考时间较长
    const pauseTime = currentMessage.speaker === '咨询师' ? 
      Math.random() * 1000 + 800 : // 咨询师：0.8-1.8秒思考时间
      Math.random() * 2000 + 1500; // 来访者：1.5-3.5秒思考时间
    
    console.log(`准备播放: ${currentMessage.speaker} - "${currentMessage.content}" (暂停${Math.round(pauseTime)}ms)`);
    
    setTimeout(() => {
      if (this.isRecording) {
        const message = messages[this.transcriptMessages.length % messages.length];
        
        if (this.transcriptPaused) {
          // 如果暂停了，将消息添加到待处理队列
          this.pendingMessages.push(message);
        } else {
          // 开始流式显示消息
          this.addTranscriptMessageWithTyping(message);
        }
        
        this.transcriptMessages.push(message);
        this.simulateTranscription();
      }
    }, pauseTime);
  }

  addTranscriptMessageWithTyping(message) {
    // 创建消息容器
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message typing';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content"></div>
      <div class="message-time">[${time}]</div>
    `;
    
    // 为消息添加点击事件
    messageElement.style.cursor = 'pointer';
    messageElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleMessageClick(messageElement);
    });
    
    // 添加悬停效果
    messageElement.addEventListener('mouseenter', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '#f0f9ff';
      }
    });
    
    messageElement.addEventListener('mouseleave', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '';
      }
    });
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 立即滚动到新消息（除非用户正在滚动）
    if (this.transcriptContent && !this.isUserScrolling) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
    
    // 获取内容容器
    const contentElement = messageElement.querySelector('.message-content');
    
    // 开始打字效果
    this.typeMessage(contentElement, message.content, () => {
      // 打字完成后的回调
      messageElement.classList.remove('typing');
      
      // 打字完成后再次确保滚动到底部（除非用户正在滚动）
      if (this.transcriptContent && !this.isUserScrolling) {
        this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
      }
    });
  }

  addClickEventToMessage(messageElement) {
    messageElement.style.cursor = 'pointer';
    messageElement.style.transition = 'background-color 0.2s ease';
    
    // 添加点击事件
    messageElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleMessageClick(messageElement);
    });
    
    // 添加悬停效果
    messageElement.addEventListener('mouseenter', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '#f0f9ff';
      }
    });
    
    messageElement.addEventListener('mouseleave', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.classList.contains('selected')) {
        messageElement.style.backgroundColor = '';
      }
    });
  }

  formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  // AI观察模拟
  simulateAiObservations() {
    const observations = [
      {
        type: 'emotion',
        title: '情感观察',
        status: 'attention',
        text: '注意到来访者在谈到家庭关系时语速变慢，可能触及敏感话题。',
        suggestion: '建议使用反映技术："我感觉到你在说这个话题时有些不太一样的感受？"'
      },
      {
        type: 'behavior',
        title: '行为分析',
        status: 'attention',
        text: '来访者身体前倾，显示出积极的参与度。',
        suggestion: '这是建立治疗关系的好时机，可以深入探索。'
      },
      {
        type: 'pattern',
        title: '模式识别',
        status: 'warning',
        text: '发现来访者反复提到"压力"和"焦虑"，这可能是核心议题。',
        suggestion: '建议探索压力的具体来源和应对方式。'
      },
      {
        type: 'risk',
        title: '风险评估',
        status: 'alert',
        text: '来访者提到"感觉没有希望"，需要关注自伤风险。',
        suggestion: '立即进行自伤风险评估，询问具体的自伤想法。'
      },
      {
        type: 'progress',
        title: '治疗进展',
        status: 'attention',
        text: '来访者开始主动分享内心感受，治疗关系有所改善。',
        suggestion: '继续保持当前的治疗节奏，鼓励更多的自我表达。'
      },
      {
        type: 'resistance',
        title: '阻抗分析',
        status: 'warning',
        text: '来访者频繁转移话题，可能在回避某些重要内容。',
        suggestion: '温和地指出这一模式，探索回避的原因。'
      }
    ];
    
    // 随机更新AI观察
    setInterval(() => {
      if (this.isAiAssistantOpen) {
        const randomObservation = observations[Math.floor(Math.random() * observations.length)];
        this.updateAiObservation(randomObservation);
      }
    }, 15000); // 每15秒更新一次
  }

  updateAiObservation(observation) {
    // 更新标题
    if (this.observationTitle) {
      this.observationTitle.textContent = observation.title;
    }
    
    // 更新状态标签
    if (this.statusTag) {
      this.statusTag.textContent = this.getStatusText(observation.status);
      this.statusTag.className = `status-tag ${observation.status}`;
    }
    
    // 更新always-visible观察内容
    const alwaysVisibleLabel = document.querySelector('.observation-item.always-visible .observation-label');
    if (alwaysVisibleLabel) {
      alwaysVisibleLabel.textContent = observation.text;
    }
    
    // 更新建议内容
    const suggestionText = document.querySelector('.suggestion-text');
    if (suggestionText) {
      suggestionText.textContent = `"${observation.suggestion}"`;
    }
  }

  getStatusText(status) {
    const statusMap = {
      'attention': '关注',
      'warning': '提示', 
      'alert': '预警'
    };
    return statusMap[status] || '关注';
  }

  // 模态窗口控制
  setupModalEvents() {
    // 画板模态窗口
    document.getElementById('closePureCanvas')?.addEventListener('click', () => {
      this.closePureCanvas();
    });
    
    // 画板保存按钮
    this.saveCanvasBtn?.addEventListener('click', () => {
      this.savePureCanvas();
    });
    
    // 正念冥想模态窗口
    document.getElementById('closeMeditation')?.addEventListener('click', () => {
      this.closeMeditation();
    });
    
    // 核销模态窗口
    document.getElementById('cancelCheckout')?.addEventListener('click', () => {
      this.checkoutModal?.classList.remove('show');
    });
    
    document.getElementById('confirmCheckout')?.addEventListener('click', () => {
      this.confirmCheckout();
    });
    
    // 点击背景关闭模态窗口
    [this.pureCanvasModal, this.meditationModal, this.checkoutModal].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === this.pureCanvasModal) {
            this.closePureCanvas();
          } else {
            modal.classList.remove('show');
          }
        }
      });
    });
    
    // 设置画板工具
    this.setupPureCanvasTools();
    
    // 设置正念冥想
    this.setupMeditation();
    
    // 设置核销选项
    this.setupCheckoutOptions();
  }

  openPureCanvas() {
    this.pureCanvasModal?.classList.add('show');
    // 隐藏底部工具栏
    const bottomToolbar = document.getElementById('bottomToolbar');
    if (bottomToolbar) {
      bottomToolbar.style.display = 'none';
    }
    
    // 延迟调整画布尺寸，确保模态窗口完全显示后再计算
    setTimeout(() => {
      this.resizePureCanvas();
      // 设置画布事件
      this.setupCanvasEvents(this.pureCanvas, this.pureCtx);
    }, 350); // 增加延迟时间确保动画完成
    
    // 监听窗口大小变化，动态调整画布
    const resizeHandler = () => {
      if (this.pureCanvasModal?.classList.contains('show')) {
        this.resizePureCanvas();
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', resizeHandler);
    
    // 保存resize处理器的引用，用于清理
    this.pureCanvasResizeHandler = resizeHandler;
  }

  openMeditation() {
    this.meditationModal?.classList.add('show');
  }

  closeMeditation() {
    this.meditationModal?.classList.remove('show');
    this.stopMeditation();
  }

  openSandbox() {
    // 显示沙盘功能的提示信息
    this.showToast('沙盘功能即将上线，敬请期待！', 'info');
    
    // 这里可以添加沙盘功能的具体实现
    // 例如打开沙盘模态窗口、加载沙盘组件等
    console.log('沙盘功能被触发');
  }

  setupPureCanvasTools() {
    const canvasTools = document.querySelectorAll('.canvas-tool');
    const canvasColors = document.querySelectorAll('.canvas-color');
    
    canvasTools.forEach(tool => {
      tool.addEventListener('click', (e) => {
        const toolType = e.target.dataset.tool;
        if (toolType === 'clear') {
          if (this.hasCanvasContent) {
            if (confirm('确定要清空画板内容吗？')) {
              this.clearPureCanvas();
            }
          } else {
            this.clearPureCanvas();
          }
        } else {
          // 简化的工具选择，直接设置当前工具
          this.currentTool = toolType;
          canvasTools.forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
        }
      });
    });
    
    canvasColors.forEach(color => {
      color.addEventListener('click', (e) => {
        this.selectColor(e.target.dataset.color);
        canvasColors.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  setupMeditation() {
    const meditationBtns = document.querySelectorAll('.meditation-btn');
    
    meditationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.startMeditation(type);
      });
    });
    
    document.getElementById('playPauseBtn')?.addEventListener('click', () => {
      this.toggleMeditationPlayPause();
    });
    
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetMeditation();
    });
  }

  startMeditation(type) {
    const durations = {
      'breathing': 300, // 5分钟
      'body-scan': 600, // 10分钟  
      'mindfulness': 180, // 3分钟
      'relaxation': 480 // 8分钟
    };
    
    const guides = {
      'breathing': '请舒适地坐好，轻轻闭上眼睛，将注意力集中在呼吸上...',
      'body-scan': '让我们从头部开始，慢慢扫描身体的每一个部位...',
      'mindfulness': '保持觉察，观察当下的想法和感受，不做任何判断...',
      'relaxation': '从脚趾开始，逐步放松身体的每一块肌肉...'
    };
    
    this.meditationDuration = durations[type];
    this.meditationElapsed = 0;
    
    // 更新UI
    document.getElementById('currentMeditationType').textContent = type === 'breathing' ? '呼吸冥想' : 
      type === 'body-scan' ? '身体扫描' : 
      type === 'mindfulness' ? '正念观察' : '渐进放松';
    
    document.getElementById('totalTime').textContent = this.formatMeditationTime(this.meditationDuration);
    document.getElementById('meditationGuide').innerHTML = `<p>${guides[type]}</p>`;
    
    // 显示播放器
    document.querySelector('.meditation-options').style.display = 'none';
    document.getElementById('meditationPlayer').style.display = 'block';
    
    this.updateMeditationProgress();
  }

  toggleMeditationPlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (this.isPlaying) {
      // 暂停
      clearInterval(this.meditationTimer);
      this.isPlaying = false;
      playPauseBtn.textContent = '▶️';
    } else {
      // 播放
      this.meditationTimer = setInterval(() => {
        this.meditationElapsed++;
        this.updateMeditationProgress();
        
        if (this.meditationElapsed >= this.meditationDuration) {
          this.stopMeditation();
        }
      }, 1000);
      
      this.isPlaying = true;
      playPauseBtn.textContent = '⏸️';
    }
  }

  resetMeditation() {
    this.stopMeditation();
    this.meditationElapsed = 0;
    this.updateMeditationProgress();
    document.getElementById('playPauseBtn').textContent = '▶️';
  }

  stopMeditation() {
    clearInterval(this.meditationTimer);
    this.isPlaying = false;
    document.getElementById('playPauseBtn').textContent = '▶️';
  }

  updateMeditationProgress() {
    const progress = this.meditationElapsed / this.meditationDuration;
    const circumference = 2 * Math.PI * 54; // r=54
    const strokeDashoffset = circumference - (progress * circumference);
    
    document.querySelector('.progress-ring-circle').style.strokeDashoffset = strokeDashoffset;
    document.getElementById('currentTime').textContent = this.formatMeditationTime(this.meditationElapsed);
  }

  formatMeditationTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  setupCheckoutOptions() {
    const durationBtns = document.querySelectorAll('.duration-btn');
    
    durationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedDuration = parseInt(e.target.dataset.minutes);
        durationBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  showCheckoutModal() {
    // 更新核销信息
    document.getElementById('checkoutClientName').textContent = 
      document.getElementById('clientName').textContent;
    document.getElementById('checkoutStartTime').textContent = 
      document.getElementById('consultationTime').textContent.split(' ')[0] + ' ' + 
      document.getElementById('consultationTime').textContent.split(' ')[1].split('-')[0];
    document.getElementById('checkoutDuration').textContent = 
      this.sessionTimer.textContent;
    
    this.checkoutModal?.classList.add('show');
  }

  processCheckout() {
    // 首先保存笔记
    this.saveNotes();

    // 更新核销弹窗中的信息
    document.getElementById('checkoutClientName').textContent = 
      document.getElementById('clientName').textContent;
    document.getElementById('checkoutStartTime').textContent = 
      document.getElementById('consultationTime').textContent.split(' ')[0] + ' ' + 
      document.getElementById('consultationTime').textContent.split(' ')[1].split('-')[0];
    document.getElementById('checkoutDuration').textContent = 
      this.sessionTimer.textContent;
    
    this.checkoutModal?.classList.add('show');
  }

  confirmCheckout() {
    const remark = document.getElementById('checkoutRemark').value;
    
    const checkoutData = {
      clientName: document.getElementById('checkoutClientName').textContent,
      consultationTime: document.getElementById('checkoutStartTime').textContent,
      actualDuration: document.getElementById('checkoutDuration').textContent,
      billedDuration: this.selectedDuration,
      remark: remark,
      timestamp: new Date().toISOString()
    };
    
    this.saveCheckoutData(checkoutData);
    
    this.checkoutModal?.classList.remove('show');

    this.showToast('咨询已结束，笔记已保存。', 'success');
    
    // 跳转到咨询记录查看页面
    setTimeout(() => {
      // 传递一个唯一标识符，以便记录页面能找到正确的笔记
      const noteId = new Date(checkoutData.timestamp).getTime();
      window.location.href = `consultation-record.html?client=${encodeURIComponent(checkoutData.clientName)}&id=${noteId}`;
    }, 1500);
  }

  saveCheckoutData(data) {
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    checkouts.push(data);
    localStorage.setItem('consultationCheckouts', JSON.stringify(checkouts));
    console.log('核销数据已保存', data);
  }

  // 初始化拖拽功能
  initializeDragAndDrop() {
    // 不再需要拖拽功能，已删除
  }

  // 计时器功能
  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      this.sessionTimer.textContent = this.formatTime(elapsed);
    }, 1000);
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 加载咨询信息
  loadConsultationInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientName = urlParams.get('client') || '李小雅';
    const sessionCount = urlParams.get('session') || '3';
    const appointmentTime = urlParams.get('time') || '2024年1月18日 14:00-15:00';
    
    document.getElementById('clientName').textContent = clientName;
    document.getElementById('sessionCount').textContent = `第 ${sessionCount} 次咨询`;
    document.getElementById('consultationTime').textContent = appointmentTime;
  }

  // 保存笔记
  saveNotes() {
    const notebookTextarea = document.getElementById('notebookTextarea');
    const textData = notebookTextarea ? notebookTextarea.value.trim() : '';
    const canvasData = this.notebookCanvas ? this.notebookCanvas.toDataURL() : ''; // 即使是空的也保存

    const notesData = {
      noteId: new Date().getTime(), // 使用时间戳作为唯一ID
      clientName: document.getElementById('clientName').textContent,
      sessionCount: document.getElementById('sessionCount').textContent,
      consultationTime: document.getElementById('consultationTime').textContent,
      duration: this.sessionTimer.textContent,
      canvasData: canvasData,
      textData: textData,
      timestamp: new Date().toISOString()
    };
    
    // 使用更可靠的方式存储，以便能通过ID检索
    let savedNotes = JSON.parse(localStorage.getItem('consultationNotes') || '{}');
    if (!savedNotes[notesData.clientName]) {
      savedNotes[notesData.clientName] = [];
    }
    // 添加或更新笔记
    savedNotes[notesData.clientName].push(notesData);
    localStorage.setItem('consultationNotes', JSON.stringify(savedNotes));
    
    console.log('笔记已保存', notesData);
    this.showToast('笔记已保存!', 'success');
  }

  // 键盘快捷键
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          this.saveNotes();
          break;
        case 'z':
          e.preventDefault();
          this.undo();
          break;
        case 'y':
          e.preventDefault();
          this.redo();
          break;
      }
    }
    
    // ESC键关闭模态窗口
    if (e.key === 'Escape') {
      [this.pureCanvasModal, this.meditationModal, this.checkoutModal].forEach(modal => {
        modal?.classList.remove('show');
      });
    }
  }

  closePureCanvas() {
    if (this.hasCanvasContent) {
      if (confirm('画板中有绘画内容，关闭将会清空所有内容，是否要继续？')) {
        this.clearPureCanvas();
        this.pureCanvasModal?.classList.remove('show');
        
        // 显示底部工具栏
        const bottomToolbar = document.getElementById('bottomToolbar');
        if (bottomToolbar) {
          bottomToolbar.style.display = 'block';
        }
        
        // 清理resize事件监听器
        if (this.pureCanvasResizeHandler) {
          window.removeEventListener('resize', this.pureCanvasResizeHandler);
          window.removeEventListener('orientationchange', this.pureCanvasResizeHandler);
          this.pureCanvasResizeHandler = null;
        }
      }
    } else {
      this.pureCanvasModal?.classList.remove('show');
      // 显示底部工具栏
      const bottomToolbar = document.getElementById('bottomToolbar');
      if (bottomToolbar) {
        bottomToolbar.style.display = 'block';
      }
      
      // 清理resize事件监听器
      if (this.pureCanvasResizeHandler) {
        window.removeEventListener('resize', this.pureCanvasResizeHandler);
        window.removeEventListener('orientationchange', this.pureCanvasResizeHandler);
        this.pureCanvasResizeHandler = null;
      }
    }
  }

  savePureCanvas() {
    if (!this.hasCanvasContent) {
      alert('画板中没有内容可以保存');
      return;
    }
    
    // 获取画板内容
    const canvasData = this.pureCanvas.toDataURL('image/png');
    
    // 创建缩略图容器
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'canvas-thumbnail-container';
    thumbnailContainer.style.cssText = `
      display: inline-block;
      margin: 10px;
      padding: 8px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    `;
    
    // 创建缩略图
    const thumbnail = document.createElement('img');
    thumbnail.src = canvasData;
    thumbnail.style.cssText = `
      width: 120px;
      height: 80px;
      object-fit: contain;
      border-radius: 4px;
      display: block;
    `;
    
    // 创建标签
    const label = document.createElement('div');
    label.textContent = '画板内容';
    label.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 500;
    `;
    
    // 创建时间戳
    const timestamp = document.createElement('div');
    timestamp.textContent = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    timestamp.style.cssText = `
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    `;
    
    // 组装缩略图容器
    thumbnailContainer.appendChild(thumbnail);
    thumbnailContainer.appendChild(label);
    thumbnailContainer.appendChild(timestamp);
    
    // 添加悬停效果
    thumbnailContainer.addEventListener('mouseenter', () => {
      thumbnailContainer.style.transform = 'translateY(-2px)';
      thumbnailContainer.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      thumbnailContainer.style.borderColor = '#3b82f6';
    });
    
    thumbnailContainer.addEventListener('mouseleave', () => {
      thumbnailContainer.style.transform = 'translateY(0)';
      thumbnailContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      thumbnailContainer.style.borderColor = '#e2e8f0';
    });
    
    // 添加点击放大功能
    thumbnailContainer.addEventListener('click', () => {
      this.showImageModal(canvasData);
    });
    
    // 将缩略图添加到笔记本画布上方的容器中
    let thumbnailsContainer = document.querySelector('.thumbnails-container');
    if (!thumbnailsContainer) {
      thumbnailsContainer = document.createElement('div');
      thumbnailsContainer.className = 'thumbnails-container';
      thumbnailsContainer.style.cssText = `
        padding: 16px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        min-height: 60px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      `;
      
      // 添加标题
      const title = document.createElement('div');
      title.textContent = '画板记录：';
      title.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-right: 12px;
        flex-shrink: 0;
      `;
      thumbnailsContainer.appendChild(title);
      
      // 插入到笔记本纸张前面
      const notebookPaper = document.querySelector('.notebook-paper');
      notebookPaper.parentNode.insertBefore(thumbnailsContainer, notebookPaper);
    }
    
    thumbnailsContainer.appendChild(thumbnailContainer);
    
    alert('画板内容已保存为缩略图');
    
    // 清空画板并关闭
    this.clearPureCanvas();
    this.pureCanvasModal?.classList.remove('show');
    
    // 显示底部工具栏
    const bottomToolbar = document.getElementById('bottomToolbar');
    if (bottomToolbar) {
      bottomToolbar.style.display = 'block';
    }
  }

  // 显示图片放大模态窗口
  showImageModal(imageSrc) {
    // 创建模态窗口
    const modal = document.createElement('div');
    modal.className = 'image-modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // 创建图片容器
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      color: #64748b;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#f1f5f9';
      closeBtn.style.color = '#1e293b';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = '#64748b';
    });
    
    // 创建放大的图片
    const enlargedImage = document.createElement('img');
    enlargedImage.src = imageSrc;
    enlargedImage.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      display: block;
    `;
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '画板内容';
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      text-align: center;
    `;
    
    // 组装模态窗口
    imageContainer.appendChild(closeBtn);
    imageContainer.appendChild(title);
    imageContainer.appendChild(enlargedImage);
    modal.appendChild(imageContainer);
    
    // 关闭功能
    const closeModal = () => {
      modal.style.opacity = '0';
      imageContainer.style.transform = 'scale(0.9)';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // 键盘ESC关闭
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // 显示模态窗口
    document.body.appendChild(modal);
    
    // 动画效果
    setTimeout(() => {
      modal.style.opacity = '1';
      imageContainer.style.transform = 'scale(1)';
    }, 10);
  }

  clearPureCanvas() {
    this.pureCtx?.clearRect(0, 0, this.pureCanvas.width, this.pureCanvas.height);
    this.hasCanvasContent = false;
  }

  handleTextSelection(e) {
    console.log('handleTextSelection 被调用');
    
    // 立即检查选择状态
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    console.log('当前选择的文本:', selectedText);
    
    // 如果没有选中文本，不处理
    if (selectedText.length === 0) {
      console.log('没有选中文本，退出处理');
      return;
    }
    
    // 检查选中的文本是否在当前消息内
    const message = e.currentTarget;
    console.log('消息元素:', message);
    
    try {
      const range = selection.getRangeAt(0);
      console.log('选择范围:', range);
      
      // 检查选择范围是否在消息内容区域
      const messageContent = message.querySelector('.message-content');
      if (!messageContent) {
        console.log('未找到消息内容区域');
        return;
      }
      
      // 检查选择是否在消息内容内
      if (!messageContent.contains(range.commonAncestorContainer) && 
          range.commonAncestorContainer !== messageContent) {
        console.log('选中的文本不在消息内容内');
        return;
      }
      
      // 防止选中跨越多个消息
      const startMessage = range.startContainer.closest('.transcript-message');
      const endMessage = range.endContainer.closest('.transcript-message');
      
      if (startMessage !== endMessage || startMessage !== message) {
        console.log('选择跨越了多个消息');
        return;
      }
      
      console.log('准备创建部分标记，选中文本:', selectedText);
      
      // 延迟执行，确保选择稳定
      setTimeout(() => {
        // 再次检查选择是否仍然存在
        const currentSelection = window.getSelection();
        const currentText = currentSelection.toString().trim();
        
        if (currentText.length > 0 && currentText === selectedText) {
          console.log('创建部分标记');
          this.createPartialMark(message, range, selectedText);
        } else {
          console.log('选择已改变或消失，不创建标记');
        }
      }, 50); // 减少延迟时间到50ms
      
    } catch (error) {
      console.error('处理文本选择时出错:', error);
    }
  }

  // 长按开始处理
  handleLongPressStart(e) {
    if (!this.isMarkingMode) return;
    
    console.log('长按开始');
    
    // 记录长按开始位置
    this.longPressStartPos = {
      x: e.clientX,
      y: e.clientY,
      target: e.target
    };
    
    this.isLongPressing = false;
    
    // 设置长按计时器
    this.longPressTimer = setTimeout(() => {
      console.log('长按触发');
      this.isLongPressing = true;
      this.startAutoSelection(e);
    }, this.longPressThreshold);
    
    // 注意：由于使用passive事件监听器，我们不能阻止默认行为
    // 这样可以保持滚动功能正常工作
  }

  // 长按移动处理
  handleLongPressMove(e) {
    if (!this.longPressTimer) return;
    
    // 如果移动距离太大，取消长按
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - this.longPressStartPos.x, 2) + 
      Math.pow(e.clientY - this.longPressStartPos.y, 2)
    );
    
    if (moveDistance > 10) { // 移动超过10px取消长按
      this.handleLongPressCancel();
    }
  }

  // 长按结束处理
  handleLongPressEnd(e) {
    if (this.isLongPressing) {
      console.log('长按结束，完成自动选择');
      this.completeAutoSelection(e);
    }
    
    this.handleLongPressCancel();
  }

  // 取消长按
  handleLongPressCancel() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isLongPressing = false;
    this.longPressStartPos = null;
  }

  // 开始自动选择
  startAutoSelection(e) {
    console.log('开始自动选择文本');
    
    // 找到点击位置的文本节点和字符位置
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range) return;
    
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    
    const text = textNode.textContent;
    const clickOffset = range.startOffset;
    
    // 智能选择：找到单词或句子边界
    const selectedRange = this.findSelectionBoundaries(text, clickOffset);
    
    if (selectedRange) {
      // 创建新的选择范围
      const newRange = document.createRange();
      newRange.setStart(textNode, selectedRange.start);
      newRange.setEnd(textNode, selectedRange.end);
      
      // 应用选择
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // 添加视觉反馈
      this.addLongPressVisualFeedback(e.target.closest('.transcript-message'));
      
      console.log('自动选择完成:', text.substring(selectedRange.start, selectedRange.end));
    }
  }

  // 完成自动选择
  completeAutoSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      const message = e.target.closest('.transcript-message');
      if (message) {
        try {
          const range = selection.getRangeAt(0);
          console.log('长按自动创建标记:', selectedText);
          this.createPartialMark(message, range, selectedText);
        } catch (error) {
          console.error('长按创建标记失败:', error);
        }
      }
    }
    
    // 移除视觉反馈
    this.removeLongPressVisualFeedback();
  }

  // 智能查找选择边界
  findSelectionBoundaries(text, offset) {
    // 中文标点符号
    const chinesePunctuation = /[，。！？；：""''（）【】《》]/;
    // 英文单词边界
    const wordBoundary = /[\s\.,!?;:()[\]{}"""'']/;
    
    let start = offset;
    let end = offset;
    
    // 向前查找边界
    while (start > 0) {
      const char = text[start - 1];
      if (chinesePunctuation.test(char) || wordBoundary.test(char)) {
        break;
      }
      start--;
    }
    
    // 向后查找边界
    while (end < text.length) {
      const char = text[end];
      if (chinesePunctuation.test(char) || wordBoundary.test(char)) {
        break;
      }
      end++;
    }
    
    // 确保选择了有意义的内容
    if (end - start < 2) {
      // 如果选择太短，尝试扩展到句子
      return this.findSentenceBoundaries(text, offset);
    }
    
    return { start, end };
  }

  // 查找句子边界
  findSentenceBoundaries(text, offset) {
    const sentenceEnd = /[。！？]/;
    
    let start = 0;
    let end = text.length;
    
    // 向前查找句子开始
    for (let i = offset - 1; i >= 0; i--) {
      if (sentenceEnd.test(text[i])) {
        start = i + 1;
        break;
      }
    }
    
    // 向后查找句子结束
    for (let i = offset; i < text.length; i++) {
      if (sentenceEnd.test(text[i])) {
        end = i + 1;
        break;
      }
    }
    
    // 去除前后空白
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    
    return start < end ? { start, end } : null;
  }

  // 添加长按视觉反馈
  addLongPressVisualFeedback(messageElement) {
    if (messageElement) {
      messageElement.style.backgroundColor = '#fef3c7';
      messageElement.style.transform = 'scale(1.02)';
      messageElement.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
      messageElement.style.transition = 'all 0.2s ease';
    }
  }

  // 移除长按视觉反馈
  removeLongPressVisualFeedback() {
    const messages = this.transcriptStream.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      if (!message.classList.contains('marked') && !message.querySelector('.partial-mark')) {
        message.style.backgroundColor = '';
        message.style.transform = '';
        message.style.boxShadow = '';
      }
    });
  }

  createPartialMark(messageElement, range, selectedText) {
    console.log('开始创建部分标记:', selectedText);
    
    // 检查是否已经有部分标记
    const existingMark = messageElement.querySelector('.partial-mark');
    if (existingMark) {
      // 直接替换已有标记，不需要确认
      this.removePartialMark(messageElement);
      this.showToast('已替换为新的选中内容', 'info');
    }
    
    // 创建标记元素
    const markElement = document.createElement('span');
    markElement.className = 'partial-mark';
    markElement.style.cssText = `
      background-color: #fef3c7 !important;
      border: 2px solid #f59e0b !important;
      border-radius: 4px !important;
      padding: 2px 4px !important;
      margin: 0 2px !important;
      position: relative !important;
      display: inline !important;
    `;
    
    // 包装选中的文本
    try {
      // 克隆范围以避免修改原始选择
      const clonedRange = range.cloneRange();
      
      // 尝试直接包装内容
      if (clonedRange.startContainer === clonedRange.endContainer && 
          clonedRange.startContainer.nodeType === Node.TEXT_NODE) {
        // 简单情况：选择在单个文本节点内
        const textNode = clonedRange.startContainer;
        const startOffset = clonedRange.startOffset;
        const endOffset = clonedRange.endOffset;
        
        // 分割文本节点
        const beforeText = textNode.textContent.substring(0, startOffset);
        const selectedTextContent = textNode.textContent.substring(startOffset, endOffset);
        const afterText = textNode.textContent.substring(endOffset);
        
        // 创建新的文本节点
        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(afterText);
        
        // 设置标记元素的内容
        markElement.textContent = selectedTextContent;
        
        // 替换原始文本节点
        const parent = textNode.parentNode;
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(markElement, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);
        
        console.log('成功创建部分标记 - 简单情况');
      } else {
        // 复杂情况：选择跨越多个节点
        try {
          clonedRange.surroundContents(markElement);
          console.log('成功创建部分标记 - 使用surroundContents');
        } catch (e) {
          console.log('surroundContents失败，使用替代方法');
          // 如果无法直接包装，使用替代方法
          const contents = clonedRange.extractContents();
          markElement.appendChild(contents);
          clonedRange.insertNode(markElement);
          console.log('成功创建部分标记 - 使用extractContents');
        }
      }
      
      // 清除选择
      window.getSelection().removeAllRanges();
      
    } catch (error) {
      console.error('创建部分标记时出错:', error);
      // 如果所有方法都失败，至少创建一个标记提示
      const messageContent = messageElement.querySelector('.message-content');
      if (messageContent) {
        markElement.textContent = selectedText;
        messageContent.appendChild(document.createElement('br'));
        messageContent.appendChild(markElement);
        console.log('使用备用方法创建部分标记');
      }
    }
    
    // 添加标记数据
    const messageData = {
      element: messageElement,
      speaker: messageElement.querySelector('.message-speaker').textContent,
      content: selectedText, // 只保存选中的文本
      fullContent: messageElement.querySelector('.message-content').textContent, // 保存完整内容用于参考
      time: messageElement.querySelector('.message-time').textContent,
      emotionTags: [],
      textTags: [],
      isPartial: true,
      markElement: markElement
    };
    
    // 创建标签容器
    this.addTagsToPartialMark(messageElement, markElement, messageData);
    
    // 添加到标记列表
    this.markedMessages.push(messageData);
    
    console.log('部分标记创建完成');
  }

  addTagsToPartialMark(messageElement, markElement, messageData) {
    // 检查是否已经有标签容器
    let tagsContainer = messageElement.querySelector('.message-tags');
    if (!tagsContainer) {
      tagsContainer = document.createElement('div');
      tagsContainer.className = 'message-tags';
      tagsContainer.style.cssText = `
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        background: #f8fafc;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      `;
      messageElement.appendChild(tagsContainer);
    }
    
    // 添加部分标记提示
    const partialLabel = document.createElement('div');
    partialLabel.className = 'partial-mark-label';
    partialLabel.style.cssText = `
      font-size: 11px;
      color: #f59e0b;
      font-weight: 600;
      margin-bottom: 4px;
    `;
    partialLabel.textContent = `已标记: "${messageData.content.length > 30 ? messageData.content.substring(0, 30) + '...' : messageData.content}"`;
    tagsContainer.appendChild(partialLabel);
    
    // 表情标签行
    const emotionTags = document.createElement('div');
    emotionTags.className = 'emotion-tags';
    emotionTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    // 更新表情标签：emoji+中文，咨询中最常见的5个情绪 + 3个特殊标签
    const emotions = ['😭哭', '😰焦虑', '😠愤怒', '😔抑郁', '😊开心', '🌟重要', '⚠️风险', '💊药物服用'];
    emotions.forEach(emotion => {
      const tag = document.createElement('button');
      tag.textContent = emotion;
      tag.className = 'emotion-tag';
      tag.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#3b82f6';
          tag.style.color = 'white';
          tag.style.borderColor = '#3b82f6';
          // 记录选择时间用于排序
          tag.dataset.selectedTime = Date.now();
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
          // 移除选择时间
          delete tag.dataset.selectedTime;
        }
        // 标签状态改变时自动更新笔记
        this.autoUpdateNotesForMessage(messageElement);
      });
      
      emotionTags.appendChild(tag);
    });
    
    // 文字标签行
    const textTags = document.createElement('div');
    textTags.className = 'text-tags';
    textTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    // 更新纯中文标签：仅3个
    const textLabels = ['关键议题', '咨询目标', '咨询计划'];
    textLabels.forEach(label => {
      const tag = document.createElement('button');
      tag.textContent = label;
      tag.className = 'text-tag';
      tag.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#10b981';
          tag.style.color = 'white';
          tag.style.borderColor = '#10b981';
          // 记录选择时间用于排序
          tag.dataset.selectedTime = Date.now();
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
          // 移除选择时间
          delete tag.dataset.selectedTime;
        }
        // 标签状态改变时自动更新笔记
        this.autoUpdateNotesForMessage(messageElement);
      });
      
      textTags.appendChild(tag);
    });
    
    // 添加删除按钮
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '移除标记';
    removeBtn.className = 'remove-mark-btn';
    removeBtn.style.cssText = `
      padding: 4px 8px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      margin-top: 4px;
      align-self: flex-start;
    `;
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removePartialMark(messageElement);
    });
    
    tagsContainer.appendChild(emotionTags);
    tagsContainer.appendChild(textTags);
    tagsContainer.appendChild(removeBtn);
    
    // 立即添加到笔记（不等待标签选择）
    this.autoAddSingleMessageToNotes(messageData);
  }

  removePartialMark(messageElement) {
    // 移除部分标记元素
    const partialMark = messageElement.querySelector('.partial-mark');
    if (partialMark) {
      // 恢复原始文本
      const parent = partialMark.parentNode;
      while (partialMark.firstChild) {
        parent.insertBefore(partialMark.firstChild, partialMark);
      }
      parent.removeChild(partialMark);
    }
    
    // 移除标签容器
    const tagsContainer = messageElement.querySelector('.message-tags');
    if (tagsContainer) {
      tagsContainer.remove();
    }
    
    // 从标记列表中移除
    this.markedMessages = this.markedMessages.filter(msg => msg.element !== messageElement);
    
    // 重新绘制笔记（移除该消息）
    this.redrawAllMarkedContent();
    
    // 显示移除提示
    this.showToast('部分标记已从笔记中移除', 'info');
  }

  setupTranscriptScrollEvents() {
    if (!this.transcriptContent) return;
    
    // 监听滚动事件 - 在所有模式下都应该工作
    this.transcriptContent.addEventListener('scroll', () => {
      this.handleTranscriptScroll();
    });
    
    // 监听触摸和鼠标事件来检测用户交互 - 使用passive来提高性能
    this.transcriptContent.addEventListener('touchstart', () => {
      this.setUserScrolling(true);
    }, { passive: true });
    
    // 鼠标按下时设置用户滚动状态，但不阻止默认行为
    this.transcriptContent.addEventListener('mousedown', (e) => {
      // 只有在滚动条区域或空白区域才设置滚动状态
      // 避免在消息内容上点击时误触发
      const isClickOnScrollbar = e.offsetX > this.transcriptContent.clientWidth;
      const isClickOnMessage = e.target.closest('.transcript-message');
      
      if (isClickOnScrollbar || (!isClickOnMessage && !this.isMarkingMode)) {
        this.setUserScrolling(true);
      }
    });
    
    // 鼠标滚轮滚动时设置用户滚动状态
    this.transcriptContent.addEventListener('wheel', () => {
      this.setUserScrolling(true);
    }, { passive: true });
  }

  handleTranscriptScroll() {
    if (!this.transcriptContent) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.transcriptContent;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    
    // 如果用户滚动到底部，重新启用自动滚动（仅在非标记模式下）
    if (isAtBottom && this.isUserScrolling && !this.isMarkingMode) {
      this.setUserScrolling(false);
      console.log('用户滚动到底部 - 重新启用自动滚动');
    }
  }

  setUserScrolling(isScrolling) {
    this.isUserScrolling = isScrolling;
    
    if (isScrolling) {
      // 清除之前的定时器
      if (this.userScrollTimeout) {
        clearTimeout(this.userScrollTimeout);
      }
      
      // 根据当前模式更新滚动指示器
      if (this.isMarkingMode) {
        this.updateScrollIndicator('user-scrolling', '标记模式');
      } else {
        this.updateScrollIndicator('user-scrolling', '手动滚动');
      }
      
      // 设置定时器，如果用户停止滚动3秒后自动恢复自动滚动（仅在非标记模式下）
      this.userScrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = this.transcriptContent;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
        
        if (isAtBottom && !this.isMarkingMode) {
          this.isUserScrolling = false;
          this.updateScrollIndicator('auto-scrolling', '自动跟随');
          console.log('用户停止滚动且在底部 - 恢复自动滚动');
        }
      }, 3000);
      
      console.log('检测到用户滚动 - 暂停自动滚动');
    } else {
      // 恢复自动滚动（仅在非标记模式下）
      if (!this.isMarkingMode) {
        this.updateScrollIndicator('auto-scrolling', '自动跟随');
      }
    }
  }

  updateScrollIndicator(type, text) {
    if (!this.scrollIndicator) return;
    
    // 移除所有状态类
    this.scrollIndicator.classList.remove('user-scrolling', 'auto-scrolling');
    
    // 添加新的状态类
    this.scrollIndicator.classList.add(type);
    this.scrollIndicator.textContent = text;
    
    // 显示指示器
    this.scrollIndicator.classList.add('show');
    
    // 3秒后隐藏指示器（如果是自动跟随状态）
    if (type === 'auto-scrolling') {
      setTimeout(() => {
        if (this.scrollIndicator.classList.contains('auto-scrolling')) {
          this.scrollIndicator.classList.remove('show');
        }
      }, 3000);
    }
  }

  typeMessage(element, text, callback, customSpeed = null) {
    let index = 0;
    const typingSpeed = customSpeed || 50; // 默认每个字符50ms，可自定义
    
    const typeChar = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        
        // 自动滚动条件：不在标记模式 且 用户没有手动滚动
        if (this.transcriptContent && !this.transcriptPaused && !this.isUserScrolling) {
          this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
        }
        
        setTimeout(typeChar, typingSpeed);
      } else {
        // 打字完成，最后一次滚动
        if (this.transcriptContent && !this.transcriptPaused && !this.isUserScrolling) {
          this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
        }
        
        // 打字完成
        if (callback) callback();
      }
    };
    
    typeChar();
  }

  addTranscriptMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content">${message.content}</div>
      <div class="message-time">[${time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 如果在标记模式下，为新消息添加点击事件
    if (this.isMarkingMode) {
      this.addClickEventToMessage(messageElement);
    }
    
    // 自动滚动到底部（除非在标记模式下或用户正在滚动）
    if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
  }

  // 显示Toast提示
  showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // 设置样式
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      word-wrap: break-word;
    `;

    // 添加到页面
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // 获取Toast颜色
  getToastColor(type) {
    const colors = {
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444',
      'info': '#3b82f6'
    };
    return colors[type] || colors.info;
  }

  // 自动添加单个消息到笔记
  autoAddSingleMessageToNotes(messageData) {
    if (!this.notebookCtx) return;
    
    // 收集当前标签状态
    this.updateMessageDataTags(messageData);
    
    // 在笔记本画布上添加标记内容
    this.drawSingleMessageOnCanvas(messageData);
    
    // 显示成功提示
    this.showToast('标记已自动添加到笔记', 'success');
  }

  // 自动更新笔记中的消息（当标签改变时）
  autoUpdateNotesForMessage(messageElement) {
    // 找到对应的消息数据
    const messageData = this.markedMessages.find(msg => msg.element === messageElement);
    if (!messageData) return;
    
    // 更新标签数据
    this.updateMessageDataTags(messageData);
    
    // 重新绘制整个笔记（简单实现，可以优化为只更新特定区域）
    this.redrawAllMarkedContent();
    
    // 显示更新提示
    this.showToast('笔记已更新', 'info');
  }

  // 更新消息数据的标签信息
  updateMessageDataTags(messageData) {
    if (!messageData.element) return;
    
    // 收集选中的表情标签，按选择时间排序
    const selectedEmotions = Array.from(messageData.element.querySelectorAll('.emotion-tag.selected'))
      .sort((a, b) => {
        const timeA = parseInt(a.dataset.selectedTime) || 0;
        const timeB = parseInt(b.dataset.selectedTime) || 0;
        return timeA - timeB;
      })
      .map(tag => tag.textContent);
    
    // 收集选中的文字标签，按选择时间排序
    const selectedTextTags = Array.from(messageData.element.querySelectorAll('.text-tag.selected'))
      .sort((a, b) => {
        const timeA = parseInt(a.dataset.selectedTime) || 0;
        const timeB = parseInt(b.dataset.selectedTime) || 0;
        return timeA - timeB;
      })
      .map(tag => tag.textContent);
    
    // 收集选中的自定义标签，按选择时间排序
    const selectedCustomTags = Array.from(messageData.element.querySelectorAll('.custom-tag.selected'))
      .sort((a, b) => {
        const timeA = parseInt(a.dataset.selectedTime) || 0;
        const timeB = parseInt(b.dataset.selectedTime) || 0;
        return timeA - timeB;
      })
      .map(tag => tag.textContent);
    
    messageData.emotionTags = selectedEmotions;
    messageData.textTags = selectedTextTags;
    messageData.customTags = selectedCustomTags;
  }

  // 在画布上绘制单个消息
  drawSingleMessageOnCanvas(messageData) {
    if (!this.notebookCtx) return;
    
    const ctx = this.notebookCtx;
    
    // 找到合适的绘制位置（简单实现：在画布底部添加）
    const canvasHeight = this.notebookCanvas.height;
    let startY = 50; // 从顶部开始，不需要为标题留空间
    
    // 检查是否已经有内容，如果有则在现有内容下方添加
    const existingContent = this.getCanvasContentHeight();
    if (existingContent > 0) {
      startY = existingContent + 30;
    }
    
    ctx.save();
    
    // 绘制消息内容
    this.drawMessageContentOnCanvas(ctx, messageData, startY);
    
    ctx.restore();
    this.saveCanvasState();
  }

  // 重新绘制所有标记内容
  redrawAllMarkedContent() {
    if (!this.notebookCtx || this.markedMessages.length === 0) return;
    
    // 清空画布
    this.notebookCtx.clearRect(0, 0, this.notebookCanvas.width, this.notebookCanvas.height);
    
    const ctx = this.notebookCtx;
    let currentY = 50; // 从顶部开始，不需要为标题留空间
    
    ctx.save();
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    
    // 删除标题，直接绘制消息内容
    this.markedMessages.forEach((msg, index) => {
      // 更新标签数据
      this.updateMessageDataTags(msg);
      
      // 绘制分隔线（第一个消息不需要分隔线）
      if (index > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, currentY);
        ctx.lineTo(this.notebookCanvas.width - 80, currentY);
        ctx.stroke();
        currentY += 20;
      }
      
      // 绘制消息内容
      currentY = this.drawMessageContentOnCanvas(ctx, msg, currentY);
    });
    
    ctx.restore();
    this.saveCanvasState();
  }

  // 在画布上绘制消息内容的具体实现
  drawMessageContentOnCanvas(ctx, messageData, startY) {
    let currentY = startY;
    
    // 绘制说话人和时间
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    const headerText = `${messageData.speaker} ${messageData.time}${messageData.isPartial ? ' [部分标记]' : ''}`;
    ctx.fillText(headerText, 80, currentY);
    currentY += 20;
    
    // 绘制内容
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    
    // 如果是部分标记，显示选中的文本和上下文
    let contentToDisplay = messageData.content;
    if (messageData.isPartial && messageData.fullContent) {
      // 找到选中文本在完整内容中的位置
      const index = messageData.fullContent.indexOf(messageData.content);
      if (index !== -1) {
        const before = messageData.fullContent.substring(0, index);
        const after = messageData.fullContent.substring(index + messageData.content.length);
        
        // 显示上下文（前后各20个字符）
        const contextBefore = before.length > 20 ? '...' + before.slice(-20) : before;
        const contextAfter = after.length > 20 ? after.slice(0, 20) + '...' : after;
        
        contentToDisplay = `${contextBefore}【${messageData.content}】${contextAfter}`;
      }
    }
    
    const words = contentToDisplay.split('');
    let line = '';
    const maxWidth = this.notebookCanvas.width - 160;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 80, currentY);
        line = words[i];
        currentY += 20;
      } else {
        line = testLine;
      }
    }
    
    if (line !== '') {
      ctx.fillText(line, 80, currentY);
      currentY += 20;
    }
    
    // 绘制标签
    if (messageData.emotionTags.length > 0 || messageData.textTags.length > 0 || messageData.customTags.length > 0) {
      currentY += 5;
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      
      let tagsText = '标签: ';
      if (messageData.emotionTags.length > 0) {
        tagsText += messageData.emotionTags.join(' ') + ' ';
      }
      if (messageData.textTags.length > 0) {
        tagsText += messageData.textTags.join(', ') + ' ';
      }
      if (messageData.customTags.length > 0) {
        tagsText += messageData.customTags.join(', ');
      }
      
      ctx.fillText(tagsText, 80, currentY);
      currentY += 25;
    } else {
      currentY += 15;
    }
    
    return currentY;
  }

  // 获取画布现有内容的高度（简单实现）
  getCanvasContentHeight() {
    // 这里可以实现更复杂的逻辑来检测画布内容的实际高度
    // 简单实现：根据已标记消息的数量估算
    if (this.markedMessages.length === 0) return 0;
    
    // 每个消息大约占用100像素高度，起始位置从50开始（删除了标题）
    return 50 + this.markedMessages.length * 100;
  }

  // 加载自定义标签
  loadCustomTags(container, messageElement) {
    const customTags = JSON.parse(localStorage.getItem('customTags') || '[]');
    
    customTags.forEach(tagText => {
      const tag = document.createElement('button');
      tag.textContent = tagText;
      tag.className = 'custom-tag';
      tag.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #fbbf24;
        background: #fef3c7;
        color: #f59e0b;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#f59e0b';
          tag.style.color = 'white';
          tag.style.borderColor = '#f59e0b';
          tag.dataset.selectedTime = Date.now();
        } else {
          tag.style.background = '#fef3c7';
          tag.style.color = '#f59e0b';
          tag.style.borderColor = '#fbbf24';
          delete tag.dataset.selectedTime;
        }
        // 标签状态改变时自动更新笔记
        this.autoUpdateNotesForMessage(messageElement);
      });
      
      container.appendChild(tag);
    });
  }

  // 显示自定义标签管理对话框
  showCustomTagModal() {
    // 获取现有标签，如果为空则初始化预设标签
    let customTags = JSON.parse(localStorage.getItem('customTags') || '[]');
    
    // 如果没有自定义标签，初始化一些预设标签
    if (customTags.length === 0) {
      customTags = [
        '😭哭', '😰焦虑', '😠愤怒', '😔抑郁', '😊开心', 
        '🌟重要', '⚠️风险', '💊药物服用',
        '关键议题', '咨询目标', '咨询计划'
      ];
      localStorage.setItem('customTags', JSON.stringify(customTags));
    }
    
    const modal = document.createElement('div');
    modal.className = 'custom-tag-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">自定义标签管理</h3>
        <button class="close-modal" style="width: 32px; height: 32px; background: none; border: none; font-size: 18px; color: #6b7280; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;">×</button>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 16px;">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">添加新标签</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="customTagInput" placeholder="输入标签名称..." style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            <button id="addCustomTagBtn" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.2s ease;">添加</button>
          </div>
        </div>
        <div>
          <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">现有标签 (点击 × 删除)</label>
          <div id="customTagsList" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 60px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb;">
            <!-- 标签将通过JavaScript动态生成 -->
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 16px; border-top: 1px solid #e2e8f0;">
        <button class="close-modal" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.2s ease;">关闭</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 获取标签列表容器
    const tagsList = modal.querySelector('#customTagsList');
    
    // 动态生成现有标签
    const renderTags = () => {
      tagsList.innerHTML = '';
      customTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.style.cssText = 'display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #fef3c7; color: #f59e0b; border: 1px solid #fbbf24; border-radius: 16px; font-size: 12px; margin: 2px;';
        tagElement.innerHTML = `
          <span>${tag}</span>
          <button style="background: none; border: none; color: #f59e0b; cursor: pointer; padding: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-weight: bold;">×</button>
        `;
        
        // 绑定删除事件
        tagElement.querySelector('button').addEventListener('click', () => {
          const index = customTags.indexOf(tag);
          if (index > -1) {
            customTags.splice(index, 1);
            localStorage.setItem('customTags', JSON.stringify(customTags));
            renderTags(); // 重新渲染
          }
        });
        
        tagsList.appendChild(tagElement);
      });
    };
    
    // 初始渲染
    renderTags();
    
    // 绑定事件
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    const addBtn = modal.querySelector('#addCustomTagBtn');
    const input = modal.querySelector('#customTagInput');
    
    const addTag = () => {
      const tagText = input.value.trim();
      if (tagText && !customTags.includes(tagText)) {
        customTags.push(tagText);
        localStorage.setItem('customTags', JSON.stringify(customTags));
        
        renderTags(); // 重新渲染标签列表
        input.value = '';
      }
    };
    
    addBtn.addEventListener('click', addTag);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTag();
      }
    });
  }

  // --- 新的笔记模式和语音识别方法 ---

  switchNoteMode(newMode) {
    if (this.currentNoteMode === newMode) return;
    
    this.currentNoteMode = newMode;
    
    // 更新UI
    const notebookPaper = document.querySelector('.notebook-paper');
    const notebookTextarea = document.getElementById('notebookTextarea');
    const notebookCanvas = document.getElementById('notebookCanvas');
    
    console.log('切换到模式:', newMode, '元素检查:', { notebookTextarea, notebookCanvas });
    
    if (newMode === 'text') {
      // 文本模式：显示文本框，隐藏画布绘制
      if (notebookTextarea) {
        notebookTextarea.style.display = 'block';
        notebookTextarea.style.pointerEvents = 'auto';
        notebookTextarea.style.backgroundColor = 'transparent';
        notebookTextarea.readOnly = false;
      }
      if (notebookCanvas) {
        notebookCanvas.style.pointerEvents = 'none';
        notebookCanvas.style.opacity = '0.3';
      }
      if (notebookPaper) {
        notebookPaper.classList.remove('drawing-mode');
        notebookPaper.classList.add('text-mode');
      }
    } else if (newMode === 'drawing') {
      // 手写模式：文本框可见但只读，启用画布绘制
      if (notebookTextarea) {
        notebookTextarea.style.display = 'block';
        notebookTextarea.style.pointerEvents = 'none';
        notebookTextarea.style.backgroundColor = 'transparent';
        notebookTextarea.readOnly = true;
      }
      if (notebookCanvas) {
        notebookCanvas.style.pointerEvents = 'auto';
        notebookCanvas.style.opacity = '1';
        this.setupCanvasEvents(notebookCanvas, this.notebookCtx);
      }
      if (notebookPaper) {
        notebookPaper.classList.remove('text-mode');
        notebookPaper.classList.add('drawing-mode');
      }
    }

    // 更新按钮状态
    const noteModeToolbar = document.querySelector('.note-mode-toolbar');
    if (noteModeToolbar) {
      noteModeToolbar.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      const activeButton = noteModeToolbar.querySelector(`[data-mode="${newMode}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }
    }
    
    console.log('模式切换完成:', newMode);
  }

  // 处理全局点击事件
  handleGlobalClick(e) {
    // 如果点击的是逐字稿消息或其标签，不处理
    const transcriptMessage = e.target.closest('.transcript-message');
    const tagContainer = e.target.closest('.message-tags');
    
    if (!transcriptMessage && !tagContainer && this.currentSelectedMessage) {
      this.deselectMessage();
    }
  }

  // 处理消息点击
  handleMessageClick(messageElement) {
    // 如果已经有选中的消息，先取消选择
    if (this.currentSelectedMessage && this.currentSelectedMessage !== messageElement) {
      this.deselectMessage();
    }
    
    // 选择当前消息
    this.selectMessage(messageElement);
  }

  // 选择消息
  selectMessage(messageElement) {
    this.currentSelectedMessage = messageElement;
    
    // 强制暂停逐字稿流动
    this.transcriptPaused = true;
    this.isRecording = false; // 暂停录制
    
    // 添加选中样式
    messageElement.classList.add('selected');
    
    // 显示标签选择界面
    this.showTagSelection(messageElement);
    
    // 更新滚动指示器
    this.updateScrollIndicator('user-scrolling', '标记模式');
    
    console.log('消息已选中，逐字稿已暂停');
  }

  // 取消选择消息
  deselectMessage() {
    if (!this.currentSelectedMessage) return;
    
    // 移除选中样式
    this.currentSelectedMessage.classList.remove('selected');
    
    // 隐藏标签选择界面
    this.hideTagSelection();
    
    // 恢复逐字稿流动
    this.transcriptPaused = false;
    this.isRecording = true; // 恢复录制
    this.resumeTranscriptWithCatchup();
    
    this.currentSelectedMessage = null;
    
    // 恢复自动滚动
    this.updateScrollIndicator('auto-scrolling', '自动跟随');
    
    console.log('消息取消选中，逐字稿已恢复');
  }

  // 显示标签选择界面
  showTagSelection(messageElement) {
    // 检查是否已经有标签容器
    let tagsContainer = messageElement.querySelector('.message-tags');
    if (!tagsContainer) {
      tagsContainer = document.createElement('div');
      tagsContainer.className = 'message-tags';
      tagsContainer.style.cssText = `
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 6px;
        border: 2px solid #3b82f6;
        animation: fadeInUp 0.3s ease;
      `;
      messageElement.appendChild(tagsContainer);
    }
    
    // 表情标签行
    const emotionTags = document.createElement('div');
    emotionTags.className = 'emotion-tags';
    emotionTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    // 表情标签：咨询中最常见的情绪和状态
    const emotions = ['😭哭', '😰焦虑', '😠愤怒', '😔抑郁', '😊开心', '🌟重要', '⚠️风险', '💊药物服用'];
    emotions.forEach(emotion => {
      const tag = document.createElement('button');
      tag.textContent = emotion;
      tag.className = 'emotion-tag';
      tag.style.cssText = `
        padding: 6px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTag(tag, 'emotion');
      });
      
      emotionTags.appendChild(tag);
    });
    
    // 文字标签行
    const textTags = document.createElement('div');
    textTags.className = 'text-tags';
    textTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-top: 4px;
    `;
    
    // 文字标签：咨询重点
    const textLabels = ['关键议题', '咨询目标', '咨询计划'];
    textLabels.forEach(label => {
      const tag = document.createElement('button');
      tag.textContent = label;
      tag.className = 'text-tag';
      tag.style.cssText = `
        padding: 6px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTag(tag, 'text');
      });
      
      textTags.appendChild(tag);
    });
    
    // 确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认标记';
    confirmBtn.className = 'confirm-mark-btn';
    confirmBtn.style.cssText = `
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
      align-self: flex-start;
      transition: all 0.2s ease;
    `;
    
    confirmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirmMessageMark(messageElement);
    });
    
    tagsContainer.appendChild(emotionTags);
    tagsContainer.appendChild(textTags);
    tagsContainer.appendChild(confirmBtn);
  }

  // 隐藏标签选择界面
  hideTagSelection() {
    if (!this.currentSelectedMessage) return;
    
    const tagsContainer = this.currentSelectedMessage.querySelector('.message-tags');
    if (tagsContainer) {
      tagsContainer.remove();
    }
  }

  // 切换标签状态
  toggleTag(tagElement, type) {
    const isSelected = tagElement.classList.contains('selected');
    
    if (isSelected) {
      tagElement.classList.remove('selected');
      tagElement.style.background = 'white';
      tagElement.style.color = '';
      if (type === 'emotion') {
        tagElement.style.borderColor = '#e2e8f0';
      } else {
        tagElement.style.borderColor = '#e2e8f0';
      }
    } else {
      tagElement.classList.add('selected');
      if (type === 'emotion') {
        tagElement.style.background = '#3b82f6';
        tagElement.style.color = 'white';
        tagElement.style.borderColor = '#3b82f6';
      } else {
        tagElement.style.background = '#10b981';
        tagElement.style.color = 'white';
        tagElement.style.borderColor = '#10b981';
      }
    }
  }

  // 确认消息标记
  confirmMessageMark(messageElement) {
    // 收集选中的标签
    const selectedEmotionTags = Array.from(messageElement.querySelectorAll('.emotion-tag.selected'))
      .map(tag => tag.textContent);
    const selectedTextTags = Array.from(messageElement.querySelectorAll('.text-tag.selected'))
      .map(tag => tag.textContent);
    
    // 创建标记数据
    const messageData = {
      element: messageElement,
      speaker: messageElement.querySelector('.message-speaker').textContent,
      content: messageElement.querySelector('.message-content').textContent,
      time: messageElement.querySelector('.message-time').textContent,
      emotionTags: selectedEmotionTags,
      textTags: selectedTextTags,
      isPartial: false
    };
    
    // 添加到标记列表
    this.markedMessages.push(messageData);
    
    // 添加标记样式
    messageElement.classList.add('marked');
    messageElement.style.backgroundColor = '#dbeafe';
    messageElement.style.border = '2px solid #3b82f6';
    messageElement.style.borderRadius = '8px';
    messageElement.style.padding = '12px';
    messageElement.style.marginBottom = '16px';
    
    // 立即添加到文本笔记
    this.addToTextNotes(messageData);
    
    // 取消选择
    this.deselectMessage();
    
    // 显示成功提示
    this.showToast('内容已标记并添加到笔记', 'success');
  }

  // 添加到文本笔记
  addToTextNotes(messageData) {
    console.log('开始添加到文本笔记:', messageData);
    
    // 直接获取元素，不依赖this.notebookTextarea
    const notebookTextarea = document.getElementById('notebookTextarea');
    console.log('获取到的文本框元素:', notebookTextarea);
    
    if (!notebookTextarea) {
      console.error('无法找到笔记本文本框元素');
      this.showToast('无法找到笔记本文本框', 'error');
      return;
    }
    
    // 构建笔记格式：说话人："说话内容" 标记：标签1，标签2
    let noteText = `${messageData.speaker}："${messageData.content}"\n`;
    
    // 添加标签
    const allTags = [...messageData.emotionTags, ...messageData.textTags];
    if (allTags.length > 0) {
      noteText += `标记：${allTags.join('，')}\n`;
    }
    
    noteText += '\n'; // 添加空行分隔
    
    console.log('准备添加的文本:', noteText);
    
    // 添加到现有内容
    const currentContent = notebookTextarea.value || '';
    const newContent = currentContent + noteText;
    notebookTextarea.value = newContent;
    
    console.log('文本框内容更新完成，新内容长度:', newContent.length);
    
    // 滚动到底部
    notebookTextarea.scrollTop = notebookTextarea.scrollHeight;
    
    // 确保文本框可见并获得焦点
    notebookTextarea.style.display = 'block';
    notebookTextarea.focus();
    
    console.log('内容已成功添加到笔记本');
  }

  // 调试页面状态
  debugPageStatus() {
    const notebookTextarea = document.getElementById('notebookTextarea');
    const notebookCanvas = document.getElementById('notebookCanvas');
    const notebookPaper = document.querySelector('.notebook-paper');
    
    console.log('=== 页面状态调试 ===');
    console.log('文本框元素:', notebookTextarea);
    console.log('文本框样式:', notebookTextarea ? {
      display: getComputedStyle(notebookTextarea).display,
      pointerEvents: getComputedStyle(notebookTextarea).pointerEvents,
      zIndex: getComputedStyle(notebookTextarea).zIndex,
      backgroundColor: getComputedStyle(notebookTextarea).backgroundColor
    } : '未找到');
    console.log('画布元素:', notebookCanvas);
    console.log('笔记本容器:', notebookPaper);
    console.log('笔记本容器类名:', notebookPaper ? notebookPaper.className : '未找到');
    console.log('当前笔记模式:', this.currentNoteMode);
    console.log('==================');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationNotesNew();
}); 