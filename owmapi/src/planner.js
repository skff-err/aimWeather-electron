// this js file is used in travel-create.html only
// replace this api key with yours if ratelimited
const apiKey = '30aa772f20d15a38190aab4ef07a8f74';

// displays the forecasts of the arrival and departure cities
async function fetchWeather(city, datetime) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const forecast = findNearestForecast(data.list, datetime);
        const country = data.city.country;
        return { forecast, country };
    } catch (error) {
        console.error('Error fetching weather data:', error);
		alert('City not found.')
        throw error;
    }
}

// by default, weather forecasts provided by the api are in 3 hour intervals
// this function would find the forecast closest to the inputted date and time
function findNearestForecast(forecasts, dateTime) {
    var selectedDate = new Date(dateTime);
    var nearestForecast = forecasts.reduce((prev, curr) => {
        var prevDiff = Math.abs(new Date(prev.dt_txt) - selectedDate);
        var currDiff = Math.abs(new Date(curr.dt_txt) - selectedDate);
        return prevDiff < currDiff ? prev : curr;
    });

    var nearestDate = new Date(nearestForecast.dt_txt);
    // return the nearest forecast only if it's within 3 hours of the selected time
    return Math.abs(nearestDate - selectedDate) <= 3 * 60 * 60 * 1000 ? nearestForecast : null;
}

// handles city searching with datetime validation
async function searchCity() {
    const departureCity = document.getElementById('city-departure').value;
    const arrivalCity = document.getElementById('city-arrival').value;
    const departureDateTime = document.getElementById('departure-datetime').value;
    const arrivalDateTime = document.getElementById('arrival-datetime').value;

    if (!validateDateTime(departureDateTime, arrivalDateTime)) {
        return;
    }

    const { forecast: departureForecast, country: departureCountry } = await fetchWeather(departureCity, departureDateTime);
    const { forecast: arrivalForecast, country: arrivalCountry } = await fetchWeather(arrivalCity, arrivalDateTime);

    displayForecast('forecast-preview', departureForecast, arrivalForecast, departureCity, departureCountry, arrivalCity, arrivalCountry, departureDateTime, arrivalDateTime);

    document.getElementById('save-button').style.display = 'block';
    document.getElementById('save-button').addEventListener('click', () => {
        saveForecasts(departureCity, arrivalCity, departureForecast, arrivalForecast, departureCountry, arrivalCountry, departureDateTime, arrivalDateTime);
    });
}

