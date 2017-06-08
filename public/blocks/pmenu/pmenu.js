'use strict';
$(function() {
  const con = new __control();
  const el = con.getElem();
  el.appendTo('.pmenu__control');
  $.post(
    '/projects/get',
    function(data, textStatus, jqXHR) {
      if (textStatus === 'success') {
        const list = new __list( { projects: data } );
        con.setList(list);
        list.getElem().appendTo('.pmenu__list');
      }
    }
  );
});