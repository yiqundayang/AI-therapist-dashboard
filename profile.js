/**
 * 客户档案页面逻辑
 */

class CustomerProfile {
  constructor() {
    // 当前选中的客户
    this.currentCustomer = null;
    
    // 客户数据
    this.customers = new Map();
    this.filteredCustomers = [];
    
    // DOM元素缓存
    this.elements = {};
    
    // 状态管理
    this.hasUnsavedChanges = false;
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.initMockData();
    this.bindEvents();
    // 不再渲染客户列表，直接检查URL参数
    this.checkURLParams();
    this.restoreQuickRecallState(); // 恢复快速回忆状态
    
    console.log('客户档案页面已初始化');
  }
  
  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      // 客户列表相关
      customerSearch: document.getElementById('customerSearch'),
      customerList: document.getElementById('customerList'),
      
      // 侧边栏相关
      sidebarToggle: document.getElementById('sidebarToggle'),
      profileLayout: document.getElementById('profileLayout'),
      customerSidebar: document.getElementById('customerSidebar'),
      profileMain: document.getElementById('profileMain'),
      
      // 档案内容相关
      profileEmpty: document.getElementById('profileEmpty'),
      profileContent: document.getElementById('profileContent'),
      
      // 用户信息
      userAvatar: document.getElementById('userAvatar'),
      userName: document.getElementById('userName'),
      userPhone: document.getElementById('userPhone'),
      customerGender: document.getElementById('customerGender'),
      customerAge: document.getElementById('customerAge'),
      
      // 基础信息按钮
      moreInfoBtn: document.getElementById('moreInfoBtn'),
      
      // 快速回忆
      recallToggle: document.getElementById('recallToggle'),
      recallContent: document.getElementById('recallContent'),
      recallInfoBtn: document.getElementById('recallInfoBtn'),
      concernsText: document.getElementById('concernsText'),
      
      // AI总结信息
      riskTags: document.getElementById('riskTags'),
      historyList: document.getElementById('historyList'),
      
      // Tab导航
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabPanes: document.querySelectorAll('.tab-pane'),
      
      // 咨询记录
      consultationRecordsList: document.getElementById('consultationRecordsList'),
      totalConsultations: document.getElementById('totalConsultations'),
      videoConsultations: document.getElementById('videoConsultations'),
      offlineConsultations: document.getElementById('offlineConsultations'),
      
      // 量表记录
      scaleRecordsList: document.querySelector('#scalesTab .scales-items'),
      
      // 问诊记录
      diagnosisRecordsList: document.querySelector('#diagnosisTab .diagnosis-items'),
      
      // 表单元素
      profileForm: document.getElementById('profileForm'),
      resetBtn: document.getElementById('resetBtn'),
      
      // 文件上传
      uploadBtn: document.getElementById('uploadBtn'),
      fileInput: document.getElementById('fileInput'),
      uploadedImages: document.getElementById('uploadedImages'),
      
