async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function formatNumber(num) {
  if (typeof num !== 'number') return '—';
  return new Intl.NumberFormat().format(num);
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (_) {}
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? 'Switch to dark' : 'Switch to light';
}

function initTheme() {
  let theme = 'dark';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
  } catch (_) {}
  applyTheme(theme);
}

async function init() {
  const input = document.getElementById('country-input');
  const datalist = document.getElementById('country-list');
  const toggle = document.getElementById('theme-toggle');

  const flag = document.getElementById('flag');
  const capital = document.getElementById('capital');
  const region = document.getElementById('region');
  const population = document.getElementById('population');
  const area = document.getElementById('area');
  const languages = document.getElementById('languages');
  const currencies = document.getElementById('currencies');
  const timezones = document.getElementById('timezones');

  initTheme();
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  try {
    const countries = await fetchJSON('/api/countries');
    datalist.innerHTML = countries
      .map(c => `<option value="${c.name.replace(/\"/g, '&quot;')}" data-code="${c.code || ''}"></option>`) 
      .join('');

    const defaultName = input && input.value ? input.value.trim() : 'India';
    if (input && defaultName) {
      loadForValue(defaultName);
    }
  } catch (err) {
    datalist.innerHTML = '<option value="Failed to load countries"></option>';
    console.error(err);
  }

  async function loadForValue(value) {
    if (!value) return;
    const opts = Array.from(datalist.options || []);
    const match = opts.find(o => o.value === value);
    const code = match && match.getAttribute('data-code');
    try {
      const query = code ? `code=${encodeURIComponent(code)}` : `name=${encodeURIComponent(value)}`;
      const data = await fetchJSON(`/api/country?${query}`);

      flag.src = data.flag_svg || data.flag_png || '';
      flag.style.display = data.flag_svg || data.flag_png ? 'block' : 'none';

      capital.textContent = data.capital || '—';
      region.textContent = data.region || '—';
      population.textContent = formatNumber(data.population);
      area.textContent = data.area ? `${formatNumber(data.area)} km²` : '—';
      languages.textContent = data.languages || '—';
      currencies.textContent = data.currencies || '—';
      timezones.textContent = data.timezones || '—';
    } catch (err) {
      console.error(err);
      capital.textContent = region.textContent = population.textContent = area.textContent = languages.textContent = currencies.textContent = timezones.textContent = '—';
      flag.style.display = 'none';
    }
  }

  if (input) {
    input.addEventListener('change', () => loadForValue(input.value.trim()));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadForValue(input.value.trim());
    });
  }
}

window.addEventListener('DOMContentLoaded', init);


