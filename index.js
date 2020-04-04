const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
var moment = require('moment');
const axios = require('axios');
app.get('/indianStats', function (req, res) {
    var response = {};

    var time;
    var confirmed;
    var death;
    var recovered;
    var todayConfirmed;
    var stateData = [];
    var todayDeath;
    var todayRecovered;
    axios.all([axios.get('https://api.covid19india.org/data.json'), axios.get('https://api.covid19india.org/state_district_wise.json')])
        .then(axios.spread((data, distData) => {
            var finalData = data.data;
            var districtData = distData.data;
            var confirmedGraph = [];
            var recoveredGraph = [];
            var deathGraph = [];
            finalData.cases_time_series = finalData.cases_time_series.map(elm => {
                confirmedGraph.push(+(+elm.dailyconfirmed).toFixed(1))
                recoveredGraph.push(+(+elm.dailyrecovered).toFixed(1));
                deathGraph.push(+(+elm.dailydeceased).toFixed(1))
                return elm;
            })
            finalData.statewise = finalData.statewise.map(element => {
                if (element.statecode == 'TT') {
                    time = element.lastupdatedtime;
                    confirmed = element.confirmed;
                    recovered = element.recovered;
                    death = element.deaths;
                    todayConfirmed = element.delta.confirmed.toString();
                    todayRecovered = element.delta.recovered.toString();
                    todayDeath = element.delta.deaths.toString();
                }
                else {
                    let district = [];
                    console.log(element.state);
                    if (districtData[element.state])
                        for (let key in districtData[element.state].districtData) {
                            district.push({
                                name: key,
                                count: districtData[element.state].districtData[key].confirmed.toString(),
                                todayCount: districtData[element.state].districtData[key].delta.confirmed.toString()
                            });
                        }
                    stateData.push(
                        {
                            state: element.state,
                            showDistrict: false,
                            "totalDeath": element.deaths,
                            "totalConfirmed": element.confirmed,
                            "totalRecovered": element.recovered,
                            "todayDeath": element.delta.deaths.toString(),
                            "todayRecovered": element.delta.recovered.toString(),
                            "todayConfirmed": element.delta.confirmed.toString(),
                            "districts": district
                        }
                    )
                }
                return element;

            });


            response = {
                time,
                confirmedGraph,
                recoveredGraph,
                deathGraph,
                confirmed,
                recovered,
                death,
                todayConfirmed,
                todayRecovered,
                todayDeath,
                stateData
            }
            res.send(response)

        }
        ))
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}
);
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
