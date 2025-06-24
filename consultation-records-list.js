// 咨询记录列表页面JavaScript

// 模拟咨询记录数据 - 按时间正序排列，最新记录在前
const allRecords = [
  {
    id: 1,
    customerId: 1,
    customerName: '张小明',
    customerGender: 'male',
    customerPhone: '13812345678',
    customerAvatar: '👨',
    consultationType: 'youth',
    consultationTypeText: '青少年咨询',
    consultationMethod: 'offline',
    consultationMethodText: '到店',
    appointmentTime: '今天 07:18',
    appointmentTimeSlot: '今天 07:00-08:00',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 1.5,
    status: 'expired',
    statusText: '已失效',
    createdTime: new Date().toISOString() // 今天 - 最新
  },
  {
    id: 2,
    customerId: 2,
    customerName: '李小雅',
    customerGender: 'female',
    customerPhone: '13987654321',
    customerAvatar: '👩',
    consultationType: 'ecommerce',
    consultationTypeText: '电商咨询',
    consultationMethod: 'video',
    consultationMethodText: '视频',
    appointmentTime: '昨天 07:18',
    appointmentTimeSlot: '昨天 07:00-08:00',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 2.0,
    status: 'expired',
    statusText: '已失效',
    createdTime: new Date(Date.now() - 86400000).toISOString() // 昨天
  },
  {
    id: 10,
    customerId: 7,
    customerName: '马小亮',
    customerGender: 'male',
    customerPhone: '13512349876',
    customerAvatar: '👦',
    consultationType: 'youth',
    consultationTypeText: '青少年咨询',
    consultationMethod: 'offline',
    consultationMethodText: '到店',
    appointmentTime: '前天 09:30',
    appointmentTimeSlot: '前天 09:30-10:30',
    orderStatus: 'completed',
    orderStatusText: '已完成',
    orderDetail: '10次咨询-1 - 扣除1.0 - 20250620015(',
    consumedHours: 1.0,
    status: 'completed',
    statusText: '已完成',
    createdTime: new Date(Date.now() - 2 * 86400000).toISOString() // 前天
  },
  {
    id: 3,
    customerId: 3,
    customerName: '王小芳',
    customerGender: 'female',
    customerPhone: '13690123456',
    customerAvatar: '👧',
    consultationType: 'sleep',
    consultationTypeText: '睡眠障碍',
    consultationMethod: 'offline',
    consultationMethodText: '到店',
    appointmentTime: '6/21 07:18',
    appointmentTimeSlot: '6月21日 08:10-08:40',
    orderStatus: 'pending',
    orderStatusText: '待核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 0,
    status: 'cancelled',
    statusText: '已取消',
    createdTime: new Date(Date.now() - 3 * 86400000).toISOString() // 6月21日
  },
  {
    id: 4,
    customerId: 4,
    customerName: '陈小强',
    customerGender: 'male',
    customerPhone: '13734567890',
    customerAvatar: '🧑',
    consultationType: 'youth',
    consultationTypeText: '青少年咨询',
    consultationMethod: 'video',
    consultationMethodText: '视频',
    appointmentTime: '6/21 07:18',
    appointmentTimeSlot: '6月21日 10:00-11:00',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 1.0,
    status: 'completed',
    statusText: '已完成',
    createdTime: new Date(Date.now() - 4 * 86400000).toISOString() // 6月21日
  },
  {
    id: 5,
    customerId: 5,
    customerName: '刘小娟',
    customerGender: 'female',
    customerPhone: '13578901234',
    customerAvatar: '👩‍💼',
    consultationType: 'ecommerce',
    consultationTypeText: '电商咨询',
    consultationMethod: 'offline',
    consultationMethodText: '到店',
    appointmentTime: '6/17 07:18',
    appointmentTimeSlot: '6月17日 09:00-10:30',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 2.5,
    status: 'expired',
    statusText: '已失效',
    createdTime: new Date(Date.now() - 7 * 86400000).toISOString() // 6月17日
  },
  {
    id: 7,
    customerId: 7,
    customerName: '赵小华',
    customerGender: 'male',
    customerPhone: '13913572468',
    customerAvatar: '👨‍💼',
    consultationType: 'youth',
    consultationTypeText: '青少年咨询',
    consultationMethod: 'offline',
    consultationMethodText: '到店',
    appointmentTime: '6/14 07:18',
    appointmentTimeSlot: '6月14日 14:00-15:00',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 1.5,
    status: 'expired',
    statusText: '已失效',
    createdTime: new Date(Date.now() - 10 * 86400000).toISOString() // 6月14日
  },
  {
    id: 8,
    customerId: 8,
    customerName: '孙小艳',
    customerGender: 'female',
    customerPhone: '13697531246',
    customerAvatar: '👩‍⚕️',
    consultationType: 'ecommerce',
    consultationTypeText: '电商咨询',
    consultationMethod: 'video',
    consultationMethodText: '视频',
    appointmentTime: '5/25 07:18',
    appointmentTimeSlot: '5月25日 11:00-12:00',
    orderStatus: 'verified',
    orderStatusText: '已核销',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 3.0,
    status: 'expired',
    statusText: '已失效',
    createdTime: new Date(Date.now() - 30 * 86400000).toISOString() // 5月25日
  },
  {
    id: 9,
    customerId: 6,
    customerName: '周小琳',
    customerGender: 'female',
    customerPhone: '13824681357',
    customerAvatar: '👩‍🎓',
    consultationType: 'sleep',
    consultationTypeText: '睡眠障碍',
    consultationMethod: 'video',
    consultationMethodText: '视频',
    appointmentTime: '2024/12/15 14:30',
    appointmentTimeSlot: '2024年12月15日 14:00-15:00',
    orderStatus: 'cancelled',
    orderStatusText: '已取消',
    orderDetail: '10次咨询-3 - 扣除0.5 - 20250522011(',
    consumedHours: 0,
    status: 'completed',
    statusText: '已完成',
    createdTime: new Date('2024-12-15 14:30:00').toISOString() // 2024年12月15日 - 最早
  }
];

