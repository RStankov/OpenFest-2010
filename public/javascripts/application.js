$(document).bind("action:error", function(e, errorMessage){
  OpenFest.errorMessage(errorMessage);
});

$(document).delegate('[data-action="preview"]', "click", function(e){
  e.preventDefault();
  OpenFest.preview($(this).attr("href"));
});

$(document).delegate('[data-method="delete"]', "click", function(e){
  e.preventDefault();
  var element = $(this);
  if (OpenFest.confirm(element.data("confirm"))){
    $.ajax({
      url:  element.attr("href"),
      type: "DELETE"
    });
    element.trigger("action:delete");
  }
});

$(document).delegate("[data-sortable-url]", "action:reorder", function(e, data){
  $.ajax({
    url:  $(this).data("sortable-url"),
    type: "PUT",
    data: data
  });
});

var OpenFest = {
  createDynamicWidget: function(widget, options){
    widget  = $(widget);
    options = jQuery.extend({ list: "ol", item: "li" }, options || {});

    var list = widget.children(options.list);

    widget.bind("action:insert", function(e, content){
      list.prepend(content);
    });

    widget.delegate(options.item, "action:delete", function(){
      $(this).remove();
    });

    list.sortable({
      placeholder: "ui-state-highlight",
      update:      function(){ list.trigger("action:reorder", $(this).sortable("serialize")); }
    });
  },
  confirm: function(question){
    return !question || confirm(question);
  },
  errorMessage: function(errorMessage){
    alert(errorMessage);
  },
  preview: function(image){
    var overlay = $('<div class="overlay"></div>');

    overlay.click(function(){
      overlay.html("").hide();
    });

    overlay.appendTo(document.body);

    (OpenFest.preview = function(src){
      overlay.prepend(getImage(src)).show();
    })(image);

    function getImage(src){
      var image = new Image();

      image.src = src;
      image.style.visibility = "hidden";
      image.onload = function(){
        setTimeout(function(){
          image.onload = null;
          $(image).css({
            visibility: "visible",
            top:        Math.max(0, ($(window).height() - image.height) / 2) + "px",
            left:       Math.max(0, ($(window).width()  - image.width)  / 2) + "px"
          });
        }, 1);
      };

      return image;
    }
  }

};

OpenFest.createDynamicWidget("#images_widget");

$.fileUploadSupported && $('#new_image').submit(function(e){
  var form  = $(this),
      file  = form.children('input[type="file"]'),
      files = file[0].files;

  if (files && files.length > 0){
    $.uploadFile({
      url:        form.attr("action"),
    	type:       form.attr("method").toUpperCase(),
      dataType:   "html",
      name:       file.attr("name"),
      beforeSend: function(){       form.css("opacity", "0.4").children(":input").attr("disabled", "disabled"); },
      complete:   function(){       form.css("opacity", "1").children(":input").removeAttr("disabled");         },
      error:      function(xhr){    xhr.status == 422 && form.trigger("action:error", xhr.responseText);        },
      success:    function(html){   form.trigger("action:insert", html);                                        },
    }, files[0]);
  }
  this.reset();

  return false;
});