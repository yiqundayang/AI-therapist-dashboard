// 咨询笔记页面功能
class ConsultationNotes {
  constructor() {
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.timerInterval = null;
    this.transcriptCount = 0;
    
    // 画板相关
    this.canvas = null;
    this.ctx = null;
    this.currentTool = 'pen';
    this.currentColor = '#000000';
    this.currentSize = 3;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.canvasHistory = [];
    this.historyStep = -1;
    
    // 核销相关
    this.selectedDuration = 60;
    
    // 快速笔记相关
    this.isQuickNoteMode = false;
    this.quickNotes = [];
    this.dragStartElement = null;
    this.dragIndicator = null;
    this.countdownTimer = null;
    this.currentEditingNote = null;
    
    this.initializeElements();
    this.initializeCanvas();
    this.initializeEventListeners();
    this.initializeTimer();
    this.loadConsultationInfo();
  }

  initializeElements() {
    // 获取主要元素
    this.transcriptSection = document.getElementById('transcriptSection');
    this.toggleTranscriptBtn = document.getElementById('toggleTranscriptBtn');
    this.startRecordBtn = document.getElementById('startRecordBtn');
    this.pauseRecordBtn = document.getElementById('pauseRecordBtn');
    this.transcriptText = document.getElementById('transcriptText');
    this.sessionTimer = document.getElementById('sessionTimer');
    this.endConsultationBtn = document.getElementById('endConsultationBtn');
    
    // 画板相关元素
    this.canvas = document.getElementById('drawingCanvas');
    this.textOverlay = document.getElementById('textOverlay');
    this.colorPicker = document.getElementById('colorPicker');
    this.brushSize = document.getElementById('brushSize');
    this.clearCanvasBtn = document.getElementById('clearCanvas');
    this.undoCanvasBtn = document.getElementById('undoCanvas');
    
    // 画板工具按钮
    this.canvasTools = document.querySelectorAll('.canvas-tool');
    
    // 核销弹窗相关元素
    this.checkoutModal = document.getElementById('checkoutModal');
    this.checkoutModalClose = document.getElementById('checkoutModalClose');
    this.cancelCheckout = document.getElementById('cancelCheckout');
    this.confirmCheckout = document.getElementById('confirmCheckout');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    this.customMinutes = document.getElementById('customMinutes');
    
    // 快速笔记相关元素
    this.quickNoteBtn = document.getElementById('quickNoteBtn');
    this.quickNotesOverlay = document.getElementById('quickNotesOverlay');
    this.transcriptContent = document.getElementById('transcriptContent');
  }

  initializeCanvas() {
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // 设置画布初始状态
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentSize;
    
    // 保存初始状态
    this.saveCanvasState();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // 保存当前画布内容
    const imageData = this.ctx ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height) : null;
    
    // 调整画布尺寸
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // 恢复画布内容
    if (imageData) {
      this.ctx.putImageData(imageData, 0, 0);
    }
    
