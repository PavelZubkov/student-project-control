// ;'use strict';




// $( function() {
// 	// datepicker
//     $( "#datepicker" ).datepicker({
//       changeMonth: true,
//       changeYear: true
//     });
//     // tooltips
//     $(function () {
        
//     });

// });

// (function() {
// 	// Авторизация
// 	$('.login-form').on('submit', function() {
// 		var form = $(this);
// 		$('.alert-danger').addClass('hidden');
// 		$.ajax({
// 			url: "/signin",
// 			method: "POST",
// 			data: form.serialize(),
// 			error: function() {
// 				$('.alert-danger').removeClass('hidden');
// 			},
// 			statusCode: {
// 				200: function() {
// 					window.location.href = '/';
// 				},
// 			}
// 		});
// 		return false;
// 	});
// 	// Логаут
// 	$('#btnLogout').on('click', function() {
// 		$.ajax({
// 			url: '/logout',
// 			method: 'POST'
// 		});
// 		window.location.reload();
// 	});
// 	// Регистрация
// 	$('.signup-form').on('submit', function() {
// 		var form = $(this);	

// 		$('.alert-danger').addClass('hidden');
// 		$.ajax({
// 			url: "/signup",
// 			method: "POST",
// 			data: form.serialize(),
// 			error: function() {
// 				$('.alert-danger').removeClass('hidden');
// 			},
// 			statusCode: {
// 				200: function() {
// 					window.location.href = '/signin';
// 				},
// 			}
// 		});
// 		return false;
// 	});

// 	// listOfProject
// 	// Список проектов пользователя, выделение, генерация события с информацией о том какой проект выделен
// 	if ($('#listOfProjects').length) { // Если присутствует компонент ListOfProjects, то загружаем список проектов и вешаем обработчики
// 		// 1. ГЕТ запросом получить список проектов пользователя
// 		// 2. Отобразить список
// 		// 3. Повешать обработчики
// 		$.ajax({
// 			url: "/projects",
// 			method: "get",
// 			ifModified: false,
// 			statusCode: {
// 				200: function(data) {
// 					showListOfProjects(data); // 2. Отобразить список
// 					// console.log(data);
// 				}
// 			},
// 			error: function(err) {
// 				console.log(err);
// 			}
// 		});

// 		function showListOfProjects(projects) {
// 			var textOfEmpty = $('#textOfEmpty');
// 			var listOfProjects = $('#listOfProjects');
// 			// Список проектов пуст?
// 			if (!projects.length) {
// 				// Список проектов пуст
// 				textOfEmpty.removeClass('hidden').addClass('show');
// 				listOfProjects.removeClass('show').addClass('hidden');
// 				return;
// 			}
// 			// Список полон
// 			textOfEmpty.removeClass('show').addClass('hidden');
// 			listOfProjects.removeClass('hidden').addClass('show');

// 			var name, progress, tbody, id
// 			projects.forEach(function(element, index, array) {
// 				id = element._id
// 				name = element.name;
// 				progress = Math.round(element.progress * 100);
// 				tbody = listOfProjects.children('tbody').append(createRow(id, index+1, name, progress));
// 				// console.log(id, index+1, name, progress);
// 			});

// 			// 3. Повешать обработчики
// 			// Обработка кликов и наведений на строках
// 			$('#listOfProjects').on({
// 				click: function() {
// 					// Выделение
// 						// Если клик по выделеному
// 					if ($(this).hasClass('bg-selected') === true) {
// 						// Убрать выделение, выход из функции
// 						$(this).removeClass('bg-selected');
// 						// $('.inspect-panel').empty();
// 						// Событие - не выбран проект
// 						$('#listOfProjects').trigger('projectUnSelect', $(this).attr('id'));
// 						return;
// 					}

// 					$(this).siblings('.bg-selected').removeClass('bg-selected');
// 					$(this).addClass('bg-selected');
// 					// Событие - выбран проект
// 					$('#listOfProjects').trigger('projectSelect', $(this).attr('id'));

// 					// $(this).find('.progress-bar').addClass('progress-bar-info');

// 					$(this).removeClass('active');
// 					// // Появление inspect-panel
// 					// var data = getInspectPanelData($(this).attr('id'));
// 					// $('.inspect-panel').html(createInspectPanelBody(data));
// 				},
// 				mouseenter: function() {
// 					if ($(this).hasClass('bg-selected') === false) {
// 						$(this).addClass('active');
// 					}
// 				},
// 				mouseleave: function() {
// 					$(this).removeClass('active');
// 				},
// 				//Блокировака/разблокировка кнопок редактирования
// 				// rowSelect: function() {
// 				// 	$('.lockable').removeClass('disabled');
// 				// },
// 				// rowUnselect: function() {
// 				// 	$('.lockable').addClass('disabled');
// 				// }
// 			}, 'tbody > tr');

