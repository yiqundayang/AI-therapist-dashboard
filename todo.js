/**
 * 待办中心页面逻辑
 */

class TodoCenter {
  constructor() {
    // 当前选中的日期
    this.currentDate = 'today';
    
    // 模拟数据存储
    this.consultations = new Map();
    this.records = new Map();
    
    // DOM元素缓存
    this.elements = {};
    
    // 录音相关状态
    this.isRecording = false;
    this.recordingInterval = null;
    this.recordingSeconds = 0;

    this.recordingPrompts = [
      "在人工智能的浪潮中，我们致力于通过技术创新，为每一位用户带来更加智能、便捷和个性化的服务体验。",
      "我们的智能对话系统不仅能理解您的需求，更能预测您的意图，从而提供超越期待的解决方案，让沟通变得前所未有的高效。",
      "安全与隐私是我们设计的核心基石，我们采用业界领先的加密技术和严格的数据管理政策，确保您的每一次互动都得到最高标准的安全保障。",
      "从晨曦到星辰，我们的系统持续学习与进化，只为在您需要的时候，提供最精准、最贴心的支持，成为您生活中不可或缺的智能伙伴。",
      "无论是复杂的专业咨询，还是日常的闲聊陪伴，我们都力求做到最好，因为我们相信，技术最终的目的是为了服务于人，温暖人心。"
    ];

    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.initMockData();
    this.generateDateTabs();
    this.bindEvents();
    this.updateContent();
    this.checkFirstLoginVoiceprint(); // 检查首次登录声纹采集
    
    console.log('待办中心页面已初始化');
  }
  
  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      dateSelector: document.getElementById('dateSelector'),
      consultationList: document.getElementById('consultationList'),
      recordsList: document.getElementById('recordsList'),
      viewAllBtn: document.getElementById('viewAllBtn'),
      viewAllRecordsBtn: document.getElementById('viewAllRecordsBtn'),
      confirmModal: document.getElementById('confirmModal'),
      shareModal: document.getElementById('shareModal'),
      confirmBtn: document.getElementById('confirmBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      shareConfirm: document.getElementById('shareConfirm'),
      shareCancel: document.getElementById('shareCancel'),
      
      // 核销弹窗相关元素
      closeModalBtn: document.getElementById('closeModalBtn'),
      visitorName: document.getElementById('visitorName'),
      startTime: document.getElementById('startTime'),
      actualDuration: document.getElementById('actualDuration'),
      checkoutRemark: document.getElementById('checkoutRemark'),
      
      // 声纹采集相关元素
      recordingModal: document.getElementById('recordingModal'),
      cancelRecordingBtn: document.getElementById('cancelRecordingBtn'),
      toggleRecordingBtn: document.getElementById('toggleRecordingBtn'),
      recordingTimer: document.getElementById('recordingTimer'),
      recordingPrompt: document.getElementById('recordingPrompt')
    };
  }
  
  /**
   * 初始化模拟数据
   */
  initMockData() {
    // 今天的咨询数据
    this.consultations.set('today', [
      {
        id: '1',
        type: 'offline',
        userName: '张小明',
        userId: 'user1',
        avatar: 'https://picsum.photos/seed/user1/100/100',
        time: '17:00-18:00',
        sessionInfo: { current: 1, total: 10, isFirst: true } // 首次咨询
      },
      {
        id: '2',
        type: 'video',
        userName: '王小芳',
        userId: 'user3',
        avatar: 'https://picsum.photos/seed/user3/100/100',
        time: '18:30-19:30',
        sessionInfo: { current: 2, total: 10, isFirst: false } // 第2次咨询
      },
      {
        id: '3',
        type: 'video',
        userName: '陈小强',
        userId: 'user4',
        avatar: 'https://picsum.photos/seed/user4/100/100',
        time: '20:00-21:00',
        sessionInfo: { current: 3, total: 10, isFirst: false } // 第3次咨询
      }
    ]);
    
    // 今天的咨询记录数据
    this.records.set('today', [
      {
        id: '4',
        type: 'offline',
        userName: '刘小娟',
        userId: 'user5',
        avatar: 'https://picsum.photos/seed/user5/100/100',
        time: '11:30-12:00',
        sessionInfo: { current: 1, total: 10, isFirst: true },
        status: 'pending' // 已完成首次咨询，记录待确认
      },
      {
        id: '5',
        type: 'video',
        userName: '李小雅',
        userId: 'user2',
        avatar: 'https://picsum.photos/seed/user2/100/100',
        time: '14:00-15:00',
        sessionInfo: { current: 2, total: 10, isFirst: false },
        status: 'generating' // 第2次咨询，记录生成中
      },
      {
        id: '6',
        type: 'video',
        userName: '周小琳',
        userId: 'user6',
        avatar: 'https://picsum.photos/seed/user6/100/100',
        time: '09:00-10:00',
        sessionInfo: { current: 3, total: 10, isFirst: false },
        status: 'completed' // 第3次咨询，记录已完成
      }
    ]);
    
    // 明天的数据（示例）- 可以有预约咨询
    this.consultations.set('tomorrow', [
      {
        id: '7',
        type: 'video',
        userName: '赵小明',
        userId: 'user7',
        avatar: 'https://via.placeholder.com/40x40/34C759/FFFFFF?text=赵',
        time: '10:00-11:00',
        sessionInfo: { current: 4, total: 10, isFirst: false }
      }
    ]);
    
    // 未来日期没有咨询记录（因为咨询还没有发生）
    this.records.set('tomorrow', []);
  }
  
  /**
   * 生成日期标签
   */
  generateDateTabs() {
    const futureDates = utils.getFutureDates(5, 2); // 从后天开始获取5天
    
    futureDates.forEach(date => {
      const tab = document.createElement('button');
      tab.className = 'date-tab';
      tab.dataset.date = date.value;
      tab.textContent = date.label;
      this.elements.dateSelector.appendChild(tab);
      
      // 为未来日期初始化数据，但要确保不覆盖已有数据的"明天"
      if (!this.consultations.has(date.value)) {
        this.consultations.set(date.value, []);
      }
      if (!this.records.has(date.value)) {
        this.records.set(date.value, []);
      }
    });
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 日期切换
    this.elements.dateSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('date-tab')) {
        this.switchDate(e.target.dataset.date);
      }
    });
    
    // 查看全部客户
    this.elements.viewAllBtn.addEventListener('click', () => {
      window.location.href = 'customer-list.html';
    });
    
    // 查看全部咨询记录
    this.elements.viewAllRecordsBtn.addEventListener('click', () => {
      window.location.href = 'consultation-records-list.html';
    });
    
    // 咨询列表事件代理
    this.elements.consultationList.addEventListener('click', (e) => {
      this.handleConsultationAction(e);
    });
    
    // 记录列表事件代理
    this.elements.recordsList.addEventListener('click', (e) => {
      this.handleRecordAction(e);
    });
    
    // 确认弹窗事件
    this.elements.confirmBtn.addEventListener('click', () => {
      this.confirmVerification();
    });
    
    this.elements.cancelBtn.addEventListener('click', () => {
      modal.hide('confirmModal');
    });
    
    // 关闭核销弹窗
    this.elements.closeModalBtn.addEventListener('click', () => {
      modal.hide('confirmModal');
    });
    
    // 核销时长选择
    this.elements.confirmModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('duration-btn')) {
        this.selectDuration(e.target);
      }
    });
    
    // 分享弹窗事件
    this.elements.shareConfirm.addEventListener('click', () => {
      this.shareRoom();
    });
    
    this.elements.shareCancel.addEventListener('click', () => {
      modal.hide('shareModal');
    });
    
    // 监听咨询记录查看事件
    window.addEventListener('recordViewed', (e) => {
      this.handleRecordViewed(e.detail);
    });

    // 声纹采集录音弹窗事件
    this.elements.cancelRecordingBtn.addEventListener('click', () => {
      this.cancelRecording();
    });

    this.elements.toggleRecordingBtn.addEventListener('click', () => {
      this.toggleRecording();
    });
  }
  
  /**
   * 切换日期
   * @param {string} date 日期
   */
  switchDate(date) {
    // 更新选中状态
    document.querySelectorAll('.date-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`[data-date="${date}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    this.currentDate = date;
    this.updateContent();
  }
  
  /**
   * 更新页面内容
   */
  updateContent() {
    this.renderConsultations();
    this.renderRecords();
  }
  
  /**
   * 渲染咨询列表
   */
  renderConsultations() {
    const consultations = this.consultations.get(this.currentDate) || [];
    const container = this.elements.consultationList;
    
    if (consultations.length === 0) {
      container.innerHTML = `
        <div class="empty-consultation">
          <div class="empty-icon">📅</div>
          <p>今日暂无咨询安排</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = consultations.map(item => this.renderConsultationItem(item)).join('');
  }
  
  /**
   * 渲染单个咨询项
   * @param {Object} item 咨询项数据
   */
  renderConsultationItem(item) {
    const typeClass = item.type === 'video' ? 'video' : 'offline';
    const typeText = item.type === 'video' ? '视频咨询' : '到店咨询';
    
    // 生成咨询次数标签
    const sessionTag = item.sessionInfo?.isFirst 
      ? '<span class="session-tag first">首次</span>'
      : `<span class="session-tag">${item.sessionInfo?.current || 1}/${item.sessionInfo?.total || 10}</span>`;
    
    const actions = item.type === 'video' 
      ? `<button class="btn btn-primary start-consultation" data-id="${item.id}">开始咨询</button>
         <button class="btn btn-secondary share-room" data-id="${item.id}">分享房间</button>`
      : `<button class="btn btn-primary start-record" data-id="${item.id}">开始咨询</button>
         <button class="btn btn-danger verify-consultation" data-id="${item.id}">核销</button>`;
    
    return `
      <div class="consultation-item" data-type="${typeClass}" data-id="${item.id}">
        <div class="consultation-type">
          <div class="type-tag ${typeClass}">${typeText}</div>
        </div>
        <div class="user-avatar-section">
          <img src="${item.avatar}" alt="用户头像" class="avatar">
        </div>
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">
              <span class="name">${item.userName}</span>
              ${sessionTag}
            </div>
            <div class="consultation-time">${item.time}</div>
            <a href="customer-profile.html?user=${item.userId}&name=${encodeURIComponent(item.userName)}" class="profile-link">查看客户档案</a>
          </div>
        </div>
        <div class="consultation-actions">
          ${actions}
        </div>
      </div>
    `;
  }
  
  /**
   * 渲染咨询记录列表
   */
  renderRecords() {
    const records = this.records.get(this.currentDate) || [];
    const container = this.elements.recordsList;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-records">
          <div class="empty-icon">✅</div>
          <p>今日暂无咨询记录</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = records.map(item => this.renderRecordItem(item)).join('');
  }
  
  /**
   * 渲染单个记录项
   * @param {Object} item 记录项数据
   */
  renderRecordItem(item) {
    const typeClass = item.type === 'video' ? 'video' : 'offline';
    const typeText = item.type === 'video' ? '视频咨询' : '到店咨询';
    
    // 生成咨询次数标签
    const sessionTag = item.sessionInfo?.isFirst 
      ? '<span class="session-tag first">首次</span>'
      : `<span class="session-tag">${item.sessionInfo?.current || 1}/${item.sessionInfo?.total || 10}</span>`;
    
    let statusContent = '';
    switch (item.status) {
      case 'generating':
        statusContent = `
          <div class="record-generating-container">
          <button class="btn btn-secondary btn-sm record-generating" data-id="${item.id}">
            <span class="status-icon generating">⏳</span>
            咨询记录生成中
          </button>
            <div class="waiting-time-hint">预计等待3分钟</div>
          </div>
        `;
        break;
      case 'pending':
        statusContent = `
          <button class="btn btn-warning btn-sm record-pending" data-id="${item.id}">
            <span class="status-icon pending">📋</span>
            咨询记录待确认
          </button>
        `;
        break;
      case 'viewed':
        statusContent = `<button class="btn btn-success btn-sm view-record" data-id="${item.id}">查看咨询记录</button>`;
        break;
      case 'completed':
        statusContent = `<button class="btn btn-primary btn-sm view-record" data-id="${item.id}">查看咨询记录</button>`;
        break;
    }
    
    return `
      <div class="record-item" data-type="${typeClass}" data-id="${item.id}">
        <div class="consultation-type">
          <div class="type-tag ${typeClass}">${typeText}</div>
        </div>
        <div class="user-avatar-section">
          <img src="${item.avatar}" alt="用户头像" class="avatar">
        </div>
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">
              <span class="name">${item.userName}</span>
              ${sessionTag}
            </div>
            <div class="consultation-time">${item.time}</div>
            <a href="customer-profile.html?user=${item.userId}&name=${encodeURIComponent(item.userName)}" class="profile-link">查看客户档案</a>
          </div>
        </div>
        <div class="record-status">
          ${statusContent}
        </div>
      </div>
    `;
  }
  
  /**
   * 处理咨询操作
   * @param {Event} e 事件对象
   */
  handleConsultationAction(e) {
    const target = e.target;
    const id = target.dataset.id;
    
    // 处理按钮点击事件
    if (target.classList.contains('start-consultation')) {
      this.startVideoConsultation(id);
    } else if (target.classList.contains('share-room')) {
      this.showShareModal(id);
    } else if (target.classList.contains('start-record')) {
      this.startRecord(id);
    } else if (target.classList.contains('verify-consultation')) {
      this.showConfirmModal(id);
    } else if (target.classList.contains('profile-link')) {
      // 阻止默认链接行为，使用自定义跳转
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    } else {
      // 点击卡片其他区域时跳转到客户档案
      // 首先找到最近的consultation-item元素
      const consultationItem = target.closest('.consultation-item');
      if (consultationItem) {
        const itemId = consultationItem.dataset.id;
        // 检查点击的是否是按钮或链接
        if (!target.closest('button') && !target.closest('a')) {
          this.goToCustomerProfile(itemId);
        }
      }
    }
  }
  
  /**
   * 跳转到客户档案页面
   * @param {string} id 咨询ID
   */
  goToCustomerProfile(id) {
    // 查找对应的咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      // 构建客户档案页面URL
      const profileUrl = `customer-profile.html?user=${consultation.userId}&name=${encodeURIComponent(consultation.userName)}`;
      window.location.href = profileUrl;
    } else {
      toast.show('找不到客户信息', 'error');
    }
  }
  
  /**
   * 从记录跳转到客户档案页面
   * @param {string} id 记录ID
   */
  goToCustomerProfileFromRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      // 构建客户档案页面URL
      const profileUrl = `customer-profile.html?user=${record.userId}&name=${encodeURIComponent(record.userName)}`;
      window.location.href = profileUrl;
    } else {
      toast.show('找不到客户信息', 'error');
    }
  }
  
  /**
   * 处理记录操作
   * @param {Event} e 事件对象
   */
  handleRecordAction(e) {
    const target = e.target;
    const id = target.dataset.id;
    
    // 处理按钮点击事件
    if (target.classList.contains('view-record')) {
      this.viewRecord(id);
    } else if (target.classList.contains('record-generating')) {
      this.handleGeneratingRecord(id);
    } else if (target.classList.contains('record-pending')) {
      this.handlePendingRecord(id);
    } else if (target.classList.contains('profile-link')) {
      // 阻止默认链接行为，使用自定义跳转
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    } else {
      // 点击记录卡片其他区域时跳转到客户档案
      // 首先找到最近的record-item元素
      const recordItem = target.closest('.record-item');
      if (recordItem) {
        const itemId = recordItem.dataset.id;
        // 检查点击的是否是按钮或链接
        if (!target.closest('button') && !target.closest('a')) {
          this.goToCustomerProfileFromRecord(itemId);
        }
      }
    }
  }
  
  /**
   * 开始视频咨询
   * @param {string} id 咨询ID
   */
  startVideoConsultation(id) {
    // 查找对应的咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      toast.show('正在启动视频咨询...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: consultation.userName,
        userId: consultation.userId,
        time: `${new Date().toLocaleDateString('zh-CN')} ${consultation.time}`,
        type: 'video'
      });
      
      // 跳转到视频咨询页面
      setTimeout(() => {
        window.location.href = `video-consultation.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到咨询信息', 'error');
    }
  }
  
  /**
   * 分享房间
   */
  shareRoom() {
    modal.hide('shareModal');
    
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: '咨询房间邀请',
        text: '请点击链接加入咨询房间',
        url: 'https://example.com/room/123456'
      }).then(() => {
        toast.show('分享成功', 'success');
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }
  
  /**
   * 复制到剪贴板
   */
  copyToClipboard() {
    const url = 'https://example.com/room/123456';
    navigator.clipboard.writeText(url).then(() => {
      toast.show('房间链接已复制到剪贴板', 'success');
    }).catch(() => {
      toast.show('复制失败，请手动复制', 'error');
    });
  }
  
  /**
   * 显示分享弹窗
   * @param {string} id 咨询ID
   */
  showShareModal(id) {
    this.currentActionId = id;
    modal.show('shareModal');
  }
  
  /**
   * 开始记录
   * @param {string} id 咨询ID
   */
  startRecord(id) {
    // 查找对应的咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      // 构建URL参数
      const params = new URLSearchParams({
        client: consultation.userName,
        session: consultation.sessionCount || 1,
        time: `${new Date().toLocaleDateString('zh-CN')} ${consultation.time}`
      });
      
      // 跳转到新的咨询笔记页面
      window.location.href = `consultation-notes-new.html?${params.toString()}`;
    } else {
      toast.show('找不到咨询信息', 'error');
    }
  }
  
  /**
   * 显示确认核销弹窗
   * @param {string} id 咨询ID
   */
  showConfirmModal(id) {
    this.currentActionId = id;
    
    // 查找咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      // 填充核销信息
      this.elements.visitorName.textContent = consultation.userName;
      this.elements.startTime.textContent = this.formatConsultationTime(consultation.time);
      this.elements.actualDuration.textContent = this.generateActualDuration();
      this.elements.checkoutRemark.value = '';
      
      // 重置时长选择（默认选中60分钟）
      this.resetDurationSelection();
    }
    
    modal.show('confirmModal');
  }
  
  /**
   * 确认核销
   */
  confirmVerification() {
    // 获取核销数据
    const selectedDuration = document.querySelector('.duration-btn.active');
    const remark = this.elements.checkoutRemark.value.trim();
    const duration = selectedDuration ? selectedDuration.dataset.duration : '60';
    
    // 构建核销数据
    const checkoutData = {
      id: this.currentActionId,
      duration: `${duration}分钟`,
      remark: remark || '无',
      checkoutTime: new Date().toLocaleString('zh-CN')
    };
    
    console.log('核销数据:', checkoutData);
    
    modal.hide('confirmModal');
    
    // 模拟核销操作
    toast.show('正在核销...', 'info');
    
    setTimeout(() => {
      // 从咨询列表中移除该项目
      const consultations = this.consultations.get(this.currentDate) || [];
      const updatedConsultations = consultations.filter(item => item.id !== this.currentActionId);
      this.consultations.set(this.currentDate, updatedConsultations);
      
      // 添加到记录列表
      const removedConsultation = consultations.find(item => item.id === this.currentActionId);
      if (removedConsultation) {
        const records = this.records.get(this.currentDate) || [];
        records.push({
          ...removedConsultation,
          status: 'completed',
          checkoutData: checkoutData
        });
        this.records.set(this.currentDate, records);
      }
      
      // 更新页面
      this.updateContent();
      toast.show('核销成功', 'success');
    }, 1500);
  }
  
  /**
   * 查看记录
   * @param {string} id 记录ID
   */
  viewRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'completed'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
  
  /**
   * 处理生成中的记录
   * @param {string} id 记录ID
   */
  handleGeneratingRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'generating'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
  
  /**
   * 处理待确认的记录
   * @param {string} id 记录ID
   */
  handlePendingRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'pending'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
  
  /**
   * 处理咨询记录查看事件
   * @param {object} detail 事件详情
   */
  handleRecordViewed(detail) {
    console.log(`记录 ${detail.id} 已在另一页面被查看，状态更新为: ${detail.status}`);
    
    const record = this.findRecordById(detail.id);
    if (record) {
      record.status = detail.status;
      this.updateContent(); // 重新渲染以反映状态变化
    }
  }

  /**
   * 根据ID查找记录
   * @param {string} id 记录ID
   * @returns {Object|null} 找到的记录对象或null
   */
  findRecordById(id) {
    for (const [date, records] of this.records) {
      const record = records.find(item => item.id === id);
      if (record) {
        return record;
      }
    }
    return null;
  }

  /**
   * 选择核销时长
   * @param {HTMLElement} button 点击的时长按钮
   */
  selectDuration(button) {
    // 移除所有按钮的active状态
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // 为当前按钮添加active状态
    button.classList.add('active');
  }

  /**
   * 重置核销时长选择
   */
  resetDurationSelection() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // 默认选中60分钟
    const defaultBtn = document.querySelector('.duration-btn[data-duration="60"]');
    if (defaultBtn) {
      defaultBtn.classList.add('active');
    }
  }

  /**
   * 格式化咨询时间
   * @param {string} timeRange 时间范围字符串，如"18:30-19:30"
   * @returns {string} 格式化后的时间字符串
   */
  formatConsultationTime(timeRange) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    // 提取开始时间
    const startTime = timeRange.split('-')[0];
    
    return `${year}年${month}月${date}日 ${startTime}`;
  }

  /**
   * 生成模拟的实际咨询时长
   * @returns {string} 时长字符串
   */
  generateActualDuration() {
    // 生成随机的咨询时长（30-90分钟之间）
    const minutes = Math.floor(Math.random() * 60) + 30; // 30-89分钟
    const seconds = Math.floor(Math.random() * 60); // 0-59秒
    const milliseconds = Math.floor(Math.random() * 100); // 0-99毫秒
    
    return `${minutes}分${seconds}秒:${milliseconds.toString().padStart(2, '0')}:${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  // --- 声纹采集相关方法 ---

  /**
   * 显示录音弹窗
   */
  showRecordingModal() {
    this.resetRecordingState();
    
    // 设置随机提示文案
    const randomIndex = Math.floor(Math.random() * this.recordingPrompts.length);
    this.elements.recordingPrompt.textContent = this.recordingPrompts[randomIndex];

    modal.show('recordingModal');
  }

  /**
   * 切换录音状态
   */
  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  /**
   * 开始录音
   */
  startRecording() {
    this.isRecording = true;
    this.recordingSeconds = 0;
    
    this.elements.toggleRecordingBtn.textContent = '停止录音';
    this.elements.toggleRecordingBtn.classList.add('recording');

    this.updateTimerDisplay();

    this.recordingInterval = setInterval(() => {
      this.recordingSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  /**
   * 停止录音
   */
  stopRecording() {
    this.isRecording = false;
    clearInterval(this.recordingInterval);
    this.elements.toggleRecordingBtn.textContent = '开始录音';
    this.elements.toggleRecordingBtn.classList.remove('recording');
    
    // 检查录音时长
    if (this.recordingSeconds >= 15) {
      // 录音时长足够，标记为完成
      storage.remove('needVoiceprintCollection');
      this.showSuccessMessage('声纹采集完成！');
      setTimeout(() => {
        modal.hide('recordingModal');
      }, 1500);
    } else {
      // 录音时长不够
      this.showWarningMessage(`录音时长不足，请录制至少15秒（当前：${this.recordingSeconds}秒）`);
    }
  }
  
  /**
   * 取消录音
   */
  cancelRecording() {
    if(this.isRecording) {
      clearInterval(this.recordingInterval);
    }
    modal.hide('recordingModal');
    this.resetRecordingState();
  }

  /**
   * 重置录音状态和UI
   */
  resetRecordingState() {
    this.isRecording = false;
    if(this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    this.recordingSeconds = 0;
    this.elements.toggleRecordingBtn.textContent = '开始录音';
    this.elements.toggleRecordingBtn.classList.remove('recording');
    this.updateTimerDisplay();
  }

  /**
   * 更新计时器显示
   */
  updateTimerDisplay() {
    const minutes = Math.floor(this.recordingSeconds / 60).toString().padStart(2, '0');
    const seconds = (this.recordingSeconds % 60).toString().padStart(2, '0');
    this.elements.recordingTimer.textContent = `${minutes}:${seconds}`;
  }

  // 检查首次登录声纹采集
  checkFirstLoginVoiceprint() {
    const needVoiceprintCollection = storage.get('needVoiceprintCollection');
    
    if (needVoiceprintCollection) {
      // 延迟一点时间再弹窗，确保页面完全加载
      setTimeout(() => {
        this.showVoiceprintModal();
      }, 1000);
    }
  }

  // 显示声纹采集弹窗
  showVoiceprintModal() {
    if (!this.elements.recordingModal) return;
    
    // 随机选择一段文案
    this.setRandomPrompt();
    
    // 重置录音状态
    this.isRecording = false;
    this.recordingSeconds = 0;
    this.updateRecordingTimer();
    this.elements.toggleRecordingBtn.textContent = '开始录音';
    this.elements.toggleRecordingBtn.classList.remove('recording');
    
    // 显示弹窗
    modal.show('recordingModal');
  }

  // 隐藏声纹采集弹窗
  hideRecordingModal() {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.elements.recordingModal?.classList.remove('show');
  }

  // 设置随机提示文案
  setRandomPrompt() {
    const prompts = [
      "在人工智能的浪潮中，我们致力于通过技术创新，为每一位用户带来更加智能、便捷和个性化的服务体验。",
      "我们的智能对话系统不仅能理解您的需求，更能预测您的意图，从而提供超越期待的解决方案，让沟通变得前所未有的高效。",
      "安全与隐私是我们设计的核心基石，我们采用业界领先的加密技术和严格的数据管理政策，确保您的每一次互动都得到最高标准的安全保障。",
      "从晨曦到星辰，我们的系统持续学习与进化，只为在您需要的时候，提供最精准、最贴心的支持，成为您生活中不可或缺的智能伙伴。",
      "无论是复杂的专业咨询，还是日常的闲聊陪伴，我们都力求做到最好，因为我们相信，技术最终的目的是为了服务于人，温暖人心。"
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    if (this.elements.recordingPrompt) {
      this.elements.recordingPrompt.textContent = randomPrompt;
    }
  }

  // 更新录音计时器
  updateRecordingTimer() {
    const minutes = Math.floor(this.recordingSeconds / 60);
    const seconds = this.recordingSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (this.elements.recordingTimer) {
      this.elements.recordingTimer.textContent = timeString;
    }
  }

  // 显示成功消息
  showSuccessMessage(message) {
    this.showToast(message, 'success');
  }

  // 显示警告消息
  showWarningMessage(message) {
    this.showToast(message, 'warning');
  }

  // 显示Toast消息
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // 设置样式
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动消失
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new TodoCenter();
}); 