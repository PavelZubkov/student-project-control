'use strict';
$(function() {
  
  // Копирование задачи
  $('.copy_task').on('click', function(e) {
    const id = $(e.currentTarget).data('id');
    $.post(
      window.location.href + '/copy',
      { id },
      function(data, status) {
        if (status === 'success') {
          window.location.reload();
        } else {
          alert('Ошибка сервера!');
        }
      }
    );
  });
  
  // страница с задачами проекта
  
  // редактировать задачу
  
  // сбор данных из полей модального окна
  const getModal = function getModal(done) {
    const modal = $('#list-of-task_modals_create-task');
    
    // const name = modal.find('#name');
    // const description = modal.find('#description');
    // const dueDate = modal.find('#datepicker');
    // const state = modal.find('#state');
    // const members = modal.find('#members');
    // const move = modal.find('#move');
    // const position = modal.find('#position');
    // const id = $(`[data-number = ${position.val()}]`).data('id');

    // const data = {
    //   name: name.val(),
    //   description: description.val(),
    //   dueDate: dueDate.val(),
    //   state: state.val(),
    //   members: members.val(),
    //   move: move.val(),
    //   id: id
    // };
    
    // return data;
    const getId = function getId(modal) {
      const position = modal.find('#position').val();
      return $(`[data-number = ${position}]`).data('id');
    };
    
    const getTask = function getTask(id, done) {
      $.post(
        window.location.href + '/get',
        { id },
        function(data, status) {
          if (status === 'success') {
            return done(null, data);
          } else {
            return done(1);
          }
        }
      );
    };

    const getName = function getName(task, modal) {
      const name = modal.find('#name').val();
      if (!name) {
        return alert('Название должно быть');
      }
      if (task.name !== name) {
        return { propertyName: 'name', value: name };
      } else {
        return undefined;
      }
    };
    
    const getDescription = function getDescription(task, modal) {
      const description = modal.find('#description').val();
      if (task.description !== description) {
        return { propertyName: 'description', value: description };
      } else {
        return undefined;
      }
    };
    
    const getState = function getState(task, modal) {
      const state = modal.find('#state').val();
      let st;
      switch (state) {
        case 'planning':
          st = 'Черновик';
          break;
        case 'queue':
          st = 'В очереди';
          break;
        case 'executed':
          st = 'Выполнено';
          break;
        case 'complete':
          st = 'Завершено';
          break;
        default:
          st = 'Черновик';
      }
      if (task.state !== st) {
        return { propertyName: 'state', value: st };
      } else {
        return undefined;
      }
    };
    
    const getDueDate = function getDueDate(task, modal) {
      if (!modal.find('#datepicker').val()) {
        return undefined;
      }
      let tempDate = modal.find('#datepicker').val().split('/');
      const newDate = new Date(`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`);
      console.log(task.dueDate);
      if (!task.dueDate) {
        task.dueDate = '1970-1-1';
      }
      tempDate = task.dueDate.split('/');
      const oldDate = new Date(`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`);
      if (newDate.getTime() !== oldDate.getTime()) {
        return { propertyName: 'dueDate', value: newDate};
      } else {
        return undefined;
      }
    };
    
    const getMembers = function getMembers(task, modal) {
      const members = modal.find('#members').val();
      const newMembers = {};
      // task.members = [{  id: '594258822fc26514ece3dd33',  firstName: 'Дракон',  lastName: 'Артамон'}, {  id: '594258882fc26514ece3dd3c',  firstName: 'Lorem',  lastName: 'Ipsum'} ];
      if (!task.members.length && members.length) {
        newMembers.add = members;
        delete newMembers.sub;
        return { propertyName: 'members', value: newMembers};
      }
      newMembers.sub = [];
      for (let oldMember of task.members) {
        let eq = false;
        for (let newMember of members) {
          if (oldMember === newMember) {
            eq = true;
            break;
          }
        }
        if (!eq) {
          newMembers.sub.push(oldMember);
        }
      }
      newMembers.add = [];
      for (let newMember of members) {
        let eq = false;
        for (let oldMember of task.members) {
          if (newMember === oldMember) {
            eq = true;
            break;
          }
        }
        if (!eq) {
          newMembers.add.push(newMember);
        }
      }
      if (!newMembers.add.length && !newMembers.sub.length) {
        return undefined;
      }
      if (!newMembers.add.length) {
        delete newMembers.add;
        return { propertyName: 'members', value: newMembers};
      }
      if (!newMembers.sub.length) {
        delete newMembers.sub;
        return { propertyName: 'members', value: newMembers};
      }
      return { propertyName: 'members', value: newMembers};
    };
    
    const getMove = function getMove(task, modal) {
      const newPosition = modal.find('#move').val(); 
      const oldPosition = modal.find('#position').val();
      if (oldPosition === newPosition || !newPosition) {
        return undefined;
      } else {
        return { propertyName: 'move', value: newPosition};
      }
    };
    const taskId = getId(modal);
    getTask(taskId, function(err, task) {
      if (err) {
        return alert('Ошибка сервера!');
      }
      const functions = {
        getName,
        getDescription,
        getState,
        getDueDate,
        getMembers,
        getMove
      };
      
      const data = {};
      for (let func in functions) {
        let result = functions[func](task, modal);
        if (result) {
          data[result.propertyName] = result.value;
        }
      }
      return done(null, data, taskId)
    });
  };
  
  //кнопка сохранить в модале
  $('#modal_save_task').on('click', function() {
    getModal(function(err, task, taskId) {
      console.log(task);
      if (err) {
        return alert('Ошибка сервера!');
      }
      if (Object.keys(task).length) {
        task.id = taskId;
        $.post(
          window.location.href + '/update',
          { task: JSON.stringify(task) },
          function(data, textStatus, jqXHR) {
            window.location.reload();
          }
        );
      }
    });
  });
  
  // закрытие окна - очистка
	$('#list-of-task_modals_create-task').on('hide.bs.modal', function() {
    // $('#position').empty();
    $('#name').val('');
    $('#description').val('');
    $('#datepicker').val('');
	});
	
  // открытие окна
  const openModal = function openModal() {
    $('#list-of-task_modals_create-task').modal('show');
  };
  
  const setModal = function datingModal(task) {
    const modal = $('#list-of-task_modals_create-task');
    if (!modal.length) {
      return alert('Неизвестная ошибка. Модальное окно пропало!');
    }

    modal.find('#name').val(task.name);
    modal.find('#description').val(task.description);
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      // modal.find('#datepicker').val(`${dueDate.getDate()}/${dueDate.getMonth()+1}/${dueDate.getFullYear()}`);
      modal.find('#datepicker').val(task.dueDate);
    }
    
    // task.members = [{  id: '594258822fc26514ece3dd39',  firstName: 'Дракон',  lastName: 'Артамон'}, {  id: '594258882fc26514ece3dd3c',  firstName: 'Lorem',  lastName: 'Ipsum'} ];
    const selectMembers = modal.find('#members');
    if (task.members.length) {
      let members = [];
      for (let member of task.members) {
        members.push(member);
      }
      $('#members').selectpicker('val', members);
    }
    const state = modal.find('#state');
    switch (task.state) {
      case 'Черновик':
        state.selectpicker('val', 'planning');
        break;
      case 'В очереди':
        state.selectpicker('val', 'queue');
        break;
      case 'Выполнено':
        state.selectpicker('val', 'executed');
        break;
      case 'Завершено':
        state.selectpicker('val', 'complete');
        break;
      default:
        state.selectpicker('val', 'planning');
    }
    $('#position').val($(`#${task.id}`).data('number'));
    openModal();
  };
  
  const getTask = function getTask(id) {
    $.post(
      window.location.href + '/get',
      { id: id },
      function(data, textStatus, jqXHR) {
        if (textStatus === 'success') {
          return setModal(data);
        } else {
          alert('Неизвестная ошибка. Попробуйте позже!');
        }
      }
    );
  };
  
  $('.tasks-list tbody').on('click', '.change_task', function(e) {
    const id = e.currentTarget.dataset.id;
    return getTask(id);
  });
  
  // создать задачу
  $('.tasks_list_add_task').on('click', function() {
    const name = prompt('Введите название задачи', '');
    if (name) {
      $.post(
        window.location.href + '/create',
        { name: name },
        function(data, textStatus, jqXHR) {
          window.location.reload();
        }
      );
    }
  });
  
  //удалить задачу
  const getId = function getId(number) {
    const row = $(`[data-number = ${number}]`);
    if (!row.length) {
      return alert('Нет задачи с таким номером!');
    }
    return row.data('id');
  };
  
  $('.tasks_list_del_task').on('click', function() {
    const number = prompt('Введите номер задачи', '');
    if ($.isNumeric(parseInt(number))) {
      const id = getId(number);
      $.post(
        window.location.href + '/remove',
        { id: id },
        function(data, textStatus, jqXHR) {
          window.location.reload();
        }
      );
    } else {
      alert('Введите число!');
    }
  });
  
  
  // team page
  $('.pteam__btnInviteMember').on('click', function() {
    const email = prompt('Введите email', '');
    $.post(
      window.location.href + '/invite',
      { email: email },
      function(data, textStatus, jqXHR) {
        window.location.reload();
      }
    );
  });
  $('.pteam__btnKickMember').on('click', function() {
    const email = prompt('Введите email', '');
    $.post(
      window.location.href + '/kick',
      { email: email },
      function(data, textStatus, jqXHR) {
        window.location.reload();
      }
    );
  });
  
  
  // profile
  const clickBtnSave = function clickBtnSave(event) {
    const props = ['username', 'password', 'email', 'firstName', 'lastName', 'initials'];
    const user = {};
    for (let prop of props) {
      let value = $(`#${prop} input`).val();
      if (prop === 'password') {
        const oldPassword = $('#password [name = "oldPassword"]').val();
        const newPassword = $('#password [name = "newPassword"]').val();
        if (oldPassword) {
          user.oldPassword = oldPassword;
          user.newPassword = newPassword;
        }
      } else {
        if (value !== event.data[prop]) {
          user[prop] = value;
        }
      }
    }
    if (jQuery.isEmptyObject(user)) {
      // ничего
    } else {
      $.ajax({
        url: "/profile",
        method: "POST",
      // 	data: JSON.stringify(user),
        data: user,
        error: function(err) {
          $('.msg p').text('Ошибка');
          $('.msg').removeClass('text-info').addClass('text-danger');
        },
        statusCode: {
          200: function() {
            $('.msg p').text('Сохранено. Обновите страницу');
            $('.msg').removeClass('text-info').addClass('text-success');
            window.location.reload();
        },
      }
    });
    }
  };
  
  const clickBtnChange = function clickBtnChange() {
    const props = ['username', 'password', 'email', 'firstName', 'lastName', 'initials'];
    const oldUser = {};
    for (let prop of props) {
      let elem = $(`#${prop} span`);
      if (prop === 'password') {
        elem.after(`<input type="text" class="form-control input-sm" name="newPassword" placeholder="Новый пароль">`);
        elem.after(`<input type="text" class="form-control input-sm op" name="oldPassword" placeholder="Старый пароль">`);
      } else {
        elem.after(`<input type="text" class="form-control input-sm" name="${prop}" value="${elem.text()}">`);
        oldUser[prop] = elem.text();
      }
      elem.remove();
    }
    const btn = $('.profile #change');
    btn.text('Сохранить');
    $('.msg').removeClass('hidden');
    
    $('.profile').off('click', '#change', clickBtnChange);
    $('.profile').on('click', '#change', oldUser, clickBtnSave);
  };
  
  const clickBtnDestroy = function clickBtnDestroy() {
    const password = prompt('Введите пароль', '');
    $.ajax({
      url: "/profile/destroy",
      method: "POST",
      // 	data: JSON.stringify(user),
      data: { password: password},
      error: function(err) {
        console.log(err);
      },
      statusCode: {
        200: function() {
          // window.location.reload();
          window.location.href = '/signout';
          alert('OK');
        }
      }
    });
  };
  
  $('.profile').on('click', '#change', clickBtnChange);
  $('.profile').on('click', '#destroy', clickBtnDestroy);
  
  
  // $( "#datepicker" ).datepicker({
  //   changeMonth: true,
  //   changeYear: true,
  //   dateFormat: "dd/mm/yy"
  // });
});