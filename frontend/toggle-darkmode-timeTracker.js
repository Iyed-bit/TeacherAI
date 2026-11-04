  const toggle = document.getElementById('toggleDark');
  const body = document.querySelector('body');
  const logo = document.querySelector('.image-container');
  const title = document.querySelector('h1');
  const subtitle = document.querySelector('section h2');


  toggle.addEventListener('click', function(){
      this.classList.toggle('bi-moon');
      if(this.classList.toggle('bi-brightness-high-fill')){
          body.style.background= '#435152';
          body.style.color = '';
          body.style.transition = '1s';
          body.classList.remove('light-mode');
          title.style.color = 'white';
          logo.innerHTML = '<img class="logo" src="../images/teacherAiImageTimeTracker_prev_ui.png" style="top: 30px; right: 90px; ">';
          subtitle.style.color = '#dbcfb1';
      }else{
          body.style.background = '#d6d0d0';
          body.style.color = 'black';
          body.classList.add('light-mode');
          title.style.color = '#1f373d';
          body.style.transition = '1s';
          logo.innerHTML = '<img class="logo" src="../images/teacherAiBlueUnderline.png" style="top: 29px; right: 108px;  ">'
          subtitle.style.color = '#1f373d';
          
      }
  });