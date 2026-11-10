// BookRift — таныстыру бөлімдерінің интерактиві.
// Ойын, ұпай, рейтинг және сөздік логикасы game.js файлында.
document.addEventListener('DOMContentLoaded', () => {
  const stats = document.querySelectorAll('[data-target]');

  const animateCounter = (element) => {
    const target = Number(element.dataset.target);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((stat) => observer.observe(stat));

  const quotes = [
    '“Кітап – бұл алғашқы бастама, ал ойын – оны мүмкіндіктерге айналдыратын құрал.”',
    '“Оқу – жаңа әлемге кірісудің ең күшті кілті.”',
    '“Әр беттің артында жаңа жанр, жаңа идея және жаңа өмір бар.”',
    '“Кітапты ойынға айналдырған кезде, білім үнемі жеңіске айналады.”'
  ];

  const quoteNode = document.getElementById('daily-quote');
  if (quoteNode) {
    const dayIndex = new Date().getDate() % quotes.length;
    quoteNode.textContent = quotes[dayIndex];
  }

  document.querySelectorAll('button.demo-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.querySelector(`[data-demo-panel="${trigger.dataset.demo}"]`);
      if (!panel) return;
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      trigger.setAttribute('aria-expanded', String(isHidden));
    });
  });

  document.querySelectorAll('.method-demo').forEach((demo) => {
    demo.querySelectorAll('.choice-button').forEach((button) => {
      button.addEventListener('click', () => {
        const result = demo.querySelector('.demo-result');
        const correct = button.dataset.answer === 'correct';
        result.textContent = correct ? 'Дұрыс! Деңгейлерде осындай тапсырмалар күтіп тұр.' : 'Тағы бір рет ойлан!';
        result.dataset.state = correct ? 'success' : 'retry';
      });
    });
  });

  const rouletteButton = document.querySelector('.roulette-button');
  if (rouletteButton) {
    const genres = ['Фантастика', 'Детектив', 'Приключение', 'Поэзия', 'Классика'];
    rouletteButton.addEventListener('click', () => {
      const result = document.querySelector('.roulette-result');
      result.textContent = genres[Math.floor(Math.random() * genres.length)];
    });
  }

  const teamButton = document.querySelector('.team-button');
  if (teamButton) {
    teamButton.addEventListener('click', () => {
      const input = document.querySelector('.team-input input');
      const result = document.querySelector('.team-result');
      const text = input.value.trim();
      result.textContent = text ? `Пікірің модераторға жіберілді: «${text}»` : 'Алдымен бір сөз жазып көр.';
      if (!text) return;
      // Модератор панелі осы тізімнен оқиды (roles.js)
      try {
        const list = JSON.parse(localStorage.getItem('bookrift-feedback') || '[]');
        let who = null;
        const match = document.cookie.match(/(?:^|;\s*)br_user=([^;]*)/);
        if (match) who = JSON.parse(decodeURIComponent(match[1]));
        list.push({
          id: Date.now(),
          text,
          author: (who && who.role) || localStorage.getItem('bookrift-role') || 'student',
          name: who ? `${who.name}${who.class ? ` (${who.class})` : ''}` : null,
          status: 'pending',
          at: new Date().toISOString()
        });
        localStorage.setItem('bookrift-feedback', JSON.stringify(list));
        document.dispatchEvent(new CustomEvent('bookrift:feedback'));
      } catch (error) {
        /* сақтау мүмкін болмаса, елемейміз */
      }
      input.value = '';
    });
  }

  const bookCards = document.querySelectorAll('.book-card');
  bookCards.forEach((card) => {
    card.addEventListener('click', () => {
      const isAvailable = card.dataset.book === 'matilda';
      if (!isAvailable) return;
      bookCards.forEach((item) => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
    });
  });
});
