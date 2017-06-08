'use strict';
const __list = function __list(options) {
  let table
    , tbody
    , projects = options.projects;
  
  function getElem() {
    if (!table) render();
    return table;
  }
  
  function render() {
    table = $('<table> <thead><tr> <th>#</th> <th>Название</th> <th>Действие</th> </tr> </thead></table>')
      .addClass('table');
    renderItems();
  }
  
  function renderItems() {
    if (!projects.length) {
      tbody = $('<tbody><tr><td colspan="3">Список проектов пуст</td></tr></tbody>');
      tbody.appendTo(table);
      return;
    }
    tbody = $('<tbody></tbody>');
    for (let i = 0; i < projects.length; i++) {
      let name = projects[i].name;
      let id = projects[i].id;
      let count = i + 1;
      let open = `<a href="/projects/tasks/${id}" role="button" class="btn btn-default btn-xs pmenu__list__open">Открыть</a>`;
      let copy = `<button type="button" id=${id} class="btn btn-default btn-xs pmenu__list__copy">Скопировать</button>`;
      $(`<tr><th>${count}</th><td>${name}</td><td>${open + ' ' + copy}</td></tr>`).appendTo(tbody);
      
    }
    tbody.appendTo(table);

    $(`.pmenu__list`).on('click', '.pmenu__list__copy', copy);
  }
  
  function copy(event) {
    const id = event.target.id; 
    $.post(
      'projects/copy',
      { projectId: id },
      function(data, textStatus, jqXHR) {
        if (textStatus === 'success') {
          window.location.reload();
        } else {
          alert('Неизвестная ошибка');
        }
      }
    );
  }
  
  
  this.getElem = getElem;
  this.projects = projects;
};