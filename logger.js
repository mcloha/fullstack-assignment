function log(record) {
  let cssClasses = {
    note: 'alert alert-light',
    error: 'alert alert-danger',
    success: 'alert alert-success'
  };
  $('#logs').prepend('<li class="' + cssClasses[record.type] + '">' + record.message + '</li>');
}