// 		}

// 		// Возвращает строку списка проектов с подставленными значениями
// 		function createRow (id, number, name, progress) {
// 			name = name.slice(0, 49);
// 			return '<tr id="' + id + '">\
// 					<td>' + number + '</td>\
// 					<td>' + name + '</td>\
// 					<td>' + createProgressBar(progress) + '</td>\
// 					</tr>)';
// 		}
// 		// Прогрессбар
// 		function createProgressBar (value) {
// 			return '<div class="progress">\
// 						<div class="progress-bar"\
// 							 role="progressbar"\
// 							 aria-valuenow="' + value + '" \
// 							 aria-valuemin="0" \
// 							 aria-valuemax="100" \
// 							 style="width: '+ value + '%;">\
// 							' + value + '%\
// 						</div>\
// 					</div>';
// 		}
// 	}

// 	// Кнопка создания проекта
// 	// Состоит из кнопки сбоку и модали, появляющейся при клике на кнопку
// 	// Обработчик на клик, по кнопке в модале
// 	$('#btnAddNewProject').on('click', function() {
// 		var name = $('#NameOfNewProject').val();
// 		// Отправляем имя на сервер
// 		$.ajax({
// 			url: '/projects',
// 			method: 'post',
// 			data: {'name': name},
// 			statusCode: {
// 				200: function() {
// 					window.location.reload();
// 				},
// 			}
// 		});
// 	});

// 	// inspect panel
// 	// Клик по строке, вызывает появление кнопки, клик по которой открывает страницу выбранного проекта

// 	$('#listOfProjects').on('projectSelect', function(event, id) {
// 		$('#inspectPanel').html(createInspectPanel(id));
// 	});

// 	$('#listOfProjects').on('projectUnSelect', function(event, id) {
// 		$('#inspectPanel').empty();
// 	});

// 	function createInspectPanel(id) {
// 		return '<a href="/projects/' + id +'" class="btn btn-default btn-md text-left">\
// 					<span class="glyphicon glyphicon-folder-open"></span>\
// 					Открыть проект...\
// 				</a>\
// 				<hr>';
// 	}

// 	// listOfTasks

// 	/*
// 		Список задач, конкретного проекта
// 		он позволяет добавлять, удалять, копировать, переименовывать задачи
// 		он выделяет задачу, которая может быть открыта с помощью инспект панели

// 	*/

// 	/*
// 		Инициализация списка задач
// 		1. Получение списка задач
// 			Отправляет >> Гет запрос на /project/:id/task
// 			Получает << Массив данных задач проекта

// 		2. Отображение списка задач
// 	*/

// 	$(document).ready(function() {
// 		getTasks(function(err, tasks) {
// 			if (err) throw new Error('Ошибка загрузки');
// 			help(function(help) {
// 				initListOfTasks(tasks, help, function() {
// 					createHandlers();
// 					// console.log(help);
// 				});
// 			});
// 		});
// 	});

// 	function help(callback) {
// 		var url = window.location.href + '/help';
// 		$.ajax({
// 			url: url,
// 			method: 'post',
// 			statusCode: {
// 				200: function(data) {
// 					callback(data);
// 				},
// 			}
// 		});
// 	}
// 	// Отображение таблицы
// 	function initListOfTasks (tasks, help, callback) {
// 		var tableTasks = $('.table-tasks');
// 		var tbody = tableTasks.find('tbody');
// 		// console.log(tableTasks);
// 		createInitials(help.team, function(intials) {
// 			if (tasks.length) { // Если список задач не пуст
// 				// console.log(tbody);
// 				tasks.forEach(function(elem, index, array) {
// 					var id = elem._id,
// 						number = index + 1,
// 						name = elem.name,
// 						row = createRowTask(id, number, name, intials);
// 						tbody.append(row);
// 				});
// 			}

// 			tbody.append(createRowAddTask());
// 			tableTasks.removeClass('hidden');

// 			callback(tasks);
// 		});

// 	}

