// create namespace for our app
var app = {};

// Models
//--------------
app.Todo = Backbone.Model.extend({
	defaults: {
		title: '',
		completed: false
	},
	toggle: function(){
		this.save({completed:!this.get('completed')});
	}
});


// Collections
//--------------
app.TodoList = Backbone.Collection.extend({
	model: app.Todo,
	localStorage: new Store("backbone-todo"),
	completed: function(){
		return this.filter(function(todo){
			return todo.get('completed');
		});
	},
	remaining: function(){
		return this.without.apply(this, this.completed());
	}
});

app.todoList = new app.TodoList();

// Views
//--------------

// renders individual todo items list (li)
app.TodoView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#item-template').html()),
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.input = this.$('.edit');
		// enable chained calls
		return this;
	},
	initialize: function(){
		this.model.on('change', this.render, this);
		// remove: Convenience Backbone's function for removing the view from the DOM.
		this.model.on('destroy', this.remove, this);
	},
	events: {
		'dblclick label' : 'edit',
		'keypress .edit' : 'updateOnEnter',
		'blur .edit' : 'close',
		'click .toggle': 'toggleCompleted',
		'click .destroy': 'destroy'
	},
	edit: function(){
		this.$el.addClass('editing');
		this.input.focus();
	},
	close: function(){
		var value = this.input.val().trim();
		if (value){
			this.model.save({title:value});
		}
		this.$el.removeClass('editing');
	},
	updateOnEnter: function(e){
		if (e.which == 13){
			this.close();
		}
	},
	toggleCompleted: function(){
		this.model.toggle();
	},
	destroy: function(){
		this.model.destroy();
	}
});

// renders the full list of todo items calling TodoView for each one.
app.AppView = Backbone.View.extend({
	el: '#todoapp',
	initialize: function(){
		this.input = $('#new-todo');
		app.todoList.on('add', this.addAll, this);
		app.todoList.on('reset', this.addAll, this);
		// Loads list from local storage
		app.todoList.fetch();
	},
	events: {
		'keypress #new-todo': 'createTodoOnEnter'
	},
	createTodoOnEnter: function (e) {
		// ENTER_KEY = 13
		if (e.which !== 13 || !this.input.val().trim()) {
			return;
		}
		app.todoList.create(this.newAttributes());
		// clean input box
		this.input.val('');
	},
	addOne: function(todo){
		var view = new app.TodoView({model: todo});
		$('#todo-list').append(view.render().el);
	},
	addAll: function(){
		// clean the todo list
		this.$('#todo-list').html('');
		// filter todo item list
		switch(window.filter){
			case 'pending':
				_.each(app.todoList.remaining(), this.addOne);
				break;
			case 'completed':
				_.each(app.todoList.completed(), this.addOne);
				break;
			default:
				app.todoList.each(this.addOne, this);
				break;
		}
	},
	newAttributes: function(){
		return {
			title: this.input.val().trim(),
			completed: false
		}
	}
});

// Routers
//--------------
app.Router = Backbone.Router.extend({
	routes: {
		'*filter' : 'setFilter'
	},
	setFilter: function (params) {
		window.filter = params.trim() || '';
		app.todoList.trigger('reset');
	}
});

// Initializers
//--------------
app.router = new app.Router()
Backbone.history.start();
app.appView = new app.AppView();