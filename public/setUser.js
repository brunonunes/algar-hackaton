function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

console.log("Identify user", {
  id: getParameterByName('user') || null,
  first_name: getParameterByName('first_name') || null
})

Botkit.identifyUser({
  id: getParameterByName('user') || null,
  first_name: getParameterByName('first_name') || null
})