// *- NOTE
// *- ternary operator usage:
// *- condition ? what-to-do-if-true : what-to-do-if-false
// displays the forecast for the selected cities
function displayForecast(elementId, departureForecast, arrivalForecast, departureCity, departureCountry, arrivalCity, arrivalCountry, departureDateTime, arrivalDateTime) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    document.getElementById('planned-travels-header').style.display = 'block';

    departureCity = toSentenceCase(departureCity);
    arrivalCity = toSentenceCase(arrivalCity);
    departureCountry = getCountryName(departureCountry);
    arrivalCountry = getCountryName(arrivalCountry);

    const departureIconUrl = departureForecast ? `https://openweathermap.org/img/wn/${departureForecast.weather[0].icon}@4x.png` : '';
    const arrivalIconUrl = arrivalForecast ? `https://openweathermap.org/img/wn/${arrivalForecast.weather[0].icon}@4x.png` : '';
    const unavailableIcon = '<div class="unavailable-container"><span class="material-symbols-outlined unavailable">cloud_off</span></div>';
    const unavailableText = 'Forecast unavailable for selected date';

	if(departureForecast) {
		var departureTemp = (departureForecast.main.temp).toFixed(0) + '°';
		var departureDesc = toSentenceCase(departureForecast.weather[0].description);
	} else {
		var departureTemp = '';
		var departureDesc = '';
	}

	if(arrivalForecast) {
		var arrivalTemp = (arrivalForecast.main.temp).toFixed(0) + '°';
		var arrivalDesc = toSentenceCase(arrivalForecast.weather[0].description);
	} else {
		var arrivalTemp = '';
		var arrivalDesc = '';
	}

    const forecastInfo = `
	<article>
		<header>
			<strong>Forecast: </strong>
			${departureCity} and ${arrivalCity}
		</header>
		<div class="center-row-forecast-travel">
			<div class="departure">
				<strong>${departureCity}, ${departureCountry}</strong>
				${departureIconUrl ? `<img class="forecast-img" src="${departureIconUrl}" alt="">` : unavailableIcon}
				${departureForecast ? `<p><strong>${departureTemp} &bull; ${departureDesc}</strong></p>` : unavailableText}

			</div>
			<div class="middle">
				<strong>Travel Forecast</strong>
				<span class="material-symbols-outlined arrow">
					flight_land
				</span>
			</div>
			<div class="arrival">
				<strong>${arrivalCity}, ${arrivalCountry}</strong>
				${arrivalIconUrl ? `<img class="forecast-img" src="${arrivalIconUrl}" alt="">` : unavailableIcon}
				${arrivalForecast ? `<p><strong>${arrivalTemp} &bull; ${arrivalDesc}</strong></p>` : unavailableText}
			</div>
		</div>
		<br />
		<footer>
			<details>
				<summary><strong>Details<strong></summary>
				<div class="center-row-forecast-travel">
					<div class="departure">
						${departureForecast ? `
							<p>Feels like: <strong>${(departureForecast.main.feels_like).toFixed(0)}°</strong></p>
							<p>Min: <strong>${(departureForecast.main.temp_min).toFixed(0)}°</strong></p>
							<p>Max: <strong>${(departureForecast.main.temp_max).toFixed(0)}°</strong></p>
							<p>Humidity: <strong>${departureForecast.main.humidity}%</strong></p>
							<p>Forecast time: <strong>${departureForecast.dt_txt}</strong></p>
						` : unavailableText}
					</div>
					<div class="middle">

					</div>
					<div class="arrival">
						${arrivalForecast ? `
							<p>Feels like: <strong>${(arrivalForecast.main.feels_like).toFixed(0)}°</strong></p>
							<p>Min: <strong>${(arrivalForecast.main.temp_min).toFixed(0)}°</strong></p>
							<p>Max: <strong>${(arrivalForecast.main.temp_max).toFixed(0)}°</strong></p>
							<p>Humidity: <strong>${arrivalForecast.main.humidity}%</strong></p>
							<p>Forecast time: <strong>${arrivalForecast.dt_txt}</strong></p>
						` : unavailableText}
					</div>
				</div>
			</details>
		</footer>
	</article>
    `;

    element.innerHTML = forecastInfo;
}

// this function checks whether:
// datetime is empty
// arrival date is less than departure date
function validateDateTime(departureDateTime, arrivalDateTime) {
    const departureDate = new Date(departureDateTime);
    const arrivalDate = new Date(arrivalDateTime);

    if (departureDateTime === '' || arrivalDateTime === '') {
        alert('Date and time required.');
        return false;
    }

    if (arrivalDate <= departureDate) {
        alert('Arrival datetime must be after departure datetime.');
        return false;
    }

    return true;
}

// saves the cities' forecast into localstorage
function saveForecasts(departureCity, arrivalCity, departureForecast, arrivalForecast, departureCountry, arrivalCountry, departureDateTime, arrivalDateTime) {
    const savedForecasts = JSON.parse(localStorage.getItem('savedForecasts')) || [];
    const forecastObject = {
        departureCity,
        arrivalCity,
        departureForecast,
        arrivalForecast,
        departureCountry,
        arrivalCountry,
        departureDateTime,
        arrivalDateTime
    };
    savedForecasts.push(forecastObject);
    localStorage.setItem('savedForecasts', JSON.stringify(savedForecasts));
	
    displaySavedForecasts();
}