// 	//Возвращает строку '<tr>...<tr>' с подставленными параметрами - номер, название
// 	function createRowTask(id, number, name, members) {
// 			return '<tr id="' + id + '">\
// 						<td>' + number + '</td>\
// 						<td>' + name + '</td>\
// 						<td>' + members + '</td>\
// 						<td>' + 'Статус' + '</td>\
// 						<td>' + 'Действие' + '</td>\
// 						</tr>';		
// 	}
// 	function createRowAddTask() {
// 		return  '<tr class="rowAddTask">\
// 				  	<td><span class="glyphicon glyphicon-plus btnAddTaskPlus"></span>\
// 						<span class="glyphicon glyphicon-ok btnAddTaskOk hidden"></span>\
// 						<span class="glyphicon glyphicon-remove btnAddTaskCancel hidden"></span>\
// 				  	</td>\
// 				  	<td class="tdInputName" colspan="4">\
// 				  		<input type="text" class="form-control inputNameNewTask hidden">\
// 				  	</td>\
// 				</tr>';
// 	}
// 	// Возвращает прямоугольник с инициалами
// 	function createInitials(ids, callback) {
// 		// ids = ['58e14f0e0927a71320973dc6', '58ea06c598c6141100e79354'];
// 		var data_send = JSON.stringify(ids);
// 		$.ajax({
// 			url: '/user/names',
// 			method: 'post',
// 			data: { "ids": data_send },
// 			statusCode: {
// 				200: function(users) {
// 					createElementsInitials(users, function(res) {
// 						if (!res) res = 'Нет';
// 						else res = res.join('');
// 						callback(res);
// 					});
// 				},
// 				400: function(err) {
// 					throw err;
// 				},
// 				500: function(err) {
// 					throw err;
// 				}
// 			}
// 		});
// 	}

// 	function createElementsInitials(names, callback) {
// 		var initials = names.map(function(element, index) {
// 			var tmp = element.split(' ').map(function(el) {
// 								return el[0];
// 							});
// 			return tmp.join('');
// 		});
// 		var elements = [];
// 		elements = initials.map(function(element, index) {
// 			var html = '<div class="tooltip-init mini-initials" data-toggle="tooltip" ' +
// 					'title="' + names[index] +'">' +
// 					element +'</div>';
// 			return html;
// 		});
// 		callback(elements);
// 	}

// 	// Создает обработчики блока list-of-task
// 	function createHandlers() {
// 		$('.tooltip-init').tooltip(); // тултипы
// 		/* 
// 		Нижняя строка добавления задачи
// 		*/

// 		// Изменение размера значка '+', при наведении на строку
// 		$('.rowAddTask').hover(
// 		function() {
// 			$('.btnAddTaskPlus').addClass('scaleHover');
// 		},
// 		function() {
// 			$('.btnAddTaskPlus').removeClass('scaleHover');
// 		});
// 		$('.rowAddTask').mousedown(function() {
// 			$('.btnAddTaskPlus').addClass('scaleActive');
// 		});
// 		$('.rowAddTask').mouseup(function() {
// 			$('.btnAddTaskPlus').removeClass('scaleActive');
// 		});

// 		// Активация режима ввода
// 		$('.rowAddTask').one('click', startEnter);// Выполнится один раз, потому что нужно будет обрабатывать клики по элементам строки
// 		function startEnter() {
// 			$('.inputNameNewTask').removeClass('hidden').focus();
// 			$('.btnAddTaskPlus').addClass('hidden');
// 			$('.btnAddTaskOk').removeClass('hidden');
// 			$('.btnAddTaskCancel').removeClass('hidden');
// 		}

// 		// Деактивация режима ввода - потеря фокуса
// 		$(document).click(function(event) {
// 			if ($(event.target).closest('.rowAddTask').length) return;
// 			inputEnd(event);
// 			event.stopPropagation();
// 		});
// 		function inputEnd(event) {
// 			event.stopPropagation(); // Завершение передачи события click вверх по дереву, иначе активация будет вызвана моментально
// 			$('.rowAddTask').one('click', startEnter);// Переназначении активации
// 			$('.inputNameNewTask').val('');
// 			$('.inputNameNewTask').addClass('hidden');
// 			$('.btnAddTaskPlus').removeClass('hidden');
// 			$('.btnAddTaskOk').addClass('hidden');
// 			$('.btnAddTaskCancel').addClass('hidden');
// 		}

// 		// Завершение ввода - ок
// 		$('.btnAddTaskOk').click(function(event) {
// 			var name = $('.inputNameNewTask').val();
// 			if (!name) return inputEnd(event);// Поле пустое - выход
// 			var tbody = $('.table-tasks').find('tbody');
// 			var lastRow = tbody.find('.rowAddTask').prev().attr('id');
// 			console.log(lastRow);
// 			createTask({ "name": name, prev: lastRow }, function(err, id) {
// 				if (err) {
// 					inputEnd(event);
// 					return new Error(err);
// 				}
// 				var tbody = $('.table-tasks').find('tbody');
// 				var lastIndex = +tbody.find('.rowAddTask').prev().children().first().text() + 1;
// 				$('.rowAddTask').before(createRowTask(id, lastIndex, name));
// 			});
// 			inputEnd(event);
// 		});

