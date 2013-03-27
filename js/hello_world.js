var AppView = Backbone.View.extend({
	// el - stands for element. Every view has a element associate in with HTML content will be rendered.
	el: '#container',
	// template which has the placeholder 'who' to be substitute later 
	template: _.template("<h3>Hello <%= who %><h3>"),
	// It's the first function called when this view it's instantiated.
	initialize: function(){
		console.log("initialize");
		this.render();
	},
	render: function(){
		// render the function using substituting the varible 'who' for 'world!'. 
		this.$el.html(this.template({who: 'world!'}));
	}
});

var appView = new AppView();