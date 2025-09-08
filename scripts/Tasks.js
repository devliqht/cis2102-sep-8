$(document).ready(() => {
    let ROOT_URL = 'https://todo-list.dcism.org';
    console.log('Script Connected');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = '../../login.html';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || 1;

    $('#filterUserId').val(currentUserId);

    let isEditMode = false;
    let editingTaskId = null;

    $('#newTaskBtn').click(() => {
        isEditMode = false;
        editingTaskId = null;
        $('#addBtn').text('Add Task');
        $('#taskInputSection').slideToggle(200);
        $('#todoInput').focus();
    });

    $('#cancelBtn').click(() => {
        $('#taskInputSection').slideUp(200);
        clearForm();
    });

    $('#addBtn').click(() => {
        const taskName = $('#todoInput').val().trim();
        const taskDescription = $('#todoDescription').val().trim();
        const status = $('#statusSelect').val();

        if (taskName) {
            if (isEditMode && editingTaskId) {
                editTask(editingTaskId, taskName, taskDescription);
            } else {
                addTask(taskName, taskDescription);
            }
        }
    });

    $('#todoInput').keypress((e) => {
        if (e.which === 13) {
            $('#addBtn').click();
        }
    });

    $('#selectAll').change(function() {
        $('.task-checkbox').prop('checked', this.checked);
    });

    $('#filterBtn').click(() => {
        loadTasks();
    });

    $('#filterStatus').change(() => {
        loadTasks();
    });

    $('#filterUserId').on('input', debounce(() => {
        if ($('#filterUserId').val()) {
            loadTasks();
        }
    }, 500));

    $(document).on('click', '.action-btn.delete', function() {
        const taskRow = $(this).closest('.task-row');
        const taskId = taskRow.data('task-id');

        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
    });

    $(document).on('click', '.action-btn.edit', function() {
        const taskRow = $(this).closest('.task-row');
        const taskTitle = taskRow.find('.task-title').text();
        const taskDescription = taskRow.find('.task-description').text();
        const taskId = taskRow.data('task-id');

        isEditMode = true;
        editingTaskId = taskId;

        $('#todoInput').val(taskTitle);
        $('#todoDescription').val(taskDescription);
        $('#addBtn').text('Update Task');
        $('#taskInputSection').slideDown(200);
        $('#todoInput').focus().select();
    });

    $(document).on('click', '.clickable-status', function() {
        const taskRow = $(this).closest('.task-row');
        const taskId = taskRow.data('task-id');
        const statusBadge = $(this);
        const currentStatus = statusBadge.hasClass('status-active') ? 'active' : 'inactive';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        if (confirm(`Are you sure you want to change this task to ${newStatus}?`)) {
            changeTaskStatus(taskId, newStatus);
        }
    });

    function clearForm() {
        $('#todoInput').val('');
        $('#todoDescription').val('');
        $('#statusSelect').val('active');
        isEditMode = false;
        editingTaskId = null;
        $('#addBtn').text('Add Task');
    }

    function changeTaskStatus(taskId, newStatus) {
        const statusData = {
            item_id: taskId,
            status: newStatus
        };

        $.ajax({
            type: 'POST',
            url: ROOT_URL + '/statusItem_action.php',
            data: JSON.stringify(statusData),
            success: (response) => {
                console.log('Change status response:', response);
                let parsedRes = JSON.parse(response);

                if (parsedRes.status === 200) {
                    console.log('Task status changed successfully:', parsedRes.message);
                    loadTasks();
                } else {
                    console.error('Failed to change task status:', parsedRes.message);
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX Error changing task status:', error);
                console.error('Response Text:', xhr.responseText);
            }
        });
    }

    function deleteTask(taskId) {
        $.ajax({
            type: 'POST',
            url: ROOT_URL + '/deleteItem_action.php?item_id=' + taskId,
            success: (response) => {
                console.log('Delete task response:', response);
                let parsedRes = JSON.parse(response);

                if (parsedRes.status === 200) {
                    console.log('Task deleted successfully:', parsedRes.message);
                    loadTasks();
                } else {
                    console.error('Failed to delete task:', parsedRes.message);
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX Error deleting task:', error);
                console.error('Response Text:', xhr.responseText);
            }
        });
    }

    function editTask(taskId, name, description) {
        const taskData = {
            item_id: taskId,
            item_name: name,
            item_description: description || name
        };

        $.ajax({
            type: 'POST',
            url: ROOT_URL + '/editItem_action.php',
            data: JSON.stringify(taskData),
            success: (response) => {
                console.log('Edit task response:', response);
                let parsedRes = JSON.parse(response);

                if (parsedRes.status === 200) {
                    console.log('Task updated successfully:', parsedRes.message);
                    clearForm();
                    $('#taskInputSection').slideUp(200);
                    loadTasks();
                } else {
                    console.error('Failed to update task:', parsedRes.message);
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX Error updating task:', error);
                console.error('Response Text:', xhr.responseText);
            }
        });
    }

    function addTask(name, description) {
        const taskData = {
            item_name: name,
            item_description: description || name,
            user_id: currentUserId
        };

        $.ajax({
            type: 'POST',
            url: ROOT_URL + '/addItem_action.php',
            data: JSON.stringify(taskData),
            success: (response) => {
                console.log('Add task response:', response);
							let parsedRes = JSON.parse(response);

                if (parsedRes.status === 200) {
                    console.log('Task added successfully:', parsedRes.data);
                    clearForm();
                    $('#taskInputSection').slideUp(200);
                    loadTasks();
                } else {
                    console.error('Failed to add task:', parsedRes.message);
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX Error adding task:', error);
                console.error('Response Text:', xhr.responseText);
            }
        });
    }

    function renderTasks(data) {
        $('#todoList').empty();

        if (!data || Object.keys(data).length === 0) {
            checkEmptyState();
            return;
        }

        Object.values(data).forEach((item) => {
            $('#todoList').append(renderTaskRow(item));
        });

        console.log(`Rendered ${Object.keys(data).length} tasks`);
    }

    function loadTasks() {
        const filterParams = getFilterParams();

        console.log('Loading tasks with params:', filterParams);

        $.ajax({
            type: 'GET',
            url: ROOT_URL + '/getItems_action.php',
            data: filterParams,
            dataType: 'json',
            success: (res) => {
                console.log('API Response:', res);

                if (res.status === 200 && res.data) {
                    tasks = res.data;
                    renderTasks(res.data);

                    if (res.count) {
                        console.log(`Total tasks: ${res.count}`);
                    }
                } else {
                    console.log('No items found or invalid response structure');
                    renderTasks({});
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX Error: ', error);
                console.error('Response Text:', xhr.responseText);
                renderTasks({});
            }
        });
    }

    loadTasks();
});
