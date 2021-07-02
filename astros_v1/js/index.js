// FETCH DATA
const remoteURL = "https://raw.githubusercontent.com/rd-astros/hiring-resources/master/pitches.json";
const localURL = "../sampledata/pitches.json";

fetchData(remoteURL);

function fetchData(url) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        document.querySelector(".loading").classList.add("loaded");
        document.querySelector(".wrapper").classList.remove("fetching");

        let eventsJSON = JSON.parse(this.responseText);
        let events = eventsJSON.queryResults.row;

        let pitchingTechniques = [];
        let eventResults = [];

        for(let i = 0; i < events.length; i++) {
             if(events[i].event_result !== "") {
                // create an event card for each event
                document.querySelector("#all_events").innerHTML += displayCard(events[i]);
            
                // populate the pitchingTechniques array
                // first check if the pitchingTechnique is already in the array 
                // if it exists add to its count
                // we need it for the doughnut graph
                const foundPitch = pitchingTechniques.some(element => element.pitchTechnique === events[i].pitch_type);
                if(!foundPitch) {
                    pitchingTechniques.push({
                        pitchTechnique: events[i].pitch_type,
                        pitchName: events[i].pitch_name,
                        count: 1
                    })
                } else {
                    for(let x in pitchingTechniques) {
                        if(pitchingTechniques[x].pitchTechnique === events[i].pitch_type) {
                            pitchingTechniques[x].count = pitchingTechniques[x].count + 1;
                            break;
                        }
                    }
                }

                // Populate the events array
                // we need this to in turn populate the filter options
                const foundResult = eventResults.some(result => result === events[i].event_result);
                if(!foundResult) eventResults.push(events[i].event_result);
            }
        }

        // Populate the pitch type filter
        pitchingTechniques.forEach(function(technique) {
            document.querySelector(".filters select#filter_pitch").innerHTML += `<option value="${technique.pitchTechnique}">${technique.pitchName}</option>`
        })

        // Populate the event filter
        eventResults.forEach(function(result) {
            if(result !== "") {
                document.querySelector(".filters select#filter_result").innerHTML += `<option value="${result}">${result}</option>`
            }
        })
        
        // the doughnut chart
        displayPitchingTechniques(pitchingTechniques);
        
    }
    xhttp.open("GET", url);
    xhttp.send();
}

function displayCard(play) {
    let inning;
    play.inning_half === "1" ? inning = "Top" : inning = "Bottom";

    let stringifiedObj = JSON.stringify(play)

    let card = `<div class="event"  data-pitch="${play.pitch_type}" data-inning="${play.inning_half}" data-result="${play.event_result}">
                    <div class="event_inning" title="inning"><i class="fas fa-chevron-circle-${play.inning_half === "1" ? "up" : "down"}"></i> ${inning}</div>
                    
                    <div class="event_balls_to_strikes"><p><span title="balls">${play.balls}</span> - <span title="strikes">${play.strikes}</span></p></div>
                    
                    <div class="event_pitchtype" title="pitch type"><strong> ${play.pitch_type} -</strong> ${play.pitch_name}</div>
                    
                    <div class="event_players">
                        <div class="event_batter" title="batter">
                            <img src="./images/batter.png" alt="">
                            <p><strong>${play.batter_name}</strong></p>
                        </div>
                        <p>vs</p>
                        <div class="event_pitcher" title="pitcher">
                            <p><strong>${play.pitcher_name}</strong></p>
                            <img src="./images/pitcher.png" alt="">
                        </div>
                    </div>
                    
                    <div class="event_result" title="result">
                        <p>${play.event_result}</p>
                        <div class="event_link">
                            <button onclick="openModal('${encodeURIComponent(stringifiedObj)}')"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>

                    
                </div>`;

    return card;
}


// GENERAL DATA
function displayPitchingTechniques(techniques) {
    
    // pitches - Doughnut

    const pitchesConfigData = {
        labels: techniques.map(technique => technique.pitchName),
        datasets: [{
            label: "Pitch comparisons",
            data: techniques.map(technique => technique.count),
            backgroundColor: techniques.map(technique => randomColor()),
            hoverOffset: 4
        }]
    }

    const pitchConfig = { 
        type: "doughnut",
        data: pitchesConfigData
    }

    new Chart(document.getElementById("pitchData"), pitchConfig);
}