    // 重新设置绘图属性
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentSize;
  }

  initializeEventListeners() {
    // 逐字稿展开/收起
    this.toggleTranscriptBtn?.addEventListener('click', () => {
      this.toggleTranscript();
    });

    // 录音控制
    this.startRecordBtn?.addEventListener('click', () => {
      this.startRecording();
    });

    this.pauseRecordBtn?.addEventListener('click', () => {
      this.pauseRecording();
    });

    // 结束咨询
    this.endConsultationBtn?.addEventListener('click', () => {
      this.showCheckoutModal();
    });

    // 画板工具切换
    this.canvasTools.forEach(tool => {
      tool.addEventListener('click', (e) => {
        this.switchTool(e.target.dataset.tool);
      });
    });

    // 画板控制
    this.colorPicker?.addEventListener('change', (e) => {
      this.currentColor = e.target.value;
      this.ctx.strokeStyle = this.currentColor;
    });

    this.brushSize?.addEventListener('input', (e) => {
      this.currentSize = e.target.value;
      this.ctx.lineWidth = this.currentSize;
    });

    this.clearCanvasBtn?.addEventListener('click', () => {
      this.clearCanvas();
    });

    this.undoCanvasBtn?.addEventListener('click', () => {
      this.undoCanvas();
    });

    // 画布绘制事件
    this.canvas?.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas?.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas?.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas?.addEventListener('mouseout', () => this.stopDrawing());

    // 触摸事件支持
    this.canvas?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas?.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas?.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });

    // 快捷键支持
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // 自动保存
    setInterval(() => {
      this.autoSave();
    }, 30000); // 每30秒自动保存一次
    
    // 快速笔记事件
    this.quickNoteBtn?.addEventListener('mousedown', (e) => {
      this.startQuickNote(e);
    });

    // 全局鼠标事件（用于快速笔记拖拽）
    document.addEventListener('mousemove', (e) => {
      this.handleQuickNoteDrag(e);
    });

    document.addEventListener('mouseup', (e) => {
      this.endQuickNote(e);
    });
    
    // 快速笔记触摸事件支持
    this.quickNoteBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.startQuickNote(mouseEvent);
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isQuickNoteMode) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.handleQuickNoteDrag(mouseEvent);
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (this.isQuickNoteMode) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const mouseEvent = new MouseEvent('mouseup', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.endQuickNote(mouseEvent);
      }
    });
  }

  // 切换工具
  switchTool(tool) {
    this.currentTool = tool;
    
    // 更新工具按钮状态
    this.canvasTools.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // 更新画布光标
    switch (tool) {
      case 'pen':
        this.canvas.style.cursor = 'crosshair';
        break;
      case 'eraser':
        this.canvas.style.cursor = 'grab';
        break;
      case 'text':
        this.canvas.style.cursor = 'text';
        break;
    }
  }

  // 开始绘制
  startDrawing(e) {
    if (this.currentTool === 'text') {
      this.addTextInput(e);
      return;
    }
    
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    
    if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.currentSize * 3; // 橡皮擦更大
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentSize;
    }
  }

  // 绘制
  draw(e) {
    if (!this.isDrawing) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    
    this.lastX = currentX;
    this.lastY = currentY;
  }

  // 停止绘制
  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveCanvasState();
    }
  }

  // 添加文本输入
  addTextInput(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const textInput = document.createElement('textarea');
    textInput.className = 'text-input';
    textInput.style.left = x + 'px';
    textInput.style.top = y + 'px';
    textInput.style.color = this.currentColor;
    textInput.style.fontSize = (this.currentSize * 4) + 'px';
    textInput.placeholder = '输入文字...';
    
    textInput.addEventListener('blur', () => {
      if (textInput.value.trim()) {
        this.drawText(textInput.value, x, y);
      }
      textInput.remove();
    });
    
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        textInput.blur();
      }
    });
    
    this.textOverlay.appendChild(textInput);
    textInput.focus();
  }

  // 绘制文字到画布
  drawText(text, x, y) {
    this.ctx.save();
    this.ctx.fillStyle = this.currentColor;
    this.ctx.font = `${this.currentSize * 4}px Arial`;
    this.ctx.textBaseline = 'top';
    
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, y + (index * this.currentSize * 5));
    });
    
    this.ctx.restore();
    this.saveCanvasState();
  }

  // 清空画布
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveCanvasState();
  }

  // 撤销
  undoCanvas() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreCanvasState();
    }
  }

  // 保存画布状态
  saveCanvasState() {
    this.historyStep++;
    if (this.historyStep < this.canvasHistory.length) {
      this.canvasHistory.length = this.historyStep;
    }
    this.canvasHistory.push(this.canvas.toDataURL());
  }

  // 恢复画布状态
  restoreCanvasState() {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = this.canvasHistory[this.historyStep];
  }

  // 切换逐字稿显示状态
  toggleTranscript() {
    const isCollapsed = this.transcriptSection.classList.contains('collapsed');
    
    if (isCollapsed) {
      this.transcriptSection.classList.remove('collapsed');
      this.toggleTranscriptBtn.querySelector('.toggle-icon').textContent = '−';
      this.toggleTranscriptBtn.title = '收起';
    } else {
      this.transcriptSection.classList.add('collapsed');
      this.toggleTranscriptBtn.querySelector('.toggle-icon').textContent = '+';
      this.toggleTranscriptBtn.title = '展开';
    }
  }

  // 开始录音
  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.isPaused = false;
      
      // 更新UI
      this.startRecordBtn.style.display = 'none';
      this.pauseRecordBtn.style.display = 'inline-flex';
      
      // 开始计时器
      if (!this.startTime) {
        this.startTime = Date.now();
        this.startTimer();
      }
      
      // 模拟语音识别
      this.simulateTranscription();
      
      console.log('开始转文字');
    }
  }

  // 暂停录音
  pauseRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.isPaused = true;
      
      // 更新UI
      this.startRecordBtn.style.display = 'inline-flex';
      this.startRecordBtn.textContent = '继续转文字';
      this.pauseRecordBtn.style.display = 'none';
      
      console.log('暂停转文字');
    }
  }

  // 模拟语音转录
  simulateTranscription() {
    if (!this.isRecording) return;
    
    const sampleTexts = [
      '好的，今天我们继续上次的话题，关于您的睡眠状况。',
      '您最近的睡眠状况怎么样，有改善吗，还是仍然存在问题？',
      '嗯，我理解您的困扰。',
      '我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的，能具体描述一下吗？',
      '很好，您能具体描述一下那种紧张的感觉吗，是身体上的还是心理上的？',
      '理解，这确实是一个常见的反应。',
      '那么我们来尝试一个放松练习，请您跟着我的指导，先深呼吸，然后慢慢放松肩膀。',
      '很棒，您做得很好。',
      '现在您感觉如何，刚才的练习对您有帮助吗，我看到您的肩膀似乎放松了一些。',
      '好的，这种自我觉察很重要，继续保持这种状态。',
      '我想我们可以在接下来的时间里探讨一些应对策略，您觉得怎么样，有什么想法吗？',
      '非常好的想法，您很有洞察力。',
      '那么让我们先从识别压力信号开始，您能告诉我通常在什么情况下会感到压力最大，是工作还是生活？',
      '嗯，工作场景确实是一个常见的压力源，很多人都有同感。',
      '我们可以练习一些在工作环境中可以使用的快速减压技巧，这样您就可以及时调节自己的状态了。'
    ];
    
    const randomDelay = Math.random() * 4000 + 1000; // 1-5秒随机间隔
    
    setTimeout(() => {
      if (this.isRecording && this.transcriptCount < sampleTexts.length) {
        const text = sampleTexts[this.transcriptCount];
        this.addTranscriptText(text);
        this.transcriptCount++;
        this.simulateTranscription(); // 继续模拟
      }
    }, randomDelay);
  }

  // 添加转录文本 - 支持逗号级别选择
  addTranscriptText(text) {
    const sentence = document.createElement('div');
    sentence.className = 'transcript-sentence new';
    
    // 将文本按逗号分割成片段
    const segments = text.split('，').map(segment => segment.trim()).filter(segment => segment.length > 0);
    
    let segmentHTML = '';
    segments.forEach((segment, index) => {
      segmentHTML += `<span class="transcript-segment" data-segment-index="${index}">${segment}</span>`;
      if (index < segments.length - 1) {
        segmentHTML += '<span class="comma-separator">，</span>';
      }
    });
    
    sentence.innerHTML = `
      <span class="speaker-label">咨询师</span>
      <span class="timestamp-small">[${this.formatTime(Date.now() - this.startTime)}]</span>
      <span class="transcript-content">${segmentHTML}</span>
    `;
    
    this.transcriptText.appendChild(sentence);
    
    // 自动滚动到底部
    this.transcriptText.scrollTop = this.transcriptText.scrollHeight;
    
    // 移除高亮动画类
    setTimeout(() => {
      sentence.classList.remove('new');
    }, 2000);
    
    // 显示快速笔记按钮（第一次有内容时）
    if (this.transcriptText.children.length === 1) {
      this.quickNoteBtn.style.display = 'inline-flex';
    }
  }

  // 显示核销弹窗
  showCheckoutModal() {
    // 更新弹窗信息
    document.getElementById('checkoutClientName').textContent = document.getElementById('clientName').textContent;
    document.getElementById('checkoutStartTime').textContent = document.getElementById('consultationTime').textContent.split(' ')[0] + ' ' + document.getElementById('consultationTime').textContent.split(' ')[1].split('-')[0];
    document.getElementById('checkoutActualDuration').textContent = this.sessionTimer.textContent;
    
    // 显示弹窗
    this.checkoutModal.style.display = 'flex';
    
    // 添加核销弹窗事件监听器
    this.setupCheckoutEventListeners();
  }
  
  // 设置核销弹窗事件监听器
  setupCheckoutEventListeners() {
    // 关闭弹窗
    this.checkoutModalClose?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    this.cancelCheckout?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    // 确认核销
    this.confirmCheckout?.addEventListener('click', () => {
      this.processCheckout();
    });
    
    // 时长选择
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectDuration(e.target.dataset.minutes);
      });
    });
    
    this.customMinutes?.addEventListener('input', (e) => {
      this.selectCustomDuration(e.target.value);
    });
    
    // 点击背景关闭弹窗
    this.checkoutModal.addEventListener('click', (e) => {
      if (e.target === this.checkoutModal) {
        this.hideCheckoutModal();
      }
    });
  }
  
  // 隐藏核销弹窗
  hideCheckoutModal() {
    this.checkoutModal.style.display = 'none';
  }
  
  // 选择核销时长
  selectDuration(minutes) {
    this.selectedDuration = parseInt(minutes);
    
    // 更新按钮状态
    this.durationBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-minutes="${minutes}"]`).classList.add('active');
    
    // 清空自定义输入
    this.customMinutes.value = '';
  }
  
  // 选择自定义时长
  selectCustomDuration(minutes) {
    if (minutes && minutes > 0) {
      this.selectedDuration = parseInt(minutes);
      
      // 取消其他按钮的选中状态
      this.durationBtns.forEach(btn => btn.classList.remove('active'));
    }
  }
  
  // 处理核销
  processCheckout() {
    const remark = document.getElementById('checkoutRemark').value;
    
    // 构建核销数据
    const checkoutData = {
      clientName: document.getElementById('checkoutClientName').textContent,
      consultationTime: document.getElementById('checkoutStartTime').textContent,
      actualDuration: document.getElementById('checkoutActualDuration').textContent,
      billedDuration: this.selectedDuration,
      remark: remark,
      timestamp: new Date().toISOString(),
      // 添加快速笔记和逐字稿标签信息
      quickNotes: this.quickNotes.map(note => ({
        id: note.id,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        originalTranscript: note.originalTranscript
      })),
      // 保存完整的逐字稿内容（包含标签信息）
      transcriptWithTags: this.transcriptText.innerHTML
    };
    
    // 保存核销数据
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    checkouts.push(checkoutData);
    localStorage.setItem('consultationCheckouts', JSON.stringify(checkouts));
    
    // 保存笔记数据
    this.saveNotes();
    
    // 隐藏弹窗
    this.hideCheckoutModal();
    
    // 跳转到智能咨询记录页面
    setTimeout(() => {
      window.location.href = 'consultation-record.html?client=' + encodeURIComponent(checkoutData.clientName);
    }, 500);
    
    console.log('核销成功:', checkoutData);
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
          this.undoCanvas();
          break;
      }
    }
    
    // ESC键收起逐字稿
    if (e.key === 'Escape') {
      if (!this.transcriptSection.classList.contains('collapsed')) {
        this.toggleTranscript();
      }
    }
  }

  // 初始化计时器
  initializeTimer() {
    this.sessionTimer.textContent = '00:00:00';
  }

  // 开始计时器
  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.startTime && this.isRecording) {
        const elapsed = Date.now() - this.startTime;
        this.sessionTimer.textContent = this.formatTime(elapsed);
      }
    }, 1000);
  }

  // 格式化时间
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 加载咨询信息
  loadConsultationInfo() {
    // 从URL参数或localStorage获取咨询信息
    const urlParams = new URLSearchParams(window.location.search);
    const clientName = urlParams.get('client') || '李小雅';
    const sessionCount = urlParams.get('session') || '3';
    const appointmentTime = urlParams.get('time') || '2024年1月18日 14:00-15:00';
    
    // 更新页面信息
    document.getElementById('clientName').textContent = clientName;
    document.getElementById('sessionCount').textContent = `第 ${sessionCount} 次咨询`;
    document.getElementById('consultationTime').textContent = appointmentTime;
  }

  // 保存笔记
  saveNotes() {
    const canvasData = this.canvas.toDataURL();
    const transcriptContent = this.transcriptText.innerHTML;
    
    // 构建保存数据
    const notesData = {
      timestamp: new Date().toISOString(),
      clientName: document.getElementById('clientName').textContent,
      sessionCount: document.getElementById('sessionCount').textContent,
      consultationTime: document.getElementById('consultationTime').textContent,
      duration: this.sessionTimer.textContent,
      canvasDrawing: canvasData,
      transcript: transcriptContent,
      // 添加快速笔记数据
      quickNotes: this.quickNotes.map(note => ({
        id: note.id,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        originalTranscript: note.originalTranscript
      }))
    };
    
    // 保存到localStorage (实际项目中应该发送到服务器)
    const savedNotes = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
    savedNotes.push(notesData);
    localStorage.setItem('consultationNotes', JSON.stringify(savedNotes));
    
    console.log('笔记已保存:', notesData);
  }

  // 自动保存
  autoSave() {
    if (this.canvas && this.canvasHistory.length > 1) {
      this.saveNotes();
      console.log('自动保存完成');
    }
  }
  
  // ========== 快速笔记功能 ==========
  
  // 开始快速笔记
  startQuickNote(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.isQuickNoteMode = true;
    this.quickNoteBtn.classList.add('active');
    
    // 检查逐字稿容器是否存在
    if (this.transcriptContent) {
      this.transcriptContent.classList.add('selecting-mode');
    }
    
    // 创建拖拽指示器
    this.dragIndicator = document.createElement('div');
    this.dragIndicator.className = 'drag-indicator';
    this.dragIndicator.textContent = '拖拽到逐字稿选择内容';
    document.body.appendChild(this.dragIndicator);
    
    // 更新指示器位置
    this.updateDragIndicator(e);
    
    // 阻止按钮的默认行为
    document.body.style.userSelect = 'none';
    
    console.log('开始快速笔记模式');
  }
  
  // 处理快速笔记拖拽
  handleQuickNoteDrag(e) {
    if (!this.isQuickNoteMode || !this.dragIndicator) return;
    
    // 更新拖拽指示器位置
    this.updateDragIndicator(e);
    
    // 检查是否在逐字稿区域上方
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const transcriptSegment = element?.closest('.transcript-segment');
    const transcriptSentence = element?.closest('.transcript-sentence');
    
    // 清除之前的选择状态
    document.querySelectorAll('.transcript-sentence.selecting, .transcript-segment.selecting').forEach(el => {
      el.classList.remove('selecting');
    });
    
    // 优先选择片段，如果没有片段则选择整句
    if (transcriptSegment) {
      transcriptSegment.classList.add('selecting');
      this.dragIndicator.textContent = '松手添加片段到笔记';
      this.dragIndicator.style.backgroundColor = 'var(--success-green)';
    } else if (transcriptSentence) {
      transcriptSentence.classList.add('selecting');
      this.dragIndicator.textContent = '松手添加整句到笔记';
      this.dragIndicator.style.backgroundColor = 'var(--success-green)';
    } else {
      this.dragIndicator.textContent = '拖拽到逐字稿选择内容';
      this.dragIndicator.style.backgroundColor = 'var(--primary-blue)';
    }
  }
  
  // 结束快速笔记
  endQuickNote(e) {
    if (!this.isQuickNoteMode) return;
    
    console.log('结束快速笔记模式');
    console.log('鼠标位置:', { x: e.clientX, y: e.clientY });
    
    this.isQuickNoteMode = false;
    this.quickNoteBtn.classList.remove('active');
    
    // 恢复样式
    document.body.style.userSelect = '';
    
    if (this.transcriptContent) {
      this.transcriptContent.classList.remove('selecting-mode');
    }
    
    // 移除拖拽指示器
    if (this.dragIndicator) {
      this.dragIndicator.remove();
      this.dragIndicator = null;
    }
    
    // 检查是否在逐字稿片段或句子上松手
    const element = document.elementFromPoint(e.clientX, e.clientY);
    console.log('检测到的元素:', element);
    
    const transcriptSegment = element?.closest('.transcript-segment');
    const transcriptSentence = element?.closest('.transcript-sentence');
    
    console.log('检测结果:', {
      transcriptSegment,
      transcriptSentence,
      elementClasses: element?.className,
      parentClasses: element?.parentElement?.className
    });
    
    if (transcriptSegment) {
      this.addQuickNoteFromSegment(transcriptSegment);
      console.log('找到逐字稿片段，添加笔记');
    } else if (transcriptSentence) {
      this.addQuickNoteFromSentence(transcriptSentence);
      console.log('找到逐字稿句子，添加笔记');
    } else {
      console.log('未找到逐字稿内容，元素类名:', element?.className);
      console.log('元素路径:', this.getElementPath(element));
    }
    
    // 清除选择状态
    document.querySelectorAll('.transcript-sentence.selecting, .transcript-segment.selecting').forEach(el => {
      el.classList.remove('selecting');
    });
  }
  
  // 辅助方法：获取元素路径用于调试
  getElementPath(element) {
    if (!element) return 'null';
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      const tag = current.tagName?.toLowerCase() || 'unknown';
      const classes = current.className ? `.${current.className.split(' ').join('.')}` : '';
      const id = current.id ? `#${current.id}` : '';
      path.unshift(`${tag}${id}${classes}`);
      current = current.parentElement;
    }
    return path.join(' > ');
  }
  
  // 更新拖拽指示器位置
  updateDragIndicator(e) {
    if (this.dragIndicator) {
      this.dragIndicator.style.left = (e.clientX + 10) + 'px';
      this.dragIndicator.style.top = (e.clientY - 30) + 'px';
    }
  }
  
  // 从逐字稿片段添加快速笔记
  addQuickNoteFromSegment(transcriptSegment) {
    console.log('addQuickNoteFromSegment 被调用，片段元素:', transcriptSegment);
    
    const noteText = transcriptSegment.textContent.trim();
    console.log('提取的片段文本:', noteText);
    
    if (!noteText) {
      console.log('片段文本为空');
      return;
    }
    
    this.createQuickNote(noteText, transcriptSegment);
  }
  
  // 从逐字稿句子添加快速笔记
  addQuickNoteFromSentence(transcriptSentence) {
    console.log('addQuickNoteFromSentence 被调用，句子元素:', transcriptSentence);
    
    // 提取整句内容（不包含说话人标识）
    const contentSpan = transcriptSentence.querySelector('.transcript-content');
    
    if (!contentSpan) {
      console.log('未找到 .transcript-content 元素');
      return;
    }
    
    const noteText = contentSpan.textContent.trim();
    console.log('提取的整句文本:', noteText);
    
    if (!noteText) {
      console.log('整句文本为空');
      return;
    }
    
    this.createQuickNote(noteText, transcriptSentence);
  }
  
  // 创建快速笔记的通用方法
  createQuickNote(noteText, sourceElement) {
    console.log('createQuickNote 被调用，参数:', { noteText, sourceElement });
    console.log('quickNotesOverlay 元素:', this.quickNotesOverlay);
    
    // 获取原始逐字稿信息
    const sentence = sourceElement.closest('.transcript-sentence');
    const sentenceIndex = Array.from(this.transcriptText.children).indexOf(sentence);
    const timeElement = sentence?.querySelector('.timestamp-small');
    const timestamp = timeElement?.textContent?.replace(/[\[\]]/g, '') || '';
    
    // 创建笔记对象，包含原始逐字稿位置信息
    const note = {
      id: Date.now(),
      content: noteText,
      tags: [],
      createdAt: new Date().toISOString(),
      position: { x: 50, y: 50 + (this.quickNotes.length * 20) }, // 默认位置，稍微错开
      // 添加原始逐字稿关联信息
      originalTranscript: {
        text: noteText,
        timestamp: timestamp,
        sentenceIndex: sentenceIndex,
        speaker: '咨询师' // 当前都是咨询师发言
      }
    };
    
    // 添加到笔记列表
    this.quickNotes.push(note);
    console.log('笔记已添加到列表，当前笔记数量:', this.quickNotes.length);
    
    // 渲染笔记 - 添加错误捕获
    try {
      console.log('准备调用 renderQuickNote...');
      this.renderQuickNote(note);
      console.log('renderQuickNote 调用完成');
    } catch (error) {
      console.error('renderQuickNote 调用时出错:', error);
      console.error('错误堆栈:', error.stack);
    }
    
    // 显示快速笔记区域并添加has-notes类
    if (this.quickNotesOverlay) {
      this.quickNotesOverlay.classList.add('has-notes');
      console.log('已添加 has-notes 类到覆盖层');
    } else {
      console.error('quickNotesOverlay 元素未找到！');
    }
    
    // 开始十秒倒计时
    try {
      console.log('准备开始倒计时...');
      this.startCountdown(note.id);
      console.log('倒计时开始成功');
    } catch (error) {
      console.error('开始倒计时时出错:', error);
    }
    
    // 添加选中状态
    sourceElement.classList.add('selected-for-note');
    setTimeout(() => {
      sourceElement.classList.remove('selected-for-note');
    }, 1000);
    
    console.log('创建快速笔记成功:', note);
  }
  
  // 渲染快速笔记
  renderQuickNote(note) {
    console.log('renderQuickNote 被调用，笔记:', note);
    console.log('quickNotesOverlay 元素状态:', this.quickNotesOverlay);
    
    if (!this.quickNotesOverlay) {
      console.error('无法渲染笔记：quickNotesOverlay 元素不存在！');
      return;
    }
    
    const noteElement = document.createElement('div');
    noteElement.className = 'quick-note-item editing';
    noteElement.dataset.noteId = note.id;
    
    // 不再设置绝对定位的left和top，让它使用相对定位在覆盖层中居中显示
    // noteElement.style.left = note.position.x + 'px';
    // noteElement.style.top = note.position.y + 'px';
    
    noteElement.innerHTML = `
      <div class="countdown-progress" style="display: none;">
        <div class="countdown-bar" style="width: 100%;"></div>
      </div>
      <div class="countdown-text" style="display: none;">可选择标签: <span class="countdown-seconds">4</span>秒</div>
      <div class="quick-note-content">${note.content}</div>
      <div class="quick-note-tags">
        <span class="note-tag countdown-active" data-type="important" data-tag="重要" title="重要">⭐</span>
        <span class="note-tag countdown-active" data-type="risk" data-tag="风险" title="风险">⚠️</span>
        <span class="note-tag countdown-active" data-type="emotion" data-tag="哭" title="哭">😢</span>
        <span class="note-tag countdown-active" data-type="emotion" data-tag="焦虑" title="焦虑">😰</span>
        <span class="note-tag countdown-active" data-type="task" data-tag="任务" title="任务">✅</span>
      </div>
      <button class="clear-notes-btn" title="删除笔记">×</button>
    `;
    
    console.log('笔记元素HTML已创建');
    
    // 添加标签点击事件
    const tags = noteElement.querySelectorAll('.note-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNoteTag(note.id, e.target);
      });
    });
    
    // 添加删除按钮事件
    const clearBtn = noteElement.querySelector('.clear-notes-btn');
    clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeQuickNote(note.id);
    });
    
    // 添加点击笔记重新编辑功能
    noteElement.addEventListener('click', (e) => {
      // 如果点击的是标签或删除按钮，不触发编辑
      if (e.target.closest('.note-tag') || e.target.closest('.clear-notes-btn')) {
        return;
      }
      this.editQuickNote(note.id);
    });
    
    // 添加长按拖拽功能
    this.makeLongPressDraggable(noteElement, note);
    
    // 直接添加到覆盖层
    this.quickNotesOverlay.appendChild(noteElement);
    console.log('笔记元素已添加到DOM，覆盖层子元素数量:', this.quickNotesOverlay.children.length);
    
    // 强制刷新显示
    this.quickNotesOverlay.style.display = 'block';
    noteElement.style.display = 'block';
    
    // 滚动到新添加的笔记
    noteElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // 开始倒计时
  startCountdown(noteId) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;
    
    const progressBar = noteElement.querySelector('.countdown-progress');
    const progressFill = noteElement.querySelector('.countdown-bar');
    const countdownText = noteElement.querySelector('.countdown-text');
    const countdownSeconds = noteElement.querySelector('.countdown-seconds');
    const tags = noteElement.querySelectorAll('.note-tag');
    
    // 显示倒计时元素
    progressBar.style.display = 'block';
    countdownText.style.display = 'block';
    
    let timeLeft = 4; // 改为4秒
    this.currentEditingNote = noteId;
    
    // 清除之前的计时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    // 初始显示
    countdownSeconds.textContent = timeLeft;
    progressFill.style.width = '100%';
    
    this.countdownTimer = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        // 时间到了，立即结束倒计时
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.checkForSecondRound(noteId);
        return;
      }
      
      // 更新显示
      countdownSeconds.textContent = timeLeft;
      
      // 更新进度条
      const progress = (timeLeft / 4) * 100; // 分母改为4
      progressFill.style.width = progress + '%';
    }, 1000);
    
    console.log(`开始倒计时 ${timeLeft} 秒，笔记ID: ${noteId}`);
  }
  
  // 结束倒计时
  endCountdown(noteId) {
    console.log(`倒计时结束，笔记ID: ${noteId}`);
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;
    
    // 隐藏倒计时元素
    const progressBar = noteElement.querySelector('.countdown-progress');
    const countdownText = noteElement.querySelector('.countdown-text');
    
    progressBar.style.display = 'none';
    countdownText.style.display = 'none';
    
    // 移除编辑状态和动画
    noteElement.classList.remove('editing');
    
    const tags = noteElement.querySelectorAll('.note-tag');
    tags.forEach(tag => {
      tag.classList.remove('countdown-active');
      // 隐藏未选中的标签
      if (!tag.classList.contains('selected')) {
        tag.style.display = 'none';
      }
    });
    
    this.currentEditingNote = null;
  }
  
  // 删除快速笔记
  removeQuickNote(noteId) {
    // 从数据中删除
    this.quickNotes = this.quickNotes.filter(note => note.id !== noteId);
    
    // 从DOM中删除
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (noteElement) {
      noteElement.remove();
    }
    
    // 清除倒计时
    if (this.currentEditingNote === noteId) {
      this.endCountdown(noteId);
    }
    
    // 如果没有笔记了，隐藏覆盖层
    if (this.quickNotes.length === 0) {
      this.quickNotesOverlay.classList.remove('has-notes');
    }
    
    console.log(`删除快速笔记: ${noteId}`);
  }

  // 编辑快速笔记
  editQuickNote(noteId) {
    console.log('编辑快速笔记:', noteId);
    
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) {
      console.error('未找到笔记元素:', noteId);
      return;
    }
    
    // 清除之前的编辑状态
    if (this.currentEditingNote && this.currentEditingNote !== noteId) {
      this.endCountdown(this.currentEditingNote);
    }
    
    // 设置为编辑状态
    noteElement.classList.add('editing');
    this.currentEditingNote = noteId;
    
    // 显示所有标签
    const tags = noteElement.querySelectorAll('.note-tag');
    tags.forEach(tag => {
      tag.style.display = 'inline-block';
      tag.classList.add('countdown-active');
    });
    
    // 显示倒计时元素
    const progressBar = noteElement.querySelector('.countdown-progress');
    const countdownText = noteElement.querySelector('.countdown-text');
    
    if (progressBar && countdownText) {
      progressBar.style.display = 'block';
      countdownText.style.display = 'block';
      
      // 重新开始4秒倒计时
      this.startCountdown(noteId);
    }
    
    console.log('笔记重新进入编辑模式');
  }

  // 切换笔记标签
  toggleNoteTag(noteId, tagElement) {
    const isSelected = tagElement.classList.contains('selected');
    const tagText = tagElement.dataset.tag;
    
    // 找到对应的笔记
    const note = this.quickNotes.find(n => n.id === noteId);
    if (!note) return;
    
    if (isSelected) {
      // 取消选择
      tagElement.classList.remove('selected');
      note.tags = note.tags.filter(tag => tag !== tagText);
    } else {
      // 选择标签
      tagElement.classList.add('selected');
      if (!note.tags.includes(tagText)) {
        note.tags.push(tagText);
      }
    }
    
    // 只有在倒计时结束后才隐藏未选中的标签
    if (this.currentEditingNote !== noteId) {
      const allTags = tagElement.parentElement.querySelectorAll('.note-tag');
      const hasSelected = tagElement.parentElement.querySelector('.note-tag.selected');
      
      allTags.forEach(tag => {
        if (hasSelected && !tag.classList.contains('selected')) {
          tag.style.display = 'none';
        } else {
          tag.style.display = 'inline-block';
        }
      });
    }
    
    console.log('更新笔记标签:', note);
  }
  
  // 清空快速笔记
  clearQuickNotes() {
    if (this.quickNotes.length === 0) return;
    
    if (confirm('确定要清空所有快速笔记吗？')) {
      // 清除倒计时
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      
      this.quickNotes = [];
      this.quickNotesOverlay.innerHTML = '';
      this.quickNotesOverlay.classList.remove('has-notes');
      this.currentEditingNote = null;
      
      // 清除逐字稿中的选中状态
      document.querySelectorAll('.transcript-sentence.selected-for-note').forEach(el => {
        el.classList.remove('selected-for-note');
      });
      
      // 清除本地存储中的相关数据
      localStorage.removeItem('consultationCheckouts');
      localStorage.removeItem('consultationNotes');
      
      console.log('已清空快速笔记和相关数据');
      
      // 显示清空成功提示
      this.showSuccessMessage('已清空所有快速笔记数据');
    }
  }

  // 显示成功消息
  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 3000);
  }

  // 添加快速笔记 - 保留原方法作为向后兼容
  addQuickNote(transcriptSentence) {
    // 向后兼容，调用新的整句方法
    this.addQuickNoteFromSentence(transcriptSentence);
  }

  // 添加长按拖拽功能
  makeLongPressDraggable(noteElement, note) {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let longPressTimer = null;
    let isLongPress = false;
    
    // 开始长按检测
    const startLongPress = (e) => {
      // 如果点击的是标签或删除按钮，不启动长按
      if (e.target.closest('.note-tag') || e.target.closest('.clear-notes-btn')) {
        return;
      }
      
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        noteElement.style.cursor = 'grabbing';
        noteElement.style.opacity = '0.8';
        startDrag(e);
      }, 500); // 500ms长按
    };
    
    // 取消长按
    const cancelLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (!isDragging) {
        noteElement.style.cursor = 'move';
        noteElement.style.opacity = '1';
      }
    };
    
    // 鼠标按下开始拖拽
    const startDrag = (e) => {
      if (!isLongPress) return;
      
      isDragging = true;
      noteElement.classList.add('dragging');
      
      const rect = noteElement.getBoundingClientRect();
      const canvasRect = this.quickNotesOverlay.getBoundingClientRect();
      
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', endDrag);
      
      e.preventDefault();
    };
    
    // 拖拽过程
    const drag = (e) => {
      if (!isDragging) return;
      
      const canvasRect = this.quickNotesOverlay.getBoundingClientRect();
      let newX = e.clientX - canvasRect.left - dragOffset.x;
      let newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // 边界检查
      const noteRect = noteElement.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, canvasRect.width - noteRect.width));
      newY = Math.max(0, Math.min(newY, canvasRect.height - noteRect.height));
      
      noteElement.style.left = newX + 'px';
      noteElement.style.top = newY + 'px';
      
      // 更新笔记位置
      note.position.x = newX;
      note.position.y = newY;
    };
    
    // 结束拖拽
    const endDrag = () => {
      isDragging = false;
      isLongPress = false;
      noteElement.classList.remove('dragging');
      noteElement.style.cursor = 'move';
      noteElement.style.opacity = '1';
      
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', endDrag);
      
      console.log('笔记位置更新:', note.position);
    };
    
    // 设置初始样式
    noteElement.style.cursor = 'move';
    
    // 鼠标事件
    noteElement.addEventListener('mousedown', startLongPress);
    noteElement.addEventListener('mouseup', cancelLongPress);
    noteElement.addEventListener('mouseleave', cancelLongPress);
    
    // 触摸事件支持
    noteElement.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      startLongPress(mouseEvent);
    });
    
    noteElement.addEventListener('touchend', cancelLongPress);
    
    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        drag(mouseEvent);
      }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      if (isDragging) {
        endDrag();
      }
    });
  }

  // 检查是否需要显示第二轮标签
  checkForSecondRound(noteId) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;
    
    const selectedTags = noteElement.querySelectorAll('.note-tag.selected');
    
    // 如果在第一轮中选择了标签，显示第二轮标签
    if (selectedTags.length > 0) {
      this.showSecondRoundTags(noteId);
    } else {
      // 没有选择任何标签，直接结束编辑
      this.endCountdown(noteId);
    }
  }
  
  // 显示第二轮标签
  showSecondRoundTags(noteId) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;
    
    const tagsContainer = noteElement.querySelector('.quick-note-tags');
    
    // 隐藏第一轮标签
    const firstRoundTags = noteElement.querySelectorAll('.note-tag:not([data-type="plan"]):not([data-type="core"])');
    firstRoundTags.forEach(tag => {
      if (!tag.classList.contains('selected')) {
        tag.style.display = 'none';
      }
    });
    
    // 添加第二轮标签
    const secondRoundTags = `
      <span class="note-tag countdown-active" data-type="plan" data-tag="咨询计划" title="咨询计划">咨询计划</span>
      <span class="note-tag countdown-active" data-type="core" data-tag="核心议题" title="核心议题">核心议题</span>
    `;
    
    tagsContainer.insertAdjacentHTML('beforeend', secondRoundTags);
    
    // 为新标签添加事件监听器
    const newTags = tagsContainer.querySelectorAll('[data-type="plan"], [data-type="core"]');
    newTags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNoteTag(noteId, e.target);
      });
    });
    
    // 开始第二轮倒计时
    this.startSecondRoundCountdown(noteId);
  }
  
  // 开始第二轮倒计时
  startSecondRoundCountdown(noteId) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;
    
    const progressBar = noteElement.querySelector('.countdown-progress');
    const progressFill = noteElement.querySelector('.countdown-bar');
    const countdownText = noteElement.querySelector('.countdown-text');
    const countdownSeconds = noteElement.querySelector('.countdown-seconds');
    
    // 更新提示文本
    countdownText.innerHTML = '第二轮标签选择: <span class="countdown-seconds">4</span>秒';
    
    let timeLeft = 4; // 第二轮也是4秒
    
    // 清除之前的计时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    // 初始显示
    countdownSeconds.textContent = timeLeft;
    progressFill.style.width = '100%';
    
    this.countdownTimer = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        // 时间到了，结束所有倒计时
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.endCountdown(noteId);
        return;
      }
      
      // 更新显示
      countdownSeconds.textContent = timeLeft;
      
      // 更新进度条
      const progress = (timeLeft / 4) * 100;
      progressFill.style.width = progress + '%';
    }, 1000);
    
    console.log(`开始第二轮倒计时 ${timeLeft} 秒，笔记ID: ${noteId}`);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationNotes();
}); 