// displays saved forecasts
function displaySavedForecasts() {
    const savedForecasts = JSON.parse(localStorage.getItem('savedForecasts')) || [];

    const savedForecastsElement = document.getElementById('saved-forecasts');
    savedForecastsElement.innerHTML = '';

    if (savedForecasts.length > 0) {
        document.getElementById('planned-travels-header').style.display = 'block'
    } else {
        document.getElementById('planned-travels-header').style.display = 'none'
    }

    savedForecasts.forEach((item, index) => {
        const travelTime = calculateTravelTime(item.departureDateTime, item.arrivalDateTime);

        const div = document.createElement('div');
        div.classList.add('forecast-item');
        div.innerHTML = `
            <article>
                <header>${toSentenceCase(item.departureCity)} to ${toSentenceCase(item.arrivalCity)}</header>
                <div class="center-row-forecast-travel">
                    <div class="departure">
                        <strong>${toSentenceCase(item.departureCity)}, ${getCountryName(item.departureCountry)}</strong>
                        ${item.departureForecast ? `
                            <img class="forecast-img" src="https://openweathermap.org/img/wn/${item.departureForecast.weather[0].icon}@4x.png">
                            <p><strong>${(item.departureForecast.main.temp).toFixed(0)}°</strong> &bull; ${toSentenceCase(item.departureForecast.weather[0].description)}</p>
                        ` : `
                            <span class="material-symbols-outlined cloud_off"></span>
                            <p>Forecast unavailable for date</p>
                        `}
                    </div>
                    <div class="middle">
                        <strong>Travel Forecast</strong>
                        <span class="material-symbols-outlined arrow">
                            flight_land
                        </span>
                        <strong>Travel Time</strong>
                        <p>${travelTime}</p>
                    </div>
                    <div class="arrival">
                        <strong>${toSentenceCase(item.arrivalCity)}, ${getCountryName(item.arrivalCountry)}</strong>
                        ${item.arrivalForecast ? `
                            <img class="forecast-img" src="https://openweathermap.org/img/wn/${item.arrivalForecast.weather[0].icon}@4x.png">
                            <p><strong>${(item.arrivalForecast.main.temp).toFixed(0)}°</strong> &bull; ${toSentenceCase(item.arrivalForecast.weather[0].description)}</p>
                        ` : `
							<div class="unavailable-container">
                            	<span class="material-symbols-outlined unavailable">cloud_off</span>
							</div>
                            <p>Forecast unavailable for selected date</p>
                        `}
                    </div>
                </div>
                <br />
				<footer>
					<details>
						<summary><strong>Details<strong></summary>
						<div class="center-row-forecast-travel">
							<div class="departure">
								${item.departureForecast ? `
									<p>Feels like: <strong>${(item.departureForecast.main.feels_like).toFixed(0)}°</strong></p>
									<p>Min: <strong>${(item.departureForecast.main.temp_min).toFixed(0)}°</strong></p>
									<p>Max: <strong>${(item.departureForecast.main.temp_max).toFixed(0)}°</strong></p>
									<p>Humidity: <strong>${item.departureForecast.main.humidity}%</strong></p>
									<p>Forecast time: <strong>${item.departureForecast.dt_txt}</strong></p>
								` : `<p>Forecast unavailable for selected date</p>`}
							</div>
							<div class="middle">
								<button data-tooltip="Delete Plan" class="outline red" onclick="deleteForecast(${index})">
									<span class="material-symbols-outlined">delete</span>
								</button>
							</div>
							<div class="arrival">
								${item.arrivalForecast ? `
									<p>Feels like: <strong>${(item.arrivalForecast.main.feels_like).toFixed(0)}°</strong></p>
									<p>Min: <strong>${(item.arrivalForecast.main.temp_min).toFixed(0)}°</strong></p>
									<p>Max: <strong>${(item.arrivalForecast.main.temp_max).toFixed(0)}°</strong></p>
									<p>Humidity: <strong>${item.arrivalForecast.main.humidity}%</strong></p>
									<p>Forecast time: <strong>${item.arrivalForecast.dt_txt}</strong></p>
								` : `<p>Forecast unavailable for selected date</p>`}
							</div>
						</div>
					</details>
				</footer>
            </article>
        `;
        savedForecastsElement.appendChild(div);
    });
}

// this function calculates the travel time to be displayed in the saved forecasts display
function calculateTravelTime(departureDateTime, arrivalDateTime) {
    const departureDate = new Date(departureDateTime);
    const arrivalDate = new Date(arrivalDateTime);
    const differenceInMilliseconds = Math.abs(arrivalDate - departureDate);
    const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    return `${days} days, ${hours % 24} hours`;
}

// deletes forecast from local storage
function deleteForecast(index) {
    if (confirm('Are you sure you want to delete this travel forecast?')) {
        const savedForecasts = JSON.parse(localStorage.getItem('savedForecasts')) || [];
        savedForecasts.splice(index, 1);
        localStorage.setItem('savedForecasts', JSON.stringify(savedForecasts));
        displaySavedForecasts();
    }
}