//////////////////////////////////////////////////
/////////// MODAL ///////////////////////////////

let speedChart;
let accelChart;
let velocityChart;
let positionsChart;

function openModal(play) {
    const event = JSON.parse(decodeURIComponent(play));

    let links = document.querySelectorAll(".event_link button");
    let modal = document.querySelector(".single_event");

    Object.keys(links).forEach(function(key) {
        links[key].addEventListener("click", function() {
            console.log("clicked")
            modal.classList.remove("hide");
        })
    })

    document.querySelector(".single_event_details").innerHTML = "";
    document.querySelector(".single_event_details").innerHTML = `<div class="single_event_date">
                                                                    <small class="date"><i class="fas fa-calendar-day"></i> ${event.time_code.split("T")[0].replace(/-/g, " / ")}</small>
                                                                    <p class="time"><i class="fas fa-clock"></i> ${event.time_code.split("T")[1]}</p>
                                                                </div>

                                                                <div class="teams">
                                                                    <div class="home_team">
                                                                        <small>Home Team</small>
                                                                        <br />
                                                                        <strong>${event.home_team_name}</strong>
                                                                    </div>
                                                                    <div class="away_team">
                                                                        <small>Away Team</small>
                                                                        <br />
                                                                        <strong>${event.away_team_name}</strong>
                                                                    </div>
                                                                </div>

                                                                <div class="single_event_teams">
                                                                    <div class="single_team_event single_team_event_batting_team">
                                                                        <p>Batting team: <span>${event.batting_team_name}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_team_event_fielding_team">
                                                                        <p>Fielding team: <span>${event.fielding_team_name}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_pitch_name">
                                                                        <p>Pitch name: <span>${event.pitch_name}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_result">
                                                                        <p>Event result: <span>${event.event_result}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_batter">
                                                                        <p>Batter name: <span>${event.batter_name}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_pitcher">
                                                                        <p>Pitcher name: <span>${event.pitcher_name}</span></p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_balls">
                                                                        <p>${event.balls}</p>
                                                                    </div>
                                                                    <div class="single_team_event single_event_strikes">
                                                                        <p>${event.strikes}</p>
                                                                    </div>
                                                                    
                                                                </div>`;


    //numerical stats
    const numericalStatsConfigData = {
        labels: ["Initial speed","Plate speed"],
        datasets: [
                {
                label: "Initial speed vs plate speed (mph)",
                data: [pad(event.initial_speed), pad(event.plate_speed)],            
                backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(75, 192, 192, 0.6)"]
                }
            ]
    }

    const numericalStatsConfig = {
    type: "bar",
    data: numericalStatsConfigData,
    options: {indexAxis:"y"}
    }

    // destroy any previous chart drawn on the canvas
    speedChart && speedChart.destroy();
    speedChart = new Chart(document.getElementById("event_numerical_stats"), numericalStatsConfig);

    // Acceleration
    const accelConfigData = {
        labels: ["Initial acceleration Y", "Initial acceleration Z", "Initial acceleration X"],
        datasets: [{
                label: 'Acceleration (feet/s/s)',
                data: [pad(event.init_accel_y), pad(event.init_accel_z), pad(event.init_accel_x)],
                fill: false,
                backgroundColor: 'rgba(255, 205, 86, 0.6)',
                borderColor: 'rgba(255, 205, 86, 0.6)',
                pointBackgroundColor: 'rgba(255, 205, 86, 0.6)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 205, 86, 0.9)',
                pointRadius: 8
            }]
    }

    const accelConfig = {
    type: "radar",
    data: accelConfigData,
    options: {elements: {line: {borderWidth: 2}}}
    }

    accelChart && accelChart.destroy();
    accelChart = new Chart(document.getElementById("accel"), accelConfig);

    // Velocity
    const velocityConfigData = {
        labels: ["Initial velocity Y", "Initial velocity Z", "Initial velocity X"],
        datasets: [{
                label: 'Initial velocities (feet/s)',
                data: [pad(event.init_vel_y), pad(event.init_vel_z), pad(event.init_vel_x)],
                fill: false,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 0.6)',
                pointBackgroundColor: 'rgba(153, 102, 255, 0.6)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(153, 102, 255, 0.9)',
                pointRadius: 8
            }]
    }

    const velocityConfig = {
    type: "radar",
    data: velocityConfigData,
    options: {elements: {line: {borderWidth: 2}}}
    }

    velocityChart && velocityChart.destroy();
    velocityChart = new Chart(document.getElementById("velocity"), velocityConfig);

    // Positions
    const eventPositionsConfigData = {
        labels: ["Plate position Y", "Plate position Z", "Plate position X"],
        datasets: [{
                label: 'Plate positions(feet)',
                data: [pad(event.plate_y), pad(event.plate_z), pad(event.plate_x)],
                fill: false,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor:"rgba(75, 192, 192, 0.6)",
                pointBackgroundColor: "rgba(75, 192, 192, 0.6)",
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: "rgba(75, 192, 192, 0.9)",
                pointRadius: 8
            }]
    }

    const eventPositionsConfig = {
    type: "radar",
    data: eventPositionsConfigData,
    options: {elements: {line: {borderWidth: 2}}}
    }

    positionsChart && positionsChart.destroy();
    positionsChart = new Chart(document.getElementById("event_positions"), eventPositionsConfig);

}

