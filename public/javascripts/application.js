$("#images_widget").each(function(){
  var widget = $(this),
      images  = widget.children("ol");

  widget.bind("action:insert", function(e, content){
    images.prepend(content);
  });

  widget.bind("action:error", function(e, errorMessage){
    alert(errorMessage);
  });

  widget.delegate('[data-method="delete"]', "click", function(e){
    e.preventDefault();
    var element = $(this);
    if (confirm(element.data("confirm"))){
      $.ajax({
        url:  element.attr("href"),
        type: "DELETE"
      });
      element.parents("li").remove();
    }
  });

  widget.delegate('[data-action="preview"]', "click", function(e){
    e.preventDefault();
    preview($(this).attr("href"));
  });
});

function preview(image){
  var overlay = $('<div class="overlay"></div>');

  overlay.click(function(){
    overlay.html("").hide();
  });

  overlay.appendTo(document.body);

  (preview = function(src){
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