      // 模态框
      basicInfoModal: document.getElementById('basicInfoModal'),
      basicInfoClose: document.getElementById('basicInfoClose'),
      recallInfoModal: document.getElementById('recallInfoModal'),
      recallInfoClose: document.getElementById('recallInfoClose'),
      riskInfoModal: document.getElementById('riskInfoModal'),
      historyInfoModal: document.getElementById('historyInfoModal'),
      riskInfoClose: document.getElementById('riskInfoClose'),
      historyInfoClose: document.getElementById('historyInfoClose')
    };
  }
  
  /**
   * 初始化模拟数据
   */
  initMockData() {
    const mockCustomers = [
      {
        id: 'user1',
        name: '张小明',
        nickname: '观心学员318974',
        phone: '13912345678',
        avatar: 'https://picsum.photos/seed/user1/80/80',
        accountType: 'main',
        gender: 'male',
        birthDate: '1995-03-15',
        height: 175,
        weight: 70,
        occupation: '软件工程师',
        education: 'bachelor',
        address: '北京市朝阳区xxx街道',
        symptoms: '自2020年起出现焦虑症状，工作压力大时加重，影响睡眠质量。',
        mainConcerns: '工作压力导致的焦虑症状，主要表现为失眠、心悸、注意力不集中。希望通过心理咨询学会有效的压力管理技巧，改善睡眠质量，提升工作效率。',
        isFirstConsultation: true, // 首次咨询，还没开始
        consultationRecords: [], // 首次咨询，暂无记录
        scaleRecords: [
          {
            id: 's1',
            name: 'PHQ-9 抑郁症筛查量表',
            date: '2024-01-15',
            score: 15,
            level: 'high',
            result: '中度抑郁'
          },
          {
            id: 's2',
            name: 'GAD-7 焦虑症筛查量表',
            date: '2024-01-15',
            score: 8,
            level: 'medium',
            result: '轻度焦虑'
          }
        ],
        diagnosisRecords: [
          {
            id: 'd1',
            date: '2024-01-15',
            status: 'completed',
            mainSymptoms: '情绪低落、兴趣减退、睡眠质量差、食欲下降',
            medicalHistory: '症状持续3个月，无明显诱因，家族史阴性',
            diagnosis: '中度抑郁症，建议进一步评估'
          }
        ]
      },
      {
        id: 'user2',
        name: '李小雅',
        nickname: '观心学员318975',
        phone: '13987654321',
        avatar: 'https://picsum.photos/seed/user2/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1992-08-22',
        height: 165,
        weight: 55,
        occupation: '教师',
        education: 'master',
        address: '上海市浦东新区xxx路',
        symptoms: '产后抑郁，情绪低落，兴趣减退，需要心理支持和专业指导。',
        mainConcerns: '产后出现的抑郁症状，包括情绪低落、兴趣减退、疲劳感强。希望通过专业心理治疗恢复正常的情绪状态，重新找回生活的乐趣。',
        isFirstConsultation: false, // 非首次咨询
        hasCompletedConsultations: true, // 已有完成的咨询
        consultationRecords: [
          {
            id: 'c4',
            date: '2024-01-12',
            session: 2,
            type: 'offline',
            topic: '产后抑郁症治疗 - 情绪调节训练',
            duration: 55
          },
          {
            id: 'c5',
            date: '2024-01-05',
            session: 1,
            type: 'video',
            topic: '初诊评估 - 产后抑郁症状评估',
            duration: 50
          }
        ],
        scaleRecords: [
          {
            id: 's3',
            name: 'EPDS 爱丁堡产后抑郁量表',
            date: '2024-01-05',
            score: 18,
            level: 'high',
            result: '重度产后抑郁'
          }
        ],
        diagnosisRecords: []
      },
      {
        id: 'user3',
        name: '王小芳',
        nickname: '观心学员318976',
        phone: '13611223344',
        avatar: 'https://picsum.photos/seed/user3/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1988-12-10',
        height: 160,
        weight: 58,
        occupation: '市场经理',
        education: 'bachelor',
        address: '深圳市南山区xxx大厦',
        symptoms: '社交恐惧症，在公开场合容易紧张，影响工作表现。',
        mainConcerns: '社交场合的恐惧和紧张情绪，特别是在工作汇报和团队会议中。希望克服社交恐惧，提升自信心和沟通能力。',
        isFirstConsultation: false, // 非首次咨询，即将第2次
        hasCompletedConsultations: true, // 已有完成的咨询
        consultationRecords: [
          {
            id: 'c6',
            date: '2024-01-10',
            session: 1,
            type: 'video',
            topic: '初诊评估 - 社交焦虑症状评估',
            duration: 50
          }
        ],
        scaleRecords: [
          {
            id: 's4',
            name: 'SAS 社交焦虑量表',
            date: '2024-01-16',
            score: 65,
            level: 'high',
            result: '重度社交焦虑'
          },
          {
            id: 's5',
            name: 'GAD-7 焦虑症筛查量表',
            date: '2024-01-16',
            score: 12,
            level: 'medium',
            result: '中度焦虑'
          }
        ],
        diagnosisRecords: [
          {
            id: 'd2',
            date: '2024-01-16',
            status: 'completed',
            mainSymptoms: '社交场合紧张、心悸、出汗、回避行为',
            medicalHistory: '症状持续2年，工作压力加重，无家族史',
            diagnosis: '社交焦虑症，建议认知行为治疗'
          }
        ]
      },
      {
        id: 'user4',
        name: '陈小强',
        nickname: '观心学员318977',
        phone: '13755667788',
        avatar: 'https://picsum.photos/seed/user4/80/80',
        accountType: 'main',
        gender: 'male',
        birthDate: '1985-06-30',
        height: 180,
        weight: 75,
        occupation: '销售总监',
        education: 'college',
        address: '广州市天河区xxx广场',
        symptoms: '工作压力过大导致失眠，经常性头痛，情绪易怒。',
        mainConcerns: '长期工作压力导致的身心症状，包括失眠、头痛、易怒。希望学会压力管理技巧，改善睡眠质量，提升情绪控制能力。',
        isFirstConsultation: false, // 非首次咨询，即将第3次
        hasCompletedConsultations: true, // 已有完成的咨询
        consultationRecords: [
          {
            id: 'c7',
            date: '2024-01-12',
            session: 2,
            type: 'offline',
            topic: '压力管理技巧训练 - 放松技术与认知调整',
            duration: 55
          },
          {
            id: 'c8',
            date: '2024-01-05',
            session: 1,
            type: 'video',
            topic: '初诊评估 - 工作压力相关症状评估',
            duration: 50
          }
        ],
        scaleRecords: [
          {
            id: 's6',
            name: '工作压力量表',
            date: '2024-01-12',
            score: 75,
            level: 'high',
            result: '高度工作压力'
          },
          {
            id: 's7',
            name: 'ISI 失眠严重程度指数',
            date: '2024-01-12',
            score: 18,
            level: 'medium',
            result: '中度失眠'
          }
        ],
        diagnosisRecords: [
          {
            id: 'd3',
            date: '2024-01-12',
            status: 'completed',
            mainSymptoms: '失眠、头痛、易怒、注意力不集中',
            medicalHistory: '工作压力持续3年，症状逐渐加重，无家族史',
            diagnosis: '工作压力相关适应障碍，建议压力管理训练'
          }
        ]
      },
      {
        id: 'user5',
        name: '刘小娟',
        nickname: '观心学员318978',
        phone: '13899887766',
        avatar: 'https://picsum.photos/seed/user5/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1990-04-18',
        height: 168,
        weight: 52,
        occupation: '护士',
        education: 'college',
        address: '杭州市西湖区xxx医院',
        symptoms: '因工作性质接触患者较多，出现轻度创伤后应激障碍。',
        mainConcerns: '工作中接触创伤事件导致的心理创伤，出现回避、噩梦、情绪麻木等症状。希望通过专业治疗缓解创伤症状，恢复正常工作和生活。',
        isFirstConsultation: false, // 已完成首次咨询
        hasCompletedConsultations: true, // 已有完成的咨询
        consultationRecords: [
          {
            id: 'c6',
            date: '2024-01-10',
            session: 1,
            type: 'offline',
            topic: '创伤后应激障碍初诊评估',
            duration: 60
          }
        ],
        scaleRecords: [
          {
            id: 's6',
            name: 'PCL-5 创伤后应激障碍量表',
            date: '2024-01-10',
            score: 45,
            level: 'medium',
            result: '中度PTSD症状'
          }
        ],
        diagnosisRecords: []
      },
      {
        id: 'user6',
        name: '周小琳',
        nickname: '观心学员318979',
        phone: '13633445566',
        avatar: 'https://picsum.photos/seed/user6/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1993-11-05',
        height: 162,
        weight: 50,
        occupation: '设计师',
        education: 'bachelor',
        address: '成都市锦江区xxx创意园',
        symptoms: '完美主义倾向严重，因工作要求过高导致焦虑和抑郁情绪。',
        mainConcerns: '完美主义导致的焦虑和抑郁情绪，工作效率下降，人际关系紧张。希望学会接受不完美，减轻心理压力。',
        isFirstConsultation: false, // 非首次咨询，多次咨询
        hasCompletedConsultations: true, // 已有完成的咨询
        consultationRecords: [
          {
            id: 'c7',
            date: '2024-01-15',
            session: 3,
            type: 'video',
            topic: '认知行为疗法 - 完美主义认知重构',
            duration: 50
          },
          {
            id: 'c8',
            date: '2024-01-08',
            session: 2,
            type: 'offline',
            topic: '深度心理评估 - 完美主义根源分析',
            duration: 60
          },
          {
            id: 'c9',
            date: '2024-01-01',
            session: 1,
            type: 'video',
            topic: '初诊评估 - 完美主义症状评估与治疗方案制定',
            duration: 45
          }
        ],
        scaleRecords: [
          {
            id: 's7',
            name: 'MPS 多维完美主义量表',
            date: '2024-01-15',
            score: 85,
            level: 'high',
            result: '高度完美主义'
          },
          {
            id: 's8',
            name: 'GAD-7 焦虑症筛查量表',
            date: '2024-01-15',
            score: 14,
            level: 'high',
            result: '重度焦虑'
          }
        ],
        diagnosisRecords: [
          {
            id: 'd3',
            date: '2024-01-15',
            status: 'completed',
            mainSymptoms: '过度追求完美、焦虑、抑郁、强迫倾向',
            medicalHistory: '症状持续5年，工作压力加重，无家族史',
            diagnosis: '完美主义相关焦虑抑郁症，建议认知行为治疗'
          }
        ]
      }
    ];
    
    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
    
    this.filteredCustomers = Array.from(this.customers.values());
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 侧边栏收起/展开
    if (this.elements.sidebarToggle) {
      this.elements.sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
    
    // 搜索功能
    if (this.elements.customerSearch) {
      this.elements.customerSearch.addEventListener('input', () => {
        this.filterCustomers();
      });
    }
    
    // Tab切换
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // 基础信息按钮
    if (this.elements.moreInfoBtn) {
      this.elements.moreInfoBtn.addEventListener('click', () => {
        this.showModal('basicInfoModal');
      });
    }
    
    // 表单相关
    if (this.elements.profileForm) {
      this.elements.profileForm.addEventListener('submit', (e) => {
        this.handleFormSubmit(e);
      });
    }
    
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.resetForm();
      });
    }
    
    // 文件上传
    if (this.elements.uploadBtn) {
      this.elements.uploadBtn.addEventListener('click', () => {
        this.elements.fileInput?.click();
      });
    }
    
    if (this.elements.fileInput) {
      this.elements.fileInput.addEventListener('change', (e) => {
        this.handleFileUpload(e);
      });
    }
    
    // 出生日期变化时计算年龄
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
      birthDateInput.addEventListener('change', () => {
        this.calculateAge();
      });
    }
    
    // 身高体重变化时计算BMI
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    if (heightInput) {
      heightInput.addEventListener('input', () => {
        this.calculateBMI();
      });
    }
    if (weightInput) {
      weightInput.addEventListener('input', () => {
        this.calculateBMI();
      });
    }
    
    // 表单变化监听
    if (this.elements.profileForm) {
      this.elements.profileForm.addEventListener('input', () => {
        this.hasUnsavedChanges = true;
      });
    }
    
    // 快速回忆信息按钮
    if (this.elements.recallInfoBtn) {
      this.elements.recallInfoBtn.addEventListener('click', () => {
        this.showModal('recallInfoModal');
      });
    }
    
    // 模态框关闭
    if (this.elements.basicInfoClose) {
      this.elements.basicInfoClose.addEventListener('click', () => {
        this.hideModal('basicInfoModal');
      });
    }
    
    if (this.elements.recallInfoClose) {
      this.elements.recallInfoClose.addEventListener('click', () => {
        this.hideModal('recallInfoModal');
      });
    }
    
    if (this.elements.riskInfoClose) {
      this.elements.riskInfoClose.addEventListener('click', () => {
        this.hideModal('riskInfoModal');
      });
    }
    
    if (this.elements.historyInfoClose) {
      this.elements.historyInfoClose.addEventListener('click', () => {
        this.hideModal('historyInfoModal');
      });
    }
    
    // 快速回忆展开收起
    if (this.elements.recallToggle) {
      this.elements.recallToggle.addEventListener('click', () => {
        this.toggleQuickRecall();
      });
    }
    
    // 页面退出前确认
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    });
    
    // 开始倒计时更新
    this.startCountdownUpdate();
  }
  
  /**
   * 检查URL参数
   */
  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const userName = urlParams.get('name');
    
    console.log('URL参数:', { userId, userName });
    console.log('可用客户:', Array.from(this.customers.keys()));
    
    if (userId && this.customers.has(userId)) {
      console.log('根据userId选择客户:', userId);
      this.selectCustomer(userId);
    } else if (userName) {
      // 根据姓名查找客户
      const customer = Array.from(this.customers.values()).find(c => c.name === decodeURIComponent(userName));
      if (customer) {
        console.log('根据userName选择客户:', customer.name);
        this.selectCustomer(customer.id);
      } else {
        console.log('未找到匹配的客户，使用默认客户');
        this.selectDefaultCustomer();
      }
    } else {
      console.log('没有URL参数，使用默认客户');
      this.selectDefaultCustomer();
    }
  }
  
  /**
   * 选择默认客户（用于测试）
   */
  selectDefaultCustomer() {
    // 选择第一个客户作为默认显示
    const firstCustomer = Array.from(this.customers.values())[0];
    if (firstCustomer) {
      this.selectCustomer(firstCustomer.id);
    }
  }
  
  /**
   * 过滤客户列表
   */
  filterCustomers() {
    // 检查搜索元素是否存在
    if (!this.elements.customerSearch) return;
    
    const searchTerm = this.elements.customerSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredCustomers = Array.from(this.customers.values());
    } else {
      this.filteredCustomers = Array.from(this.customers.values()).filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.nickname.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
      );
    }
    
    this.renderCustomerList();
  }
  
  /**
   * 渲染客户列表
   */
  renderCustomerList() {
    const container = this.elements.customerList;
    
    // 检查容器是否存在
    if (!container) return;
    
    if (this.filteredCustomers.length === 0) {
      container.innerHTML = '<div class="empty-message">暂无客户</div>';
      return;
    }
    
    const html = this.filteredCustomers.map(customer => `
      <div class="customer-item" data-customer-id="${customer.id}">
        <img src="${customer.avatar}" alt="${customer.name}" class="customer-avatar">
        <div class="customer-info">
          <div class="customer-name">${customer.name}</div>
          <div class="customer-account-type">${customer.accountType === 'main' ? '主账号' : '子账号'}</div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // 绑定点击事件
    container.addEventListener('click', (e) => {
      const customerItem = e.target.closest('.customer-item');
      if (customerItem) {
        const customerId = customerItem.dataset.customerId;
        this.selectCustomer(customerId);
      }
    });
  }
  
  /**
   * 选择客户
   */
  selectCustomer(customerId) {
    const customer = this.customers.get(customerId);
    if (!customer) return;
    
    this.currentCustomer = customer;
    
    // 更新列表选中状态
    this.updateCustomerListSelection(customerId);
    
    // 显示档案内容
    this.showProfileContent();
    
    console.log('已选择客户:', customer.name);
  }
  
  /**
   * 更新客户列表选中状态
   */
  updateCustomerListSelection(customerId) {
    // 检查客户列表元素是否存在（因为页面可能没有客户列表）
    if (this.elements.customerList) {
      const customerItems = this.elements.customerList.querySelectorAll('.customer-item');
      customerItems.forEach(item => {
        if (item.dataset.customerId === customerId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * 显示档案内容
   */
  showProfileContent() {
    // 更新用户基本信息
    this.elements.userAvatar.src = this.currentCustomer.avatar;
    this.elements.userName.textContent = this.currentCustomer.name;
    this.elements.userPhone.textContent = this.currentCustomer.phone;
    
    // 更新性别和年龄显示
    const genderText = this.currentCustomer.gender === 'male' ? '男' : 
                      this.currentCustomer.gender === 'female' ? '女' : '未知';
    this.elements.customerGender.textContent = genderText;
    
    const age = this.calculateAgeFromBirthDate(this.currentCustomer.birthDate);
    this.elements.customerAge.textContent = age ? `${age}岁` : '年龄未知';
    
    // 填充表单
    this.fillForm(this.currentCustomer);
    
    // 渲染快速回忆
    this.renderQuickRecall(this.currentCustomer);
    
    // 渲染咨询记录
    this.renderConsultationRecords(this.currentCustomer);
    
    // 渲染量表记录
    this.renderScaleRecords(this.currentCustomer);
    
    // 渲染问诊记录
    this.renderDiagnosisRecords(this.currentCustomer);
  }
  
  /**
   * 填充表单数据
   */
  fillForm(customer) {
    // 基本信息
    document.getElementById('nickname').value = customer.nickname || '';
    document.getElementById('realName').value = customer.name || '';
    document.getElementById('gender').value = customer.gender || '';
    document.getElementById('birthDate').value = customer.birthDate || '';
    document.getElementById('phoneNumber').value = customer.phone || '';
    document.getElementById('height').value = customer.height || '';
    document.getElementById('weight').value = customer.weight || '';
    document.getElementById('occupation').value = customer.occupation || '';
    document.getElementById('education').value = customer.education || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('emergencyContactName').value = customer.emergencyContactName || '';
    document.getElementById('emergencyContactPhone').value = customer.emergencyContactPhone || '';
    document.getElementById('symptoms').value = customer.symptoms || '';
    
    // 计算年龄和BMI
    this.calculateAge();
    this.calculateBMI();
  }
  
  /**
   * 渲染AI总结信息
   */
  renderAISummary(customer) {
    // 风险评估标签
    const riskData = [
      { type: 'suicide', level: 'high', label: '自杀风险-高' },
      { type: 'depression', level: 'high', label: '重度情绪-高' },
      { type: 'self-harm', level: 'medium', label: '自伤风险-中' },
      { type: 'isolation', level: 'medium', label: '社会隔离-中' },
      { type: 'neglect', level: 'low', label: '自我忽视-低' }
    ];
    
    this.elements.riskTags.innerHTML = riskData.map(risk => `
      <span class="risk-tag ${risk.level}">${risk.label}</span>
    `).join('');
    
    // 疾病史与用药史
    const historyData = [
      '2015年起，存在情绪低落、兴趣减退等问题，医院诊断为轻度抑郁',
      '现阶段，存在重度抑郁症状，伴有自杀倾向，未服药',
      '2019年，开始服用草酸艾司西普兰片 (10mg/日)，后调整至15mg/日',
      '现阶段建议使用度洛西汀肠溶胶囊和米氮平片，但实际未服药'
    ];
    
    this.elements.historyList.innerHTML = historyData.map(item => `<li>${item}</li>`).join('');
  }
  
  /**
   * 切换Tab
   */
  switchTab(tabName) {
    // 更新按钮状态
    this.elements.tabBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新内容显示
    this.elements.tabPanes.forEach(pane => {
      pane.classList.remove('active');
    });
    
    const targetPane = document.getElementById(this.getTabPaneId(tabName));
    if (targetPane) {
      targetPane.classList.add('active');
    }
  }
  
  /**
   * 获取Tab面板ID
   */
  getTabPaneId(tabName) {
    const tabMap = {
      'consultations': 'consultationsTab',
      'scales': 'scalesTab',
      'diagnosis': 'diagnosisTab',
      'prescriptions': 'prescriptionsTab',
      'orders': 'ordersTab'
    };
    return tabMap[tabName] || 'consultationsTab';
  }
  
  /**
   * 计算年龄
   */
  calculateAge() {
    const birthDate = document.getElementById('birthDate').value;
    const ageField = document.getElementById('age');
    
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      ageField.value = age >= 0 ? age : '';
    } else {
      ageField.value = '';
    }
  }
  
  /**
   * 计算BMI
   */
  calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bmiField = document.getElementById('bmi');
    
    if (height && weight && height > 0) {
      const bmi = weight / Math.pow(height / 100, 2);
      bmiField.value = bmi.toFixed(1);
    } else {
      bmiField.value = '';
      bmiField.placeholder = '请填写身高和体重';
    }
  }
  
  /**
   * 处理文件上传
   */
  handleFileUpload(e) {
    const files = Array.from(e.target.files);
    const maxFiles = 9;
    const currentImages = this.elements.uploadedImages.children.length;
    
    if (currentImages + files.length > maxFiles) {
      toast.show(`最多只能上传${maxFiles}张图片`, 'warning');
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.previewImage(file);
      }
    });
    
    // 清空input
    e.target.value = '';
  }
  
  /**
   * 预览图片
   */
  previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'uploaded-image';
      imageDiv.innerHTML = `
        <img src="${e.target.result}" alt="病历资料">
        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
      `;
      this.elements.uploadedImages.appendChild(imageDiv);
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * 处理表单提交
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.currentCustomer) {
      toast.show('请先选择一个客户', 'warning');
      return;
    }
    
    // 获取表单数据
    const formData = new FormData(this.elements.profileForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
      toast.show('正在保存...', 'info');
      
      // 模拟API调用
      await this.saveCustomerProfile(data);
      
      // 更新本地数据
      Object.assign(this.currentCustomer, data);
      
      this.hasUnsavedChanges = false;
      toast.show('保存成功', 'success');
      
      // 更新客户列表显示
      this.renderCustomerList();
      
    } catch (error) {
      console.error('保存失败:', error);
      toast.show('保存失败，请稍后重试', 'error');
    }
  }
  
  /**
   * 模拟保存客户档案API
   */
  async saveCustomerProfile(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 + Math.random() * 1000);
    });
  }
  
  /**
   * 重置表单
   */
  resetForm() {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm('确定要重置表单吗？这将丢失所有未保存的更改。');
      if (!confirmed) return;
    }
    
    if (this.currentCustomer) {
      this.fillForm(this.currentCustomer);
      this.hasUnsavedChanges = false;
      toast.show('表单已重置', 'info');
    }
  }
  
  /**
   * 检查下次咨询提醒
   */
  checkNextConsultation(customer) {
    const card = this.elements.nextConsultationCard;
    
    // 已删除30分钟提醒逻辑 - 不再显示"开始咨询"按钮
    // 直接隐藏下次咨询提醒卡片
    card.style.display = 'none';
    
    // 原逻辑已注释：
    // if (customer.nextConsultation) {
    //   const consultationTime = customer.nextConsultation.time;
    //   const now = new Date();
    //   const timeDiff = consultationTime.getTime() - now.getTime();
    //   
    //   // 如果距离咨询时间小于30分钟，显示提醒卡片
    //   if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) {
    //     card.style.display = 'block';
    //     this.updateNextConsultationCard(customer.nextConsultation, timeDiff);
    //   } else {
    //     card.style.display = 'none';
    //   }
    // } else {
    //   card.style.display = 'none';
    // }
  }
  
  /**
   * 更新下次咨询提醒卡片
   */
  updateNextConsultationCard(consultation, timeDiff) {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    this.elements.countdownText.textContent = `距离下次咨询还有 ${minutes} 分钟 ${seconds} 秒`;
    this.elements.nextConsultationType.textContent = 
      consultation.type === 'video' ? '线上咨询' : '到店咨询';
    
    this.elements.nextConsultationBtn.textContent = 
      consultation.type === 'video' ? '开始咨询' : '开始记录';
  }
  
  /**
   * 处理下次咨询按钮点击
   */
  handleNextConsultation() {
    if (!this.currentCustomer?.nextConsultation) return;
    
    const consultation = this.currentCustomer.nextConsultation;
    
    if (consultation.type === 'video') {
      toast.show('正在连接视频咨询...', 'info');
      // 这里可以跳转到视频咨询页面
      setTimeout(() => {
        toast.show('视频咨询已开始', 'success');
      }, 2000);
    } else {
      // 跳转到咨询笔记页面
      const clientName = this.currentCustomer.name;
      const sessionCount = this.currentCustomer.sessionCount || 1;
      const consultationTime = consultation.time.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + '-' + new Date(consultation.time.getTime() + 60 * 60 * 1000).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: clientName,
        session: sessionCount,
        time: consultationTime
      });
      
      // 跳转到咨询笔记页面
      window.location.href = `consultation-notes.html?${params.toString()}`;
    }
  }
  
  /**
   * 开始倒计时更新
   */
  startCountdownUpdate() {
    setInterval(() => {
      if (this.currentCustomer?.nextConsultation && 
          this.elements.nextConsultationCard.style.display !== 'none') {
        this.checkNextConsultation(this.currentCustomer);
      }
    }, 1000); // 每秒更新
  }
  
  /**
   * 显示模态框
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
      
      // 添加点击背景关闭功能
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modalId);
        }
      });
      
      // 添加ESC键关闭功能
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideModal(modalId);
        }
      });
    }
  }
  
  /**
   * 隐藏模态框
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 200);
      
      // 移除事件监听器
      document.removeEventListener('keydown', this.handleEscKey);
    }
  }
  
  /**
   * 切换侧边栏显示/隐藏
   */
  toggleSidebar() {
    const isCollapsed = this.elements.profileLayout.classList.contains('sidebar-collapsed');
    
    if (isCollapsed) {
      // 展开侧边栏
      this.elements.profileLayout.classList.remove('sidebar-collapsed');
      this.elements.sidebarToggle.classList.remove('collapsed');
      
      // 保存状态
      localStorage.setItem('sidebarCollapsed', 'false');
    } else {
      // 收起侧边栏
      this.elements.profileLayout.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('collapsed');
      
      // 保存状态
      localStorage.setItem('sidebarCollapsed', 'true');
    }
  }
  
  /**
   * 恢复侧边栏状态
   */
  restoreSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
      this.elements.profileLayout.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('collapsed');
    }
  }
  
  /**
   * 切换AI总结展开收起状态
   */
  toggleAISummary() {
    const aiSummary = document.querySelector('.ai-summary');
    const isCollapsed = aiSummary.classList.contains('collapsed');
    
    if (isCollapsed) {
      // 展开
      aiSummary.classList.remove('collapsed');
      localStorage.setItem('aiSummaryCollapsed', 'false');
    } else {
      // 收起
      aiSummary.classList.add('collapsed');
      localStorage.setItem('aiSummaryCollapsed', 'true');
    }
  }
  
  /**
   * 恢复AI总结展开收起状态
   */
  restoreAISummaryState() {
    const isCollapsed = localStorage.getItem('aiSummaryCollapsed') === 'true';
    const aiSummary = document.querySelector('.ai-summary');
    
    if (isCollapsed && aiSummary) {
      aiSummary.classList.add('collapsed');
    }
  }
  
  /**
   * 从出生日期计算年龄
   */
  calculateAgeFromBirthDate(birthDate) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  }
  
  /**
   * 渲染快速回忆信息
   */
  renderQuickRecall(customer) {
    // 主要困扰及诉求
    this.elements.concernsText.textContent = customer.mainConcerns || '暂无相关信息';
    
    // 风险评估标签 - 根据客户情况动态生成
    let riskData = [];
    
    if (customer.isFirstConsultation) {
      // 首次咨询：基于初步评估的风险标签
      if (customer.symptoms.includes('抑郁') || customer.symptoms.includes('情绪低落')) {
        riskData.push({ type: 'depression', level: 'medium', label: '抑郁风险-中' });
      }
      if (customer.symptoms.includes('焦虑') || customer.symptoms.includes('紧张')) {
        riskData.push({ type: 'anxiety', level: 'medium', label: '焦虑风险-中' });
      }
      if (customer.symptoms.includes('失眠') || customer.symptoms.includes('睡眠')) {
        riskData.push({ type: 'sleep', level: 'low', label: '睡眠问题-低' });
      }
      if (customer.symptoms.includes('社交') || customer.symptoms.includes('恐惧')) {
        riskData.push({ type: 'social', level: 'medium', label: '社交回避-中' });
      }
      if (customer.symptoms.includes('创伤') || customer.symptoms.includes('应激')) {
        riskData.push({ type: 'trauma', level: 'high', label: '创伤反应-高' });
      }
      
      // 如果没有明显风险标签，显示待评估
      if (riskData.length === 0) {
        riskData.push({ type: 'assessment', level: 'pending', label: '风险评估中' });
      }
    } else {
      // 非首次咨询：基于历史数据的完整风险评估
      riskData = [
        { type: 'suicide', level: 'high', label: '自杀风险-高' },
        { type: 'depression', level: 'high', label: '重度情绪-高' },
        { type: 'self-harm', level: 'medium', label: '自伤风险-中' },
        { type: 'isolation', level: 'medium', label: '社会隔离-中' },
        { type: 'neglect', level: 'low', label: '自我忽视-低' }
      ];
    }
    
    this.elements.riskTags.innerHTML = riskData.map(risk => `
      <span class="risk-tag ${risk.level}">${risk.label}</span>
    `).join('');
    
    // 疾病史与用药史 - 根据客户情况动态生成
    let historyData = [];
    
    if (customer.isFirstConsultation) {
      // 首次咨询：基于客户自述的基础信息
      historyData = [
        `根据客户自述：${customer.symptoms}`,
        '详细病史信息待进一步评估',
        '用药史信息待收集',
        '建议完善相关检查和评估'
      ];
    } else {
      // 非首次咨询：详细的历史信息
      historyData = [
        '2015年起，存在情绪低落、兴趣减退等问题，医院诊断为轻度抑郁',
        '现阶段，存在重度抑郁症状，伴有自杀倾向，未服药',
        '2019年，开始服用草酸艾司西普兰片 (10mg/日)，后调整至15mg/日',
        '现阶段建议使用度洛西汀肠溶胶囊和米氮平片，但实际未服药'
      ];
    }
    
    this.elements.historyList.innerHTML = historyData.map(item => `<li>${item}</li>`).join('');
  }
  
  /**
   * 渲染咨询记录
   */
  renderConsultationRecords(customer) {
    const records = customer.consultationRecords || [];
    const container = this.elements.consultationRecordsList;
    
    // 更新统计数据
    const totalCount = records.length;
    const videoCount = records.filter(r => r.type === 'video').length;
    const offlineCount = records.filter(r => r.type === 'offline').length;
    
    this.elements.totalConsultations.textContent = totalCount;
    this.elements.videoConsultations.textContent = videoCount;
    this.elements.offlineConsultations.textContent = offlineCount;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-consultation-records">
          <div class="empty-icon">📋</div>
          <h4>暂无咨询记录</h4>
          <p>这是首次咨询，还没有历史咨询记录</p>
        </div>
      `;
      return;
    }
    
    // 按日期倒序排列
    const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedRecords.map(record => `
      <div class="consultation-record-item">
        <div class="record-date">${record.date}</div>
        <div class="record-session">第${record.session}次</div>
        <div class="record-type ${record.type}">
          ${record.type === 'video' ? '视频咨询' : '到店咨询'}
        </div>
        <div class="record-topic">${record.topic}</div>
        <button class="btn btn-sm btn-secondary view-detail-btn" 
                onclick="window.customerProfile.viewConsultationDetail('${record.id}')">
          查看详情
        </button>
      </div>
    `).join('');
  }
  
  /**
   * 查看咨询记录详情
   */
  viewConsultationDetail(recordId) {
    const customer = this.currentCustomer;
    const record = customer.consultationRecords?.find(r => r.id === recordId);
    
    if (record) {
      toast.show('正在打开咨询记录详情...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: customer.name,
        userId: customer.id,
        type: record.type,
        session: record.session,
        date: record.date,
        id: recordId,
        status: 'completed'
      });
      
      // 跳转到咨询记录详情页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到咨询记录', 'error');
    }
  }
  
  /**
   * 切换快速回忆展开收起状态
   */
  toggleQuickRecall() {
    const quickRecall = document.querySelector('.quick-recall');
    const isCollapsed = quickRecall.classList.contains('collapsed');
    
    if (isCollapsed) {
      // 展开
      quickRecall.classList.remove('collapsed');
      localStorage.setItem('quickRecallCollapsed', 'false');
    } else {
      // 收起
      quickRecall.classList.add('collapsed');
      localStorage.setItem('quickRecallCollapsed', 'true');
    }
  }
  
  /**
   * 恢复快速回忆展开收起状态
   */
  restoreQuickRecallState() {
    const isCollapsed = localStorage.getItem('quickRecallCollapsed') === 'true';
    const quickRecall = document.querySelector('.quick-recall');
    
    if (isCollapsed && quickRecall) {
      quickRecall.classList.add('collapsed');
    }
  }
  
  /**
   * 渲染量表记录
   */
  renderScaleRecords(customer) {
    const records = customer.scaleRecords || [];
    const container = this.elements.scaleRecordsList;
    
    if (!container) return;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-scale-records">
          <div class="empty-icon">📊</div>
          <h4>暂无量表记录</h4>
          <p>${customer.isFirstConsultation ? '首次咨询，建议完成相关心理量表评估' : '暂无量表记录'}</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = records.map(record => `
      <div class="scale-item">
        <div class="scale-info">
          <h4>${record.name}</h4>
          <p class="scale-date">完成时间: ${record.date}</p>
          <p class="scale-score">得分: <span class="score-${record.level}">${record.score}分</span> (${record.result})</p>
        </div>
        <div class="scale-actions">
          <button class="btn btn-sm btn-secondary">查看详情</button>
          <button class="btn btn-sm btn-outline">对比历史</button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * 渲染问诊记录
   */
  renderDiagnosisRecords(customer) {
    const records = customer.diagnosisRecords || [];
    const container = this.elements.diagnosisRecordsList;
    
    if (!container) return;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-diagnosis-records">
          <div class="empty-icon">🩺</div>
          <h4>暂无问诊记录</h4>
          <p>${customer.isFirstConsultation ? '首次咨询，建议完成详细问诊评估' : '暂无问诊记录'}</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = records.map(record => `
      <div class="diagnosis-item">
        <div class="diagnosis-header">
          <h4>${record.date} 问诊记录</h4>
          <span class="diagnosis-status ${record.status}">${record.status === 'completed' ? '已完成' : '进行中'}</span>
        </div>
        <div class="diagnosis-content">
          <div class="diagnosis-section">
            <h5>主要症状</h5>
            <p>${record.mainSymptoms}</p>
          </div>
          <div class="diagnosis-section">
            <h5>病史询问</h5>
            <p>${record.medicalHistory}</p>
          </div>
          <div class="diagnosis-section">
            <h5>初步诊断</h5>
            <p>${record.diagnosis}</p>
          </div>
        </div>
        <div class="diagnosis-actions">
          <button class="btn btn-sm btn-secondary">查看完整记录</button>
          <button class="btn btn-sm btn-outline">编辑</button>
        </div>
      </div>
    `).join('');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.customerProfile = new CustomerProfile();
}); 