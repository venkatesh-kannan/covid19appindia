const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
var moment = require('moment');
const axios = require('axios');
const { STATES } = require('mongoose');

let fcm;

getToken();

setInterval(function () {
  functions.logger.info("Hello logs! " + new Date());
  getCovidData();
}, 60 * 10 * 1000);

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
    var subscriptions = [];
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
                    confirmed = formatNumber(element.confirmed);
                    recovered = formatNumber(element.recovered);
                    death = formatNumber(element.deaths);
                    active = formatNumber(element.active);
                    todayConfirmed = formatNumber(element.deltaconfirmed);
                    todayRecovered = formatNumber(element.deltarecovered);
                    todayDeath = formatNumber(element.deltadeaths);
                    var stateStats = minData[element.statecode];
                    TotalTested = formatNumber(stateStats.total.tested.samples);
                    TotalTodayTested = stateStats.delta.tested && stateStats.delta.tested.states && stateStats.delta.tested.states.samples ? formatNumber(stateStats.delta.tested.states.samples) : "0";
                }
                else {
                    if(element.state != 'State Unassigned')
                    subscriptions.push({
                        name: `${element.state}`,
                        code: `state`
                    });
                    let district = [];
                    if (districtData[element.state]) {
                        for (let key in districtData[element.state].districtData) {
                            district.push({
                                name: key,
                                count: districtData[element.state].districtData[key].confirmed,
                                todayCount: formatNumber(districtData[element.state].districtData[key].delta.confirmed),
                                todayRecovered: formatNumber(districtData[element.state].districtData[key].delta.recovered),
                                todayDeceased: formatNumber(districtData[element.state].districtData[key].delta.deceased),
                                active: formatNumber(districtData[element.state].districtData[key].active),
                                recovered: formatNumber(districtData[element.state].districtData[key].recovered),
                                deceased: formatNumber(districtData[element.state].districtData[key].deceased),
                            });
                            if(key != 'Unknown')
                        }
                        district.sort(function (a, b) {
                            return b.count - a.count
                        })
                        for (let d = 0; d < district.length; d++) {
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
                    else {
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
                            "todayRecovered": formatNumber(element.deltarecovered),
                            "todayConfirmed": formatNumber(element.deltaconfirmed),
                            "districts": district
                        }
                    )
                }
                return element;

            });


            stateData.sort(function (a, b) {
                return (b.totalConfirmed.split(',').join('')) - (a.totalConfirmed.split(',').join(''))
            })

            subscriptions.sort(compare)

            response = {
                time,
                confirmedGraph,
                recoveredGraph,
                subscriptions,
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

app.get('/globalStats', function (req, res) {
    axios.all([
        axios.get('https://api.covid19api.com/summary')])
        .then(axios.spread((data) => {
            data.data.Countries = data.data.Countries.map(con => {
                con.showCountry = false;
                return con;
            });
            data.data.Countries.sort(function (a, b) {
                return b.TotalConfirmed - a.TotalConfirmed
            })
            res.send(data.data)
        }))

})

function compare( a, b ) {
    if ( b.code < a.code ){
      return -1;
    }
    if ( b.code > a.code ){
      return 1;
    }
    return 0;
  }

  app.get('/statsTrigger', function(res,res) {
    axios.all([
        axios.get('https://api.covid19india.org/data.json')])
        .then(axios.spread((data) => {
            res.send(data.data)
        }))
  });

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

function formatNumber(val) {
    var x = val;
    x = x.toString();
    var lastThree = x.substring(x.length - 3);
    var otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers != '')
        lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

function getToken() {
    axios.get('https://firebasestorage.googleapis.com/v0/b/covidindia-app.appspot.com/o/serviceAccountKey.json?alt=media&token=c1416b51-0b9d-43bb-a6a7-fdfa78b5cf98').then((res) => {
      admin.initializeApp({
        credential: admin.credential.cert(res.data),
        databaseURL: "https://covidindia-app.firebaseio.com"
      });
      fcm = admin.messaging();
      getCovidData();
    }).catch((e) => {
      functions.logger.error(e);
    })
  }
  
  function getCovidData() {
    axios.get('https://api.covid19india.org/data.json')
      .then((reps) => {
        processCovidData(reps.data).then(dta => {
          console.log(dta);
        }).catch(e => {
          functions.logger.error(e);
        })
      })
      .catch((error) => {
        functions.logger.error(error);
      })
  }
  
  async function processCovidData(dta) {
    let stateWise = dta.statewise;
    let formatedstateWise = [];
    let fbData = await admin.firestore().collection('statewiseData').get();
    let subData = await admin.firestore().collection('subscriptions').get();
    let fbDoc;
    let stdataId;
    let subDocs = [];
    if (fbData && !fbData.empty)
      fbData.forEach(doc => {
        fbDoc = doc.data();
        stdataId = doc.id;
      });
    subData.forEach(doc => {
      subDocs.push(doc.data())
    })
    if (!fbDoc && stateWise && stateWise.length > 0) {
      stateWise = stateWise.map((sw) => {
        formatedstateWise.push({
          deltaconfirmed: sw.deltaconfirmed,
          lastupdatedtime: sw.lastupdatedtime,
          state: sw.state,
          statecode: sw.statecode,
        });
        return sw;
      });
      admin.firestore().collection('statewiseData').add({ data: formatedstateWise }).then((res) => {
        console.log(res)
      }).catch(e => {
        functions.logger.error(e);
      });
    }
    else {
      let updatedData = [];
      if (stateWise && stateWise.length > 0)
        stateWise = stateWise.map((st) => {
          fbDoc.data = fbDoc.data.map((fb) => {
            if (fb.statecode === st.statecode && st.deltaconfirmed != '0' && st.lastupdatedtime != fb.lastupdatedtime) {
              updatedData.push({
                deltaconfirmed: st.deltaconfirmed,
                lastupdatedtime: st.lastupdatedtime,
                state: st.state,
                statecode: st.statecode,
              });
            }
            return fb;
          });
          return st;
        })
      formatedstateWise = [];
      if (stateWise && stateWise.length > 0)
        stateWise = stateWise.map((sw) => {
          formatedstateWise.push({
            deltaconfirmed: sw.deltaconfirmed,
            lastupdatedtime: sw.lastupdatedtime,
            state: sw.state,
            statecode: sw.statecode,
          });
          return sw;
        });
      if (stdataId && stdataId.length > 0)
        admin.firestore().collection('statewiseData').doc(stdataId).update({ data: formatedstateWise }).then(res => {
          console.log(res)
        }).catch(e => {
          console.log(e)
        });
      functions.logger.info(updatedData);
      if (subDocs && subDocs.length > 0)
        subDocs = subDocs.map((sudb) => {
          let filterChange = updatedData.filter((ud) => {
            return sudb.subscriptions.includes(ud.state)
          })
          functions.logger.warn(filterChange);
          if (filterChange && filterChange.length > 0) {
            let tgBody = 'States: ';
            let newtg = false;
            if (filterChange && filterChange.length > 0)
              filterChange = filterChange.map((tg) => {
                if (!newtg) {
                  tgBody = tgBody + tg.state;
                  newtg = true
                }
                else {
                  tgBody = tgBody + ', ' + tg.state;
                }
  
              });
            const payload = {
              notification: {
                title: 'New cases identified!',
                body: tgBody
              }
            }
            return fcm.sendToDevice(sudb.token, payload).then((res) => {
              console.log(res);
  
            }).catch(e => {
              console.log(e);
            });
          }
          return sudb;
        })
  
      // fcm.sendToDevice()
    }
  }

app.listen(port, () => console.log(`App listening at ${port}`))