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
    var active;
    var todayDeath;
    var todayRecovered;
    axios.all([
        axios.get('https://api.covid19india.org/data.json'),
        axios.get('https://api.covid19india.org/state_district_wise.json'),
        axios.get('https://api.covid19india.org/v5/min/data.min.json')])

        .then(axios.spread((data, distData, minData) => {
            var finalData = data.data;
            var districtData = distData.data;
            var minData = minData.data;
            var confirmedGraph = [];
            var recoveredGraph = [];
            var deathGraph = [];
            var activeGraph = [];
            var activeCases = 0;
            finalData.cases_time_series = finalData.cases_time_series.map(elm => {
                if (moment(elm.date + '2020', 'DD MMMM YYYY').isAfter(moment('2020-03-01', 'YYYY-MM-DD'))) {
                    confirmedGraph.push(+(elm.dailyconfirmed + '.1'));
                    recoveredGraph.push(+(elm.dailyrecovered + '.1'));
                    deathGraph.push(+(elm.dailydeceased + '.1'));
                    activeGraph.push(+((+elm.dailyconfirmed - (+elm.dailyrecovered + +elm.dailydeceased)) + '.1'))
                }
                return elm;
            });
            confirmedGraph = confirmedGraph.slice(Math.max(confirmedGraph.length - 12, 1))
            recoveredGraph = recoveredGraph.slice(Math.max(recoveredGraph.length - 12, 1));
            activeGraph = activeGraph.slice(Math.max(activeGraph.length - 12, 1));
            deathGraph = deathGraph.slice(Math.max(deathGraph.length - 12, 1))
            finalData.statewise = finalData.statewise.map(element => {
                if (element.statecode == 'TT') {
                    time = element.lastupdatedtime ? moment(element.lastupdatedtime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST': '';
                    confirmed = element.confirmed;
                    recovered = element.recovered;
                    death = element.deaths;
                    active = element.active;
                    todayConfirmed = element.deltaconfirmed.toString();
                    todayRecovered = element.deltarecovered.toString();
                    todayDeath = element.deltadeaths.toString();
                }
                else {
                    let district = [];
                    if (districtData[element.state]) {
                        for (let key in districtData[element.state].districtData) {
                            district.push({
                                name: key,
                                count: districtData[element.state].districtData[key].confirmed.toString(),
                                todayCount: districtData[element.state].districtData[key].delta.confirmed.toString()
                            });
                        }
                        district.sort(function (a, b) {
                            return b.count - a.count
                        })
                    }
                    let stateStats = minData[element.statecode];
                    let lastUpdated = '';
                    if (stateStats && stateStats.meta) {
                        let dateTime;
                        if (stateStats.meta.last_updated) {
                            let splitDate = stateStats.meta.last_updated.split('T');
                            let splitTime = splitDate[1].split('+');
                            console.log(splitDate[0], splitTime[0]);
                            dateTime = splitDate[0] + ' ' + splitTime[0];
                        }
                        lastUpdated = stateStats.meta.last_updated ? moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST' : ''
                    }
                    stateData.push(
                        {
                            state: element.state,
                            showDistrict: false,
                            "lastUpdated": lastUpdated,
                            "totalDeath": element.deaths,
                            "totalConfirmed": element.confirmed,
                            "totalRecovered": element.recovered,
                            "totalActive": element.active,
                            "todayDeath": element.deltadeaths.toString(),
                            "todayRecovered": element.deltarecovered.toString(),
                            "todayConfirmed": element.deltaconfirmed.toString(),
                            "districts": district,
                        }
                    )
                }
                return element;

            });


            response = {
                time,
                confirmedGraph,
                recoveredGraph,
                activeGraph,
                deathGraph,
                confirmed,
                recovered,
                death,
                active,
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
app.listen(port, () => console.log(`App listening at ${port}`))
