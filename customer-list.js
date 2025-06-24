// 客户列表页面JavaScript

// 模拟客户数据
const allCustomers = [
  {
    id: 1,
    name: '张小明',
    gender: 'male',
    phone: '13812345678',
    emergencyContact: '13987654321',
    avatar: '👨',
    status: 'first-consultation',
    statusText: '首次咨询',
    sessionCount: 0,
    lastSession: new Date().toISOString(), // 今天
    remainingHours: 10,
    concerns: '焦虑、失眠',
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: '李小雅',
    gender: 'female',
    phone: '13987654321',
    emergencyContact: '13612345678',
    avatar: '👩',
    status: 'ongoing',
    statusText: '服务中',
    sessionCount: 5,
    lastSession: new Date(Date.now() - 86400000).toISOString(), // 昨天
    remainingHours: 5,
    concerns: '情绪管理',
    joinDate: '2023-12-10',
  },
  {
    id: 3,
    name: '王小芳',
    gender: 'female',
    phone: '13690123456',
    emergencyContact: '',
    avatar: '👧',
    status: 'pending-first',
    statusText: '待首访',
    sessionCount: 0,
    lastSession: '待预约',
    remainingHours: 10,
    concerns: '抑郁倾向',
    joinDate: '2024-01-18',
  },
  {
    id: 4,
    name: '陈小强',
    gender: 'male',
    phone: '13734567890',
    emergencyContact: '13856789012',
    avatar: '🧑',
    status: 'ongoing',
    statusText: '服务中',
    sessionCount: 3,
    lastSession: new Date(Date.now() - 4 * 86400000).toISOString(), // 4天前
    remainingHours: 7,
    concerns: '工作压力',
    joinDate: '2024-01-05',
  },
  {
    id: 5,
    name: '刘小娟',
    gender: 'female',
    phone: '13578901234',
    emergencyContact: '13723456789',
    avatar: '👩‍💼',
    status: 'completed',
    statusText: '已完成',
    sessionCount: 12,
    lastSession: new Date(Date.now() - 30 * 86400000).toISOString(), // 30天前
    remainingHours: 0,
    concerns: '婚姻关系',
    joinDate: '2023-11-20',
  },
  {
    id: 6,
    name: '周小琳',
    phone: '13824681357',
    emergencyContact: '',
    avatar: '👩‍🎓',
    status: 'follow-up',
    statusText: '待回访',
    sessionCount: 2,
    lastSession: new Date(Date.now() - 60 * 86400000).toISOString(), // 60天前
    remainingHours: 8,
    concerns: '学习压力',
    joinDate: '2023-12-15',
  },
  {
    id: 7,
    name: '赵小华',
    gender: 'male',
    phone: '13913572468',
    emergencyContact: '13645789123',
    avatar: '👨‍💼',
    status: 'ongoing',
    statusText: '服务中',
    sessionCount: 8,
    lastSession: new Date(Date.now() - 8 * 86400000).toISOString(), // 8天前
    remainingHours: 2,
    concerns: '人际关系',
    joinDate: '2023-10-30',
  },
  {
    id: 8,
    name: '孙小艳',
    gender: 'female',
    phone: '13697531246',
    emergencyContact: '13534567890',
    avatar: '👩‍⚕️',
    status: 'transferred',
    statusText: '已转出',
    sessionCount: 1,
    lastSession: '2024-01-22',
    remainingHours: 0,
    concerns: '创伤应激',
    joinDate: '2024-01-22',
  },
  {
    id: 9,
    name: '马小亮',
    gender: 'male',
    phone: '13512349876',
    emergencyContact: '',
    avatar: '👦',
    status: 'first-visit',
    statusText: '首访',
    sessionCount: 0,
    lastSession: '即将开始',
    remainingHours: 10,
    concerns: '学业压力',
    joinDate: '2024-01-20',
  },
  {
    id: 10,
    name: '林小红',
    gender: 'female',
    phone: '13798765432',
    emergencyContact: '13789012345',
    avatar: '👩‍🎨',
    status: 'paused',
    statusText: '暂停',
    sessionCount: 4,
    lastSession: new Date(Date.now() - 15 * 86400000).toISOString(), // 15天前
    remainingHours: 6,
    concerns: '职场焦虑',
    joinDate: '2023-12-28',
  }
];

