$(document).ready(function () {
  
  // Modal
  $(".source-button").click(function () {
    $('.small.modal').modal('show');
  });
  // $('.ui.modal').modal('show');

  // Highlight.js settings
  hljs.configure({
    tabReplace: '  ',
    classPrefix: ''
  });

});