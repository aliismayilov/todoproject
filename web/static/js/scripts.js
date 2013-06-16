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
        due_date: parseDateForAPI(date)
    };

    $.post('/api/todos/', todo, function (data) {
        // reset text input
        $('#todo-string').val('');

        // build html from template and append it to todo list
        var template = $('#todo_mustache').html();
        var html = Mustache.to_html(template, {'todo': data});

        $('.todos').first().append(html);

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
    })
}

function parseDateForAPI(dateString) {
    var month = dateString.split('/')[0] - 1;
    var day = dateString.split('/')[1];
    var year = dateString.split('/')[2];

    var datetime = new Date();

    datetime.setUTCFullYear(year);
    datetime.setUTCMonth(month);
    datetime.setUTCDate(day);

    return datetime.toISOString();
}
