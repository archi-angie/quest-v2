(() => {
  const init = () => {
    const form = document.querySelector('#booking-form');
    const hotels = window.questBookingDestinations;
    if (!form || !Array.isArray(hotels) || form.classList.contains('qb-enhanced')) return false;
    const destination = form.querySelector('#destination');
    const checkin = form.querySelector('#checkin');
    const checkout = form.querySelector('#checkout');
    const nativeGuest = form.querySelector('.guest-trigger');
    const nativePopover = form.querySelector('.guest-popover');
    const submit = form.querySelector('.booking-submit');
    if (!destination || !checkin || !checkout || !nativeGuest || !nativePopover || !submit) return false;
    form.noValidate = true;
    form.classList.add('qb-enhanced');
    form.querySelectorAll('label').forEach(label => label.classList.add('qb-native'));
    nativePopover.classList.add('qb-native');
    const icon = {
      pin:'<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
      guests:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 6a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
      chevron:'<path d="m5 9 7 7 7-7"/>'
    };
    const svg = (body, cls) => '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
    const fields = document.createElement('div');
    fields.className = 'qb-fields';
    fields.innerHTML = [
      '<button class="qb-field qb-field--destination" type="button" data-booking-open="destination" aria-haspopup="dialog" aria-expanded="false"><span class="qb-label">Where to</span><span class="qb-value">' + svg(icon.pin,'qb-icon') + '<span data-booking-value="destination">Where to?</span>' + svg(icon.chevron,'qb-chevron') + '</span></button>',
      '<button class="qb-field qb-field--checkin" type="button" data-booking-open="checkin" aria-haspopup="dialog" aria-expanded="false"><span class="qb-label">Check in</span><span class="qb-value">' + svg(icon.calendar,'qb-icon') + '<span data-booking-value="checkin">dd/mm/yyyy</span></span></button>',
      '<button class="qb-field qb-field--checkout" type="button" data-booking-open="checkout" aria-haspopup="dialog" aria-expanded="false"><span class="qb-label">Check out</span><span class="qb-value">' + svg(icon.calendar,'qb-icon') + '<span data-booking-value="checkout">dd/mm/yyyy</span></span></button>',
      '<button class="qb-field qb-field--guests" type="button" data-booking-open="guests" aria-haspopup="dialog" aria-expanded="false"><span class="qb-label">Who is coming</span><span class="qb-value">' + svg(icon.guests,'qb-icon') + '<span data-booking-value="guests">2 guests · 1 room</span>' + svg(icon.chevron,'qb-chevron') + '</span></button>'
    ].join('');
    form.insertBefore(fields,submit);
    const backdrop = document.createElement('div');
    backdrop.className = 'qb-backdrop';
    backdrop.hidden = true;
    const panel = document.createElement('section');
    panel.className = 'qb-panel';
    panel.id = 'quest-booking-panel';
    panel.hidden = true;
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Booking options');
    document.body.append(backdrop,panel);
    const triggers = [...fields.querySelectorAll('[data-booking-open]')];
    triggers.forEach(button => button.setAttribute('aria-controls',panel.id));
    const mobile = () => matchMedia('(max-width:700px)').matches;
    const syncSubmitLabel = () => {submit.textContent = mobile() ? 'Book Now ↗' : 'Search stays →';};
    syncSubmitLabel();
    const today = new Date();
    today.setHours(0,0,0,0);
    const firstMonth = new Date(today.getFullYear(),today.getMonth(),1);
    let month = new Date(firstMonth);
    let mode = '';
    let opener = null;
    let dateStep = 'checkin';
    const dateKey = date => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
    const fromKey = value => value ? new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10))) : null;
    const dateLabel = value => value ? value.slice(8,10) + '/' + value.slice(5,7) + '/' + value.slice(0,4) : 'dd/mm/yyyy';
    const update = () => {
      const selected = hotels.find(hotel => hotel.name === destination.value);
      fields.querySelector('[data-booking-value="destination"]').textContent = selected ? selected.city : 'Where to?';
      fields.querySelector('[data-booking-value="checkin"]').textContent = dateLabel(checkin.value);
      fields.querySelector('[data-booking-value="checkout"]').textContent = dateLabel(checkout.value);
      fields.querySelector('[data-booking-value="guests"]').textContent = nativeGuest.textContent.trim();
    };
    const close = () => {
      if (!mode) return;
      mode = '';
      panel.hidden = true;
      backdrop.hidden = true;
      document.body.classList.remove('qb-sheet-open');
      triggers.forEach(button => button.setAttribute('aria-expanded','false'));
      if (opener && opener.isConnected) opener.focus({preventScroll:true});
      opener = null;
    };
    const position = () => {
      if (!mode || mobile() || !opener) return;
      const rect = opener.getBoundingClientRect();
      const width = mode === 'dates' ? Math.min(740,innerWidth-32) : Math.min(410,innerWidth-32);
      panel.style.width = width + 'px';
      let left = Math.min(Math.max(16,rect.left),innerWidth-width-16);
      let top = rect.bottom + 10;
      if (top + panel.offsetHeight > innerHeight-16 && rect.top > panel.offsetHeight+16) top = rect.top-panel.offsetHeight-10;
      else top = Math.min(top,Math.max(16,innerHeight-panel.offsetHeight-16));
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    };
    const setPanel = (title,body) => {
      panel.innerHTML = '<div class="qb-panel-head"><strong>' + title + '</strong><button class="qb-close" type="button" aria-label="Close booking options">×</button></div><div class="qb-panel-scroll"></div>';
      panel.querySelector('.qb-panel-scroll').append(body);
      panel.querySelector('.qb-close').addEventListener('click',close);
    };
    const renderDestination = () => {
      const body = document.createElement('div');
      body.className = 'qb-destination';
      body.innerHTML = '<div class="qb-search"><label for="qb-destination-search">Find a city or hotel</label><div class="qb-search-row"><input id="qb-destination-search" type="search" placeholder="Search city or hotel" autocomplete="off"><span aria-hidden="true">⌕</span></div></div><div class="qb-destination-results"></div>';
      const search = body.querySelector('input');
      const results = body.querySelector('.qb-destination-results');
      const cities = [...new Set(hotels.map(hotel => hotel.city))];
      const draw = () => {
        const term = search.value.trim().toLocaleLowerCase();
        results.replaceChildren();
        let count = 0;
        cities.forEach(city => {
          const cityHotels = hotels.filter(hotel => hotel.city === city);
          const cityMatch = city.toLocaleLowerCase().includes(term);
          const matches = cityHotels.filter(hotel => cityMatch || hotel.name.toLocaleLowerCase().includes(term));
          if (!matches.length) return;
          count++;
          const cityButton = document.createElement('button');
          cityButton.type = 'button';
          cityButton.className = 'qb-city';
          cityButton.innerHTML = '<span></span><small></small>';
          cityButton.querySelector('span').textContent = city;
          cityButton.querySelector('small').textContent = cityHotels.length + (cityHotels.length === 1 ? ' hotel to stay' : ' hotels to stay');
          cityButton.addEventListener('click',() => chooseHotel(cityHotels[0]));
          results.append(cityButton);
          matches.forEach(hotel => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'qb-hotel';
            option.textContent = hotel.name;
            option.addEventListener('click',() => chooseHotel(hotel));
            results.append(option);
          });
        });
        if (!count) {
          const empty = document.createElement('p');
          empty.className = 'qb-empty';
          empty.textContent = 'No Quest hotels found. Try another city or hotel name.';
          results.append(empty);
        }
      };
      search.addEventListener('input',draw);
      draw();
      setPanel('Find your Quest stay',body);
      requestAnimationFrame(() => search.focus({preventScroll:true}));
    };
    const chooseHotel = hotel => {
      destination.value = hotel.name;
      destination.dispatchEvent(new Event('change',{bubbles:true}));
      update();
      close();
    };
    const calendar = (start) => {
      const block = document.createElement('div');
      block.className = 'qb-month';
      const heading = document.createElement('h3');
      heading.textContent = start.toLocaleDateString('en-US',{month:'long',year:'numeric'});
      block.append(heading);
      const grid = document.createElement('div');
      grid.className = 'qb-days';
      ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(day => {
        const label = document.createElement('span');
        label.className = 'qb-weekday';
        label.textContent = day;
        grid.append(label);
      });
      const offset = new Date(start.getFullYear(),start.getMonth(),1).getDay();
      for(let i=0;i<42;i++){
        const date = new Date(start.getFullYear(),start.getMonth(),i-offset+1);
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'qb-day';
        cell.textContent = String(date.getDate());
        if(date.getMonth() !== start.getMonth()) cell.classList.add('qb-day--outside');
        const key = dateKey(date);
        if(date < today) cell.disabled = true;
        if(key === checkin.value) cell.classList.add('qb-day--start');
        if(key === checkout.value) cell.classList.add('qb-day--end');
        if(checkin.value && checkout.value && key > checkin.value && key < checkout.value) cell.classList.add('qb-day--range');
        cell.addEventListener('click',() => chooseDate(key));
        grid.append(cell);
      }
      block.append(grid);
      return block;
    };
    const drawDates = () => {
      const body = document.createElement('div');
      body.className = 'qb-dates';
      body.innerHTML = '<div class="qb-dates-summary"><span></span><small></small></div><div class="qb-calendar-nav"><button type="button" data-month="-1" aria-label="Previous month">‹</button><span>Select ' + (dateStep === 'checkin' ? 'check-in' : 'check-out') + ' date</span><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="qb-calendars"></div><div class="qb-dates-foot"><span>● &nbsp;Plan your Quest stay</span><button type="button" class="qb-apply">Apply dates</button></div>';
      body.querySelector('.qb-dates-summary span').textContent = (checkin.value ? dateLabel(checkin.value) : 'Check in') + ' — ' + (checkout.value ? dateLabel(checkout.value) : 'Check out');
      if(checkin.value && checkout.value){
        const nights = Math.round((fromKey(checkout.value)-fromKey(checkin.value))/86400000);
        body.querySelector('.qb-dates-summary small').textContent = nights + (nights === 1 ? ' night' : ' nights');
      }
      const calendars = body.querySelector('.qb-calendars');
      calendars.append(calendar(month));
      if(!mobile()) calendars.append(calendar(new Date(month.getFullYear(),month.getMonth()+1,1)));
      body.querySelector('[data-month="-1"]').disabled = month <= firstMonth;
      body.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click',() => {
        month = new Date(month.getFullYear(),month.getMonth()+Number(button.dataset.month),1);
        drawDates();
      }));
      body.querySelector('.qb-apply').addEventListener('click',close);
      setPanel('Choose your dates',body);
      position();
    };
    const chooseDate = key => {
      if(dateStep === 'checkin' || !checkin.value || key <= checkin.value){
        checkin.value = key;
        checkin.dispatchEvent(new Event('change',{bubbles:true}));
        checkout.value = '';
        dateStep = 'checkout';
      } else {
        checkout.value = key;
        checkout.dispatchEvent(new Event('change',{bubbles:true}));
        dateStep = 'checkin';
      }
      update();
      drawDates();
    };
    const renderGuests = () => {
      const body = document.createElement('div');
      body.className = 'qb-guests';
      [['adults','Guests','Ages 12 and up'],['children','Children','Ages 0–11'],['rooms','Rooms','Up to 4 guests each']].forEach(([key,title,sub]) => {
        const row = document.createElement('div');
        row.className = 'qb-guest-row';
        row.innerHTML = '<div><strong></strong><small></small></div><div class="qb-counter"><button type="button" data-step="-1" aria-label="Decrease ' + title + '">−</button><output></output><button type="button" data-step="1" aria-label="Increase ' + title + '">+</button></div>';
        row.querySelector('strong').textContent = title;
        row.querySelector('small').textContent = sub;
        const output = row.querySelector('output');
        output.textContent = form.querySelector('#'+key).textContent;
        row.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click',() => {
          const native = nativePopover.querySelector('[data-counter="'+key+'"][data-step="'+button.dataset.step+'"]');
          if(native) native.click();
          output.textContent = form.querySelector('#'+key).textContent;
          update();
        }));
        body.append(row);
      });
      const done = document.createElement('button');
      done.className = 'qb-guest-done';
      done.type = 'button';
      done.textContent = 'Done';
      done.addEventListener('click',close);
      body.append(done);
      setPanel('Guests and rooms',body);
    };
    const open = (type,trigger) => {
      if(mode && opener === trigger){close();return}
      if(mode) close();
      opener = trigger;
      mode = type === 'checkin' || type === 'checkout' ? 'dates' : type;
      dateStep = type === 'checkout' && checkin.value ? 'checkout' : 'checkin';
      if(mode === 'dates'){
        const date = fromKey(checkin.value);
        month = date ? new Date(date.getFullYear(),date.getMonth(),1) : new Date(firstMonth);
        drawDates();
      } else if(mode === 'destination') renderDestination();
      else renderGuests();
      panel.hidden = false;
      backdrop.hidden = false;
      panel.setAttribute('aria-modal',String(mobile()));
      document.body.classList.toggle('qb-sheet-open',mobile());
      trigger.setAttribute('aria-expanded','true');
      position();
      if(mode !== 'destination') panel.querySelector('.qb-close').focus({preventScroll:true});
    };
    fields.addEventListener('click',event => {
      const trigger = event.target.closest('[data-booking-open]');
      if(trigger) open(trigger.dataset.bookingOpen,trigger);
    });
    backdrop.addEventListener('click',close);
    document.addEventListener('keydown',event => {
      if(!mode) return;
      if(event.key === 'Escape'){event.preventDefault();close();}
      if(event.key === 'Tab'){
        const focusable = [...panel.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        if(!focusable.length) return;
        if(event.shiftKey && document.activeElement === focusable[0]){event.preventDefault();focusable[focusable.length-1].focus();}
        else if(!event.shiftKey && document.activeElement === focusable[focusable.length-1]){event.preventDefault();focusable[0].focus();}
      }
    });
    addEventListener('resize',() => {
      syncSubmitLabel();
      if(mode === 'dates') drawDates();
      if(mode){
        panel.setAttribute('aria-modal',String(mobile()));
        document.body.classList.toggle('qb-sheet-open',mobile());
        position();
      }
    },{passive:true});
    addEventListener('scroll',position,{passive:true});
    destination.addEventListener('change',update);
    checkin.addEventListener('change',update);
    checkout.addEventListener('change',update);
    update();
    return true;
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',() => { if(!init()) wait(); },{once:true});
  else if(!init()) wait();
  function wait(){
    const observer = new MutationObserver(() => {if(init()) observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
