// this js file is used in update-default.html and index.html only
// replace this api key with yours if ratelimited
const apiKey = '30aa772f20d15a38190aab4ef07a8f74';

function fetchWeather(city) {
	// fetch weather data from api with units set to metric
	fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
		.then(response => response.json())
		.then(currentData => {

			// apply weather description (eg: "Thunderstorm")
			// by default all of string data fetched from the api are all lowercase, use toSentenceCase() to change from example broken clouds to Broken Clouds
			document.getElementById('weather-description').textContent = toSentenceCase(currentData.weather[0].description);

			// apply humidity
			document.getElementById('weather-humidity').textContent = currentData.main.humidity + "%"

			// apply temperature
			document.getElementById('weather-temp').textContent = (currentData.main.temp).toFixed(0) + "°"

			// apply feels like index
			document.getElementById('weather-feels-like').textContent = (currentData.main.feels_like).toFixed(0) + "°"

			// apply min temp
			document.getElementById('weather-temp-min').textContent = (currentData.main.temp_min).toFixed(0) + "°"

			// apply max temp
			document.getElementById('weather-temp-max').textContent = (currentData.main.temp_max).toFixed(0) + "°"

			// apply city name + country name
			// by default, country names are displayed in ISO3166-1 a-2 format, use getCountryName() to change MY to Malaysia
			document.getElementById('weather-name').textContent = currentData.name + ", " + getCountryName(currentData.sys.country);

			// apply weather condition icon
			document.getElementById('weather-condition-img').setAttribute("src", `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png`);

			// fetch forecast data from api with units set to metric
			return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
		})
		.then(response => response.json())
		.then(forecastData => {
			var forecastItems = document.getElementById('forecast-items');
			forecastItems.innerHTML = '';

			// group forecast by date
			var dailyForecasts = {};
			forecastData.list.forEach(item => {
				var date = item.dt_txt.split(' ')[0];
				if (!dailyForecasts[date]) {
					dailyForecasts[date] = [];
				}
				dailyForecasts[date].push(item);
			});

			// display forecast for each day
			for (const date in dailyForecasts) {
				if (Object.hasOwnProperty.call(dailyForecasts, date)) {
					const items = dailyForecasts[date];
					const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

					const forecastItem = document.createElement('article');
					forecastItem.className = "overflow"
					forecastItem.innerHTML = `
					<header>
						<strong>${dayOfWeek}</strong>
					</header>
						<div class="center-row-forecast">
						${items.map(item => `
							<div class="center-col">
								<span>${item.dt_txt.split(' ')[1].slice(0, -3)}</span>
								<div class="img-container">
									<img class="forecast-img" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png">
								</div>
								${toSentenceCase(item.weather[0].description)}
								<br/>
							</div>
								`).join('')}
						</div>
					`;
					forecastItems.appendChild(forecastItem);
				}
			}
		})
		.catch(error => {
			console.error('Error fetching data:', error);
			alert('City not found.')
		});
}

// this function fetches the weather condition of the default city everytime the user loads the homepage
function startCity(homeCity) {
	fetchWeather(homeCity);
}

// this function grabs the city name from the API as a validator
// this means that the city name does not depend on the value of the search box
// thus preventing the user from setting Beranag or Shah lam or skjadkada as a default city
function getCity() {
	var city = document.getElementById('city').value;
	fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('City not found');
			}
			return response.json();
		})
		.then(currentData => {
			var newCity = currentData.name;
			console.log(newCity);
			changeDefaultCity(newCity);
		})
		.catch(error => {
			console.error(error);
			alert('City not found');
		});
}

// this function changes the default city by saving the new default city to localstorage
// also sets a validator boolean in localstorage for comparison
function changeDefaultCity(newCity) {
	defaultTampered = 1
	localStorage.setItem('tamperStatus', defaultTampered)
	localStorage.setItem('home', newCity)
	alert(`Default city set! This city's forecast will be displayed everytime you open the app or returned to the homepage.`)
}

// this function runs on first load, if value defaultTampered does not exist or is 0, set default city to Beranang
// do not set default city to beranang if the defaultTampered value exists or is 1
function checkDefault() {
	defaultSet = localStorage.getItem('home')
	defaultTampered = localStorage.getItem('tamperStatus')

	if (!defaultTampered) {
		const home = 'Beranang'
		localStorage.setItem('home', home)
		alert(`Home city automatically set to Beranang, Malaysia. Change it in "Change Home City"`)
		startCity(home)
	} else {
		newDefault = localStorage.getItem('home')
		startCity(newDefault)
	}
}