// 当前显示的客户列表
let currentCustomers = [...allCustomers];
// let currentView = 'card'; // 'card' 或 'table' -> 已移除
let highlightCustomerId = null; // 需要高亮的客户ID

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const fromId = urlParams.get('id');
  if (fromId) {
    highlightCustomerId = parseInt(fromId);
  }
  
  initializeEventListeners();
  renderCustomerList();
  
  // 如果有高亮客户，滚动到对应位置
  if (highlightCustomerId) {
    setTimeout(() => {
      scrollToCustomer(highlightCustomerId);
    }, 100);
  }
});

// 滚动到指定客户
function scrollToCustomer(customerId) {
  const customerCard = document.querySelector(`[data-customer-id="${customerId}"]`);
  if (customerCard) {
    customerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 添加高亮效果
    customerCard.classList.add('highlighted');
    // 3秒后移除高亮效果
    setTimeout(() => {
      customerCard.classList.remove('highlighted');
    }, 3000);
  }
}

// 初始化事件监听器
function initializeEventListeners() {
  // 搜索功能
  const searchInput = document.getElementById('customerSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // 筛选功能
  const statusFilter = document.getElementById('statusFilter');
  const sortBy = document.getElementById('sortBy');
  const filterBtn = document.querySelector('.filter-btn');
  
  if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
  }

  // 添加客户按钮
  const addCustomerBtn = document.querySelector('.add-customer-btn');
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', () => {
      toast.show('添加客户功能开发中...', 'info');
    });
  }

  // 分页按钮事件
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableView();
        updatePagination();
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTableView();
        updatePagination();
      }
    });
  }
}

// 搜索处理
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    currentCustomers = [...allCustomers];
  } else {
    currentCustomers = allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.concerns.toLowerCase().includes(searchTerm)
    );
  }
  
  currentPage = 1; // 重置到第一页
  renderTableView();
  updatePagination();
}

// 应用筛选
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const sortBy = document.getElementById('sortBy').value;
  
  // 筛选
  let filteredCustomers = [...allCustomers];
  
  if (statusFilter !== 'all') {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.status === statusFilter
    );
  }
  
  // 排序
  switch (sortBy) {
    case 'name':
      filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'sessions':
      filteredCustomers.sort((a, b) => b.sessionCount - a.sessionCount);
      break;
    case 'created':
      filteredCustomers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
      break;
    case 'recent':
    default:
      // 最近活动排序（默认）
      filteredCustomers.sort((a, b) => {
        if (a.lastSession === '即将开始' || a.lastSession === '明日预约') return -1;
        if (b.lastSession === '即将开始' || b.lastSession === '明日预约') return 1;
        if (a.lastSession === '待预约') return 1;
        if (b.lastSession === '待预约') return -1;
        return new Date(b.lastSession) - new Date(a.lastSession);
      });
      break;
  }
  
  currentCustomers = filteredCustomers;
  currentPage = 1; // 重置到第一页
  renderTableView();
  updatePagination();
}

// 渲染客户列表（现在只渲染表格）
function renderCustomerList() {
  renderTableView();
  updatePagination();
}

