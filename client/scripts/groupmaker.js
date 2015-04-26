var groupMaker = (function (){
  
    var obj = {
      initializeApplication: function(){
        mvc.model.construct('rosterModel', attending);
        mvc.view.construct('groupsView', 
          '<div class="col-md-3">'+
            '<div class="panel panel-default">'+        
              '<div class="panel-heading">'+          
                '<div class="panel-title" mvc-render="\'Group \' + value.groupNumber">'+
                '</div>'+
              '</div>'+
              '<div class="panel-body">'+
                '<mvc-component mvc-attr="which=\'group-\' + value.groupNumber"></mvc-component>'+
              '</div>'+
            '</div>'+
          '</div>'
          );
        mvc.view.construct('rosterView', 
        '<li class="list-group-item names" mvc-attr="title=value.bio || \'I did not bother writing a bio\'">'+ 
          '<p class="text-center">'+
            '<img class="thumbnail-photo pull-left" mvc-attr="src=value.photo.thumb_link">'+
            '<a mvc-attr="href=value.profile_url" target="_blank" mvc-render="value.name" class="name-tag">'+
            '</a>'+ 
            '<span mvc-render="parseInt(value.answers[0].answer) || 0" class="badge pull-right alert-info">'+
            '</span>'+
          '</p>'+
        '</li>'
        );
        mvc.update({
          model: 'rosterModel',
          toView: 'rosterView',
          component: 'roster'
        });
      }
    };
  var args = Array.prototype.slice.call(arguments);
  while(args.length > 0){
    var a = args.shift();
    for (var prop in a){
      obj[prop] = a[prop];
    }
  }
  return obj;
})(apis, helperFunctions);
