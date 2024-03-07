let isLight = localStorage.getItem('theme') === 'light' ? true : false;
const html = document.documentElement;
const switchTheme = document.getElementById('theme_switcher');
const sun = '<span class="material-symbols-outlined">light_mode</span>';
const moon = '<span class="material-symbols-outlined">dark_mode</span>';

document.addEventListener('DOMContentLoaded', () => {
  updateIcon();
  html.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
  switchTheme.setAttribute('data-tooltip', 'Switch Theme');
  switchTheme.setAttribute('data-placement', `bottom`);
  removeTooltip(3000);
});

switchTheme.addEventListener('click', (e)=> {
  e.preventDefault();
  isLight = !isLight;
  const theme = isLight ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  html.setAttribute('data-theme', theme);
  updateIcon();
  switchTheme.setAttribute('data-tooltip', `${isLight ? 'Light' : 'Dark'} Mode`);
  switchTheme.setAttribute('data-placement', `bottom`);
  removeTooltip();
});

const updateIcon = () => {
  switchTheme.innerHTML = isLight ? sun : moon;
	var spanElements = document.querySelectorAll('.material-symbols-outlined');
};

const removeTooltip = (timeInt = 1750) => {
  setTimeout(()=>{
    switchTheme.blur();
  }, timeInt);
};
