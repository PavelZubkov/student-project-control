'use strict';
const __control = function __control(options) {
  let wrapper
    , btnCreate
    , btnRemove
    , __list;
  
  function setList(list) {
    __list = list;
  }
  function getElem() {
    if (!wrapper) render();
    return wrapper;
  }
  
  function render() {
    wrapper = $('<div></div>')
      .addClass('wrapper');
    btnCreate = $(' <button type="button">Создать</button> ')
      .addClass('btn btn-default pmenu__control__createProject')
      .appendTo(wrapper);
    btnRemove = $(' <button type="button">Удалить</button> ')
      .addClass('btn btn-danger pmenu__control__removeProject')
      .appendTo(wrapper);
      
    $(wrapper)
      .on('click', '.pmenu__control__createProject', createProject)
      .on('click', '.pmenu__control__removeProject', removeProject);
  }
  
  function createProject() {
    const name = prompt('Введите название проекта', '');
    if (name.length) {
      $.post(
        '/projects/create',
        { name: name },
        function(data, textStatus, jqXHR) {
          if (textStatus === 'success') {
            window.location.reload();
          } else {
            alert('Ошибка, проверьте введенные данные');
          }
        }
      );
    } else {
      alert('Ошибка, проверьте введенные данные');
    }
  }
  
  function removeProject() {
    const name = prompt('Введите название проекта', '');
    for (let project of __list.projects) {
      if (name === project.name) {
        $.post(
          '/projects/remove',
          { projectId: project.id },
          function(data, textStatus, jqXHR) {
            if (textStatus === 'success') {
              window.location.reload();
            } else {
              alert('Проверьте название');
            }
          }
        );
        return;
      }
    }
    alert('Проверьте название');
  }
  
  this.getElem = getElem;
  this.createProject = createProject;
  this.removeProject = removeProject;
  this.setList = setList;
};