// 当前显示的咨询记录列表
let currentRecords = [...allRecords];
let highlightRecordId = null; // 需要高亮的记录ID

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
    highlightRecordId = parseInt(fromId);
  }
  
  initializeEventListeners();
  renderRecordsList();
  
  // 如果有高亮记录，滚动到对应位置
  if (highlightRecordId) {
    setTimeout(() => {
      scrollToRecord(highlightRecordId);
    }, 100);
  }
});

// 滚动到指定记录
function scrollToRecord(recordId) {
  const recordRow = document.querySelector(`[data-record-id="${recordId}"]`);
  if (recordRow) {
    recordRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 添加高亮效果
    recordRow.classList.add('highlighted');
    // 3秒后移除高亮效果
    setTimeout(() => {
      recordRow.classList.remove('highlighted');
    }, 3000);
  }
}

// 初始化事件监听器
function initializeEventListeners() {
  // 搜索功能
  const searchInput = document.getElementById('recordSearch');
  searchInput.addEventListener('input', handleSearch);
  
  // 筛选功能
  const filterBtn = document.getElementById('filterBtn');
  filterBtn.addEventListener('click', applyFilters);
  
  // 筛选器变化时自动应用筛选
  const filters = ['consultationTypeFilter', 'consultationMethodFilter', 'sortBy'];
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    filter.addEventListener('change', applyFilters);
  });
  
  // 分页控制 - 只保留下一页功能
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });
  
  // 状态变更弹窗事件
  document.getElementById('statusModalClose').addEventListener('click', hideStatusModal);
  document.getElementById('statusCancelBtn').addEventListener('click', hideStatusModal);
  document.getElementById('statusConfirmBtn').addEventListener('click', confirmStatusChange);
  
  // 点击弹窗背景关闭
  document.getElementById('statusChangeModal').addEventListener('click', (e) => {
    if (e.target.id === 'statusChangeModal') {
      hideStatusModal();
    }
  });
}

// 处理搜索
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    currentRecords = [...allRecords];
  } else {
    currentRecords = allRecords.filter(record => {
      return record.customerName.toLowerCase().includes(searchTerm) ||
             record.customerPhone.includes(searchTerm);
    });
  }
  
  currentPage = 1;
  renderRecordsList();
}

