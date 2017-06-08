'use strict';
$(function() {
  
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

});