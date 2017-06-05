/*
	Обрабатывает xhr запросы /projects/:id/

*/
var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);
var User = require('../models/user').User;
var Project = require('../models/project').Project;
var async = require('async');
var Task = require('../models/task').Task;


/*
	Получает объект с полями:
			* - должно присутствовать обязательно, иначе возврат ошибки
		*name:
		description: 
		dueDate: 
		state: //completed, planning, queue, pastdue, canceled
		*next: ObjectId
		*prev: ObjectId
		members: [ObjectId]
		
		// эти поля заполнятся автоматически
		author: ObjectId
		project: ObjectId
	Если поле prev пусто и поле next пусто, то это первая задача проекта
	Если поле next пусто и поле prev не пусто, то это последняя задача проекта

	1. Сохранить пришедшие данные
	2. Проверить их на валидность
	3. Создать объект задачи
	4. Сохранить данные
	5. Отправить клиенту ид задачи
*/
router.post('/:id/task', function(req, res, next) {
	// if (!req.session.user) return next();
	// Проверка на существование этого проекта
	var id,
		newTask = {
			name: req.body.name,
			description: req.body.description,
			dueDate: req.body.date,
			state: req.body.state,
			next: req.body.next,
			prev: req.body.prev,
			members: req.body.members ? JSON.parse(req.body.members) : [],
			author: req.session.user,
			project: req.params.id
		}
	if (newTask.prev === '') newTask.prev = null;
	if (newTask.next === '') newTask.next = null;

	// Наличие обязательных полей
	if (newTask.name === undefined) {
		res.status(400).json( {"required": "name"} );
		return;
	} else if (newTask.next === undefined) {
		res.status(400).json( {"required": "next=null"} );
		return;
	} else if (newTask.prev === undefined) {
		res.status(400).json( {"required": "prev"} );
		return;
	} else if (newTask.next !== null) {
		res.status(400).json( {"required": "next=null"} );
		return;
	}


	// Создать объект задачи
	console.log(newTask);

	var task = new Task(newTask);
	id = task._id;

	task.save(function(err){
		log.verbose('called task.save');
		log.verbose('new task id =', task._id);
		if (err) return next(err);
		/*
		Необходимо вставить новую задачу в указанное место, и при необходимости воставнновить связность списка
		Алгоритм:
			Если next не равен null то ошибка
			Если prev равен null то
				1 вставить задачу в начало списка
				2 второй задаче установить поле prev на новую задачу
			Если prev не равен null то // Задача prev единственная, последняя, в центре
				1 Сохранить поле next задачи prev // даже если это null
				2 Установить поле next задачи prev на новую задачу
				3 Установить полк next новой задачи на сох next
				4 Если поле next новой задачи != null
					11 установить у задаче next поле prev на новую
		*/
		if (task.prev === null) {
			log.verbose('task.prev === null')
			// Первая задача в списке
			// 1. Найти первую задачу, поле prev первой задачи равно null
			Task.findOne(
				{ project: task.project, prev: null, next: { $ne: null } }, 
				// У первой задачи проекта prev === null, a next !== null
				function(err, docs) {
					if (err) {
						log.debug(err);
						return next(err);
					}
					if (docs) {// Если первый элемент нашелся, то его нужно сдвинуть
					log.verbose('first task id=', docs._id);
					// Такая задача должна быть одна
						Task.link(task._id, docs._id, function(err) {
							if (err) {
								log.debug(err);
								return next(err);
							}
							log.verbose('new task and first task linked');
						});
					} else { // Если ничего не нашлось - либо там один элемент с prev, next = null
					// Либо ничего нет
						Task.findOne(
							{ _id: { $ne: task._id }, project: task.project },
							function(err, doc) {
								if (err) {
									log.debug(err);
									return next(err);
								}
								if (doc) { // В списке был один элемент с prev,next = null
									Task.link(task._id, doc._id, function(err) {
										if (err) {
											log.debug(err);
											return next(err);
										}
										log.verbose('new task and first task linked');
									});
								} // иначе список был пуст и теперь там только один элемент, которому ничего не нужно
							}
						);

					}
				}
			);
		} else {
			log.verbose('task.prev ===', task.prev);
			Task.findById(
				task.prev,
				function(err, prevTask) {
					if (err) {
						log.debug('126',err);
						return next(err);
					}
					log.verbose('find task.prev id=', prevTask._id);
					var nextTask = prevTask.next;
					Task.link(prevTask._id, task._id, function(err) {
						if (err) {
							log.debug(err);
							return next(err);
						}
						log.verbose('prevTask and new task linked');
						if (nextTask) {
							Task.link(task._id, nextTask, function(err) {
								if (err) {
									log.debug(err);
									return next(err);
								}
								log.verbose('new task and prevTask.next linked');
							});
						} // Иначе новая задача последняя
					});
				}
			);
		}
		log.verbose('Task #', id, 'created');
		res.json(id);
	});
});
/*
	Возвращает массив объектов, каждый объект - это одна задача проекта.
	Элементы массива расположены в порядке добавления, а не логического следования задач
*/
router.get('/:id/task', function(req, res, next) {
	log.verbose('request on', req.url)
	if (!req.session.user) return next();
	var id = req.params.id;
	Task.find({ 'project': id }, function(err, tasks) {
		if (err) {
			log.debug(err);
			res.status(500).end();
			return;
		}
		/*
			Порядок эелемнтов массива не соответствует порядку логического следования задач
			Теперь его нужно отсортировать и отдать клиенту получившийся массив
			Существует н-ное количество алгоритмов сортировки связнных списков, но сейчас нет времени разбираться
			Алгоритм:
				1. Найти первый элемент, добавить его в итоговый массив
					первый элемент имеет поле prev равное null
				2. Получить индекс элемента массива, на которое ссылается поле next последнего элемента итогового массива
				3. Повторять 2 пока поле next не станет равным null
				4. Вернуть новый массив
		*/
		if (!tasks) {
			res.json([]);
			return;
		}
		var sortTasks = [];
		tasks.some(function(element, index, array) {
			if (element.prev === null) {
				// Нашли первый элемент в списке
				sortTasks.push(element);// Вставляем первый элемент в итоговый массив
				var next = element.next; // Сохраняем _id следующего элемента
				while(next !== null) { // Пока _id следующего элемента не станет равным null, т.е. последний элемент
					tasks.some(function(element, index, array) {
						if (element._id.toString() == next.toString()) { // Если нашли следующий элемент // _id - объект
							next = element.next; // Сохраняем следующий
							sortTasks.push(element); // Добавляем найденый элемент в итоговый массив
							return true;
						}
						// Если целлостность исходного списка не нарушена и он не кольцевой, 
						// то в нем обязательно будет присутствовать элемент с полем next === null
					});
				}
				return true;
			} // Если task.some вернет false, это будет означать что список пуст
		});

		// if (!tasks) {
		// 	res.status(200).json({ "error": "не такого проекта или список задач пуст" });
		// }
		// console.log(tasks);
		// console.log(sortTasks);
		res.json(sortTasks);
	});
});

