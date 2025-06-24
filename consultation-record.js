// ================= MOCK DATA =================
const mockPastRecords = [
  { id: 19, title: '第 19 次', date: '2025-06-06 11:00-11:30', type: '视频咨询', active: true },
  { id: 18, title: '第 18 次', subtitle: '技术与业务对接', date: '2025-05-28 11:00-11:20', type: '视频咨询' },
  { id: 17, title: '第 17 次', subtitle: '学业压力与教养冲突', date: '2025-05-25 15:40-16:00', type: '视频咨询' },
  { id: 16, title: '第 16 次', subtitle: '项目推进沟通', date: '2025-05-25 15:20-15:40', type: '视频咨询' },
  { id: 15, title: '第 15 次', subtitle: '工作流程优化沟通', date: '2025-05-25 15:00-15:20', type: '到店咨询' },
  { id: 14, title: '第 14 次', subtitle: '工作压力与沟通', date: '2025-05-25 14:40-15:00', type: '视频咨询' },
];

const mockUserInfo = {
  mainConcern: '近期因孩子（小明，15岁）学业成绩下滑、沉迷游戏问题，与妻子在教养方式上产生显著分歧。希望找到平衡的教养策略，改善家庭沟通，帮助孩子重拾学习兴趣。',
  riskAssessment: '中度风险。来访者表现出明显的焦虑情绪，存在失眠、食欲不振等生理反应。家庭冲突频率较高，可能影响家庭稳定及孩子心理健康。无自伤或伤人意念。',
  history: '来访者自述无精神疾病史。因工作压力大，有长期服用安眠药（佐匹克隆）的习惯，每周约2-3次。'
};

const mockTranscriptData = [
    { speaker: 'consultant', time: '00:10', text: '下午好，欢迎来到今天的咨询。上次我们聊到您对小明最近在学校的表现有些担心，这周情况有什么新变化吗？', tags: [] },
    { speaker: 'client', time: '00:45', text: '唉，别提了，情况更糟了。上周的数学测验，他只考了58分，我感觉自己的血压都升高了。每天回家就是关在房间里玩游戏，和他说话也爱答不理的。', tags: [ { type: 'emotion', label: '😔 情绪低落' }, { type: 'event', label: '📖 学业压力' } ] },
    { speaker: 'consultant', time: '01:28', text: '听到这个消息确实会让人很焦虑。考了58分，他自己有什么反应吗？', tags: [], realTimeHint: { 
        timestamp: '01:28',
        category: '表达调整',
        priority: '提示',
        description: '咨询师直接询问分数反应，可能加重来访者对成绩的焦虑',
        suggestion: '可先共情来访者的担忧情绪，再逐步引导探讨孩子的感受，避免过于直接的问题'
    } },
    { speaker: 'client', time: '01:55', text: '他？他好像无所谓一样，就说"知道了"，然后就没下文了。我真不知道他脑子里在想什么，感觉自己所有的努力都白费了。', tags: [] },
    { speaker: 'consultant', time: '02:30', text: '听起来，您感觉自己的付出没有得到期望的回应，这让您感到很挫败。这种无力感似乎比分数本身更让您难受。', tags: [ { type: 'event', label: '关键觉察' } ], realTimeHint: { 
        timestamp: '02:30',
        category: '表达调整',
        priority: '关注',
        description: '很好的共情和情感反映，准确捕捉到来访者的核心情绪',
        suggestion: '继续保持这种共情风格，可进一步探索无力感背后的期待和需求'
    } },
    { speaker: 'client', time: '03:10', text: '对！就是这种感觉！我为这个家付出了这么多，就是希望他能好好的，但他完全不理解。他妈妈还老护着他，说他还是孩子，让我别逼他。', tags: [] },
    { speaker: 'consultant', time: '04:05', text: '您和太太在教育方式上的分歧，似乎是目前家庭矛盾的一个核心。这种不一致，孩子夹在中间也会感到困惑。', tags: [ { type: 'event', label: '家庭关系' } ] },
    { speaker: 'client', time: '04:50', text: '是的，我们经常因为这个吵架。我觉得她太放纵了，她觉得我太严格了。我真的不知道该怎么办，有时候我宁愿在公司加班也不想回家。', tags: [ { type: 'emotion', label: '😥 回避' } ], realTimeHint: { 
        timestamp: '04:50',
        category: '待探索议题',
        priority: '关注',
        description: '来访者表达了逃避家庭的想法，可能存在更深层的情感需求未被满足',
        suggestion: '可探索逃避行为背后的情感需求，以及在家庭中寻找归属感的渴望'
    } },
    { speaker: 'consultant', time: '05:33', text: '当家庭不再是放松的港湾，而变成了另一个压力源时，逃避是一种很自然地反应。我们或许可以探讨一下，如何让这个家重新变得温暖起来。', tags: [] },
    { speaker: 'client', time: '06:15', text: '可以吗？我真的希望可以。我爱我的妻子和孩子，但我不知道如何去爱。', tags: [ { type: 'emotion', label: '渴望改变' } ], realTimeHint: { 
        timestamp: '06:15',
        category: '待探索议题',
        priority: '提示',
        description: '来访者表达了对爱的困惑，这可能关联到其原生家庭的爱的模式',
        suggestion: '可探索来访者在原生家庭中接受和表达爱的方式，帮助其理解当前的表达模式'
    } },
    { speaker: 'consultant', time: '07:00', text: '当然可以。这正是我们在这里的原因。让我们先从一个小步骤开始，尝试去理解您太太行为背后的善意。您觉得，她保护孩子的行为，是出于什么样的考虑？', tags: [ { type: 'event', label: '咨询技术' } ], realTimeHint: { 
        timestamp: '07:00',
        category: '表达调整',
        priority: '预警',
        description: '咨询师引导过于迅速，未充分处理来访者刚才表达的情感脆弱性',
        suggestion: '应先回应来访者"不知道如何去爱"的困惑，给予足够的情感支持后再进行技术性引导'
    } },
    { speaker: 'client', time: '07:57', text: '嗯...她可能觉得我太急躁了，怕伤害到孩子的自尊心吧。她总是说，孩子需要的是鼓励，不是批评。', tags: [] },
    { speaker: 'consultant', time: '08:42', text: '这是一个非常好的起点。您看到了她行为背后的爱和保护。您的初衷也是爱，只是方式不同。下次当分歧出现时，也许可以先试着肯定一下对方的出发点，再沟通具体的方法。', tags: [ { type: 'event', label: '关键觉察' } ] },
    { speaker: 'client', time: '09:30', text: '先肯定...这对我来说有点难，我总是忍不住先发脾气。', tags: [ { type: 'emotion', label: '😔 情绪低落' } ] },
    { speaker: 'consultant', time: '10:11', text: '这很正常，改变习惯需要时间和练习。我们可以在接下来的咨询中，专门练习这部分。今天我们的时间差不多了，回去后可以先试着观察，不急于改变。', tags: [] }
];

