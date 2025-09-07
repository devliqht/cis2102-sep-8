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

    TaskAPI.init(ROOT_URL, currentUserId, {
        onClearForm: clearForm,
        onLoadTasks: loadTasks
    });

    $('#newTaskBtn').click(() => {
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
            addTask(taskName, taskDescription);
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

        if (confirm('Are you sure you want to delete this task?')) {
            taskRow.fadeOut(300, function() {
                $(this).remove();
                checkEmptyState();
            });
        }
    });

    $(document).on('click', '.action-btn.edit', function() {
        const taskRow = $(this).closest('.task-row');
        const taskTitle = taskRow.find('.task-title').text();
        const taskDescription = taskRow.find('.task-description').text();

        $('#todoInput').val(taskTitle);
        $('#todoDescription').val(taskDescription);
        $('#taskInputSection').slideDown(200);
        $('#todoInput').focus().select();
    });

    function clearForm() {
        $('#todoInput').val('');
        $('#todoDescription').val('');
        $('#statusSelect').val('active');
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