// 		// Завершение ввода - отмена
// 		$('.btnAddTaskCancel').click(inputEnd);

// 		// Вызов модали создания задачи
// 		$('#show-modal-create-task').on('click', function() {
// 			var opt = $('#position-post');
// 			getTasks(function(err, res) {
// 				if (err) return new Error(err);
// 				if (res) {// Список не пуст
// 					res.forEach(function(element, index, array) {
// 						var t = '<option value="' + element._id + '">\
// 								' + (index+1) + '. \
// 								' + element.name + '</option>';
// 						opt.append(t);
// 					});
// 					$('#position-post').selectpicker('refresh');
// 				}	
// 			});
// 			// Заполнение списка участников проекта
			
// 			var select = $('#members');
// 			getProject(function(err, res) {
// 				if (err) return new Error(err);
// 				if (res) {
// 					res.team.forEach(function(id) {
// 						getUser(id, function(err, user) {
// 							if (err) throw new Error(err);
// 							if (user) {
// 								var t = '<option value="' + user._id + '">\
// 										' + user.name + ' ' + user.surname +'</option>';
// 								select.append(t);
// 								select.selectpicker('refresh');
// 							}
// 						});
// 					});
// 				}
// 			});

// 			$('#list-of-task_modals_create-task').modal('show');
// 		});

// 		// Очистка селектпикера с задачами при закрытии модали
// 		$('#list-of-task_modals_create-task').on('hide.bs.modal', function() {
// 		  	$('#position-post').empty();
// 		  	$('#members').empty();
// 		  	$('#name').val('');
// 		  	$('#description').val('');
// 		  	$('#datepicker').val('');
// 		});

// 		// Автофокус в модальном окне на первом поле
// 	    $('#list-of-task_modals_create-task').on('shown.bs.modal', function() {
// 		  	$(this).find('input:first').focus();
// 		});

// 		// Обработка нажатия кнопки сохранить в модали
// 		$('#btnCreateTask').on('click', function() {
// 			var modal = $('#list-of-task_modals_create-task');
// 			var task = {};
// 			task.name = modal.find('#name').val();
// 			if (!task.name) {
// 				alert('Введите название');
// 				return;
// 			}
// 			task.description = modal.find('#description').val();
// 			var dueDate = modal.find('#datepicker').val();
// 			if(dueDate) {
// 				task.date = new Date(dueDate);
// 			}
// 			task.state = modal.find('#status').val();
// 			var membersSelected = modal.find('#members option:selected');
// 			var members = [];
// 			membersSelected.each(function(index, elem) {
// 				members.push($(elem).val());
// 			});
// 			task.members = JSON.stringify(members);
// 			// console.log(JSON.stringify(task.members));

// 			var selectedPre = modal.find('#position-pre').find('option:selected').val();
// 			var selectedPost = modal.find('#position-post').find('option:selected').val();
// 			if (!selectedPost) {
// 				getTasks(function(err, res) {
// 					if (err) throw err;
// 					res.some(function(el) {
// 						if (!el.next) {
// 							task.prev = el._id;
// 							task.next = null;
// 							console.log(task.prev);
// 							// отправка на сервер
// 							console.log(task);
// 							createTask(task, function(err, id) {
// 								console.log(err, id);
// 								window.location.reload();
// 							});
// 							return true;
// 						}
// 					});
// 				});
// 			} else if (selectedPre === 'after') {
// 				task.prev = selectedPost;
// 				task.next = null;

// 				// отправка на сервер
// 			console.log(task);
// 			createTask(task, function(err, id) {
// 				console.log(err, id);
// 				window.location.reload();

// 			});
// 			} else if (selectedPre === 'before') {
// 				getTasks(function(err, res) {
// 					if (err) throw err;
// 					res.some(function(el) {
// 						if (el._id === selectedPost) {
// 							console.log('Выбрано - перед задачей', el.name);
// 							task.prev = el.prev;
// 							console.log('task.prev =', el.prev);
// 							if (!task.prev) task.prev = null;
// 							task.next = null;
// 										// отправка на сервер
// 										console.log(task);
// 								createTask(task, function(err, id) {
// 									console.log(err, id);
// 									window.location.reload();
// 								});
// 							return true;
// 						}
// 					});
					
// 				});
// 			}
// 			$('#list-of-task_modals_create-task').modal('hide');
// 		});