// ================= CLASS DEFINITION =================
class ConsultationRecordManager {
  constructor() {
    this.activeTags = new Set(); // For multi-filtering
    this.contextMode = false; // For context display mode
    this.initDOMElements();
    this.bindEvents();
    this.initNotesEditor();
    this.renderAll();
    this.activateDefaultTabs();
  }

  initDOMElements() {
    this.elements = {
      // Sidebar
      sidebar: document.querySelector('.sidebar'),
      sidebarCollapseBtn: document.getElementById('sidebarCollapseBtn'),
      sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
      sidebarTabs: document.querySelectorAll('.sidebar-tab'),
      sidebarPanels: document.querySelectorAll('.sidebar-panel'),
      recordsPanel: document.getElementById('recordsPanel'),
      userInfoPanel: document.getElementById('userInfoPanel'),
      // Main Content
      mainTabs: document.querySelectorAll('.page-tab'),
      mainPanels: document.querySelectorAll('.page-panel'),
      transcriptContainer: document.getElementById('transcriptContainer'),
      aiRecordPanel: document.querySelector('.page-panel[data-panel="ai-record"]'),
      // Notes Editor Elements
      notesEditor: {
        container: document.querySelector('.notes-editor-container'),
        toolbar: document.querySelector('.editor-toolbar'),
        modeButtons: document.querySelectorAll('.tool-btn[data-mode]'),
        textInput: document.getElementById('text-input'),
        canvas: document.getElementById('handwriting-canvas'),
        handwritingTools: document.getElementById('handwriting-tools'),
        voiceTools: document.getElementById('voice-tools'),
        voiceStatus: document.getElementById('voice-status'),
        undoBtn: document.getElementById('undo-btn'),
        clearBtn: document.getElementById('clear-btn'),
      },
      // Transcript
      filterTagsContainer: document.getElementById('filterTagsContainer'),
      timelineContainer: document.getElementById('timelineContainer'),
    };
    if (this.elements.aiRecordPanel) {
      this.elements.aiTabs = this.elements.aiRecordPanel.querySelectorAll('.tab-btn');
      this.elements.aiPanels = this.elements.aiRecordPanel.querySelectorAll('.tab-panel');
    }
  }

