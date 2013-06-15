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
        console.log(data);
    });
}

var checkbox;

function addTodo() {
    var todo = {
        title: $('#todo-title').val()
    };

    $.post('/api/todos/', todo, function (data) {
        console.log(data);

        // reset text input
        $('#todo-title').val('');

        // build html from template and append it to todo list
        var template = '<li><label class="checkbox"><input type="checkbox" id="checkbox-{{ id }}"> {{ title }}</label></li>';
        var html = Mustache.to_html(template, data);

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
        var $parent = $(this).parent().parent();

        if ($parent.is('li')) {
            $parent.remove();
        } else {
            $parent.parent().remove();
        }
    })
}
