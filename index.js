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
                    confirmed = formatNumber(element.confirmed) ;
                    recovered = formatNumber(element.recovered) ;
                    death = formatNumber(element.deaths) ;
                    active = formatNumber(element.active) ;
                    todayConfirmed = formatNumber(element.deltaconfirmed);
                    todayRecovered = formatNumber(element.deltarecovered);
                    todayDeath = formatNumber(element.deltadeaths);
                    var stateStats = minData[element.statecode];
                    TotalTested = formatNumber(stateStats.total.tested.samples) ;
                    TotalTodayTested = stateStats.delta.tested && stateStats.delta.tested.states && stateStats.delta.tested.states.samples ? formatNumber(stateStats.delta.tested.states.samples)  : "0";                }
                else {
                    let district = [];
                    if (districtData[element.state]) {
                        for (let key in districtData[element.state].districtData) {
                            district.push({
                                name: key,
                                count: districtData[element.state].districtData[key].confirmed ,
                                todayCount: formatNumber(districtData[element.state].districtData[key].delta.confirmed),
                                todayRecovered:formatNumber(districtData[element.state].districtData[key].delta.recovered),
                                todayDeceased:formatNumber(districtData[element.state].districtData[key].delta.deceased),
                                active:formatNumber(districtData[element.state].districtData[key].active),
                                recovered:formatNumber(districtData[element.state].districtData[key].recovered),
                                deceased:formatNumber(districtData[element.state].districtData[key].deceased),
                            });
                        }
                        district.sort(function (a, b) {
                            return b.count - a.count
                        })
                        for(let d=0;d < district.length; d++)
                        {
                            district[d].count = formatNumber(district[d].count)
                        }
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
                        totalTest = formatNumber(stateStats.total.tested.samples);
                    }
                    else {
                        totalTest = "0";
                    }
                    if (stateStats && stateStats.delta) {
                        if (stateStats.delta.tested && stateStats.delta.tested.samples) {
                            todayTest = formatNumber(stateStats.delta.tested.samples);

                        }
                        else {
                            todayTest = "0";
                        }

                    }
                    else
                    {
                        todayTest = "0";
                    }
                    stateData.push(
                        {
                            //
                            state: element.state.length > 25 ? 
                            element.state.substring(0, 25 - 3) + "..." : 
                            element.state,
                            showDistrict: false,
                            "lastUpdated": lastUpdated,
                            "totalDeath": formatNumber(element.deaths),
                            "totalConfirmed": formatNumber(element.confirmed),
                            "totalRecovered": formatNumber(element.recovered),
                            "totalActive": formatNumber(element.active),
                            "totalTest": totalTest,
                            "todayTest": todayTest,
                            "todayDeath": formatNumber(element.deltadeaths),
                            "todayRecovered": formatNumber(element.deltarecovered) ,
                            "todayConfirmed": formatNumber(element.deltaconfirmed),
                            "districts": district,

                        }
                    )
                }
                return element;

            });


            stateData.sort(function (a, b) {
                return (b.totalConfirmed.split(',').join('')) - (a.totalConfirmed.split(',').join(''))
            })

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

app.get('/globalStats',function (req,res) {
    axios.all([
        axios.get('https://api.covid19api.com/summary')])
        .then(axios.spread((data) => {
            data.data.Countries = data.data.Countries.map(con => {
                con.showCountry = false;
                return con;
            })
            res.send(data.data)
        }))
    
})


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

function formatNumber(val){
    var x=val;
    x=x.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

app.listen(port, () => console.log(`App listening at ${port}`))