function enterClicked(event) {
    if (event.key === 'Enter') {
        searchCity();
    }
}

function toSentenceCase(str) {
    return str.split(' ').map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }

// courtesy of https://gist.github.com/themeteorchef/dcffd74ca3ab45277c81
var isoCountries = {'AF' : 'Afghanistan','AX' : 'Aland Islands','AL' : 'Albania','DZ' : 'Algeria','AS' : 'American Samoa','AD' : 'Andorra','AO' : 'Angola','AI' : 'Anguilla','AQ' : 'Antarctica','AG' : 'Antigua And Barbuda','AR' : 'Argentina','AM' : 'Armenia','AW' : 'Aruba','AU' : 'Australia','AT' : 'Austria','AZ' : 'Azerbaijan','BS' : 'Bahamas','BH' : 'Bahrain','BD' : 'Bangladesh','BB' : 'Barbados','BY' : 'Belarus','BE' : 'Belgium','BZ' : 'Belize','BJ' : 'Benin','BM' : 'Bermuda','BT' : 'Bhutan','BO' : 'Bolivia','BA' : 'Bosnia And Herzegovina','BW' : 'Botswana','BV' : 'Bouvet Island','BR' : 'Brazil','IO' : 'British Indian Ocean Territory','BN' : 'Brunei Darussalam','BG' : 'Bulgaria','BF' : 'Burkina Faso','BI' : 'Burundi','KH' : 'Cambodia','CM' : 'Cameroon','CA' : 'Canada','CV' : 'Cape Verde','KY' : 'Cayman Islands','CF' : 'Central African Republic','TD' : 'Chad','CL' : 'Chile','CN' : 'China','CX' : 'Christmas Island','CC' : 'Cocos (Keeling) Islands','CO' : 'Colombia','KM' : 'Comoros','CG' : 'Congo','CD' : 'Congo, Democratic Republic','CK' : 'Cook Islands','CR' : 'Costa Rica','CI' : 'Cote D\'Ivoire','HR' : 'Croatia','CU' : 'Cuba','CY' : 'Cyprus','CZ' : 'Czech Republic','DK' : 'Denmark','DJ' : 'Djibouti','DM' : 'Dominica','DO' : 'Dominican Republic','EC' : 'Ecuador','EG' : 'Egypt','SV' : 'El Salvador','GQ' : 'Equatorial Guinea','ER' : 'Eritrea','EE' : 'Estonia','ET' : 'Ethiopia','FK' : 'Falkland Islands (Malvinas)','FO' : 'Faroe Islands','FJ' : 'Fiji','FI' : 'Finland','FR' : 'France','GF' : 'French Guiana','PF' : 'French Polynesia','TF' : 'French Southern Territories','GA' : 'Gabon','GM' : 'Gambia','GE' : 'Georgia','DE' : 'Germany','GH' : 'Ghana','GI' : 'Gibraltar','GR' : 'Greece','GL' : 'Greenland','GD' : 'Grenada','GP' : 'Guadeloupe','GU' : 'Guam','GT' : 'Guatemala','GG' : 'Guernsey','GN' : 'Guinea','GW' : 'Guinea-Bissau','GY' : 'Guyana','HT' : 'Haiti','HM' : 'Heard Island & Mcdonald Islands','VA' : 'Holy See (Vatican City State)','HN' : 'Honduras','HK' : 'Hong Kong','HU' : 'Hungary','IS' : 'Iceland','IN' : 'India','ID' : 'Indonesia','IR' : 'Iran, Islamic Republic Of','IQ' : 'Iraq','IE' : 'Ireland','IM' : 'Isle Of Man','IL' : 'Israel','IT' : 'Italy','JM' : 'Jamaica','JP' : 'Japan','JE' : 'Jersey','JO' : 'Jordan','KZ' : 'Kazakhstan','KE' : 'Kenya','KI' : 'Kiribati','KR' : 'Korea','KW' : 'Kuwait','KG' : 'Kyrgyzstan','LA' : 'Lao People\'s Democratic Republic','LV' : 'Latvia','LB' : 'Lebanon','LS' : 'Lesotho','LR' : 'Liberia','LY' : 'Libyan Arab Jamahiriya','LI' : 'Liechtenstein','LT' : 'Lithuania','LU' : 'Luxembourg','MO' : 'Macao','MK' : 'Macedonia','MG' : 'Madagascar','MW' : 'Malawi','MY' : 'Malaysia','MV' : 'Maldives','ML' : 'Mali','MT' : 'Malta','MH' : 'Marshall Islands','MQ' : 'Martinique','MR' : 'Mauritania','MU' : 'Mauritius','YT' : 'Mayotte','MX' : 'Mexico','FM' : 'Micronesia, Federated States Of','MD' : 'Moldova','MC' : 'Monaco','MN' : 'Mongolia','ME' : 'Montenegro','MS' : 'Montserrat','MA' : 'Morocco','MZ' : 'Mozambique','MM' : 'Myanmar','NA' : 'Namibia','NR' : 'Nauru','NP' : 'Nepal','NL' : 'Netherlands','AN' : 'Netherlands Antilles','NC' : 'New Caledonia','NZ' : 'New Zealand','NI' : 'Nicaragua','NE' : 'Niger','NG' : 'Nigeria','NU' : 'Niue','NF' : 'Norfolk Island','MP' : 'Northern Mariana Islands','NO' : 'Norway','OM' : 'Oman','PK' : 'Pakistan','PW' : 'Palau','PS' : 'Palestinian Territory, Occupied','PA' : 'Panama','PG' : 'Papua New Guinea','PY' : 'Paraguay','PE' : 'Peru','PH' : 'Philippines','PN' : 'Pitcairn','PL' : 'Poland','PT' : 'Portugal','PR' : 'Puerto Rico','QA' : 'Qatar','RE' : 'Reunion','RO' : 'Romania','RU' : 'Russian Federation','RW' : 'Rwanda','BL' : 'Saint Barthelemy','SH' : 'Saint Helena','KN' : 'Saint Kitts And Nevis','LC' : 'Saint Lucia','MF' : 'Saint Martin','PM' : 'Saint Pierre And Miquelon','VC' : 'Saint Vincent And Grenadines','WS' : 'Samoa','SM' : 'San Marino','ST' : 'Sao Tome And Principe','SA' : 'Saudi Arabia','SN' : 'Senegal','RS' : 'Serbia','SC' : 'Seychelles','SL' : 'Sierra Leone','SG' : 'Singapore','SK' : 'Slovakia','SI' : 'Slovenia','SB' : 'Solomon Islands','SO' : 'Somalia','ZA' : 'South Africa','GS' : 'South Georgia And Sandwich Isl.','ES' : 'Spain','LK' : 'Sri Lanka','SD' : 'Sudan','SR' : 'Suriname','SJ' : 'Svalbard And Jan Mayen','SZ' : 'Swaziland','SE' : 'Sweden','CH' : 'Switzerland','SY' : 'Syrian Arab Republic','TW' : 'Taiwan','TJ' : 'Tajikistan','TZ' : 'Tanzania','TH' : 'Thailand','TL' : 'Timor-Leste','TG' : 'Togo','TK' : 'Tokelau','TO' : 'Tonga','TT' : 'Trinidad And Tobago','TN' : 'Tunisia','TR' : 'Turkey','TM' : 'Turkmenistan','TC' : 'Turks And Caicos Islands','TV' : 'Tuvalu','UG' : 'Uganda','UA' : 'Ukraine','AE' : 'United Arab Emirates','GB' : 'United Kingdom','US' : 'United States','UM' : 'United States Outlying Islands','UY' : 'Uruguay','UZ' : 'Uzbekistan','VU' : 'Vanuatu','VE' : 'Venezuela','VN' : 'Viet Nam','VG' : 'Virgin Islands, British','VI' : 'Virgin Islands, U.S.','WF' : 'Wallis And Futuna','EH' : 'Western Sahara','YE' : 'Yemen','ZM' : 'Zambia','ZW' : 'Zimbabwe'
};

// courtesy of https://gist.github.com/themeteorchef/dcffd74ca3ab45277c81
function getCountryName (countryCode) {
	if (isoCountries.hasOwnProperty(countryCode)) {
			return isoCountries[countryCode];
	} else {
			return countryCode;
	}
}
