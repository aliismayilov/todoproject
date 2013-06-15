$(function() {
    $('.todos :checkbox').each(function (index) {
        var todoId = $(this).attr('id').replace('checkbox', '');
        $(this).click(function () {
            ajaxCompleted(todoId);
        });
    });
});

function ajaxCompleted(id) {
    $.post('/api/todos/' + id + '/completed/', function (data) {
        console.log(data);
    });
}
