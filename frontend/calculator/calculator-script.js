
let input = localStorage.getItem('teacherai-calculator-input') || '';

displayResult();  


function displayResult(){
  let result = document.querySelector('.main-input');
  result.value = input;
  console.log(input);
}
function concatenate(caracter)
{
  input+=caracter;
  displayResult();
  localStorage.setItem('teacherai-calculator-input',input);
}

function clearResult(){
  let result = document.querySelector('.main-input');
  input = '';
  displayResult();
  localStorage.setItem('teacherai-calculator-input',input);
}