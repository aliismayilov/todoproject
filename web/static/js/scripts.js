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
});

function ajaxCompleted(id) {
    $.post('/api/todos/' + id + '/completed/', function (data) {
        $('#todo-' + id).toggleClass('striked');
    });
}

var checkbox;

function addTodo() {
    var todo = {
        title: $('#todo-title').val()
    };

    $.post('/api/todos/', todo, function (data) {
        // reset text input
        $('#todo-title').val('');

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
