// 视频咨询页面功能 - 支持横向拖拽布局和快速标记逐字稿
class VideoConsultation {
  constructor() {
    this.isConsulting = false;
    this.startTime = null;
    this.timerInterval = null;
    this.currentTab = 'transcript';
    
    // 布局拖拽相关
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.isVerticalMode = false;
    this.minWidth = 300;
    this.maxWidth = 0;
    this.minHeight = 250;
    this.maxHeight = 0;
    
    // 快速标记相关
    this.isMarkingMode = false;
    this.markedMessages = [];
    this.transcriptPaused = false;
    
    // 历史记录相关
    this.currentHistoryTab = 'records';
    
    // 模拟数据
    this.transcriptMessages = [];
    
    // 解析URL参数
    this.urlParams = new URLSearchParams(window.location.search);
    this.clientName = this.urlParams.get('client') || '王小秀';
    this.userId = this.urlParams.get('userId') || 'user';
    this.consultationTime = this.urlParams.get('time') || '2025/6/17 18:30-19:30';
    
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeResizing();
    this.updateResizeLimits();
    this.handleOrientationChange();
    this.loadConsultationInfo();
    this.startConsultation();
    this.startTimer();
    this.initializeAIAssistant();
    
    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
        this.updateResizeLimits();
      }, 300);
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.handleOrientationChange();
      this.updateResizeLimits();
    });
  }

  initializeElements() {
    // 主要布局元素
    this.consultationContainer = document.getElementById('consultationContainer');
    this.videoSection = document.getElementById('videoSection');
    this.infoPanel = document.getElementById('infoPanel');
    this.resizeHandle = document.getElementById('resizeHandle');
    
    // 定时器和控制
    this.sessionTimer = document.getElementById('sessionTimer');
    this.endConsultationBtn = document.getElementById('endConsultationBtn');
    
    // 标签切换
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // 逐字稿相关
    this.transcriptMessages = document.getElementById('transcriptMessages');
    this.clearTranscriptBtn = document.getElementById('clearTranscriptBtn');
    this.quickMarkBtn = document.getElementById('quickMarkBtn');
    this.endMarkBtn = document.getElementById('endMarkBtn');
    
    // 历史记录内部tab
    this.historyTabBtns = document.querySelectorAll('.history-tab-btn');
    this.historyTabContents = document.querySelectorAll('.history-tab-content');
    
    // 核销弹窗
    this.checkoutModal = document.getElementById('checkoutModal');
    this.checkoutModalClose = document.getElementById('checkoutModalClose');
    this.cancelCheckout = document.getElementById('cancelCheckout');
    this.confirmCheckout = document.getElementById('confirmCheckout');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    
    // AI助手相关
    this.aiTipsContainer = document.querySelector('.ai-tips-container');
    this.aiTipsHeader = document.getElementById('aiTipsHeader');
    this.collapseBtn = document.getElementById('collapseBtn');
    
    this.selectedDuration = 60;
  }

  initializeEventListeners() {
    // 标签切换
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
    
    // 逐字稿控制
    this.clearTranscriptBtn?.addEventListener('click', () => {
      this.clearTranscript();
    });
    
    // 快速标记功能
    this.quickMarkBtn?.addEventListener('click', () => {
      this.startQuickMark();
    });
    
    this.endMarkBtn?.addEventListener('click', () => {
      this.endQuickMark();
    });
    
    // 自定义标签按钮
    /*
    const customTagBtn = document.getElementById('customTagBtn');
    customTagBtn?.addEventListener('click', () => {
      this.showCustomTagModal();
    });
    */
    
    // 历史记录内部tab切换
    this.historyTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchHistoryTab(btn.dataset.tab);
      });
    });
    
    // 结束咨询
    this.endConsultationBtn?.addEventListener('click', () => {
      this.showCheckoutModal();
    });
    
    // 核销弹窗事件
    this.setupCheckoutEventListeners();
    
    // 点击背景关闭弹窗
    this.checkoutModal?.addEventListener('click', (e) => {
      if (e.target === this.checkoutModal) {
        this.hideCheckoutModal();
      }
    });
    
    // 快速标记工具栏
    this.setupQuickMarkToolbar();
  }

  // 处理屏幕方向改变
  handleOrientationChange() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth <= 1024;
    
    // 更新垂直模式标识
    this.isVerticalMode = isPortrait && isSmallScreen;
    
    if (this.isVerticalMode) {
      // 竖屏模式：禁用水平拖拽，启用垂直拖拽
      this.disableResize();
      setTimeout(() => {
        this.enableVerticalResize();
      }, 100);
    } else {
      // 横屏模式：禁用垂直拖拽，启用水平拖拽
      this.disableVerticalResize();
      setTimeout(() => {
        this.enableResize();
      }, 100);
    }
    
    // 界面已更新
  }

  initializeResizing() {
    this.resizeHandle = document.getElementById('resizeHandle');
    this.videoSection = document.getElementById('videoSection');
    this.infoPanel = document.getElementById('infoPanel');
    
    if (!this.resizeHandle || !this.videoSection || !this.infoPanel) {
      console.warn('拖拽元素未找到');
      return;
    }
    
    // 创建绑定的方法引用，避免重复绑定
    this.boundStartResize = this.startResize.bind(this);
    this.boundStartVerticalResize = this.startVerticalResize.bind(this);
    this.boundDoResize = this.doResize.bind(this);
    this.boundStopResize = this.stopResize.bind(this);
    this.boundDoVerticalResize = this.doVerticalResize.bind(this);
    this.boundStopVerticalResize = this.stopVerticalResize.bind(this);
    
    // 根据当前屏幕方向启用相应的拖拽功能
    this.handleOrientationChange();
  }

  enableResize() {
    if (!this.resizeHandle) return;
    
    // 移除可能存在的垂直拖拽事件
    this.resizeHandle.removeEventListener('mousedown', this.boundStartVerticalResize);
    this.resizeHandle.removeEventListener('touchstart', this.boundStartVerticalResize);
    
    // 添加水平拖拽事件
    this.resizeHandle.addEventListener('mousedown', this.boundStartResize);
    this.resizeHandle.addEventListener('touchstart', this.boundStartResize, { passive: false });
    
    // 更新光标样式
    this.resizeHandle.style.cursor = 'col-resize';
    
    console.log('水平拖拽已启用');
  }

  disableResize() {
    if (!this.resizeHandle) return;
    
    // 移除水平拖拽事件监听器
    this.resizeHandle.removeEventListener('mousedown', this.boundStartResize);
    this.resizeHandle.removeEventListener('touchstart', this.boundStartResize);
    
    console.log('水平拖拽已禁用');
  }

  enableVerticalResize() {
    if (!this.resizeHandle) return;
    
    // 移除可能存在的水平拖拽事件
    this.resizeHandle.removeEventListener('mousedown', this.boundStartResize);
    this.resizeHandle.removeEventListener('touchstart', this.boundStartResize);
    
    // 添加垂直拖拽事件
    this.resizeHandle.addEventListener('mousedown', this.boundStartVerticalResize);
    this.resizeHandle.addEventListener('touchstart', this.boundStartVerticalResize, { passive: false });
    
    // 更新光标样式
    this.resizeHandle.style.cursor = 'row-resize';
    
    console.log('垂直拖拽已启用');
  }

  disableVerticalResize() {
    if (!this.resizeHandle) return;
    
    // 移除垂直拖拽事件监听器
    this.resizeHandle.removeEventListener('mousedown', this.boundStartVerticalResize);
    this.resizeHandle.removeEventListener('touchstart', this.boundStartVerticalResize);
    
    console.log('垂直拖拽已禁用');
  }

  startResize(e) {
    // 只在横屏模式下允许水平拖拽
    if (this.isVerticalMode) return;
    
    e.preventDefault();
    
    this.isDragging = true;
    this.startX = e.clientX || (e.touches && e.touches[0].clientX);
    this.startWidth = parseInt(getComputedStyle(this.videoSection).width, 10);
    this.resizeHandle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // 添加半透明遮罩，提高移动设备上的拖拽体验
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 9999;
      cursor: col-resize;
    `;
    document.body.appendChild(overlay);
    
    // 输出调试信息
    console.log('开始拖拽:', {
      startX: this.startX,
      startWidth: this.startWidth,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      screenWidth: window.innerWidth
    });
    
    // 绑定移动和结束事件
    document.addEventListener('mousemove', this.boundDoResize);
    document.addEventListener('mouseup', this.boundStopResize);
    document.addEventListener('touchmove', this.boundDoResize);
    document.addEventListener('touchend', this.boundStopResize);
  }

  doResize(e) {
    if (!this.isDragging || this.isVerticalMode) return;
    
    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = currentX - this.startX;
    let newWidth = this.startWidth + deltaX;
    
    // 确保边界值正确
    const containerWidth = window.innerWidth;
    const actualMinWidth = Math.max(this.minWidth, 250); // 绝对最小宽度
    const actualMaxWidth = Math.min(this.maxWidth, containerWidth - 200); // 为信息面板留出至少200px
    
    // 限制宽度范围
    newWidth = Math.max(actualMinWidth, Math.min(newWidth, actualMaxWidth));
    
    // 输出调试信息
    console.log('拖拽中:', {
      currentX,
      deltaX,
      newWidth,
      actualMinWidth,
      actualMaxWidth,
      containerWidth
    });
    
    // 应用新宽度
    this.videoSection.style.width = `${newWidth}px`;
    
    // 确保信息面板自适应剩余空间
    if (this.infoPanel) {
      const remainingWidth = containerWidth - newWidth - 12; // 减去拖拽条宽度
      this.infoPanel.style.width = `${Math.max(200, remainingWidth)}px`;
    }
    
    // 界面已更新
  }

  stopResize() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.resizeHandle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // 移除拖拽遮罩
    const overlay = document.getElementById('resize-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // 移除事件监听器
    document.removeEventListener('mousemove', this.boundDoResize);
    document.removeEventListener('mouseup', this.boundStopResize);
    document.removeEventListener('touchmove', this.boundDoResize);
    document.removeEventListener('touchend', this.boundStopResize);
    
    // 确保布局一致性 - 重置信息面板样式
    if (this.infoPanel) {
      this.infoPanel.style.width = ''; // 清除内联样式，让CSS flex布局接管
    }
    
    // 获取最终的宽度值并确保布局正确
    const finalWidth = parseInt(getComputedStyle(this.videoSection).width, 10);
    console.log('拖拽结束，最终宽度:', finalWidth);
  }

  startVerticalResize(e) {
    e.preventDefault();
    
    this.isDragging = true;
    this.startY = e.clientY || (e.touches && e.touches[0].clientY);
    this.startHeight = parseInt(getComputedStyle(this.videoSection).height, 10);
    this.resizeHandle.classList.add('dragging');
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    
    // 添加半透明遮罩，提高移动设备上的拖拽体验
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 9999;
      cursor: row-resize;
    `;
    document.body.appendChild(overlay);
    
    // 绑定移动和结束事件
    document.addEventListener('mousemove', this.boundDoVerticalResize);
    document.addEventListener('mouseup', this.boundStopVerticalResize);
    document.addEventListener('touchmove', this.boundDoVerticalResize);
    document.addEventListener('touchend', this.boundStopVerticalResize);
  }

  doVerticalResize(e) {
    if (!this.isDragging) return;
    
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);
    const deltaY = currentY - this.startY;
    let newHeight = this.startHeight + deltaY;
    
    // 限制最小和最大高度
    newHeight = Math.max(this.minHeight, Math.min(newHeight, this.maxHeight));
    
    this.videoSection.style.height = `${newHeight}px`;
    
    // 界面已更新
  }

  stopVerticalResize() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.resizeHandle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // 移除拖拽遮罩
    const overlay = document.getElementById('resize-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // 移除事件监听器
    document.removeEventListener('mousemove', this.boundDoVerticalResize);
    document.removeEventListener('mouseup', this.boundStopVerticalResize);
    document.removeEventListener('touchmove', this.boundDoVerticalResize);
    document.removeEventListener('touchend', this.boundStopVerticalResize);
    
    // 拖拽结束
  }

  switchHistoryTab(tabName) {
    // 移除所有活动状态
    this.historyTabBtns.forEach(btn => btn.classList.remove('active'));
    this.historyTabContents.forEach(content => content.classList.remove('active'));
    
    // 激活选中的tab
    const activeBtn = document.querySelector(`.history-tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName === 'records' ? 'recordsContent' : 'userinfoContent');
    
    activeBtn?.classList.add('active');
    activeContent?.classList.add('active');
  }

  // 切换标签
  switchTab(tabName) {
    this.tabBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    this.tabContents.forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    this.currentTab = tabName;
    
    // 标签切换完成
    
    console.log('切换到标签:', tabName);
  }

  // 清空逐字稿
  clearTranscript() {
    if (this.transcriptMessages) {
      this.transcriptMessages.innerHTML = '';
    }
    console.log('逐字稿已清空');
  }

  // 开始咨询
  startConsultation() {
    this.isConsulting = true;
    this.startTime = Date.now();
    this.startTimer();
    
    // 更新客户信息
    this.updateClientInfo();
    
    console.log('咨询开始');
  }

  // 更新客户信息
  updateClientInfo() {
    const clientNameElement = document.getElementById('clientName');
    const consultationTimeElement = document.getElementById('consultationTime');
    
    if (clientNameElement) {
      clientNameElement.textContent = this.clientName;
    }
    
    if (consultationTimeElement) {
      consultationTimeElement.textContent = this.consultationTime;
    }
  }

  // 定时器相关方法
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    if (!this.startTime || !this.sessionTimer) return;
    
    const elapsed = Date.now() - this.startTime;
    const timeString = this.formatTime(elapsed);
    this.sessionTimer.textContent = timeString;
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 显示核销弹窗
  showCheckoutModal() {
    if (this.checkoutModal) {
      // 更新核销信息
      const actualDuration = this.formatTime(Date.now() - this.startTime);
      document.getElementById('checkoutActualDuration').textContent = actualDuration;
    document.getElementById('checkoutClientName').textContent = this.clientName;
    
    this.checkoutModal.style.display = 'flex';
    }
  }

  // 设置核销弹窗事件监听
  setupCheckoutEventListeners() {
    // 关闭按钮
    this.checkoutModalClose?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    this.cancelCheckout?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    // 时长选择
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectDuration(parseInt(btn.dataset.minutes));
      });
    });
    
    // 确认核销
    this.confirmCheckout?.addEventListener('click', () => {
      this.processCheckout();
    });
  }

  hideCheckoutModal() {
    if (this.checkoutModal) {
    this.checkoutModal.style.display = 'none';
    }
  }

  selectDuration(minutes) {
    this.selectedDuration = minutes;
    
    this.durationBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`[data-minutes="${minutes}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('active');
    }
  }

  // 处理核销
  processCheckout() {
    this.hideCheckoutModal();
    
    // 模拟API调用
    toast.show('核销成功，正在跳转至咨询笔记页面...', 'success');
    
    // 构建跳转到新笔记页面的URL
    const params = new URLSearchParams({
        client: this.clientName,
        time: this.consultationTime,
        session: 'N/A', // 视频咨询没有明确的次数，可以传递一个默认值
        userId: this.userId,
        from: 'video'
    });

    setTimeout(() => {
        window.location.href = `consultation-notes-new.html?${params.toString()}`;
    }, 1500);
  }

  // 显示提示消息
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // 设置背景颜色
    if (type === 'success') {
      toast.style.background = '#10b981';
    } else if (type === 'error') {
      toast.style.background = '#ef4444';
    } else {
      toast.style.background = '#3b82f6';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // 加载咨询信息
  loadConsultationInfo() {
    // 这里可以从API加载咨询相关信息
    console.log('加载咨询信息:', {
      clientName: this.clientName,
      consultationTime: this.consultationTime,
      userId: this.userId
    });
  }

  // 开始快速标记
  startQuickMark() {
    this.isMarkingMode = true;
    this.transcriptPaused = true;
    
    // 切换按钮显示
    if (this.quickMarkBtn) {
      this.quickMarkBtn.style.display = 'none';
    }
    if (this.endMarkBtn) {
      this.endMarkBtn.style.display = 'inline-flex';
    }
    
    // 为所有消息添加点击事件
    this.addClickEventsToMessages();
    
    this.showToast('进入快速标记模式，点击消息进行标记', 'info');
    console.log('进入快速标记模式');
  }

  // 结束快速标记
  endQuickMark() {
    this.isMarkingMode = false;
    this.transcriptPaused = false;
    
    // 切换按钮显示
    if (this.quickMarkBtn) {
      this.quickMarkBtn.style.display = 'inline-flex';
    }
    if (this.endMarkBtn) {
      this.endMarkBtn.style.display = 'none';
    }
    
    // 移除消息点击事件
    this.removeClickEventsFromMessages();
    
    const markedCount = this.markedMessages.length;
    if (markedCount > 0) {
      this.showToast(`退出标记模式，已标记 ${markedCount} 条消息`, 'success');
    } else {
      this.showToast('退出快速标记模式', 'info');
    }
    
    console.log('退出快速标记模式，标记数量:', markedCount);
  }

  // 为消息添加点击事件
  addClickEventsToMessages() {
    if (!this.transcriptMessages) return;
    
    const messages = this.transcriptMessages.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      message.style.cursor = 'pointer';
      message.style.transition = 'background-color 0.2s ease, transform 0.2s ease';
      message.style.userSelect = 'text';
      
      // 添加点击事件
      message.addEventListener('click', (e) => this.handleMessageClick(e));
      
      // 添加悬停效果
      message.addEventListener('mouseenter', () => {
        if (!message.classList.contains('marked')) {
          message.style.backgroundColor = '#f0f9ff';
        }
      });
      
      message.addEventListener('mouseleave', () => {
        if (!message.classList.contains('marked')) {
          message.style.backgroundColor = '';
        }
      });
      
      // 支持文本选择
      message.addEventListener('mouseup', () => {
        setTimeout(() => this.handleTextSelection(message), 50);
      });
    });
  }

  // 移除消息点击事件
  removeClickEventsFromMessages() {
    if (!this.transcriptMessages) return;
    
    const messages = this.transcriptMessages.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      message.style.cursor = '';
      message.style.userSelect = '';
      message.replaceWith(message.cloneNode(true)); // 移除所有事件监听器
    });
  }

  // 处理消息点击
  handleMessageClick(e) {
    // 检查是否有选中的文本，如果有则不处理整段标记
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      return; // 有选中文本时不处理点击事件
    }
    
    const message = e.currentTarget;
    
    if (message.classList.contains('marked')) {
      // 取消标记
      this.unmarkMessage(message);
    } else {
      // 添加标记
      this.markMessage(message);
    }
  }

  // 处理文本选择
  handleTextSelection(messageElement) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      console.log('选择的文本:', selectedText);
      
      // 检查选择是否在当前消息内
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const isInMessage = messageElement.contains(container) || messageElement === container;
      
      if (isInMessage) {
        this.createPartialMark(messageElement, selectedText);
      }
    }
  }

  // 创建部分标记
  createPartialMark(messageElement, selectedText) {
    // 移除可能存在的整段标记
    if (messageElement.classList.contains('marked')) {
      this.unmarkMessage(messageElement);
    }
    
    // 添加部分标记样式
    messageElement.style.backgroundColor = '#fef3c7';
    messageElement.style.border = '2px solid #f59e0b';
    messageElement.style.borderRadius = '8px';
    messageElement.style.padding = '12px';
    messageElement.style.marginBottom = '16px';
    
    // 添加部分标记指示
    let partialMarkIndicator = messageElement.querySelector('.partial-mark-indicator');
    if (!partialMarkIndicator) {
      partialMarkIndicator = document.createElement('div');
      partialMarkIndicator.className = 'partial-mark-indicator';
      partialMarkIndicator.innerHTML = `✏️ 部分标记: "${selectedText}"`;
      partialMarkIndicator.style.cssText = `
        color: #f59e0b;
        font-size: 12px;
        font-weight: 500;
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-style: italic;
      `;
      messageElement.appendChild(partialMarkIndicator);
    } else {
      partialMarkIndicator.innerHTML = `✏️ 部分标记: "${selectedText}"`;
    }
    
    // 保存到标记列表
    this.markedMessages.push(`[部分] ${selectedText}`);
    
    console.log('创建部分标记:', selectedText);
    
    // 清除选择
    window.getSelection().removeAllRanges();
  }

  // 移除部分标记
  removePartialMark(messageElement) {
    const partialMarkIndicator = messageElement.querySelector('.partial-mark-indicator');
    if (partialMarkIndicator) {
      partialMarkIndicator.remove();
      
      // 重置样式
      messageElement.style.backgroundColor = '';
      messageElement.style.border = '';
      messageElement.style.borderRadius = '';
      messageElement.style.padding = '';
      messageElement.style.marginBottom = '';
    }
  }

  // 取消标记消息
  unmarkMessage(messageElement) {
    messageElement.classList.remove('marked');
    messageElement.style.backgroundColor = '';
    messageElement.style.border = '';
    messageElement.style.borderRadius = '';
    messageElement.style.padding = '';
    messageElement.style.marginBottom = '';
    
    // 移除标签容器
    const tagsContainer = messageElement.querySelector('.message-tags');
    if (tagsContainer) {
      tagsContainer.remove();
    }
    
    // 移除标记指示
    const markIndicator = messageElement.querySelector('.mark-indicator');
    if (markIndicator) {
      markIndicator.remove();
    }
    
    // 从标记列表中移除
    const messageText = messageElement.querySelector('.message-content').textContent;
    const index = this.markedMessages.indexOf(messageText);
    if (index > -1) {
      this.markedMessages.splice(index, 1);
    }
    
    console.log('消息标记已取消:', messageText);
  }

  // 标记整段消息
  markMessage(messageElement) {
    // 移除可能存在的部分标记
    this.removePartialMark(messageElement);
    
    messageElement.classList.add('marked');
    messageElement.style.backgroundColor = '#dbeafe';
    messageElement.style.border = '2px solid #3b82f6';
    messageElement.style.borderRadius = '8px';
    messageElement.style.padding = '12px';
    messageElement.style.marginBottom = '16px';
    
    // 创建标签容器
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'message-tags';
    tagsContainer.style.cssText = `
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;
    
    // 表情标签行
    const emotionTags = document.createElement('div');
    emotionTags.className = 'emotion-tags';
    emotionTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    // 使用与咨询笔记一致的标签：表情标签
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
          tag.dataset.selectedTime = Date.now();
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
          delete tag.dataset.selectedTime;
        }
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
    
    // 使用与咨询笔记一致的标签：文字标签
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
          tag.dataset.selectedTime = Date.now();
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
          delete tag.dataset.selectedTime;
        }
      });
      
      textTags.appendChild(tag);
    });

    // 自定义标签行
    /*
    const customTags = document.createElement('div');
    customTags.className = 'custom-tags';
    customTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    // 加载并显示自定义标签
    this.loadCustomTags(customTags);
    */
    
    tagsContainer.appendChild(emotionTags);
    tagsContainer.appendChild(textTags);
    /*
    if (customTags.children.length > 0) {
      tagsContainer.appendChild(customTags);
    }
    */
    messageElement.appendChild(tagsContainer);
    
    // 保存到标记列表
    const messageText = messageElement.querySelector('.message-content').textContent;
    this.markedMessages.push(messageText);
    
    console.log('消息已标记:', messageText);
  }

  // 加载自定义标签
  /*
  loadCustomTags(container) {
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
  */

  // 更新拖拽限制
  updateResizeLimits() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 水平拖拽限制（横屏模式）
    if (screenWidth <= 480) {
      // 超小屏幕
      this.minWidth = 200;
      this.maxWidth = screenWidth * 0.6;
    } else if (screenWidth <= 768) {
      // 手机屏幕
      this.minWidth = 250;
      this.maxWidth = screenWidth * 0.65;
    } else if (screenWidth <= 1024) {
      // 平板屏幕
      this.minWidth = 300;
      this.maxWidth = screenWidth * 0.7;
    } else {
      // 桌面屏幕
      this.minWidth = 350;
      this.maxWidth = screenWidth * 0.75;
    }
    
    // 垂直拖拽限制（竖屏模式）
    if (screenHeight <= 480) {
      // 超小屏幕
      this.minHeight = 150;
      this.maxHeight = screenHeight * 0.6;
    } else if (screenHeight <= 768) {
      // 手机屏幕
      this.minHeight = 200;
      this.maxHeight = screenHeight * 0.65;
    } else if (screenHeight <= 1024) {
      // 平板屏幕
      this.minHeight = 250;
      this.maxHeight = screenHeight * 0.7;
    } else {
      // 桌面屏幕
      this.minHeight = 300;
      this.maxHeight = screenHeight * 0.75;
    }
    
    // 确保最大值不会导致信息面板过小
    this.maxWidth = Math.min(this.maxWidth, screenWidth - 250); // 为信息面板保留至少250px
    this.maxHeight = Math.min(this.maxHeight, screenHeight - 200); // 为信息面板保留至少200px
    
    console.log('拖拽限制已更新:', {
      screenWidth,
      screenHeight,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  
  // AI助手相关方法
  initializeAIAssistant() {
    // 初始状态为展开(根据图片显示的状态)
    this.isAIAssistantCollapsed = false;
    this.aiTipsContainer?.classList.add('expanded');
    this.updateCollapseButtonIcon();
    
    // 绑定点击事件 - 整个头部都可以点击
    this.aiTipsHeader?.addEventListener('click', () => {
      this.toggleAIAssistant();
    });
    
    // 按钮点击时阻止事件冒泡，避免双重触发
    this.collapseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAIAssistant();
    });
  }
  
  toggleAIAssistant() {
    if (!this.aiTipsContainer) return;
    
    this.isAIAssistantCollapsed = !this.isAIAssistantCollapsed;
    
    if (this.isAIAssistantCollapsed) {
      // 完全收起状态
      this.aiTipsContainer.classList.remove('expanded');
      this.aiTipsContainer.classList.add('collapsed');
    } else {
      // 完全展开状态
      this.aiTipsContainer.classList.remove('collapsed');
      this.aiTipsContainer.classList.add('expanded');
    }
    
    // 更新箭头图标方向
    this.updateCollapseButtonIcon();
  }
  
  updateCollapseButtonIcon() {
    if (!this.collapseBtn) return;
    
    const svg = this.collapseBtn.querySelector('svg polyline');
    if (svg) {
      if (this.isAIAssistantCollapsed) {
        // 收起状态：箭头向右 ▶️
        svg.setAttribute('points', '9,6 15,12 9,18');
      } else {
        // 展开状态：箭头向下 ▼
        svg.setAttribute('points', '6,9 12,15 18,9');
      }
    }
  }
}

// 视频网格布局管理
class VideoGridManager {
  constructor() {
    this.gridContainer = document.getElementById('videoGridContainer');
    this.participants = [];
    this.currentLayout = 'participants-3'; // 默认3人布局
    this.currentSimulationCount = 3; // 当前模拟的人数
    this.init();
  }
  
  init() {
    // 初始化参与者
    this.participants = [
      { id: 'main-speaker', name: '刘豊信(咨询师)', type: 'counselor', active: false },
      { id: 'participant-1', name: '王小秀', type: 'client', active: true },
      { id: 'participant-2', name: '家庭成员', type: 'family', active: false }
    ];
    
    this.updateLayout();
    this.updateParticipantCount();
    this.renderParticipants(); // 确保初始渲染
  }
  
  updateLayout() {
    const participantCount = this.currentSimulationCount;
    
    // 移除之前的布局类
    this.gridContainer.classList.remove('participants-2', 'participants-3', 'participants-4', 'participants-5', 'participants-6', 'participants-many');
    
    // 根据参与者数量选择合适的布局
    let layoutClass = '';
    if (participantCount <= 2) {
      layoutClass = 'participants-2';
      this.setupTwoPersonLayout();
    } else if (participantCount === 3) {
      layoutClass = 'participants-3';
      this.setupThreePersonLayout();
    } else if (participantCount === 4) {
      layoutClass = 'participants-4';
      this.setupFourPersonLayout();
    } else if (participantCount <= 6) {
      layoutClass = 'participants-6';
      this.setupSixPersonLayout();
    } else {
      layoutClass = 'participants-many';
      this.setupManyPersonLayout(participantCount);
    }
    
    this.currentLayout = layoutClass;
    this.gridContainer.classList.add(layoutClass);
    
    console.log(`更新布局为: ${layoutClass}，参与者数量: ${participantCount}`);
  }
  
  setupTwoPersonLayout() {
    this.gridContainer.style.gridTemplateColumns = '1.2fr 0.8fr';
    this.gridContainer.style.gridTemplateRows = '1fr';
  }
  
  setupThreePersonLayout() {
    this.gridContainer.style.gridTemplateColumns = '1.2fr 0.8fr';
    this.gridContainer.style.gridTemplateRows = '1fr 1fr';
  }
  
  setupFourPersonLayout() {
    this.gridContainer.style.gridTemplateColumns = '1fr 1fr';
    this.gridContainer.style.gridTemplateRows = '1fr 1fr';
  }
  
  setupSixPersonLayout() {
    this.gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
    this.gridContainer.style.gridTemplateRows = '1fr 1fr';
  }
  
  setupManyPersonLayout(count) {
    // 动态计算最佳网格布局
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // 添加data-count属性用于CSS样式选择
    this.gridContainer.setAttribute('data-count', count.toString());
    
    console.log(`多人布局: ${cols}列 × ${rows}行，总计${count}人`);
  }
  
  // 切换布局 - 循环模拟不同人数
  toggleLayout() {
    // 预定义的模拟人数：3->4->6->8->3（循环）
    const simulationCounts = [3, 4, 6, 8];
    const currentIndex = simulationCounts.indexOf(this.currentSimulationCount);
    const nextIndex = (currentIndex + 1) % simulationCounts.length;
    
    this.currentSimulationCount = simulationCounts[nextIndex];
    
    // 生成模拟参与者
    this.generateSimulatedParticipants();
    
    // 更新布局和渲染
    this.updateLayout();
    this.updateParticipantCount();
    this.renderParticipants();
    
    // 显示提示
    this.showToast(`切换到${this.currentSimulationCount}人模式`, 'info');
    
    console.log(`切换到模拟${this.currentSimulationCount}人布局`);
  }
  
  // 生成模拟参与者
  generateSimulatedParticipants() {
    // 保留固定的前3个参与者
    const baseParticipants = [
      { id: 'main-speaker', name: '刘豊信(咨询师)', type: 'counselor', active: false },
      { id: 'participant-1', name: '王小秀', type: 'client', active: true },
      { id: 'participant-2', name: '家庭成员', type: 'family', active: false }
    ];
    
    const additionalNames = ['李明', '张晓', '王芳', '陈浩', '刘娜', '赵强', '孙丽', '周杰'];
    const participantTypes = ['family', 'friend', 'colleague', 'other'];
    
    this.participants = [...baseParticipants];
    
    // 根据需要添加额外的模拟参与者
    for (let i = 3; i < this.currentSimulationCount; i++) {
      const nameIndex = (i - 3) % additionalNames.length;
      const typeIndex = (i - 3) % participantTypes.length;
      
      this.participants.push({
        id: `participant-${i}`,
        name: additionalNames[nameIndex],
        type: participantTypes[typeIndex],
        active: false
      });
    }
  }
  
  renderParticipants() {
    // 清空现有内容
    this.gridContainer.innerHTML = '';
    
    // 渲染所有参与者（不包含占位符）
    this.participants.forEach((participant, index) => {
      const frame = this.createVideoFrame(participant, index);
      this.gridContainer.appendChild(frame);
    });
  }
  
  createVideoFrame(participant, index) {
    const frame = document.createElement('div');
    frame.className = `video-frame ${participant.type === 'counselor' ? 'main-speaker' : 'participant'}`;
    frame.dataset.participant = participant.id;
    
    frame.innerHTML = `
      <div class="video-content">
        <div class="video-avatar">
          <div class="avatar-circle ${participant.type !== 'counselor' ? 'participant' : ''}">
            👤
          </div>
          <div class="participant-name">${participant.name}</div>
        </div>
        <div class="speaker-indicator">
          <div class="audio-wave"></div>
        </div>
        <div class="video-controls">
          <button class="control-btn" title="静音">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            </svg>
          </button>
          <button class="control-btn" title="关闭摄像头">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    return frame;
  }
  
  showInviteDialog() {
    // 创建邀请对话框
    const modal = document.createElement('div');
    modal.className = 'invite-modal';
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
      max-width: 400px;
      width: 90%;
      padding: 24px;
    `;
    
    modalContent.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #1f2937;">邀请参与者</h3>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">参与者姓名</label>
        <input type="text" id="participantName" placeholder="请输入参与者姓名..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">参与者类型</label>
        <select id="participantType" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          <option value="family">家庭成员</option>
          <option value="friend">朋友</option>
          <option value="colleague">同事</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="cancelInvite" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">取消</button>
        <button id="confirmInvite" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">邀请</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 绑定事件
    document.getElementById('cancelInvite').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('confirmInvite').addEventListener('click', () => {
      const name = document.getElementById('participantName').value.trim();
      const type = document.getElementById('participantType').value;
      
      if (name) {
        const newParticipant = {
          id: `participant-${Date.now()}`,
          name: name,
          type: type,
          active: false
        };
        
        this.addParticipant(newParticipant);
        modal.remove();
        
        // 显示成功提示
        this.showToast(`成功邀请 ${name} 加入会议`, 'success');
      } else {
        alert('请输入参与者姓名');
      }
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // 聚焦到输入框
    setTimeout(() => {
      document.getElementById('participantName').focus();
    }, 100);
  }
  
  addParticipant(participant) {
    // 添加到实际参与者列表
    this.participants.push(participant);
    
    // 更新当前模拟人数
    this.currentSimulationCount = this.participants.length;
    
    // 更新布局和渲染
    this.updateLayout();
    this.updateParticipantCount();
    this.renderParticipants();
    
    console.log(`成功添加参与者: ${participant.name}，当前总人数: ${this.participants.length}`);
    return true;
  }
  
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // 设置背景颜色
    if (type === 'success') {
      toast.style.background = '#10b981';
    } else if (type === 'error') {
      toast.style.background = '#ef4444';
    } else {
      toast.style.background = '#3b82f6';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  updateParticipantCount() {
    const countElement = document.getElementById('participantsCount');
    if (countElement) {
      countElement.textContent = this.currentSimulationCount;
    }
  }
  
  setSpeakingParticipant(participantId) {
    // 重置所有说话指示器
    document.querySelectorAll('.speaker-indicator').forEach(indicator => {
      indicator.classList.remove('active');
    });
    
    // 激活指定参与者的说话指示器
    if (participantId) {
      const participantFrame = document.querySelector(`[data-participant="${participantId}"]`);
      if (participantFrame) {
        const indicator = participantFrame.querySelector('.speaker-indicator');
        if (indicator) {
          indicator.classList.add('active');
        }
      }
    }
  }
}

// 视频控制管理
class VideoControlManager {
  constructor() {
    this.isMuted = false;
    this.isCameraOff = false;
    this.init();
  }
  
  init() {
    // 绑定控制按钮事件
    const muteBtn = document.getElementById('muteBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleMute());
    }
    
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => this.toggleCamera());
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    const muteBtn = document.getElementById('muteBtn');
    
    if (this.isMuted) {
      muteBtn.classList.add('muted');
      muteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.17-1.17"/>
          <path d="M12 2a3 3 0 0 1 3 3v3"/>
          <path d="M19 10v1a7 7 0 0 1-7 7"/>
          <path d="M12 19v3"/>
        </svg>`;
      muteBtn.style.background = 'rgba(239, 68, 68, 0.8)';
    } else {
      muteBtn.classList.remove('muted');
      muteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>`;
      muteBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    }
    
    console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
  }
  
  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    const cameraBtn = document.getElementById('cameraBtn');
    
    if (this.isCameraOff) {
      cameraBtn.classList.add('camera-off');
      cameraBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M10.5 5H19a2 2 0 0 1 2 2v8.5"/>
          <path d="M17 11l4-4v4"/>
          <path d="M2 5a2 2 0 0 1 2-2h3"/>
          <path d="M2 19h16"/>
        </svg>`;
      cameraBtn.style.background = 'rgba(239, 68, 68, 0.8)';
    } else {
      cameraBtn.classList.remove('camera-off');
      cameraBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 7l-7 5 7 5V7z"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>`;
      cameraBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    }
    
    console.log(`Camera ${this.isCameraOff ? 'off' : 'on'}`);
  }
}

