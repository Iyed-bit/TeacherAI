document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".calculator-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".container")?.classList.toggle("transform-visible");
    });
  });
});
// async function sendRequest(input, output) {
//   let content = '';      
//   if (input =='.main-input' || input == '.pdf-input'){
//         content = document.querySelector(input).value;
//         document.querySelector(output-container) += `<div class="main-output"></div>`;
//       }

//   else{
//     content = document.querySelector(input).innerText;
//   }

//   console.log(content)
//   try {
//       document.querySelector(output).innerText = "Loading.../"
//       const response = await fetch('http://localhost:3000/api/chat', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ content }),
//       });

//       if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//       }

          
//           const result = await response.json();
          
//           console.log(result);

//           document.querySelector(output).innerText = result?.output;
//       } catch (error) {
//           console.error('Error:', error);
//           document.querySelector(output).innerText = 'Error occurred.';
//       }
//       document.querySelector(".main-input").value = "";
//   }