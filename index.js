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
    var TotalTested = 0;
    var TotalTodayTested = 0;
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
                    time = element.lastupdatedtime ? moment(element.lastupdatedtime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST' : '';
                    confirmed = element.confirmed;
                    recovered = element.recovered;
                    death = element.deaths;
                    active = element.active;
                    todayConfirmed = element.deltaconfirmed.toString();
                    todayRecovered = element.deltarecovered.toString();
                    todayDeath = element.deltadeaths.toString();
                    var stateStats = minData[element.statecode];
                    TotalTested = stateStats.total.tested.samples;
                    TotalTodayTested = stateStats.delta.tested.states.samples
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
                    let totalTest = 0;
                    let todayTest = 0;
                    if (stateStats && stateStats.meta) {
                        let dateTime;
                        if (stateStats.meta.last_updated) {
                            let splitDate = stateStats.meta.last_updated.split('T');
                            let splitTime = splitDate[1].split('+');
                            console.log(splitDate[0], splitTime[0]);
                            dateTime = splitDate[0] + ' ' + splitTime[0];
                        }
                        lastUpdated = stateStats.meta.last_updated ? moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST' : '';

                    }
                    if (stateStats && stateStats.total) {
                        totalTest = abbreviateNumber(stateStats.total.tested.samples);
                    }
                    else {
                        totalTest = 0;
                    }
                    if (stateStats && stateStats.delta) {
                        if (stateStats.delta.tested && stateStats.delta.tested.samples) {
                            todayTest = abbreviateNumber(stateStats.delta.tested.samples);

                        }
                        else {
                            todayTest = 0;
                        }

                    }
                    else
                    {
                        todayTest = 0;
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
                            "totalTest": totalTest,
                            "todayTest": todayTest,
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
                TotalTested,
                TotalTodayTested,
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


function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "K", "M", "B", "T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

app.listen(port, () => console.log(`App listening at ${port}`))
