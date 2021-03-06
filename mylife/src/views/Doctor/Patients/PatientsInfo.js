import React from 'react';

import Chart from 'react-apexcharts'

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import IconButton from '@material-ui/core/IconButton';
import Table from "components/Table/Table.js";
import ArrowBack from '@material-ui/icons/ArrowBackIos';

import loader from "assets/img/mylife-logo-b.png";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import utils from "variables/utils.js";

import metric3 from "assets/img/client-dashboard/metric-3.png"
import metric4 from "assets/img/client-dashboard/metric-4.png"

import baseUri from "variables/baseURI.js";

import ReactSpeedometer from "react-d3-speedometer"

import Patients from "views/Doctor/Patients/Patients.js";

class PatientsInfo extends React.Component {

    constructor(props) {
        super(props);
        this.today = new Date();
        this.authUser = JSON.parse(localStorage.getItem('authUser'));
        this.state = {
            currentPatient: props.currentPatient,
            return: false,
            nutrientsTotal: [
                [<span><i className="fas fa-circle" style={{ color: "#007280" }}></i> Carbs</span>, 0, 0, 0],
                [<span><i className="fas fa-circle" style={{ color: "#00acc1" }}></i> Fats</span>, 0, 0, 0],
                [<span><i className="fas fa-circle" style={{ color: "#00cde6" }}></i> Proteins</span>, 0, 0, 0],
                [<span><i className="fas fa-circle" style={{ color: "#1ae6ff" }}></i> Calories</span>, 0, 0, 0]
            ],
            pieChart: {
                series: [1, 1, 1, 1],
                options: {
                    chart: {
                        width: 300,
                        type: 'pie',
                    },
                    labels: ['Carbs', 'Fats', 'Proteins', 'Others'],
                    colors: ['#007280', '#00acc1', '#00cde6', '#1ae6ff'],
                    responsive: [{
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200
                            },
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }],

                }
            },
            nutrient: { name: "Calories", period: "week" },
            nutrientsHistory: utils.defaultHistory,
            body: { name: "Calories", period: "week" },
            bodyHistory: utils.defaultHistory,
            loaded: false,
            heartSegmentStops: [49, 62, 66, 75, 82, 95],
            heartRate: 0,
            heartLabels: [],
            heartText: null,
            myLifeRate: 0,
            myLifeLabels: [],
            myLifeIncrease: 0,
        }

        this.heartColors = {
            "Excellent": "#76E880",
            "Good": "#99FF33",
            "Average": "#99FFFF",
            "Fair": "#80CCFF",
            "Poor": "#BB99FF"
        };

        this.myLifeColors = {
            "Poor": "#0FA3B1",
            "Average": "#B5E2FA",
            "Excellent": "#F7A072",
        }

        this.nutrientsCache = {}
        utils.nutrients.forEach(nutrient => {
            utils.periods.forEach(period => {
                this.nutrientsCache[nutrient + "" + period] = [];
            });
        });

        this.bodyCache = {}
        utils.body.forEach(b => {
            utils.periods.forEach(period => {
                this.bodyCache[b + "" + period] = [];
            });
        });

        this.toggleReturn = this.toggleReturn.bind(this);
        this.fetchNutrients = this.fetchNutrients.bind(this);

