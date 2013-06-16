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

    $('#todo-string').keypress(function(event) {
        var val = $('#todo-string').val();

        if ( event.which == 94 ) {
            var datepicker = $('#todo-string').datepicker('show').on('changeDate', function(ev) {
                var newValue = val + ' ^' + $('#todo-string').val();
                $('#todo-string').val(newValue);

                datepicker.datepicker('hide');
            });
        }
    });
});

function ajaxCompleted(id) {
    $.post('/api/todos/' + id + '/completed/', function (data) {
        $('#todo-' + id).toggleClass('striked');
    });
}

var checkbox;

function addTodo() {
    var todoString = $('#todo-string').val();
    var date = null;

    if (todoString.indexOf("^") !== -1) {
        date = todoString.split('^')[1].split(' ')[0];
        todoString = todoString.split('^')[0].trim();
    }

    var todo = {
        title: todoString,
        due_date: ((date == null) ? null : parseDate(date).toISOString())
    };

    $.post('/api/todos/', todo, function (data) {
        // reset text input
        $('#todo-string').val('');

        // build html from template and append it to todo list
        var todo_template = $('#todo_mustache').html();
        var todo_html = Mustache.to_html(todo_template, {'todo': data});

        var inserted = false;
        if (data.due_date != null) {
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
    });
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
    var month = dateString.split('/')[0] - 1;
    var day = dateString.split('/')[1];
    var year = dateString.split('/')[2];

    var datetime = new Date();

    datetime.setUTCFullYear(year);
    datetime.setUTCMonth(month);
    datetime.setUTCDate(day);

    return datetime;
}

function formatDate(date) {
    return (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear();
}
