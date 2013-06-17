$(function() {
    $('.todos :checkbox').each(function (index) {
        var todoId = $(this).attr('id').replace('checkbox-', '');
        $(this).click(function () {
            ajaxCompleted(todoId);
        });
    });

    $('#add-todo').submit(function () {
        addTodo();
        return false;
    });

    $('#archive-button').click(function () {
        removeCompleted();
    });

    registerTodoLiHover();
});

function ajaxCompleted(id) {
    $.post('/api/todos/' + id + '/completed/', function (data) {
        $('#todo-' + id).toggleClass('striked muted');
    });
}

function addTodo() {
    var todoString = $('#todo-string').val();
    var date = null;
    var priority = 1; // Todo.LOW

    if (endsWith(todoString.trim(), '!')) {
        priority = 10; // Todo.HIGH
        todoString = todoString.trim().substring(0, todoString.trim().length - 1).trim();
    }

    if (todoString.indexOf("^") !== -1) {
        date = todoString.split('^')[1].split(' ')[0];
        todoString = todoString.split('^')[0].trim();
    }

    var todo = {
        title: todoString,
        due_date: ((date == null) ? null : parseDate(date).toISOString()),
        priority: priority
    };

    var requestType = '';
    var requestUrl = '';

    var todoId = $('#todo-id').val();
    if (todoId != '') {
        requestType = 'PUT';
        requestUrl = '/api/todos/' + todoId;
    } else {
        requestType = 'POST';
        requestUrl = '/api/todos/';
    }

    $.ajax({
        type: requestType,
        url: requestUrl,
        data: todo
    }).done(function (data) {
        // reset text input
        $('#todo-string').val('');

        // build html from template and append it to todo list
        var todo_template = $('#todo_mustache').html();
        var todo_html = Mustache.to_html(todo_template, {'todo': data});

        var inserted = false;

        // if editing
        if (todoId != '') {
            $('#todo-' + todoId).html(todo_html);
            inserted = true;
        }

        if (data.due_date != null && !inserted) {
            data.due_date = formatDate(new Date(data.due_date));

            $('.todos h3').slice(0, -1).each(function (index) {
                if (inserted)
                    return;

                // compare dates without time
                todo_hours = new Date(data.due_date).setHours(0,0,0,0);
                this_hours = parseDate($(this).html()).setHours(0,0,0,0);

                if (todo_hours == this_hours) {
                    $(this).parent().children('ul').append(todo_html);
                    inserted = true;
                } else if (todo_hours > this_hours) {

                    var list_template = $('#todo_list_mustache').html();
                    var list_html = Mustache.to_html(list_template, {
                        'todo': data,
                        'todo_entry': todo_html
                    });
                    $('.todos').html(list_html);

                    inserted = true;
                }
            });
        } else if ($('.todos h3').last().html() == 'No date' && !inserted) { // append to due date
            $('.todos ul').last().append(todo_html);
            inserted = true;
        }

        if (!inserted) {
            if (data.due_date == null) {
                data.due_date = 'No date';
            } else {
                data.due_date = formatDate(new Date(data.due_date));
            }

            var list_template = $('#todo_list_mustache').html();
            var list_html = Mustache.to_html(list_template, {
                'todo': data,
                'todo_entry': todo_html
            });
            $('.todos').append(list_html);
        }

        // add event handler for checkbox
        $('#checkbox-' + data.id).click(function () {
            console.log(data.id);
            ajaxCompleted(data.id);
        });

        // add priority class
        if (data.priority == 10) {
            $('#todo-' + data.id).addClass('str');
        } else {
            $('#todo-' + data.id).addClass('lit');
        }

        // change add button text
        $('#add-todo :submit').html($('<i>').addClass('icon-plus')[0].outerHTML + ' add');

        registerTodoLiHover();
    }).fail(function(data) { console.log(data); });
}

function removeCompleted() {
    $('.todos li :checked').each(function (index) {
        var id = $(this).attr('id').replace('checkbox-', '');

        $('#todo-' + id).remove();
    });

    // remove empty lists
    $('.todos > li').each(function (index) {
        if ($(this).find('li').length == 0)
            $(this).remove();
    });
}

function parseDate(dateString) {
    var now = new Date();
    var date = Date.parse(dateString);

    date.setHours(now.getHours());
    date.setMinutes(now.getMinutes());

    return date;
}

function formatDate(date) {
    return (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear();
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function registerTodoLiHover() {
    $('.todos li li').hover(
        function () {
            var $editButton = $('<button>').addClass('btn btn-mini todo-edit-button').append($('<i>').addClass('icon-edit')).append(' edit');
            
            $editButton.click(function () {
                var todoId = $(this).parent().find(':checkbox').attr('id').replace('checkbox-', '');
                $(this).parent().find('button').remove();

                var todoString = $('#todo-' + todoId).find('label').text().trim();

                var dateString = $('#todo-' + todoId).parent().parent().find('h3').text();
                if (dateString != 'No date')
                    todoString += ' ^' + dateString;

                if ($('#todo-' + todoId).hasClass('str'))
                    todoString += ' !';

                $('#todo-string').val(todoString);
                $('#todo-id').val(todoId);

                // change add button text
                $('#add-todo :submit').html($('<i>').addClass('icon-edit')[0].outerHTML + ' edit');

                return false;
            });

            $(this).find('label').append($editButton);
        },
        function () {
            $(this).find('.todo-edit-button').remove();
        }
    );
}