// 		// Обработка кликов и наведений на строках
// 		$('.list-of-tasks').on({
// 			click: function() {
// 				// Выделение
// 					// Если клик по выделеному
// 				if ($(this).hasClass('bg-selected') === true) {
// 					// Убрать выделение, выход из функции
// 					$(this).removeClass('bg-selected');
// 					// $('.inspect-panel').empty();
// 					// Событие - снятие выделения
// 					$('.list-of-tasks').trigger('taskUnSelect', $(this).attr('id'));
// 					return;
// 				}

// 				$(this).siblings('.bg-selected').removeClass('bg-selected');
// 				$(this).addClass('bg-selected');
// 				// Событие - выбрана задача
// 				$('.list-of-tasks').trigger('taskSelect', $(this).attr('id'));
// 				$(this).removeClass('active');
// 			},
// 			mouseenter: function() {
// 				if ($(this).hasClass('bg-selected') === false) {
// 					$(this).addClass('active');
// 				}
// 			},
// 			mouseleave: function() {
// 				$(this).removeClass('active');
// 			},
// 		}, 'tbody > tr');
// 	}


// 	/*
// 			Функции обращающиеся к серверу:
// 		getUser - получает указанного пользователя
// 		getPrject - получает текущий проект
// 		getTasks - возвращает массив объектов, каждый объект - это документ задачи из БД
// 		createTask - получает параметры задачи, обязательно name, prev=null, next=null, возвращает id созданной задачи
// 		deleteTask - удаляет задачу по ее id
// 		updateTask - изменяет задачу
// 	*/
// 	function getUser(id, callback) {
// 		url = '/user/' + id;
// 		$.ajax({
// 			url: url,
// 			method: "get",
// 			ifModified: false,
// 			statusCode: {
// 				200: function(data) {
// 					callback(null, data);
// 				}
// 			},
// 			error: function(err) {
// 				callback(err);
// 			}
// 		});
// 	}

// 	function getProject(callback) {
// 		url = window.location.href;
// 		$.ajax({
// 			url: url,
// 			method: "get",
// 			ifModified: false,
// 			statusCode: {
// 				200: function(data) {
// 					callback(null, data);
// 				}
// 			},
// 			error: function(err) {
// 				callback(err);
// 			}
// 		});
// 	}

// 	function getTasks(callback) {
// 		url = window.location.href + '/task';
// 		$.ajax({
// 			url: url,
// 			method: 'get',
//   			cache: false,
//   			statusCode: {
//   				200: function(data) {
//   					callback(null, data);
//   				},
//   				400: function(data) {
//   					callback(data);
//   				},
//   				500: function(data) {
//   					callback(data);
//   				}
//   			}
// 		});
// 	}

// 	function createTask(task, callback) {
// 		if (!task.name) return callback(new Error("Имя забыл"));
// 		if (!task.prev) task.prev = null;
// 		if (!task.next) task.next = null;


// 		url = window.location.href + '/task';
// 		$.ajax({
// 			url: url,
// 			method: 'post',
// 			data: task,
//   			cache: false,
//   			statusCode: {
//   				200: function(data) {
//   					callback(null, data);
//   				},
//   				400: function(data) {
//   					callback(data);
//   				},
//   				500: function(data) {
//   					callback(data);
//   				}
//   			}
// 		});
// 	}

// 	function deleteTask(id, callback) {
// 		if (!id) return callback(new Error("required Id"));

// 		url = window.location.href + '/task/delete';
// 		$.ajax({
// 			url: url,
// 			method: 'post',
// 			data: { "id": id },
//   			cache: false,
//   			statusCode: {
//   				200: function(data) {
//   					callback(null);
//   				},
//   				400: function(data) {
//   					callback(data);
//   				},
//   				500: function(data) {
//   					callback(data);
//   				}
//   			}
// 		});

// 	}

// 	function updateTask(task, callback) {
// 		if (!task) return callback(new Error("Не пераданы новые значения"));
// 		if (!task.id) return callback(new Error("Не передан Id изменияемой задачи"));
		
// 		url = window.location.href + '/task/update';
// 		$.ajax({
// 			url: url,
// 			method: 'post',
// 			data: task,
//   			cache: false,
//   			statusCode: {
//   				200: function(data) {
//   					callback(null, data);
//   				},
//   				400: function(data) {
//   					callback(data);
//   				},
//   				500: function(data) {
//   					callback(data);
//   				}
//   			}
// 		});

// 	}
// 	window.getUser = getUser;
// 	window.createTask = createTask;
// 	window.createInitials = createInitials;
// })();