// 应用筛选
function applyFilters() {
  const typeFilter = document.getElementById('consultationTypeFilter').value;
  const methodFilter = document.getElementById('consultationMethodFilter').value;
  const sortBy = document.getElementById('sortBy').value;
  const searchTerm = document.getElementById('recordSearch').value.toLowerCase().trim();
  
  // 筛选数据
  let filteredRecords = [...allRecords];
  
  // 搜索筛选
  if (searchTerm) {
    filteredRecords = filteredRecords.filter(record => {
      return record.customerName.toLowerCase().includes(searchTerm) ||
             record.customerPhone.includes(searchTerm);
    });
  }
  
  // 咨询类型筛选
  if (typeFilter !== 'all') {
    filteredRecords = filteredRecords.filter(record => record.consultationType === typeFilter);
  }
  
  // 咨询方式筛选
  if (methodFilter !== 'all') {
    filteredRecords = filteredRecords.filter(record => record.consultationMethod === methodFilter);
  }
  
  // 排序
  filteredRecords.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdTime) - new Date(a.createdTime);
      case 'appointment':
        return new Date(b.appointmentTime) - new Date(a.appointmentTime);
      case 'hours':
        return b.consumedHours - a.consumedHours;
      default:
        return new Date(b.createdTime) - new Date(a.createdTime);
    }
  });
  
  currentRecords = filteredRecords;
  currentPage = 1;
  renderRecordsList();
}

// 渲染咨询记录列表
function renderRecordsList() {
  renderTableView();
  updatePagination();
}