        this.toggleNutrient = this.toggleNutrient.bind(this);
        this.toggleNutrientPeriod = this.toggleNutrientPeriod.bind(this);
        this.fetchNutrientsHistory = this.fetchNutrientsHistory.bind(this);
        this.toggleBody = this.toggleBody.bind(this);
        this.toggleBodyPeriod = this.toggleBodyPeriod.bind(this);
        this.fetchBodyHistory = this.fetchBodyHistory.bind(this);
        this.fetchMyLifeLabel = this.fetchMyLifeLabel.bind(this);
        this.fetchHeart = this.fetchHeart.bind(this);
    }

    toggleReturn() {
        this.setState({
            return: true
        })
    }

    classes = {
        cardCategoryWhite: {
            color: "rgba(255,255,255,.62)",
            margin: "0",
            fontSize: "14px",
            fontWeight: "500",
            marginTop: "0",
            marginBottom: "0"
        },
        cardTitleWhite: {
            color: "#FFFFFF",
            marginTop: "0px",
            minHeight: "auto",
            fontWeight: "500",
            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            marginBottom: "3px",
            textDecoration: "none"
        },
        cardHeader: {
            backgroundColor: "#00acc1",
            color: "white",
            fontSize: "18px",
        }
    };

    fetchMyLifeLabel() {
        fetch(baseUri.restApi.myLifeLabel + this.state.currentPatient.email, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();

            })
            .then(data => {
                let myLifeLabels = [];

                for (let key in data.message.scale) {
                    myLifeLabels.push(
                        <div style={{ padding: "5px", height: "30px", width: "120px", backgroundColor: this.myLifeColors[data.message.scale[key]] }}><strong style={{ color: "white" }}>{key}: {data.message.scale[key]}</strong></div>
                    )
                }
                this.setState({
                    myLifeLabels: myLifeLabels,
                    myLifeRate: data.message.current_week,
                    myLifeIncrease: data.message.increase
                })
            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })
    }

    fetchHeart() {
        fetch(baseUri.restApi.heartLabel + this.state.currentPatient.email, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();

            })
            .then(data => {
                let heartSegmentStops = [];

                let heartLabels = [];

                for (let key in data.message.scale) {
                    if (data.message.scale[key] !== "Poor") {
                        heartLabels.push(
                            <div style={{ padding: "5px", height: "30px", width: "120px", backgroundColor: this.heartColors[data.message.scale[key]] }}><strong style={{ color: "white" }}>{key}: {data.message.scale[key]}</strong></div>
                        )
                        heartSegmentStops.push(parseInt(String(key).split("-")[0]))
                    }
                }
                for (let key in data.message.scale) {
                    if (data.message.scale[key] === "Poor") {
                        heartLabels.push(
                            <div style={{ padding: "5px", height: "30px", width: "120px", backgroundColor: this.heartColors[data.message.scale[key]] }}><strong style={{ color: "white" }}>{key}: {data.message.scale[key]}</strong></div>
                        )
                        key = key + "-";
                        heartSegmentStops.push(parseInt(String(key).split("-")[0]))
                    }
                }
                heartSegmentStops.push(99);

                this.setState({
                    heartSegmentStops: heartSegmentStops.sort(),
                    heartRate: {
                        "value": data.message.avg_heart_rate <= 99 ? data.message.avg_heart_rate : 99,
                        "label": data.message.label
                    },
                    heartLabels: heartLabels.sort(),
                })

            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })
    }


    fetchNutrients() {
        fetch(baseUri.restApi.nutrientsRatio + this.state.currentPatient.email + "/" + this.today.toISOString().slice(0, 10), {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();

            })
            .then(data => {

                let series = [
                    data.message.carbs.ratio,
                    data.message.fat.ratio,
                    data.message.proteins.ratio,
                    data.message.others.ratio,
                ];

                let pieChart = this.state.pieChart;
                pieChart.series = series;

                this.setState({
                    pieChart: pieChart,
                    nutrientsTotal: this.state.nutrientsTotal,
                    currentPatient: this.state.currentPatient,
                    return: this.state.return,
                    nutrient: this.state.nutrient,
                    nutrientsHistory: this.state.nutrientsHistory,
                    body: this.state.body,
                    bodyHistory: this.state.bodyHistory
                })



            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })

        fetch(baseUri.restApi.nutrientsTotal + this.state.currentPatient.email + "/" + this.today.toISOString().slice(0, 10), {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();

            })
            .then(data => {

                console.log(data);

                let nutrients = [
                    [<span><i className="fas fa-circle" style={{ color: "#007280" }}></i> Carbs</span>, data.message.carbs.total, data.message.carbs.goal, String(data.message.carbs.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.carbs.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.carbs.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#00acc1" }}></i> Fats</span>, data.message.fat.total, data.message.fat.goal, String(data.message.fat.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.fat.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.fat.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#00cde6" }}></i> Proteins</span>, data.message.proteins.total, data.message.proteins.goal, String(data.message.proteins.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.proteins.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.proteins.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#1ae6ff" }}></i> Calories</span>, data.message.calories.total, data.message.calories.goal, String(data.message.calories.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.calories.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.calories.left}</span>]
                ];

                this.setState({
                    pieChart: this.state.pieChart,
                    nutrientsTotal: nutrients,
                    currentPatient: this.state.currentPatient,
                    return: this.state.return,
                    nutrient: this.state.nutrient,
                    nutrientsHistory: this.state.nutrientsHistory,
                    body: this.state.body,
                    bodyHistory: this.state.bodyHistory
                })


            })
            .catch(error => {
                console.log("Fetch error: " + error);

                if (String(error).includes("SyntaxError: JSON.parse")) {
                    let nutrients = [
                        [<span><i className="fas fa-circle" style={{ color: "#007280" }}></i> Carbs</span>, 0, 0, 0],
                        [<span><i className="fas fa-circle" style={{ color: "#00acc1" }}></i> Fats</span>, 0, 0, 0],
                        [<span><i className="fas fa-circle" style={{ color: "#00cde6" }}></i> Proteins</span>, 0, 0, 0],
                        [<span><i className="fas fa-circle" style={{ color: "#1ae6ff" }}></i> Calories</span>, 0, 0, 0]
                    ];

                    this.setState({
                        pieChart: this.state.pieChart,
                        nutrientsTotal: nutrients,
                        currentPatient: this.state.currentPatient,
                        return: this.state.return,
                        nutrient: this.state.nutrient,
                        nutrientsHistory: this.state.nutrientsHistory,
                        body: this.state.body,
                        bodyHistory: this.state.bodyHistory
                    })
                }
            })
    }

    fetchNutrientsHistory(nutrient, period) {

        if (this.nutrientsCache[nutrient + "" + period].length !== 0) {
            this.setState({
                nutrient: { name: nutrient, period: period },
                nutrientsHistory: this.nutrientsCache[nutrient + "" + period],
                body: this.state.body,
                bodyHistory: this.state.bodyHistory,
                pieChart: this.state.pieChart,
                nutrientsTotal: this.state.nutrientsTotal,
                currentPatient: this.state.currentPatient,
                return: this.state.return,
            })
            return;
        }


        fetch(baseUri.restApi.nutrientsHistory + this.state.currentPatient.email + "?metric=" + nutrient.toLowerCase() + "&period=" + period, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                this.authUser.token = data.token;
                localStorage.setItem('authUser', JSON.stringify(this.authUser));

                let nutrientsHistory = [];
                data.message.history.forEach(elem => {
                    nutrientsHistory.push({
                        day: elem.day,
                        value: elem.value,
                        goal: data.message.goal !== undefined ? data.message.goal : 0
                    })
                })

                this.setState({
                    nutrient: { name: nutrient, period: period },
                    nutrientsHistory: nutrientsHistory,
                    body: this.state.body,
                    bodyHistory: this.state.bodyHistory,
                    pieChart: this.state.pieChart,
                    nutrientsTotal: this.state.nutrientsTotal,
                    currentPatient: this.state.currentPatient,
                    return: this.state.return,
                })
                this.nutrientsCache[nutrient + "" + period] = data.message.history;

            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })

    }


    toggleNutrient = (event) => {
        this.fetchNutrientsHistory(event.target.value, this.state.nutrient.period);
    }

    toggleNutrientPeriod = (event) => {
        this.fetchNutrientsHistory(this.state.nutrient.name, event.target.value);
    }


    fetchBodyHistory(body, period) {

        if (this.bodyCache[body + "" + period].length !== 0) {
            this.setState({
                nutrient: this.state.nutrient,
                nutrientsHistory: this.state.nutrientsHistory,
                body: { name: body, period: period },
                bodyHistory: this.bodyCache[body + "" + period],
                pieChart: this.state.pieChart,
                nutrientsTotal: this.state.nutrientsTotal,
                currentPatient: this.state.currentPatient,
                return: this.state.return,
            })
            return;
        }


        fetch(baseUri.restApi.bodyHistory + this.state.currentPatient.email + "?metric=" + body.toLowerCase() + "&period=" + period, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                this.authUser.token = data.token;
                localStorage.setItem('authUser', JSON.stringify(this.authUser));

                let bodyHistory = [];
                data.message.history.forEach(elem => {
                    bodyHistory.push({
                        day: elem.day,
                        value: elem.value,
                        goal: data.message.goal !== undefined ? data.message.goal : 0
                    })
                })

                this.setState({
                    nutrient: this.state.nutrient,
                    nutrientsHistory: this.state.nutrientsHistory,
                    body: { name: body, period: period },
                    bodyHistory: bodyHistory,
                    pieChart: this.state.pieChart,
                    nutrientsTotal: this.state.nutrientsTotal,
                    currentPatient: this.state.currentPatient,
                    return: this.state.return,
                    loaded: true
                })
                this.bodyCache[body + "" + period] = data.message.history;

            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })

    }

    toggleBody = (event) => {
        this.fetchBodyHistory(event.target.value, this.state.body.period);
    }

    toggleBodyPeriod = (event) => {
        this.fetchBodyHistory(this.state.body.name, event.target.value);
    }

    componentDidMount() {
        this.fetchMyLifeLabel();
        this.fetchHeart();
        this.fetchNutrients();
        this.fetchNutrientsHistory(this.state.nutrient.name, this.state.nutrient.period);
        this.fetchBodyHistory(this.state.body.name, this.state.body.period);
    }



    render() {
        if (this.state.return) return <Patients />
        if (!this.state.loaded) return (
            <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={5}></GridItem>
                <GridItem xs={12} sm={12} md={2} style={{ marginTop: "100px" }}>
                    <img className="small-loader2" src={loader} alt="loader" style={{ height: "100px" }} />
                </GridItem>
                <GridItem xs={12} sm={12} md={5}></GridItem>
            </GridContainer>
        )
        return (
            <div>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-50px", marginBottom: "20px" }}>
                        <h3><IconButton aria-label="back">
                            <ArrowBack onClick={() => this.toggleReturn()} style={{ color: "#00acc1" }} fontSize="medium" />
                        </IconButton>
                        Patient details</h3>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <Card profile style={{ paddingBottom: "105px" }}>
                            <CardAvatar profile>
                                <a href="#pablo" >
                                    <img className="profile-picture" src={"data:image;base64," + this.state.currentPatient.photo} alt="Edit profile" />
                                </a>
                            </CardAvatar>
                            <CardBody profile>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={12}><h3>{this.state.currentPatient.name}</h3></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><a href={"mailto:" + this.state.currentPatient.email}><strong>{this.state.currentPatient.email}</strong></a></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><p style={{ fontSize: "17px" }}><i style={{ color: "#00acc1", marginRight: "3px" }} class="fas fa-ruler-vertical"></i> {this.state.currentPatient.height} cm</p></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><p style={{ fontSize: "17px" }}><i style={{ color: "#00acc1", marginRight: "3px" }} class="fas fa-weight"></i>  {this.state.currentPatient.current_weight} kg</p></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><p style={{ fontSize: "17px" }}><i style={{ color: "#00acc1", marginRight: "3px" }} class="fas fa-phone"></i> {this.state.currentPatient.phone_number}</p></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><p style={{ fontSize: "17px" }}><i style={{ color: "#00acc1", marginRight: "3px" }} class={this.state.currentPatient.sex === "M" ? "fas fa-male" : "fas fa-female"}></i> {this.state.currentPatient.sex === "M" ? "Male" : "Female"}</p></GridItem>
                                </GridContainer>
                            </CardBody>
                        </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric4} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.state.currentPatient.height !== null && this.state.currentPatient.height !== "" ? this.state.currentPatient.height + " m" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.state.currentPatient.current_weight !== null && this.state.currentPatient.current_weight !== "" ? this.state.currentPatient.current_weight + " kg" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Height</h6></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Weight</h6></GridItem>
                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12} style={{ marginTop: "85px" }}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric3} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={12}><h4>{this.state.currentPatient.heart_rate !== null && this.state.currentPatient.weight_goal !== "" ? this.state.currentPatient.weight_goal + " kg" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Weight Goal</h6></GridItem>

                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <Card>
                            <CardHeader style={this.classes.cardHeader}>
                                <i className="fas fa-apple-alt"></i> Nutrients
                            </CardHeader>
                            <CardBody>
                                <GridContainer >
                                    <GridItem xs={12} sm={12} md={12}>
                                        <Chart options={this.state.pieChart.options} series={this.state.pieChart.series} type="pie" width={300} />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <Table
                                            tableHeaderColor="info"
                                            tableHead={["Nutrient", "Total", "Goal", "Difference"]}
                                            tableData={this.state.nutrientsTotal}
                                        />
                                    </GridItem>

                                </GridContainer>
                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <h3><i className="fas fa-file-medical-alt" style={{ color: "#00acc1", marginRight: "5px" }}></i> Health History</h3>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4><i className="fas fa-heartbeat" style={{ color: "#00acc1", marginRight: "5px" }}></i> <strong>MyLife Metric</strong></h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4><i className="fas fa-heartbeat" style={{ color: "#00acc1", marginRight: "5px" }}></i> <strong>Heart rate</strong></h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        {this.state.heartRate !== 0 &&
                            <GridContainer justify="center">
                                <GridItem xs={12} sm={12} md={12}>

                                    <ReactSpeedometer
                                        minValue={0}
                                        value={this.state.myLifeRate.value}
                                        maxValue={5}
                                        currentValueText={this.state.myLifeRate.value + ""}
                                        customSegmentStops={[0, 2, 4, 5]}
                                        segmentColors={[
                                            "#0FA3B1",
                                            "#B5E2FA",
                                            "#F7A072",
                                        ]}
                                        customSegmentLabels={[
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                        ]}
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-100px" }}>
                                    Your estimate of <strong>{this.state.myLifeRate.value}</strong> is <strong style={{ color: this.myLifeColors[this.state.myLifeRate.label], fontWeight: "1200" }}>{this.state.myLifeRate.label}</strong> for your age.<br />{String(this.state.myLifeIncrease).includes("-") !== false ? <strong style={{ color: "red" }}><i className="fas fa-arrow-down"></i> {this.state.myLifeIncrease}% decrease</strong> : <strong style={{ color: "#76E880" }}><i className="fas fa-arrow-up"></i> {this.state.myLifeIncrease}% increase</strong>} since last week.
                                </GridItem>
                            </GridContainer>}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                        <GridContainer>
                            {this.state.myLifeLabels.map(label => {
                                return <GridItem xs={12} sm={12} md={12} style={{ marginBottom: "10px" }}>
                                    {label}
                                </GridItem>
                            })}
                        </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        {this.state.heartRate !== 0 &&
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <ReactSpeedometer
                                        minValue={this.state.heartSegmentStops[0]}
                                        value={this.state.heartRate.value}
                                        maxValue={this.state.heartSegmentStops[this.state.heartSegmentStops.length - 1]}
                                        currentValueText={this.state.heartRate.value + " bpm"}
                                        customSegmentStops={this.state.heartSegmentStops}
                                        segmentColors={[
                                            "#76E880",
                                            "#99FF33",
                                            "#99FFFF",
                                            "#80CCFF",
                                            "#BB99FF",
                                        ]}
                                        customSegmentLabels={[
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                            {
                                                position: "INSIDE",
                                                color: "white",
                                            },
                                        ]}
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-100px" }}>
                                    Your estimate of <strong>{this.state.heartRate.value}</strong> is <strong style={{ color: this.heartColors[this.state.heartRate.label], fontWeight: "1200" }}>{this.state.heartRate.label}</strong> for your age.
                                </GridItem>
                            </GridContainer>
                        }
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                        <GridContainer>
                            {this.state.heartLabels.map(label => {
                                return <GridItem xs={12} sm={12} md={12} style={{ marginBottom: "10px" }}>
                                    {label}
                                </GridItem>
                            })}
                        </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4><i className="fas fa-apple-alt" style={{ color: "#00acc1", marginRight: "5px" }}></i> Nutrients history - <strong>{this.state.nutrient.name}</strong></h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: "15px" }}>
                        <FormControl variant="outlined" style={{ width: "180px" }}>
                            <InputLabel id="demo-simple-select-outlined-label">Metric</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="nutrients-metric"
                                value={this.state.nutrient.name}
                                onChange={this.toggleNutrient}
                                label="Metric"
                            >
                                {utils.nutrients.map((nutrient, key) => {
                                    return <MenuItem value={nutrient}>{nutrient}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: "15px" }}>
                        <FormControl variant="outlined" style={{ width: "180px" }}>
                            <InputLabel id="demo-simple-select-outlined-label">Period</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="nutrients-period"
                                value={this.state.nutrient.period}
                                onChange={this.toggleNutrientPeriod}
                                label="Period"
                            >
                                {utils.periods.map((period, key) => {
                                    return <MenuItem value={period}>{period}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        <LineChart
                            width={1000}
                            height={300}
                            data={this.state.nutrientsHistory}
                            margin={{
                                top: 5, right: 30, left: 5, bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#00acc1" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="goal" stroke="red" />
                        </LineChart>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4><i className="fas fa-dumbbell" style={{ color: "#00acc1", marginRight: "5px" }}></i> Body history - <strong>{this.state.body.name}</strong></h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: "15px" }}>
                        <FormControl variant="outlined" style={{ width: "180px" }}>
                            <InputLabel id="demo-simple-select-outlined-label">Metric</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="nutrients-metric"
                                value={this.state.body.name}
                                onChange={this.toggleBody}
                                label="Metric"
                            >
                                {utils.body.map((b, key) => {
                                    return <MenuItem value={b}>{b}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: "15px" }}>
                        <FormControl variant="outlined" style={{ width: "180px" }}>
                            <InputLabel id="demo-simple-select-outlined-label">Period</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="nutrients-period"
                                value={this.state.body.period}
                                onChange={this.toggleBodyPeriod}
                                label="Period"
                            >
                                {utils.periods.map((period, key) => {
                                    return <MenuItem value={period}>{period}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        <LineChart
                            width={1000}
                            height={300}
                            data={this.state.bodyHistory}
                            margin={{
                                top: 5, right: 30, left: 5, bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#00acc1" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="goal" stroke="red" />
                        </LineChart>
                    </GridItem>

                </GridContainer>
            </div >
        )
    }
}

export default PatientsInfo;