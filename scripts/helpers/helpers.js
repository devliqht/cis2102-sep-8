function getStatusBadge(status) {
    const statusMap = {
        'active': { class: 'status-active', text: 'Active', icon: '<i class="fas fa-check-circle"></i>' },
        'inactive': { class: 'status-inactive', text: 'Inactive', icon: '<i class="fas fa-pause-circle"></i>' },
        'completed': { class: 'status-completed', text: 'Completed', icon: '<i class="fas fa-flag-checkered"></i>' }
    };
    const statusInfo = statusMap[status] || statusMap['active'];
    return `<span class="status-badge ${statusInfo.class}">
        <span>${statusInfo.icon}</span>
        ${statusInfo.text}
    </span>`;
}

function checkEmptyState() {
    if ($('.task-row').length === 0) {
        $('#todoList').html(`
            <div class="empty-state" id="emptyState">
                <div class="empty-icon"><i class="fas fa-tasks fa-3x"></i></div>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started</p>
            </div>
        `);
    }
}

function renderTaskRow(item) {
    const taskName = item.item_name || 'Untitled Task';
    const taskDescription = item.item_description || '';

    return `
        <div class="task-row" data-task-id="${item.item_id}">
            <div class="table-cell">
                <input type="checkbox" class="checkbox task-checkbox">
            </div>
            <div class="table-cell">
                <div class="task-content">
                    <div class="task-title">${taskName}</div>
                    <div class="task-description">${taskDescription}</div>
                    <div class="task-id">ID: ${item.item_id} | User: ${item.user_id}</div>
                </div>
            </div>
            <div class="table-cell">
                ${getStatusBadge(item.status)}
            </div>
            <div class="table-cell">
                <div class="task-time">${item.dateTime_created}</div>
            </div>
            <div class="table-cell">
                <div class="task-actions">
                    <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;
}

function getFilterParams() {
    const status = $('#filterStatus').val() || 'active';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const defaultUserId = currentUser.user_id || 1;
    const userId = $('#filterUserId').val() || defaultUserId;

    return {
        status: status,
        user_id: parseInt(userId)
    };
}