// 渲染表格视图
function renderTableView() {
  const tableBody = document.getElementById('customerTableBody');
  
  if (!tableBody) return;

  if (currentCustomers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>暂无客户</h3>
          <p>没有找到匹配的客户信息</p>
        </td>
      </tr>
    `;
    return;
  }
  
  // 计算分页数据
  totalPages = Math.ceil(currentCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageCustomers = currentCustomers.slice(startIndex, endIndex);
  
  tableBody.innerHTML = ''; // 清空现有行
  pageCustomers.forEach(customer => {
    const row = document.createElement('tr');
    row.dataset.customerId = customer.id;
    if (customer.id === highlightCustomerId) {
      row.classList.add('highlighted');
    }

    const genderIcon = customer.gender === 'male' ? '♂' : customer.gender === 'female' ? '♀' : '';
    const lastSessionDisplay = (customer.status === 'first-consultation' || customer.status === 'pending-first' || customer.status === 'first-visit') ? '-' : formatDate(customer.lastSession);
    const emergencyContactDisplay = customer.emergencyContact || '-';

    // 操作按钮（移除回访按钮）
    const actionButtons = `
      <button class="btn btn-sm btn-outline" onclick="viewCustomerProfile(${customer.id})">档案</button>
    `;

    row.innerHTML = `
      <td>
        <div class="customer-info-cell">
          <div>
            <div class="customer-name">${customer.name} <span class="gender-icon">${genderIcon}</span></div>
            <div class="customer-phone">${customer.phone}</div>
          </div>
        </div>
      </td>
      <td><span class="status-badge status-${customer.status}">${customer.statusText}</span></td>
      <td class="text-center">${customer.sessionCount}</td>
      <td>${lastSessionDisplay}</td>
      <td>${customer.remainingHours}小时</td>
      <td>${emergencyContactDisplay}</td>
      <td>
        <div class="action-buttons">
          ${actionButtons}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 查看客户档案
function viewCustomerProfile(customerId) {
  toast.show(`正在查看客户 ${customerId} 的档案...`, 'info');
  // 实际应用中会跳转到客户详情页
  // window.location.href = `customer-profile.html?id=${customerId}`;
}

// 更新分页信息和控件
function updatePagination() {
  const pageInfo = document.getElementById('pageInfo');
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!pageInfo || !pageNumbers || !prevBtn || !nextBtn) return;
  
  // 更新分页信息
  const startItem = currentCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, currentCustomers.length);
  pageInfo.textContent = `显示第 ${startItem}-${endItem} 条，共 ${currentCustomers.length} 条记录`;
  
  // 更新上一页/下一页按钮状态和显示
  if (currentPage <= 1) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
    prevBtn.disabled = false;
  }
  
  // 下一页按钮始终显示，只在最后一页时禁用
  nextBtn.style.display = 'block';
  if (currentPage >= totalPages || totalPages <= 1) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
  
  // 更新页码
  renderPageNumbers();
}

// 渲染页码
function renderPageNumbers() {
  const pageNumbers = document.getElementById('pageNumbers');
  if (!pageNumbers) return;
  
  pageNumbers.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // 显示逻辑：始终显示第1页，当前页前后各1页，最后一页，用...连接
  const maxVisiblePages = 7;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // 调整范围以保持最多显示maxVisiblePages个页码
  if (endPage - startPage + 1 < maxVisiblePages) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }
  
  // 第1页
  if (startPage > 1) {
    createPageButton(1);
    if (startPage > 2) {
      createDotsElement();
    }
  }
  
  // 中间页码
  for (let i = startPage; i <= endPage; i++) {
    createPageButton(i);
  }
  
  // 最后一页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      createDotsElement();
    }
    createPageButton(totalPages);
  }
}

// 创建页码按钮
function createPageButton(pageNum) {
  const pageNumbers = document.getElementById('pageNumbers');
  const button = document.createElement('button');
  button.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
  button.textContent = pageNum;
  button.addEventListener('click', () => goToPage(pageNum));
  pageNumbers.appendChild(button);
}

// 创建省略号元素
function createDotsElement() {
  const pageNumbers = document.getElementById('pageNumbers');
  const dots = document.createElement('span');
  dots.className = 'page-number dots';
  dots.textContent = '...';
  pageNumbers.appendChild(dots);
}

// 跳转到指定页面
function goToPage(pageNum) {
  if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
    currentPage = pageNum;
    renderTableView();
    updatePagination();
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return dateString;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays >= 50) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
} 