var searchHistory=[];
var routeUrl= "https://api.openweathermap.org";
var apiKey= "afbb00e30562dcd79c70fd9814d6623c";
var searchForm = document.getElementById("search-form");
var searchInput =  document.getElementById("search-input");
var todayContainer = document.getElementById("today");
var forecastContainer = document.getElementById("forecast");
var searchHistoryContainer = document.getElementById("history");
var searchButton = document.getElementById("search-button");
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
var cityName = document.getElementById("city-name");
var currentDate = document.getElementById("date");
var picture = document.getElementById("icon");
var temperature = document.getElementById('temp');
var hum = document.getElementById("humidity");
var speedOfWind = document.getElementById("wind-speed");
var cardContainer = document.getElementsByClassName("card-container")

function displaySearchHistory() {
    searchHistoryContainer.innerHTML = ""
    for (var i = searchHistory.length - 1; i >= 0; i--) {
        var button = document.createElement("button")
        button.setAttribute("type", "button")
        button.setAttribute("class", "history-btn")
        button.setAttribute("data-search", searchHistory[i])
        button.textContent = searchHistory[i]
        searchHistoryContainer.append(button)
    }
}

function addToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return
    }
    searchHistory.push(search)
    localStorage.setItem("search-history", JSON.stringify(searchHistory))
    displaySearchHistory()
}

function getHistory() {
    var storedHistory = localStorage.getItem("search-history")
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory)
    }
    displaySearchHistory()
}

function renderCurrentWeather (city, weather) {
    let date = dayjs().format("M/D/YYYY")
    let temp = weather.main.temp
    let wind = weather.wind.speed
    let humidity = weather.main.humidity
    let iconUrl = `${routeUrl}/img/w/${weather.weather[0].icon}.png`
    let card = document.createElement("div")
    let cardBody = document.createElement("div")
    let heading = document.createElement("h2")
    let weatherIcon = document.createElement("img")
    let tempEl = document.createElement("p")
    let windEl = document.createElement("p")
    let humidityEl = document.createElement("p")
    card.setAttribute('class', 'card')
    cardBody.setAttribute('class', 'card-body')
    card.append(cardBody)
    heading.setAttribute('class', 'card-title')
    tempEl.setAttribute('class', 'card-text')
    windEl.setAttribute('class', 'card-text')
    humidityEl.setAttribute('class', 'card-text')
    heading.textContent = `${city} ${date}`
    weatherIcon.setAttribute('src', iconUrl)
    weatherIcon.setAttribute('class', 'weather-img')
    heading.append(weatherIcon)
    tempEl.textContent = `temp: ${temp}C`
    windEl.textContent = `wind: ${wind}km/h`
    humidityEl.textContent = `humidity: ${humidity}%`
    cardBody.append(heading, tempEl, windEl, humidityEl)
    todayContainer.innerHTML = ""
    todayContainer.append(card)
}

function renderForecastCard (forecast) {
    var cardCol = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    cardCol.setAttribute('class', 'col-2');
    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    heading.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    heading.textContent = dayjs(forecast.dt * 1000).format('M/D/YYYY');
    weatherIcon.setAttribute('src', `${routeUrl}/img/w/${forecast.weather[0].icon}.png`);
    weatherIcon.setAttribute('class', 'weather-img');
    heading.append(weatherIcon);
    tempEl.textContent = `temp: ${forecast.main.temp}C`;
    windEl.textContent = `wind: ${forecast.wind.speed}km/h`;
    humidityEl.textContent = `humidity: ${forecast.main.humidity}%`;

    cardBody.append(heading, tempEl, windEl, humidityEl);
    card.append(cardBody);
    cardCol.append(card);
    forecastContainer.append(cardCol);

}

function renderForecast(fiveDayForecast) {
//creae html element that is div "heading container" for section
//another heading 5 day forecast
//clear forecast container
//append heading to forecast container
var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

for (let i=0; i<fiveDayForecast.length; i++) {
    if(fiveDayForecast[i].dt >= startDt && fiveDayForecast[i].dt < endDt) {
        if(fiveDayForecast[i].dt_txt.slice(11, 13) == "12") {
            renderForecastCard(fiveDayForecast[i])
        }
    }
}
}

function renderWeather (city, data) {
    renderCurrentWeather(city, data.list[0], data.city.timezone)
    renderForecast(data.list)
}

function fetchWeather (location) {
    let {lat} = location
    let {lon} = location
    let city = location.name
    let url = `${routeUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    fetch(url)
    .then(function(res){
        return res.json()
    })
    .then(function(data) {
        renderWeather(city, data)
    })
    .catch(function(err) {
        console.error(err)
    })
}

function fetchCoords(search) {
    let url = `${routeUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`
    fetch(url) 
    .then(function(res){
        return res.json()
    })
    .then(function(data){
        if (!data[0]) {
            alert("location not found")
        } else {
            addToHistory(search)
            fetchWeather (data[0]) 
        }
    })
    .catch(function(err) {
        console.error(err)
    })
}

getHistory()

searchButton.addEventListener("click", function(event) {
    event.preventDefault()
    console.log(searchInput.value)
    fetchCoords(searchInput.value)
});

searchHistoryContainer.addEventListener("click", function(event) {
    event.preventDefault()
    fetchCoords(event.target.textContent)
});

//function to display current weather data from api- var for data (temp, humidity), html elements (card-body, header, weather icon), setAttribute, setTextContent, append all of it to the today container//

//function for 5 day forecast: store all data for 5 next days from api, create all elements, give attributes, and text cntent, append elements in array with forecast container//

//function executes previous functions when somethin is searched//

//function fetches from api that longitude and latitude
//other function fetching using city name to get long and lat

//function that handles when a user submits a search form
//function when user clicks one of the buttons on the previous list option for cities

//2 event listeners. 1 for submit of a search and runs function for the search submit. 1 for user clicks search history buttons and runs that function