  bindEvents() {
    // Sidebar Toggle
    if (this.elements.sidebarToggleBtn) {
      this.elements.sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());
    }
    // Sidebar Collapse/Expand
    if (this.elements.sidebarCollapseBtn) {
      this.elements.sidebarCollapseBtn.addEventListener('click', () => this.toggleSidebarCollapse());
    }
    // Sidebar Tabs
    this.elements.sidebarTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchSidebarTab(tab.dataset.sidebarTab));
    });
    // Main Content Tabs
    this.elements.mainTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchMainTab(tab.dataset.tab));
    });
    // AI Record Sub-tabs
    if (this.elements.aiTabs) {
      this.elements.aiTabs.forEach(tab => {
        tab.addEventListener('click', () => this.switchAiTab(tab.dataset.tab));
      });
    }
    // Notes Editor Events
    if (this.elements.notesEditor.container) {
      this.elements.notesEditor.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.switchNoteMode(btn.dataset.mode));
      });
    }
    // Timeline and Transcript Sync
    this.elements.transcriptContainer.addEventListener('scroll', () => this.syncTimelineOnScroll());
    
    // Download dropdown functionality
    this.initDownloadDropdown();
  }

  toggleSidebar() {
    this.elements.sidebar.classList.toggle('collapsed');
    this.elements.sidebar.classList.toggle('expanded');
  }

  toggleSidebarCollapse() {
    console.log('切换侧边栏收起状态');
    this.elements.sidebar.classList.toggle('collapsed');
    
    // 记录当前状态
    const isCollapsed = this.elements.sidebar.classList.contains('collapsed');
    console.log(`侧边栏状态: ${isCollapsed ? '收起' : '展开'}`);
    
    // 如果是收起状态，需要重新调整主内容区域的布局
    if (isCollapsed) {
      // 可以在这里添加主内容区域的自适应逻辑
      document.body.setAttribute('data-sidebar-collapsed', 'true');
    } else {
      document.body.removeAttribute('data-sidebar-collapsed');
    }
  }

  switchSidebarTab(targetTabId) {
    console.log(`切换到tab: ${targetTabId}`); // 调试日志
    
    // 1. Deactivate all tabs and panels to prevent conflicts
    this.elements.sidebarTabs.forEach(tab => {
      tab.classList.remove('active');
    });
    this.elements.sidebarPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    // 2. Activate the specific tab and panel based on the clicked tab's ID
    const activeTab = document.querySelector(`.sidebar-tab[data-sidebar-tab="${targetTabId}"]`);
    const activePanel = document.querySelector(`.sidebar-panel[data-sidebar-panel="${targetTabId}"]`);

    if (activeTab) {
      activeTab.classList.add('active');
      console.log(`Tab ${targetTabId} 激活成功`);
    } else {
      console.error(`未找到tab: ${targetTabId}`);
    }
    
    if (activePanel) {
      activePanel.classList.add('active');
      console.log(`Panel ${targetTabId} 激活成功`);
    } else {
      console.error(`未找到panel: ${targetTabId}`);
    }
    
    // 3. 强制重新渲染内容确保显示正确的数据
    if (targetTabId === 'records') {
      console.log('渲染咨询记录数据');
      this.renderPastRecords(mockPastRecords);
    } else if (targetTabId === 'user-info') {
      console.log('渲染用户信息数据');
      this.renderUserInfo(mockUserInfo);
    }
    
    // 4. 记录当前状态用于调试
    const activeTabsDebug = Array.from(this.elements.sidebarTabs)
      .filter(tab => tab.classList.contains('active'))
      .map(tab => tab.dataset.sidebarTab);
    const activePanelsDebug = Array.from(this.elements.sidebarPanels)
      .filter(panel => panel.classList.contains('active'))
      .map(panel => panel.dataset.sidebarPanel);
    
    console.log(`当前激活状态 - tabs: [${activeTabsDebug.join(', ')}], panels: [${activePanelsDebug.join(', ')}]`);
  }

  switchMainTab(targetTabId) {
    this.elements.mainTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === targetTabId));
    this.elements.mainPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === targetTabId));
  }

  switchAiTab(targetTabId) {
    if (!this.elements.aiTabs) return;
    this.elements.aiTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === targetTabId));
    this.elements.aiPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === targetTabId));
  }

  activateDefaultTabs() {
    this.switchMainTab('transcript');
    if (this.elements.aiTabs) {
      this.switchAiTab('parent-helper');
    }
  }
  
  renderAll() {
    this.renderPastRecords(mockPastRecords);
    this.renderUserInfo(mockUserInfo);
    this.renderFilterTags(mockTranscriptData);
    this.renderTranscript(mockTranscriptData);
    this.renderTimeline(mockTranscriptData);
  }

  renderPastRecords(records) {
    if (!this.elements.recordsPanel) return;
    this.elements.recordsPanel.innerHTML = records.map(record => {
      const subtitleHTML = record.subtitle ? `<p class="card-subtitle">${record.subtitle}</p>` : '';
      
      // 为当前咨询记录（第19次）添加主标题显示
      const mainTitleHTML = record.active ? `<p class="card-main-title">学业压力与教养冲突</p>` : '';
      
      return `
        <div class="record-card ${record.active ? 'active' : ''}">
          ${mainTitleHTML}
          <p class="card-title">${record.title}</p>
          ${subtitleHTML}
          <div class="card-footer">
            <span class="card-type">${record.type}</span>
            <a href="#" class="card-link">点击查看详情</a>
          </div>
          <p class="card-date">${record.date}</p>
        </div>
      `
    }).join('');
  }

  renderUserInfo(userInfo) {
    if (!this.elements.userInfoPanel) return;
    this.elements.userInfoPanel.innerHTML = `
      <div class="user-info-wrapper">
        <div class="info-block main-concerns">
          <h4 class="recall-section-title">主要困扰及诉求</h4>
          <p class="concerns-text">${userInfo.mainConcern}</p>
        </div>
        <div class="info-block risk-assessment">
          <h4 class="recall-section-title">
            <span class="risk-icon">🏷️</span>
            风险评估
            <button class="info-btn risk-info-btn" title="风险评估说明">?</button>
          </h4>
          <div class="risk-tags">
            <span class="risk-tag risk-medium">社会隔离 - 中</span>
            <span class="risk-tag risk-high">重度情绪 - 高</span>
            <span class="risk-tag risk-low">自我风险 - 低</span>
          </div>
          <p class="risk-description">${userInfo.riskAssessment}</p>
        </div>
        <div class="info-block medical-history">
          <h4 class="recall-section-title">
            <span class="history-icon">📋</span>
            疾病史与用药史
            <button class="info-btn history-info-btn" title="疾病史信息说明">?</button>
          </h4>
          <div class="history-content markdown-content">
            <p><strong>2015年起：</strong>存在情绪低落、兴趣减退等问题，医院诊断为抑郁症，服药半年后停药</p>
            <p><strong>现阶段：</strong>存在重度抑郁症状，伴有自杀倾向，未服药</p>
            <p><strong>2019年：</strong>开始服用草酸艾司西酞普兰片(10mg/日)，后调整至15mg/日</p>
            <p><strong>现服段：</strong>医生建议使用度洛西汀胶囊和米氮平片，但未服药</p>
          </div>
        </div>
      </div>
    `;
  }

  renderFilterTags(transcriptData) {
    if (!this.elements.filterTagsContainer) return;
    const allTags = transcriptData.flatMap(item => item.tags.map(tag => tag.label));
    const uniqueTags = [...new Set(allTags)];
    
    // 检查是否有实时提示
    const hasRealTimeHints = transcriptData.some(item => item.realTimeHint);
    
    let tagsHTML = uniqueTags.map(tag => 
      `<button class="filter-tag" data-tag="${tag}">${tag}</button>`
    ).join('');
    
    // 添加实时提示筛选按钮
    if (hasRealTimeHints) {
      tagsHTML += `<button class="filter-tag" data-tag="real-time-hint">💬 实时提示</button>`;
    }
    
    this.elements.filterTagsContainer.innerHTML = tagsHTML;
    
    this.elements.filterTagsContainer.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', () => this.toggleTagFilter(btn));
    });
  }
  
  toggleTagFilter(btn) {
      const tag = btn.dataset.tag;
      if (this.activeTags.has(tag)) {
          this.activeTags.delete(tag);
          btn.classList.remove('active');
          this.contextMode = false;
      } else {
          this.activeTags.add(tag);
          btn.classList.add('active');
          // 如果筛选标签或实时提示，启用上下文模式
          this.contextMode = true;
      }
      this.renderTranscript(mockTranscriptData);
  }

  renderTranscript(transcriptData) {
    let filteredData = transcriptData;
    let matchedIndices = new Set();
    
    if (this.activeTags.size > 0) {
        filteredData = transcriptData.filter((item, index) => {
            const hasMatchingTag = item.tags.some(t => this.activeTags.has(t.label));
            const hasMatchingHint = this.activeTags.has('real-time-hint') && item.realTimeHint;
            
            if (hasMatchingTag || hasMatchingHint) {
                matchedIndices.add(index);
                return true;
            }
            return false;
        });
        
        // 如果启用上下文模式，添加上下文消息
        if (this.contextMode && matchedIndices.size > 0) {
            const contextIndices = new Set();
            matchedIndices.forEach(index => {
                // 添加前后3句作为上下文
                for (let i = Math.max(0, index - 3); i <= Math.min(transcriptData.length - 1, index + 3); i++) {
                    contextIndices.add(i);
                }
            });
            
            filteredData = Array.from(contextIndices)
                .sort((a, b) => a - b)
                .map(index => ({
                    ...transcriptData[index],
                    originalIndex: index,
                    isMatched: matchedIndices.has(index),
                    isContext: !matchedIndices.has(index)
                }));
        }
    }
    
    if (!this.elements.transcriptContainer) return;
    
    // 添加上下文模式的容器类
    if (this.contextMode) {
      this.elements.transcriptContainer.classList.add('filter-context-mode');
    } else {
      this.elements.transcriptContainer.classList.remove('filter-context-mode');
    }
    
    this.elements.transcriptContainer.innerHTML = filteredData.map((item, index) => {
      const isConsultant = item.speaker === 'consultant';
      const speakerClass = isConsultant ? 'consultant' : 'client';
      const speakerName = isConsultant ? '咨询师' : '来访者';
      const avatarIcon = isConsultant ? 'C' : 'U';
      const hasRealTimeHint = item.realTimeHint && (item.realTimeHint.description || item.realTimeHint.content);
      
      // 上下文相关的类名
      const contextClass = this.contextMode ? 
        (item.isMatched ? 'context-visible' : 'context-hidden') : '';
      const dataIndex = item.originalIndex !== undefined ? item.originalIndex : index;
      
      const tagsHTML = item.tags.length > 0 ? 
        `<div class="message-tags">
          ${item.tags.map(tag => `<span class="tag tag-${tag.type}">${tag.label}</span>`).join('')}
        </div>` : '';

      const realTimeHintHTML = hasRealTimeHint && item.realTimeHintExpanded ? `
        <div class="real-time-hint-section expanded" data-index="${dataIndex}">
          <div class="hint-content">
            <div class="hint-header">
              <span class="hint-label">实时提示</span>
              <span class="hint-time">${item.realTimeHint.timestamp}</span>
              <button class="hint-close-btn" onclick="consultationRecord.toggleRealTimeHint(${dataIndex})" title="关闭">×</button>
            </div>
            <div class="hint-details">
              <div class="category-priority-row">
                <span class="category-text">${item.realTimeHint.category || ''}</span>
                <div class="priority-tag priority-${item.realTimeHint.priority}" onclick="consultationRecord.togglePriorityEdit(${dataIndex})" data-field="priority">
                  ${item.realTimeHint.priority || '关注'}
                </div>
                <select class="priority-select" data-field="priority" style="display: none;" onchange="consultationRecord.updatePriority(${dataIndex})" onblur="consultationRecord.hidePriorityEdit(${dataIndex})">
                  <option value="关注" ${item.realTimeHint.priority === '关注' ? 'selected' : ''}>关注</option>
                  <option value="提示" ${item.realTimeHint.priority === '提示' ? 'selected' : ''}>提示</option>
                  <option value="预警" ${item.realTimeHint.priority === '预警' ? 'selected' : ''}>预警</option>
                </select>
              </div>
              <div class="hint-field">
                <textarea class="field-textarea" data-field="description" placeholder="问题描述...">${item.realTimeHint.description || ''}</textarea>
              </div>
              <div class="hint-field">
                <textarea class="field-textarea" data-field="suggestion" placeholder="未来应对建议...">${item.realTimeHint.suggestion || ''}</textarea>
              </div>
              <div class="hint-actions">
                <button class="btn-hint btn-save" onclick="consultationRecord.saveRealTimeHint(${dataIndex})">保存</button>
                <button class="btn-hint btn-delete" onclick="consultationRecord.deleteRealTimeHint(${dataIndex})">删除</button>
                <button class="btn-hint btn-cancel" onclick="consultationRecord.cancelEditRealTimeHint(${dataIndex})">取消</button>
              </div>
            </div>
          </div>
        </div>` : '';

      const messageButtonHTML = hasRealTimeHint ? `
        <div class="message-hint-btn priority-${item.realTimeHint.priority}" onclick="consultationRecord.toggleRealTimeHint(${dataIndex})" title="查看实时提示">
          💬 <span class="hint-btn-text">提示</span>
        </div>` : '';

      // 上下文展开按钮
      const expandButtonHTML = (this.contextMode && item.isContext) ? `
        <button class="expand-context-btn" onclick="consultationRecord.expandContext(${dataIndex})">展开</button>
      ` : '';

      return `
        <div class="transcript-item ${speakerClass} ${hasRealTimeHint ? 'has-real-time-hint priority-' + item.realTimeHint.priority : ''} ${contextClass}" data-index="${dataIndex}">${expandButtonHTML}
          <div class="speaker-avatar ${speakerClass}">${avatarIcon}</div>
          <div class="message-content">
            <div class="message-header">
              <span class="speaker-name">${speakerName}</span>
              <span class="message-time">${item.time}</span>
        </div>
            <div class="message-bubble">
              <p class="message-text">${item.text}</p>
              ${tagsHTML}
              ${messageButtonHTML}
            </div>
            ${realTimeHintHTML}
        </div>
      </div>
    `;
    }).join('');
    this.renderTimeline(filteredData.length > 0 ? filteredData : transcriptData);
  }
  
  renderTimeline(transcriptData) {
      if(!this.elements.timelineContainer) return;
      this.elements.timelineContainer.innerHTML = ''; 

      const track = document.createElement('div');
      track.className = 'timeline-track';

      const handle = document.createElement('div');
      handle.className = 'timeline-handle';
      
      const tooltip = document.createElement('div');
      tooltip.className = 'timeline-tooltip';
      handle.appendChild(tooltip);

      track.appendChild(handle);

      this.elements.timelineContainer.appendChild(track);
      this.timelineHandle = handle;
      this.timelineTrack = track;
      this.timelineTooltip = tooltip;
      this.currentTimelineData = transcriptData;

      this.makeTimelineDraggable();
  }

  makeTimelineDraggable() {
    let isDragging = false;

    const startDrag = () => {
        isDragging = true;
        this.timelineHandle.classList.add('dragging');
        this.timelineTooltip.style.display = 'block';
    };
    const endDrag = () => {
        isDragging = false;
        this.timelineHandle.classList.remove('dragging');
        this.timelineTooltip.style.display = 'none';
    };
    const drag = (e) => {
        if (!isDragging) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.updateTimelineAndScroll(clientY);
    };

    this.timelineHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('mousemove', drag);
    
    this.timelineHandle.addEventListener('touchstart', startDrag);
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchmove', drag);
  }

  updateTimelineAndScroll(clientY) {
    const rect = this.timelineTrack.getBoundingClientRect();
    let y = clientY - rect.top;
    y = Math.max(0, Math.min(y, rect.height));
    const percentage = y / rect.height;

    this.timelineHandle.style.top = `${percentage * 100}%`;

    if (this.currentTimelineData.length > 0) {
      const index = Math.min(
        this.currentTimelineData.length - 1, 
        Math.floor(percentage * this.currentTimelineData.length)
      );
      this.timelineTooltip.textContent = this.currentTimelineData[index].time;
    }

    const scrollHeight = this.elements.transcriptContainer.scrollHeight;
    const clientHeight = this.elements.transcriptContainer.clientHeight;
    this.elements.transcriptContainer.scrollTop = (scrollHeight - clientHeight) * percentage;
  }

  syncTimelineOnScroll() {
    if (!this.timelineHandle) return;
    const { scrollTop, scrollHeight, clientHeight } = this.elements.transcriptContainer;
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return;

    const scrollPercentage = scrollTop / scrollableHeight;
    const handleTop = scrollPercentage * (this.timelineTrack.clientHeight - this.timelineHandle.clientHeight);
    
    this.timelineHandle.style.top = `${handleTop}px`;
  }

  // ================= Notes Editor Logic =================
  
  initNotesEditor() {
    const editor = this.elements.notesEditor;
    if (!editor.container) return;

    // Canvas Setup
    this.canvas = editor.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.drawing = false;
    this.paths = [];
    this.currentPath = [];
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Handwriting Event Listeners
    editor.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    editor.canvas.addEventListener('mouseup', () => this.stopDrawing());
    editor.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    editor.canvas.addEventListener('mousemove', (e) => this.draw(e));

    // Tool listeners
    editor.undoBtn.addEventListener('click', () => this.undoLastPath());
    editor.clearBtn.addEventListener('click', () => this.clearCanvas());
    editor.handwritingTools.addEventListener('click', (e) => {
      if (e.target.id.startsWith('color-')) {
        this.ctx.strokeStyle = e.target.id.split('-')[1];
      }
    });
    
    // Voice Recognition Setup
    this.initSpeechRecognition();
  }

  resizeCanvas() {
    const editor = this.elements.notesEditor;
    const rect = editor.canvas.parentElement.getBoundingClientRect();
    editor.canvas.width = rect.width;
    editor.canvas.height = rect.height;
    this.redrawAllPaths();
  }

  startDrawing(e) {
    this.drawing = true;
    this.currentPath = [];
    this.ctx.beginPath();
    const pos = this.getMousePos(e);
    this.ctx.moveTo(pos.x, pos.y);
  }

  stopDrawing() {
    if (!this.drawing) return;
    this.drawing = false;
    this.paths.push(this.currentPath);
  }

  draw(e) {
    if (!this.drawing) return;
    const pos = this.getMousePos(e);
    this.currentPath.push({x: pos.x, y: pos.y});
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  undoLastPath() {
    this.paths.pop();
    this.redrawAllPaths();
  }
  
  clearCanvas() {
    this.paths = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  redrawAllPaths() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.paths.forEach(path => {
      this.ctx.beginPath();
      if(path.length < 1) return;
      this.ctx.moveTo(path[0].x, path[0].y);
      path.forEach(point => {
        this.ctx.lineTo(point.x, point.y);
      });
      this.ctx.stroke();
    });
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.elements.notesEditor.voiceStatus.textContent = '您的浏览器不支持语音识别。';
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'zh-CN';

    this.recognition.onresult = (event) => {
      let interim_transcript = '';
      let final_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      this.elements.notesEditor.textInput.value += final_transcript;
      this.elements.notesEditor.voiceStatus.textContent = interim_transcript || '正在聆听...';
    };
    
    this.recognition.onerror = (event) => {
      this.elements.notesEditor.voiceStatus.textContent = `语音识别错误: ${event.error}`;
    };
  }

  switchNoteMode(mode) {
    const editor = this.elements.notesEditor;
    editor.modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    
    const isText = mode === 'text';
    const isHandwriting = mode === 'handwriting';
    const isVoice = mode === 'voice';

    editor.textInput.style.display = isText || isVoice ? 'block' : 'none';
    editor.canvas.style.display = isHandwriting ? 'block' : 'none';
    editor.handwritingTools.style.display = isHandwriting ? 'flex' : 'none';
    editor.voiceTools.style.display = isVoice ? 'block' : 'none';

    if (isVoice) {
      if (this.recognition && !this.isRecognizing) {
        this.recognition.start();
        this.isRecognizing = true;
        editor.voiceStatus.textContent = '请开始说话...';
      }
      } else {
      if (this.recognition && this.isRecognizing) {
        this.recognition.stop();
        this.isRecognizing = false;
        editor.voiceStatus.textContent = '点击"语音"按钮开始识别...';
      }
    }
  }
  // ================= Real-time Hint Methods =================
  
  toggleRealTimeHint(index) {
    const item = mockTranscriptData[index];
    if (!item || !item.realTimeHint) return;
    
    item.realTimeHintExpanded = !item.realTimeHintExpanded;
    this.renderTranscript(mockTranscriptData);
  }

  saveRealTimeHint(index) {
    const item = mockTranscriptData[index];
    if (!item || !item.realTimeHint) return;
    
    const section = document.querySelector(`.real-time-hint-section[data-index="${index}"]`);
    if (section) {
      // 获取所有字段的值
      const categoryInput = section.querySelector('[data-field="category"]');
      const prioritySelect = section.querySelector('[data-field="priority"]');
      const descriptionTextarea = section.querySelector('[data-field="description"]');
      const suggestionTextarea = section.querySelector('[data-field="suggestion"]');
      
      // 更新数据
      if (categoryInput) item.realTimeHint.category = categoryInput.value;
      if (prioritySelect) item.realTimeHint.priority = prioritySelect.value;
      if (descriptionTextarea) item.realTimeHint.description = descriptionTextarea.value;
      if (suggestionTextarea) item.realTimeHint.suggestion = suggestionTextarea.value;
      
      // 这里可以添加保存到服务器的逻辑
      this.showToast('实时提示已保存', 'success');
      item.realTimeHintExpanded = false;
      this.renderTranscript(mockTranscriptData);
    }
  }

  deleteRealTimeHint(index) {
    const item = mockTranscriptData[index];
    if (!item || !item.realTimeHint) return;
    
    if (confirm('确定要删除这个实时提示吗？')) {
      delete item.realTimeHint;
      this.renderTranscript(mockTranscriptData);
      this.showToast('实时提示已删除', 'success');
    }
  }

  cancelEditRealTimeHint(index) {
    const item = mockTranscriptData[index];
    if (!item || !item.realTimeHint) return;
    
    item.realTimeHintExpanded = false;
    this.renderTranscript(mockTranscriptData);
  }

  togglePriorityEdit(index) {
    const section = document.querySelector(`.real-time-hint-section[data-index="${index}"]`);
    if (section) {
      const tag = section.querySelector('.priority-tag');
      const select = section.querySelector('.priority-select');
      
      if (tag && select) {
        tag.style.display = 'none';
        select.style.display = 'inline-block';
        select.focus();
      }
    }
  }

  updatePriority(index) {
    const section = document.querySelector(`.real-time-hint-section[data-index="${index}"]`);
    if (section) {
      const select = section.querySelector('.priority-select');
      const tag = section.querySelector('.priority-tag');
      
      if (select && tag) {
        const newPriority = select.value;
        const item = mockTranscriptData[index];
        
        if (item && item.realTimeHint) {
          item.realTimeHint.priority = newPriority;
          
          // 更新标签显示
          tag.textContent = newPriority;
          tag.className = `priority-tag priority-${newPriority}`;
          
          // 隐藏选择框，显示标签
          select.style.display = 'none';
          tag.style.display = 'inline-block';
          
          // 重新渲染以更新消息按钮和边框颜色
          this.renderTranscript(mockTranscriptData);
        }
      }
    }
  }

  hidePriorityEdit(index) {
    setTimeout(() => {
      const section = document.querySelector(`.real-time-hint-section[data-index="${index}"]`);
      if (section) {
        const tag = section.querySelector('.priority-tag');
        const select = section.querySelector('.priority-select');
        
        if (tag && select) {
          select.style.display = 'none';
          tag.style.display = 'inline-block';
        }
      }
    }, 150); // 延迟以允许onchange事件先触发
  }

  showToast(message, type = 'info') {
    // 简单的toast提示
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => toast.style.opacity = '1', 100);
    
    // 3秒后移除toast
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // ================= Download and Edit Functionality =================
  
  initDownloadDropdown() {
    const downloadBtn = document.getElementById('transcriptDownloadBtn');
    const dropdown = downloadBtn?.parentElement;
    
    if (downloadBtn && dropdown) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      
      // 点击其他地方关闭下拉菜单
      document.addEventListener('click', () => {
        dropdown.classList.remove('active');
      });
    }
  }

  downloadTranscript(type) {
    let content = '';
    let filename = '';
    
    if (type === 'original') {
      // 原文逐字稿：只包含对话和时间线
      content = this.generateOriginalTranscript();
      filename = '逐字稿-原文版.doc';
    } else if (type === 'with-tags') {
      // 含标签/提示的逐字稿
      content = this.generateFullTranscript();
      filename = '逐字稿-完整版.doc';
    }
    
    this.downloadAsDoc(content, filename);
    this.showToast(`${type === 'original' ? '原文' : '完整'}逐字稿下载完成`, 'success');
  }

  generateOriginalTranscript() {
    const title = document.getElementById('consultationTitle')?.textContent || '咨询记录';
    const datetime = document.getElementById('consultationDateTime')?.textContent || '';
    
    let content = `${title}\n`;
    content += `时间：${datetime}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    mockTranscriptData.forEach(item => {
      const speaker = item.speaker === 'consultant' ? '咨询师' : '来访者';
      content += `[${item.time}] ${speaker}：\n`;
      content += `${item.text}\n\n`;
    });
    
    return content;
  }

  generateFullTranscript() {
    const title = document.getElementById('consultationTitle')?.textContent || '咨询记录';
    const datetime = document.getElementById('consultationDateTime')?.textContent || '';
    
    let content = `${title}\n`;
    content += `时间：${datetime}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    mockTranscriptData.forEach(item => {
      const speaker = item.speaker === 'consultant' ? '咨询师' : '来访者';
      content += `[${item.time}] ${speaker}：\n`;
      content += `${item.text}\n`;
      
      // 添加标签
      if (item.tags && item.tags.length > 0) {
        content += `标签：${item.tags.map(tag => tag.label).join('、')}\n`;
      }
      
      // 添加实时提示
      if (item.realTimeHint) {
        content += `\n【实时提示】\n`;
        content += `分类：${item.realTimeHint.category}\n`;
        content += `优先级：${item.realTimeHint.priority}\n`;
        content += `问题描述：${item.realTimeHint.description}\n`;
        content += `应对建议：${item.realTimeHint.suggestion}\n`;
      }
      
      content += `\n`;
    });
    
    return content;
  }

  downloadAsDoc(content, filename) {
    // 创建一个简单的HTML文档用于Word格式
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body { font-family: "Microsoft YaHei", sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
            .speaker { font-weight: bold; color: #007acc; }
            .time { color: #666; font-size: 0.9em; }
            .tags { color: #28a745; font-size: 0.9em; margin-top: 5px; }
            .hint { background: #f8f9fa; border-left: 4px solid #007acc; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 智能记录模块编辑功能
  toggleEdit(sectionType) {
    const section = document.querySelector(`[data-panel="${sectionType}"]`);
    if (!section) return;
    
    const editBtn = section.querySelector('.edit-btn');
    const saveBtn = section.querySelector('.save-btn');
    const editableElements = section.querySelectorAll('.editable-content, .summary-item p, .topic-card p, .character-card p, .timeline-content p, .suggestion-card p');
    
    const isEditing = editBtn.style.display === 'none';
    
    if (isEditing) {
      // 退出编辑模式
      editBtn.style.display = 'inline-flex';
      saveBtn.style.display = 'none';
      editableElements.forEach(el => {
        el.contentEditable = 'false';
        el.classList.remove('editing');
      });
    } else {
      // 进入编辑模式
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-flex';
      editableElements.forEach(el => {
        el.contentEditable = 'true';
        el.classList.add('editing');
      });
    }
  }

  saveContent(sectionType) {
    // 这里可以添加保存到服务器的逻辑
    this.toggleEdit(sectionType);
    this.showToast('内容已保存', 'success');
  }

  copyContent(sectionType) {
    const section = document.querySelector(`[data-panel="${sectionType}"]`);
    if (!section) return;
    
    let textContent = '';
    
    if (sectionType === 'parent-helper') {
      const letterSections = section.querySelectorAll('.letter-section');
      const greeting = section.querySelector('.letter-greeting p')?.textContent || '';
      const closing = section.querySelector('.letter-closing p')?.textContent || '';
      
      textContent += `${greeting}\n\n`;
      
      letterSections.forEach(letterSection => {
        const content = letterSection.textContent.trim();
        textContent += `${content}\n\n`;
      });
      
      textContent += `${closing}`;
    } else {
      textContent = section.textContent.replace(/\s+/g, ' ').trim();
    }
    
    navigator.clipboard.writeText(textContent).then(() => {
      this.showToast('内容已复制到剪贴板', 'success');
    }).catch(() => {
      this.showToast('复制失败，请手动复制', 'error');
    });
  }

  downloadContent(sectionType) {
    const section = document.querySelector(`[data-panel="${sectionType}"]`);
    if (!section) return;
    
    const title = section.querySelector('.section-title')?.textContent || sectionType;
    let content = `${title}\n${'='.repeat(50)}\n\n`;
    
    if (sectionType === 'parent-helper') {
      const letterSections = section.querySelectorAll('.letter-section');
      const greeting = section.querySelector('.letter-greeting p')?.textContent || '';
      const closing = section.querySelector('.letter-closing p')?.textContent || '';
      
      content += `${greeting}\n\n`;
      
      letterSections.forEach(letterSection => {
        const sectionContent = letterSection.textContent.trim();
        content += `${sectionContent}\n\n`;
      });
      
      content += `${closing}`;
    } else {
      content += section.textContent.replace(/编辑保存下载/g, '').trim();
    }
    
    const filename = `${title.replace(/[^\w\s]/gi, '')}.doc`;
    this.downloadAsDoc(content, filename);
    this.showToast('文档下载完成', 'success');
  }

  // ================= Context Display Functionality =================
  
  expandContext(index) {
    // 临时展开所有上下文，显示完整对话
    this.contextMode = false;
    this.renderTranscript(mockTranscriptData);
    
    // 滚动到指定消息
    setTimeout(() => {
      const targetElement = document.querySelector(`[data-index="${index}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.style.backgroundColor = 'var(--yellow-100)';
        setTimeout(() => {
          targetElement.style.backgroundColor = '';
        }, 2000);
      }
    }, 100);
  }
}

// 全局变量，供HTML中的onclick使用
let consultationRecord;

document.addEventListener('DOMContentLoaded', () => {
  consultationRecord = new ConsultationRecordManager();
}); 