// 会议时长计时器
class MeetingTimer {
  constructor() {
    this.startTime = new Date();
    this.timerElement = document.getElementById('meetingDuration');
    this.init();
  }
  
  init() {
    this.updateTimer();
    setInterval(() => this.updateTimer(), 1000);
  }
  
  updateTimer() {
    const now = new Date();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (this.timerElement) {
      this.timerElement.textContent = timeString;
    }
  }
  
  reset() {
    this.startTime = new Date();
  }
}

// 初始化所有管理器
let videoGridManager;
let videoControlManager;
let meetingTimer;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化主要的VideoConsultation类（包含拖拽功能）
  window.videoConsultation = new VideoConsultation();
  
  // 初始化视频网格管理器
  videoGridManager = new VideoGridManager();
  
  // 初始化视频控制管理器
  videoControlManager = new VideoControlManager();
  
  // 初始化会议计时器
  meetingTimer = new MeetingTimer();
  
  // 初始化Tab切换
  initTabSwitching();
  
  // 初始化逐字稿模拟
  initTranscriptSimulation();
  
  // 初始化标签系统
  initTaggingSystem();
  
  // 初始化核销功能
  initCheckoutModal();
  
  // 初始化说话者模拟
  initSpeakerSimulation();
  
  // 绑定会议控制按钮
  initMeetingControls();
  
  // 初始化全屏监听器
  initFullscreenListeners();
  
  console.log('视频咨询页面初始化完成');
});