/*
	Удаление задачи id, востановление цепочки следования задач
	Алгоритм:
		1. ЕСЛИ поле next равно null и поле prev равно null ТО удалить ее и все
		2. ЕСЛИ поле next равно null а поле prev не равно null ТО
			1.1 У предыдущей задачи очистить поле next
			1.2 Удалить задачу
		3. ЕСЛИ поле prev равно null а next не равно ТО
			1.1 поле prev задачи, на которую указывает поле next удаляемой задачи, сделать равным null
			2.2 удалить задачу
		4. В остальных случаях
			1.1 связать поля prev и next удаляемой задачи
			1.2 удалить задачу

*/
router.post('/:id/task/delete', function(req, res, next) {
	if (!req.session.user) return next();
	var id = req.body.id;
	Task.findById(id, function(err, task) {
		// Что-нибудь нашлось?
		if (!task) {
			res.status(400).json( {"error": 'Нет задачи с таким id'} );
			return;
		// Удаляемый элемент единственный в списке
		} else if (task.next === null && task.prev === null) {
			remove(task);
		}
		// Удаляемый элемент последний и не единственный в списке задач
		if (task.next === null) {
			Task.findByIdAndUpdate(task.prev, { $set: { next: null } }, { new: false }, function(err, prevTasl) {
				if (err) {
					log.debug(err);
					return next(err);
				}
				remove(task);
			});
		// Удаляемый элемент первый и не единственный в списке задач
		} else if (task.prev === null) {
			Task.findByIdAndUpdate(task.next, { $set: { prev: null } }, { new: false }, function(err, nextTask) {
				if (err) {
					log.debug(err);
					return next(err);
				}
				remove(task);
			});
		} else {
			Task.link(task.prev, task.next, function(err) {
				if (err) {
					log.debug(err);
					return next(err);
				}
			});
			remove(task);
		}

	});
	function remove(task) {
		task.remove(function(err) {
			if (err) {
				log.debug(err);
				return next(err);
			}
			log.verbose('Task #', task.id, 'deleted');
			res.status(200).end();
		});
	}
});

/*
	Обновление одного или нескольких полей задачи
		аргументы:
			id - ид изменяемой задачи - обязательное поле
			любые поля, кроме author и project
		пример:
			{
				"id": "...",
				"name": "новое имя",
				"members": ['новый', 'массив', 'идов', 'участников']
			}
	при изменении prev, next - не гарантирует целостность списка задач

*/
router.post('/:id/task/update', function(req, res, next) {
	if (!req.session.user) return next();
	var id = req.body.id;
	if (!id) {
		res.status(400).json({ "error": "id изменяемой задачи не передан" });
		return;
	}
	Task.findByIdAndUpdate(id, { $set: req.body }, { new: false }, function(err, task) {
		if (err) {
			log.debug(err);
			return next(err);
		}
		res.json(task);
	});
});
router.post('/:id/help', function(req, res, next) {
	if (!req.session.user) return next();
	Project.findById(req.params.id, function(err, project) {
		if (err) {
			return next(err);
		}
		res.json({ "team": project.team });
	});
});

module.exports = router;