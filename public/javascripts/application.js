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
      error:      function(xhr){    xhr.status == 422 && alert(xhr.responseText);                               },
      success:    function(html){  $("#images_widget ol").prepend(html);                                       },
    }, files[0]);
  }
  this.reset();

  return false;
});