// 说话者模拟（演示用）
function initSpeakerSimulation() {
  // 模拟说话者切换
  setInterval(() => {
    if (Math.random() > 0.7 && videoGridManager) { // 30%概率切换说话者
      const participantCount = videoGridManager.currentSimulationCount;
      const speakers = [];
      
      // 动态生成说话者ID列表
      speakers.push('main-speaker');
      for (let i = 1; i < participantCount; i++) {
        speakers.push(`participant-${i}`);
      }
      
      const randomIndex = Math.floor(Math.random() * speakers.length);
      videoGridManager.setSpeakingParticipant(speakers[randomIndex]);
    }
  }, 3000);
}

// 会议控制按钮绑定
function initMeetingControls() {
  const inviteBtn = document.getElementById('inviteBtn');
  const layoutBtn = document.getElementById('layoutBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  
  // 邀请按钮恢复邀请功能
  if (inviteBtn) {
    // 恢复邀请按钮的图标和功能
    inviteBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
        <line x1="20" y1="8" x2="20" y2="14"/>
        <line x1="23" y1="11" x2="17" y2="11"/>
      </svg>
    `;
    inviteBtn.title = '邀请参与者';
    
    inviteBtn.addEventListener('click', () => {
      // 使用VideoGridManager的邀请功能
      if (videoGridManager) {
        videoGridManager.showInviteDialog();
      }
    });
  }
  
  // 布局按钮用于切换多人视图
  if (layoutBtn) {
    layoutBtn.addEventListener('click', () => {
      if (videoGridManager) {
        videoGridManager.toggleLayout();
      }
    });
  }
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      toggleVideoFullscreen();
    });
  }
}

// 全屏功能实现
function toggleVideoFullscreen() {
  console.log('全屏按钮被点击');
  
  const videoSection = document.getElementById('videoSection');
  const consultationHeader = document.querySelector('.consultation-header');
  const infoPanel = document.getElementById('infoPanel');
  const resizeHandle = document.getElementById('resizeHandle');
  const body = document.body;
  
  if (!videoSection) {
    console.error('找不到视频区域元素');
    return;
  }
  
  // 检查当前是否已经是自定义全屏状态
  const isCustomFullscreen = body.classList.contains('custom-fullscreen');
  console.log('当前自定义全屏状态:', isCustomFullscreen);
  
  if (!isCustomFullscreen) {
    // 进入自定义全屏模式
    console.log('进入视频全屏模式');
    
    // 隐藏其他元素
    if (consultationHeader) consultationHeader.style.display = 'none';
    if (infoPanel) infoPanel.style.display = 'none';
    if (resizeHandle) resizeHandle.style.display = 'none';
    
    // 设置视频区域全屏样式
    videoSection.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      min-width: none !important;
      z-index: 9999 !important;
      background: #0f172a !important;
    `;
    
    // 标记全屏状态
    body.classList.add('custom-fullscreen');
    
    // 显示提示
    showFullscreenHint('按 ESC 键或点击按钮退出全屏');
    
    console.log('已进入视频全屏模式');
  } else {
    // 退出自定义全屏模式
    console.log('退出视频全屏模式');
    
    // 显示其他元素
    if (consultationHeader) consultationHeader.style.display = '';
    if (infoPanel) infoPanel.style.display = '';
    if (resizeHandle) resizeHandle.style.display = '';
    
    // 重置视频区域样式
    videoSection.style.cssText = '';
    
    // 移除全屏状态标记
    body.classList.remove('custom-fullscreen');
    
    console.log('已退出视频全屏模式');
  }
}

// 显示全屏提示
function showFullscreenHint(message) {
  // 移除可能存在的旧提示
  const existingHint = document.querySelector('.fullscreen-hint');
  if (existingHint) {
    existingHint.remove();
  }
  
  const hint = document.createElement('div');
  hint.className = 'fullscreen-hint';
  hint.textContent = message;
  
  const videoSection = document.getElementById('videoSection');
  videoSection.appendChild(hint);
  
  // 3秒后自动移除提示
  setTimeout(() => {
    if (hint.parentNode) {
      hint.remove();
    }
  }, 3000);
}

// 监听全屏状态变化
function initFullscreenListeners() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  
  const updateFullscreenButton = () => {
    // 检测自定义全屏状态
    const isCustomFullscreen = document.body.classList.contains('custom-fullscreen');
    
    console.log('全屏状态变化:', isCustomFullscreen);
    
    if (fullscreenBtn) {
      if (isCustomFullscreen) {
        // 全屏状态 - 显示退出全屏图标
        fullscreenBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        `;
        fullscreenBtn.title = '退出全屏';
        fullscreenBtn.classList.add('fullscreen-active');
        console.log('按钮状态设置为退出全屏');
      } else {
        // 非全屏状态 - 显示进入全屏图标
        fullscreenBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        `;
        fullscreenBtn.title = '全屏显示';
        fullscreenBtn.classList.remove('fullscreen-active');
        console.log('按钮状态设置为进入全屏');
      }
    }
  };
  
  // 初始化按钮状态
  updateFullscreenButton();
  
  // 监听ESC键退出全屏
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('custom-fullscreen')) {
      console.log('检测到ESC键，将退出全屏');
      toggleVideoFullscreen(); // 直接调用切换函数
    }
  });
  
  // 创建一个观察器来监听body class的变化
  const observer = new MutationObserver(() => {
    updateFullscreenButton();
  });
  
  // 开始观察body元素的class属性变化
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// 缺失的初始化函数定义
function initTabSwitching() {
  console.log('初始化标签切换功能');
  // 标签切换功能已在VideoConsultation类中实现
}

function initTranscriptSimulation() {
  console.log('初始化逐字稿模拟');
  // 模拟逐字稿内容更新
  setTimeout(() => {
    if (document.getElementById('transcriptMessages')) {
      console.log('逐字稿模拟功能已启动');
    }
  }, 1000);
}

function initTaggingSystem() {
  console.log('初始化标签系统');
  // 标签系统已在VideoConsultation类中实现
}

function initCheckoutModal() {
  console.log('初始化核销弹窗');
  // 核销弹窗功能已在VideoConsultation类中实现
} 