// this function handles city search, the city value will be passed into fetchWeather()
function searchCity() {
	var city = document.getElementById('city').value;
	fetchWeather(city);
}

// this function handles city search in the Change Home Default Page, the city value will be passed into fetchWeather()
// this fn is redundant but is used
function searchCityUpdate() {
	document.getElementById('hidden').style.display = 'block'
	var city = document.getElementById('city').value;
	fetchWeather(city)
}

// this function receives a string from the caller and converts it to sentence case,
// eg: very small to Very Small
function toSentenceCase(str) {
	return str.split(' ').map(function (word) {
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join(' ');
}

// courtesy of https://gist.github.com/themeteorchef/dcffd74ca3ab45277c81
var isoCountries = {'AF': 'Afghanistan','AX': 'Aland Islands','AL': 'Albania','DZ': 'Algeria','AS': 'American Samoa','AD': 'Andorra','AO': 'Angola','AI': 'Anguilla','AQ': 'Antarctica','AG': 'Antigua And Barbuda','AR': 'Argentina','AM': 'Armenia','AW': 'Aruba','AU': 'Australia','AT': 'Austria','AZ': 'Azerbaijan','BS': 'Bahamas','BH': 'Bahrain','BD': 'Bangladesh','BB': 'Barbados','BY': 'Belarus','BE': 'Belgium','BZ': 'Belize','BJ': 'Benin','BM': 'Bermuda','BT': 'Bhutan','BO': 'Bolivia','BA': 'Bosnia And Herzegovina','BW': 'Botswana','BV': 'Bouvet Island','BR': 'Brazil','IO': 'British Indian Ocean Territory','BN': 'Brunei Darussalam','BG': 'Bulgaria','BF': 'Burkina Faso','BI': 'Burundi','KH': 'Cambodia','CM': 'Cameroon','CA': 'Canada','CV': 'Cape Verde','KY': 'Cayman Islands','CF': 'Central African Republic','TD': 'Chad','CL': 'Chile','CN': 'China','CX': 'Christmas Island','CC': 'Cocos (Keeling) Islands','CO': 'Colombia','KM': 'Comoros','CG': 'Congo','CD': 'Congo, Democratic Republic','CK': 'Cook Islands','CR': 'Costa Rica','CI': 'Cote D\'Ivoire','HR': 'Croatia','CU': 'Cuba','CY': 'Cyprus','CZ': 'Czech Republic','DK': 'Denmark','DJ': 'Djibouti','DM': 'Dominica','DO': 'Dominican Republic','EC': 'Ecuador','EG': 'Egypt','SV': 'El Salvador','GQ': 'Equatorial Guinea','ER': 'Eritrea','EE': 'Estonia','ET': 'Ethiopia','FK': 'Falkland Islands (Malvinas)','FO': 'Faroe Islands','FJ': 'Fiji','FI': 'Finland','FR': 'France','GF': 'French Guiana','PF': 'French Polynesia','TF': 'French Southern Territories','GA': 'Gabon','GM': 'Gambia','GE': 'Georgia','DE': 'Germany','GH': 'Ghana','GI': 'Gibraltar','GR': 'Greece','GL': 'Greenland','GD': 'Grenada','GP': 'Guadeloupe','GU': 'Guam','GT': 'Guatemala','GG': 'Guernsey','GN': 'Guinea','GW': 'Guinea-Bissau','GY': 'Guyana','HT': 'Haiti','HM': 'Heard Island & Mcdonald Islands','VA': 'Holy See (Vatican City State)','HN': 'Honduras','HK': 'Hong Kong','HU': 'Hungary','IS': 'Iceland','IN': 'India','ID': 'Indonesia','IR': 'Iran, Islamic Republic Of','IQ': 'Iraq','IE': 'Ireland','IM': 'Isle Of Man','IL': 'Israel','IT': 'Italy','JM': 'Jamaica','JP': 'Japan','JE': 'Jersey','JO': 'Jordan','KZ': 'Kazakhstan','KE': 'Kenya','KI': 'Kiribati','KR': 'Korea','KW': 'Kuwait','KG': 'Kyrgyzstan','LA': 'Lao People\'s Democratic Republic','LV': 'Latvia','LB': 'Lebanon','LS': 'Lesotho','LR': 'Liberia','LY': 'Libyan Arab Jamahiriya','LI': 'Liechtenstein','LT': 'Lithuania','LU': 'Luxembourg','MO': 'Macao','MK': 'Macedonia','MG': 'Madagascar','MW': 'Malawi','MY': 'Malaysia','MV': 'Maldives','ML': 'Mali','MT': 'Malta','MH': 'Marshall Islands','MQ': 'Martinique','MR': 'Mauritania','MU': 'Mauritius','YT': 'Mayotte','MX': 'Mexico','FM': 'Micronesia, Federated States Of','MD': 'Moldova','MC': 'Monaco','MN': 'Mongolia','ME': 'Montenegro','MS': 'Montserrat','MA': 'Morocco','MZ': 'Mozambique','MM': 'Myanmar','NA': 'Namibia','NR': 'Nauru','NP': 'Nepal','NL': 'Netherlands','AN': 'Netherlands Antilles','NC': 'New Caledonia','NZ': 'New Zealand','NI': 'Nicaragua','NE': 'Niger','NG': 'Nigeria','NU': 'Niue','NF': 'Norfolk Island','MP': 'Northern Mariana Islands','NO': 'Norway','OM': 'Oman','PK': 'Pakistan','PW': 'Palau','PS': 'Palestinian Territory, Occupied','PA': 'Panama','PG': 'Papua New Guinea','PY': 'Paraguay','PE': 'Peru','PH': 'Philippines','PN': 'Pitcairn','PL': 'Poland','PT': 'Portugal','PR': 'Puerto Rico','QA': 'Qatar','RE': 'Reunion','RO': 'Romania','RU': 'Russian Federation','RW': 'Rwanda','BL': 'Saint Barthelemy','SH': 'Saint Helena','KN': 'Saint Kitts And Nevis','LC': 'Saint Lucia','MF': 'Saint Martin','PM': 'Saint Pierre And Miquelon','VC': 'Saint Vincent And Grenadines','WS': 'Samoa','SM': 'San Marino','ST': 'Sao Tome And Principe','SA': 'Saudi Arabia','SN': 'Senegal','RS': 'Serbia','SC': 'Seychelles','SL': 'Sierra Leone','SG': 'Singapore','SK': 'Slovakia','SI': 'Slovenia','SB': 'Solomon Islands','SO': 'Somalia','ZA': 'South Africa','GS': 'South Georgia And Sandwich Isl.','ES': 'Spain','LK': 'Sri Lanka','SD': 'Sudan','SR': 'Suriname','SJ': 'Svalbard And Jan Mayen','SZ': 'Swaziland','SE': 'Sweden','CH': 'Switzerland','SY': 'Syrian Arab Republic','TW': 'Taiwan','TJ': 'Tajikistan','TZ': 'Tanzania','TH': 'Thailand','TL': 'Timor-Leste','TG': 'Togo','TK': 'Tokelau','TO': 'Tonga','TT': 'Trinidad And Tobago','TN': 'Tunisia','TR': 'Turkey','TM': 'Turkmenistan','TC': 'Turks And Caicos Islands','TV': 'Tuvalu','UG': 'Uganda','UA': 'Ukraine','AE': 'United Arab Emirates','GB': 'United Kingdom','US': 'United States','UM': 'United States Outlying Islands','UY': 'Uruguay','UZ': 'Uzbekistan','VU': 'Vanuatu','VE': 'Venezuela','VN': 'Viet Nam','VG': 'Virgin Islands, British','VI': 'Virgin Islands, U.S.','WF': 'Wallis And Futuna','EH': 'Western Sahara','YE': 'Yemen','ZM': 'Zambia','ZW': 'Zimbabwe'
};

// courtesy of https://gist.github.com/themeteorchef/dcffd74ca3ab45277c81
// converts ISO3166-1 a-2 codes to long names.
function getCountryName(countryCode) {
	if (isoCountries.hasOwnProperty(countryCode)) {
		return isoCountries[countryCode];
	} else {
		return countryCode;
	}
}

function enterClickedUpdate(event) {
	if (event.key === "Enter") {
		searchCityUpdate();
	}
}

function enterClicked(event) {
	if (event.key === "Enter") {
		searchCity();
	}
}