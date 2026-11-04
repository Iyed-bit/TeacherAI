  const toggle = document.getElementById('toggleDark');
  const body = document.querySelector('body');
  const logo = document.querySelector('.logo');
  const title = document.querySelector('.main-title');
  const subtitle = document.querySelector('.subtitle');
  const mainTitle = document.getElementById('main-title-js');

  toggle.addEventListener('click', function(){
      this.classList.toggle('bi-moon');
      if(this.classList.toggle('bi-brightness-high-fill')){
          body.style.background= '#435152';
          body.style.color = '#d6d0d0';
          body.style.transition = '1s';
          body.classList.remove('light-mode');
          title.innerHTML = '<img class="teacherImage" src="images/blacTeacherAiF.png">';
          subtitle.style.color = 'rgb(186, 186, 62)';
          mainTitle.style.borderBottom ='1px solid white';

      }else{
          body.style.background = '#d6d0d0';
          body.style.color = 'black';
          body.classList.add('light-mode');
          title.innerHTML = '<img class="teacherImage" src="images/teacherAiBlueUnderline.png">';
          subtitle.style.color = '#1f373d';
          body.style.transition = '1s';
          mainTitle.style.borderBottom ='1px solid black';


      }
  });