// close the modal
const closeBtn = document.querySelector(".close_single_event_modal_btn button");

closeBtn.addEventListener("click", function() {
    document.querySelector(".single_event").classList.add("hide");
})

////////////////////////////////////////////////////////////
/////////FILTER ////////////////////////////////////////////
// Listen for changes in the filter options
document.querySelector(".filters select#filter_pitch").addEventListener("change", (e) => filterResults("filterByPitch", e.target.value));
document.querySelector(".filters select#filter_inning").addEventListener("change", (e) => filterResults("filterByInning", e.target.value));
document.querySelector(".filters select#filter_result").addEventListener("change", (e) => filterResults("filterByResult", e.target.value));

function filterResults(filterCriteria, value) {
    let eventCards = document.querySelectorAll(".event");

    Object.keys(eventCards).forEach(function(key) {

        // reset every card intially
        eventCards[key].classList.remove("filter_out");

        switch (filterCriteria) {
            case "filterByPitch":
                if(eventCards[key].getAttribute("data-pitch") !== value && value !== "all") {
                    eventCards[key].classList.add("filter_out");
                }
                resetSelection(document.querySelector(".filters select#filter_inning"));
                resetSelection(document.querySelector(".filters select#filter_result"));
                break;
            case "filterByInning":
                if(eventCards[key].getAttribute("data-inning") !== value && value !== "all") {
                    eventCards[key].classList.add("filter_out");
                }
                resetSelection(document.querySelector(".filters select#filter_pitch"));
                resetSelection(document.querySelector(".filters select#filter_result"));
                break;
            case "filterByResult":
                if(eventCards[key].getAttribute("data-result") !== value && value !== "all") {
                    eventCards[key].classList.add("filter_out");
                }
                resetSelection(document.querySelector(".filters select#filter_pitch"));
                resetSelection(document.querySelector(".filters select#filter_inning"));
                break;
            default:
                eventCards[key].classList.remove("filter_out");
        }

    })
    
}

////////////////////////////////////////
////////////////UTILITIES /////////////

// generate random colors for the charts
function randomColor() {
    let red = Math.floor((Math.random() * 255) + 1);
    let green = Math.floor((Math.random() * 255) + 1);
    let blue = Math.floor((Math.random() * 255) + 1);

    return `rgb(${red}, ${green}, ${blue})`;
}

////////////////////////////
function pad(num) {
    return parseFloat(num).toFixed(2);
}

// reset the other filter select boxes
function resetSelection(element) {
    element.selectedIndex = 0;
}