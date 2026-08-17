$(function() {
  var date, dayName, day, month, year;
  var calendarType = 'gregorian';
  var themeMode = 'dark';
  var locationName = 'Bad Bellingen';
  var locationLat = 47.7833;
  var locationLon = 7.6167;
  var range = 270,
    sectionsDayName = 7,
    sectionsDay = 31,
    sectionsMonth = 12,
    charactersDayName = 3,
    charactersDay = 2,
    charactersMonth = 3,
    dayColor = '#FF2D55',
    monthColor = '#007AFF',
    dayNameColor = '#4CD964';

  var dayNamesPersian = ['SHA', 'YEK', 'DOS', 'SES', 'CHA', 'PAN', 'JOM'];
  var dayNamesGregorian = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var dayNamesPersianShort = ['SH', 'YE', 'DO', 'SE', 'CH', 'PA', 'JO'];
  var dayNamesGregorianShort = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  var monthNamesPersian = 'FAR ORD KHO TIR MOR SHA MEH ABA AZA DAY BAH ESF';
  var monthNamesGregorian = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC';

  function rotateRing(input, sections, characters, ring, text, color) {
    var sectionWidth = range / sections;
    var initialRotation = 135 - (sectionWidth / 2);
    var rotateAmount = initialRotation - sectionWidth * (input - 1);
    var start = (characters * (input - 1)) + (input - 1) + 1;
    
    $(ring).css({
      '-webkit-transform': 'rotate(' + rotateAmount + 'deg)',
      '-moz-transform': 'rotate(' + rotateAmount + 'deg)',
      '-ms-transform': 'rotate(' + rotateAmount + 'deg)',
      'transform': 'rotate(' + rotateAmount + 'deg)'
    });

    $(text).children('span').css('color', '');
    
    for (var i = start; i < start + characters; i++) {
      $(text).children('.char' + i).css({
        'color': color
      });
    }    
  }

  function clockRotation() {
    setInterval(function() {
      var date = new Date();
      var seconds = date.getSeconds();
      var minutes = date.getMinutes();
      var hours = date.getHours();
      var secondsRotation = seconds * 6;
      var minutesRotation = minutes * 6;
      var hoursRotation = hours * 30 + (minutes / 2);
      $("#seconds").css({
        '-webkit-transform': 'rotate(' + secondsRotation + 'deg)',
        '-moz-transform': 'rotate(' + secondsRotation + 'deg)',
        '-ms-transform': 'rotate(' + secondsRotation + 'deg)',
        'transform': 'rotate(' + secondsRotation + 'deg)'
      });
      $("#minutes").css({
        '-webkit-transform': 'rotate(' + minutesRotation  + 'deg)',
        '-moz-transform': 'rotate(' + minutesRotation + 'deg)',
        '-ms-transform': 'rotate(' + minutesRotation + 'deg)',
        'transform': 'rotate(' + minutesRotation + 'deg)'
      });
      $("#hours").css({
        '-webkit-transform': 'rotate(' + hoursRotation  + 'deg)',
        '-moz-transform': 'rotate(' + hoursRotation + 'deg)',
        '-ms-transform': 'rotate(' + hoursRotation + 'deg)',
        'transform': 'rotate(' + hoursRotation + 'deg)'
      });
    }, 1000);
  }
  
  function loadTemperatureForecast() {
    try {
      var weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locationLat}&longitude=${locationLon}&daily=temperature_2m_max,temperature_2m_min,weather_code&current=weather_code&timezone=auto&forecast_days=7`;
      
      fetch(weatherUrl).then(function(response) {
        return response.json();
      }).then(function(data) {
        var maxTemps = data.daily.temperature_2m_max;
        var minTemps = data.daily.temperature_2m_min;
        var weatherCode = data.current.weather_code;
        
        var minTemp = Math.min(...minTemps);
        var maxTemp = Math.max(...maxTemps);
        var tempRange = maxTemp - minTemp;
        
        var isExpanded = $('#steps').hasClass('expanded');
        var scale = isExpanded ? 2.25 : 1;
        var barHeight = 100 * scale;
        var baseBottom = 30 * scale;
        var labelOffset = 14 * scale;
        
        for (var i = 0; i < 7; i++) {
          var tempBarHeight = ((maxTemps[i] - minTemps[i]) / tempRange) * barHeight;
          var bottomPosition = ((minTemps[i] - minTemp) / tempRange) * barHeight;
          
          $('#bar' + (i + 1)).css({
            'height': tempBarHeight + 'px',
            'bottom': (baseBottom + bottomPosition) + 'px'
          });
          
          $('#max' + (i + 1)).text(Math.round(maxTemps[i]) + '°')
            .css('bottom', (baseBottom + bottomPosition + tempBarHeight) + 'px')
            .css('top', 'auto');
          
          $('#min' + (i + 1)).text(Math.round(minTemps[i]) + '°')
            .css('bottom', (baseBottom + bottomPosition - labelOffset) + 'px')
            .css('top', 'auto');
        }
        
        var dayNames = calendarType === 'jalali' ? dayNamesPersianShort : dayNamesGregorianShort;
        var today = new Date().getDay();
        var persianToday = ((today + 1) % 7);
        
        for (var i = 0; i < 7; i++) {
          var dayIndex = (persianToday + i) % 7;
          var dayLabel = calendarType === 'jalali' ? dayNamesPersianShort[dayIndex] : dayNamesGregorianShort[dayIndex];
          $('.bar:nth-child(' + (i + 1) + ') .day-letter').text(dayLabel);
        }
        
        var weatherDesc = getWeatherDescription(weatherCode);
        document.getElementById('weatherDesc').innerText = weatherDesc;
        
        var currentTemp = Math.round((maxTemps[0] + minTemps[0]) / 2);
        document.getElementById('temperature').innerText = currentTemp + '°C';
      }).catch(function(error) {
        console.error('Fehler beim Laden der Wetterdaten:', error);
      });
    } catch (error) {
      console.error('Fehler beim Laden der Wetterdaten:', error);
    }
  }
  
  function updateBarsScale() {
    loadTemperatureForecast();
  }
  
  function getWeatherDescription(code) {
    var descriptions = {
      0: 'clear',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'foggy',
      48: 'foggy',
      51: 'drizzle',
      53: 'drizzle',
      55: 'drizzle',
      61: 'rainy',
      63: 'rainy',
      65: 'rainy',
      71: 'snowy',
      73: 'snowy',
      75: 'snowy',
      77: 'snowy',
      80: 'rainy',
      81: 'rainy',
      82: 'rainy',
      85: 'snowy',
      86: 'snowy',
      95: 'stormy',
      96: 'stormy',
      99: 'stormy'
    };
    return descriptions[code] || 'unknown';
  }

  function updateCalendarText() {
    if (calendarType === 'jalali') {
      $('.day-name-text').text('SHA YEK DOS SES CHA PAN JOM');
      $('.month-text').text('FAR ORD KHO TIR MOR SHA MEH ABA AZA DAY BAH ESF');
    } else {
      $('.day-name-text').text('SUN MON TUE WED THU FRI SAT');
      $('.month-text').text('JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC');
    }
    
    $('.day-name-text').lettering();
    $('.month-text').lettering();
    
    generateDynamicCSS();
  }

  function generateDynamicCSS() {
    var style = document.getElementById('dynamic-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dynamic-styles';
      document.head.appendChild(style);
    }
    
    var css = '';
    
    var dayNameText = $('.day-name-text').text();
    var dayNameChars = dayNameText.replace(/ /g, '').length;
    var dayNameAnglePerChar = 270 / 21;
    var dayNameOffset = -135;
    
    $('.day-name-text span').each(function(index) {
      var charIndex = index + 1;
      var angle = dayNameOffset + dayNameAnglePerChar * charIndex;
      css += '.day-name-text .char' + charIndex + ' { transform: rotate(' + angle + 'deg); }';
    });
    
    var monthText = $('.month-text').text();
    var monthChars = monthText.replace(/ /g, '').length;
    var monthAnglePerChar = 270 / monthChars;
    var monthOffset = -135;
    
    $('.month-text span').each(function(index) {
      var charIndex = index + 1;
      var angle = monthOffset + monthAnglePerChar * charIndex;
      css += '.month-text .char' + charIndex + ' { transform: rotate(' + angle + 'deg); }';
    });
    
    style.textContent = css;
  }

  function getDateValues() {
    date = new Date();
    var dayOfWeek = date.getDay();
    
    if (calendarType === 'jalali') {
      var jdate = jalaali.toJalaali(date);
      day = jdate.jd;
      month = jdate.jm;
      
      dayName = ((dayOfWeek + 1) % 7) + 1;
    } else {
      day = date.getDate();
      month = date.getMonth() + 1;
      dayName = dayOfWeek + 1;
    }
  }

  function init() {
    getDateValues();
    
    $(".center-preview").lettering();
    $(".day-name-preview").lettering(); 
    $(".day-preview").lettering();
    $(".day-text").lettering();
    $(".month-text").lettering();
    $(".day-name-text").lettering();
    
    generateDynamicCSS();
    
    $('.day-preview').fadeTo(10, 1);
    $('.month-preview').fadeTo(10, 1);
    $('.day-name-preview').fadeTo(10, 1);
    $('.center-preview').fadeTo(10, 1);

    setTimeout(function() {
      $('.day-preview').fadeTo(500, 0);
      $('.day-text').fadeTo(500, 1);
    }, 500);

    setTimeout(function() {
      $('.month-preview').fadeTo(500, 0);
      $('.fa-cloud').fadeTo(500, 1);
      $('.weather-desc').fadeTo(500, 1);
      $('.temperature').fadeTo(500, 1);
      $('.bars').fadeTo(500, 1);
      $('.month-text').fadeTo(500, 1, function() {
        loadTemperatureForecast();
      });
    }, 1000);

    setTimeout(function() {
      $('.day-name-preview').fadeTo(500, 0);
      $('.day-name-text').fadeTo(500, 1);
    }, 1500);

    setTimeout(function() {
      $('.center-preview').fadeTo(500, 0);
      $('.head').fadeTo(500, 0);
      $('.torso').fadeTo(500, 0);
      $(".hand-container").fadeTo(500, 1, function() {});
    }, 2000);

    clockRotation();
    
    loadSettings();
  }

  async function getCityInfoByGeography(latitude, longitude) {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    response = await fetch(apiUrl);
    data = await response.json();
    return(data);
  }
  
  async function getCityNameByPostalCode(postalCode) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    return(data[0].address.village);
  }

  function loadSettings() {
    const saved = localStorage.getItem('calendarSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      calendarType = settings.calendarType || 'gregorian';
      themeMode = settings.themeMode || 'dark';
      locationName = settings.locationName || 'Bad Bellingen';
      locationLat = settings.locationLat || 47.7833;
      locationLon = settings.locationLon || 7.6167;
      $('#locationLabel').text(locationName);
      applySettings();
    }
  }

  function saveSettings() {
    localStorage.setItem('calendarSettings', JSON.stringify({
      calendarType: calendarType,
      themeMode: themeMode,
      locationName: locationName,
      locationLat: locationLat,
      locationLon: locationLon
    }));
  }

  function applySettings() {
    if (themeMode === 'dark') {
      $('body').addClass('dark-mode').removeClass('light-mode');
      $('#themeToggle').text('dark');
    } else {
      $('body').addClass('light-mode').removeClass('dark-mode');
      $('#themeToggle').text('light');
    }
    
    if (calendarType === 'jalali') {
      $('#calendarToggle').text('Jalali');
    } else {
      $('#calendarToggle').text('Gregorian');
    }
    
    $('#locationLabel').text(locationName);
    
    updateCalendarText();
    getDateValues();
    
    setTimeout(function() {
      $('.day-text span, .month-text span, .day-name-text span').css('color', '');
      rotateRing(day, sectionsDay, charactersDay, '#r3', '.day-text', dayColor);
      rotateRing(month, sectionsMonth, charactersMonth, '#r2', '.month-text', monthColor);
      rotateRing(dayName, sectionsDayName, charactersDayName, '#r1', '.day-name-text', dayNameColor);
      loadTemperatureForecast();
    }, 100);
  }

  $('#themeToggle').click(function() {
    themeMode = themeMode === 'dark' ? 'light' : 'dark';
    applySettings();
    saveSettings();
  });

  $('#calendarToggle').click(function() {
    calendarType = calendarType === 'jalali' ? 'gregorian' : 'jalali';
    applySettings();
    saveSettings();
  });

  $('#locationLabel').click(function() {
    $('#locationModal').addClass('active');
    $('#locationSearch').val('').focus();
    $('#searchResults').empty();
  });

  $('#closeModal').click(function() {
    $('#locationModal').removeClass('active');
  });

  $('#locationSearch').on('input', function() {
    var query = $(this).val().trim();
    if (query.length >= 2) {
      searchLocation(query);
    } else {
      $('#searchResults').empty();
    }
  });

  async function searchLocation(query) {
    try {
      var url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=de&format=json`;
      var response = await fetch(url);
      var data = await response.json();
      
      var results = data.results || [];
      var html = '';
      
      results.forEach(function(loc) {
        var displayName = loc.name;
        if (loc.admin1) displayName += ', ' + loc.admin1;
        if (loc.country) displayName += ', ' + loc.country;
        
        html += `<div class="search-result-item" data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${loc.name}">${displayName}</div>`;
      });
      
      $('#searchResults').html(html);
      
      $('.search-result-item').click(function() {
        locationLat = parseFloat($(this).data('lat'));
        locationLon = parseFloat($(this).data('lon'));
        locationName = $(this).data('name');
        $('#locationLabel').text(locationName);
        $('#locationModal').removeClass('active');
        saveSettings();
        loadTemperatureForecast();
      });
    } catch (error) {
      console.error('Fehler bei Ortssuche:', error);
    }
  }

  $('.side-ring').click(function(e) {
    e.stopPropagation();
    var $this = $(this);
    
    if ($this.hasClass('expanded')) {
      $this.removeClass('expanded');
      $('.clock-container').removeClass('faded');
    } else {
      $('.side-ring').removeClass('expanded');
      $this.addClass('expanded');
      $('.clock-container').addClass('faded');
    }
    
    setTimeout(updateBarsScale, 50);
  });

  $(document).click(function() {
    $('.side-ring.expanded').removeClass('expanded');
    $('.clock-container').removeClass('faded');
    setTimeout(updateBarsScale, 50);
  });

  init();
});