// 渲染表格视图
function renderTableView() {
  const tbody = document.getElementById('recordsTableBody');
  
  if (currentRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>暂无咨询记录</h3>
            <p>还没有符合条件的咨询记录</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // 计算当前页的数据
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageRecords = currentRecords.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageRecords.map(record => `
    <tr data-record-id="${record.id}">
      <td>
        <div class="table-customer-info">
          <div class="table-customer-avatar">
            <span class="table-customer-avatar-emoji">${record.customerAvatar}</span>
          </div>
          <div class="table-customer-details">
            <h4>${record.customerName} <span class="gender-icon">${record.customerGender === 'male' ? '♂' : '♀'}</span></h4>
            <p>${record.customerPhone}</p>
          </div>
        </div>
      </td>
      <td>
        <span class="type-badge ${record.consultationType}">${record.consultationTypeText}</span>
      </td>
      <td>
        <span class="method-badge ${record.consultationMethod}">${record.consultationMethodText}</span>
      </td>
      <td>
        ${record.appointmentTimeSlot}
      </td>
      <td>
        <div class="order-detail">
          <div class="order-detail-content" onclick="toggleOrderTooltip(this, '${record.orderDetail}')">
            ${record.orderDetail}
          </div>
          <div class="order-detail-tooltip"></div>
        </div>
      </td>
      <td>
        ${record.consumedHours}
      </td>
      <td>
        <span class="status-badge ${record.status}">${record.statusText}</span>
      </td>
      <td>
        <div class="table-actions ${record.status !== 'expired' ? 'two-buttons' : ''}">
          <button class="btn btn-outline btn-sm" onclick="viewSummary(${record.id})">智能总结</button>
          <button class="btn btn-outline btn-sm" onclick="viewCustomerProfile(${record.customerId})">客户档案</button>
          ${record.status === 'expired' ? 
            `<button class="btn btn-outline btn-sm" onclick="changeStatus(${record.id})">状态变更</button>` : 
            ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// 查看智能总结
function viewSummary(recordId) {
  // 这里应该跳转到智能总结页面或打开弹窗
  console.log('查看智能总结:', recordId);
  showToast('功能开发中...');
}

// 查看客户档案
function viewCustomerProfile(customerId) {
  // 跳转到客户档案页面
  window.location.href = `customer-profile.html?id=${customerId}`;
}

// 状态变更
function changeStatus(recordId) {
  const record = allRecords.find(r => r.id === recordId);
  if (!record) return;
  
  // 更新弹窗描述信息
  const description = `您正在更改${record.customerName}预约的${record.customerName}咨询师 ${record.appointmentTimeSlot}的${record.consultationTypeText}的咨询状态。`;
  document.getElementById('statusChangeDescription').textContent = description;
  
  // 重置单选框
  document.querySelectorAll('input[name="consultationStatus"]').forEach(radio => {
    radio.checked = false;
  });
  
  // 显示弹窗
  showStatusModal(recordId);
}

// 更新分页
function updatePagination() {
  totalPages = Math.ceil(currentRecords.length / itemsPerPage);
  
  // 更新分页信息
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, currentRecords.length);
  const totalItems = currentRecords.length;
  
  document.getElementById('pageInfo').textContent = 
    `显示第 ${startItem}-${endItem} 条记录`;
  
  // 更新下一页按钮状态
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// 渲染页码
function renderPageNumbers() {
  const pageNumbers = document.getElementById('pageNumbers');
  
  if (totalPages <= 1) {
    pageNumbers.innerHTML = '';
    return;
  }
  
  let pages = [];
  
  if (totalPages <= 7) {
    // 如果总页数不超过7页，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 如果总页数超过7页，使用省略号
    if (currentPage <= 4) {
      // 当前页在前4页
      pages = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      // 当前页在后4页
      pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      // 当前页在中间
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }
  
  pageNumbers.innerHTML = pages.map(page => {
    if (page === '...') {
      return createDotsElement();
    } else {
      return createPageButton(page);
    }
  }).join('');
}

// 创建页码按钮
function createPageButton(pageNum) {
  const isActive = pageNum === currentPage;
  return `
    <button class="page-number ${isActive ? 'active' : ''}" 
            onclick="goToPage(${pageNum})"
            ${isActive ? 'disabled' : ''}>
      ${pageNum}
    </button>
  `;
}

// 创建省略号元素
function createDotsElement() {
  return '<span class="page-number dots">...</span>';
}

// 跳转到指定页
function goToPage(pageNum) {
  if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
    currentPage = pageNum;
    renderRecordsList();
  }
}

// 格式化日期时间
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateStr = date.toDateString();
  const nowStr = now.toDateString();
  const yesterdayStr = yesterday.toDateString();
  const tomorrowStr = tomorrow.toDateString();
  
  const timeStr = date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  if (dateStr === nowStr) {
    return `今天 ${timeStr}`;
  } else if (dateStr === yesterdayStr) {
    return `昨天 ${timeStr}`;
  } else if (dateStr === tomorrowStr) {
    return `明天 ${timeStr}`;
  } else {
    const currentYear = now.getFullYear();
    const dateYear = date.getFullYear();
    
    // 如果是当前年份，不显示年份
    if (dateYear === currentYear) {
      return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
    } else {
      // 非当前年份显示年份
      return `${dateYear}/${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
    }
  }
}

// 切换核销订单详情浮窗
function toggleOrderTooltip(element, orderDetail) {
  const tooltip = element.nextElementSibling;
  const isVisible = tooltip.classList.contains('show');
  
  // 隐藏所有其他浮窗
  document.querySelectorAll('.order-detail-tooltip').forEach(t => {
    t.classList.remove('show');
  });
  
  if (!isVisible) {
    tooltip.textContent = orderDetail;
    tooltip.classList.add('show');
    
    // 点击其他地方隐藏浮窗
    setTimeout(() => {
      document.addEventListener('click', function hideTooltip(e) {
        if (!element.contains(e.target) && !tooltip.contains(e.target)) {
          tooltip.classList.remove('show');
          document.removeEventListener('click', hideTooltip);
        }
      });
    }, 0);
  }
}

// 当前正在变更状态的记录ID
let currentStatusChangeRecordId = null;

// 显示状态变更弹窗
function showStatusModal(recordId) {
  currentStatusChangeRecordId = recordId;
  document.getElementById('statusChangeModal').classList.add('show');
}

// 隐藏状态变更弹窗
function hideStatusModal() {
  document.getElementById('statusChangeModal').classList.remove('show');
  currentStatusChangeRecordId = null;
}

// 确认状态变更
function confirmStatusChange() {
  const selectedStatus = document.querySelector('input[name="consultationStatus"]:checked');
  
  if (!selectedStatus) {
    showToast('请选择咨询完成情况');
    return;
  }
  
  if (!currentStatusChangeRecordId) {
    showToast('未找到要变更的记录');
    return;
  }
  
  // 找到要更新的记录
  const recordIndex = allRecords.findIndex(r => r.id === currentStatusChangeRecordId);
  if (recordIndex === -1) {
    showToast('未找到要变更的记录');
    return;
  }
  
  // 更新记录状态
  const newStatus = selectedStatus.value;
  const newStatusText = newStatus === 'completed' ? '已完成' : '已取消';
  
  allRecords[recordIndex].status = newStatus;
  allRecords[recordIndex].statusText = newStatusText;
  
  // 更新当前显示的记录列表
  const currentRecordIndex = currentRecords.findIndex(r => r.id === currentStatusChangeRecordId);
  if (currentRecordIndex !== -1) {
    currentRecords[currentRecordIndex].status = newStatus;
    currentRecords[currentRecordIndex].statusText = newStatusText;
  }
  
  // 重新渲染表格
  renderRecordsList();
  
  // 隐藏弹窗
  hideStatusModal();
  
  // 显示成功提示
  showToast(`状态已更新为：${newStatusText}`);
}

// 显示提示消息
function showToast(message) {
  if (typeof window.showToast === 'function') {
    window.showToast(message);
  } else {
    alert(message);
  }
} 