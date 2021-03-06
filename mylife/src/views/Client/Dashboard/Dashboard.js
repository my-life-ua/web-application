import React from 'react';
import { Redirect } from 'react-router-dom';


import Chart from 'react-apexcharts'

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import Table from "components/Table/Table.js";

import utils from "variables/utils.js";

import metric1 from "assets/img/client-dashboard/metric-1.png"
import metric2 from "assets/img/client-dashboard/metric-2.png"
import metric3 from "assets/img/client-dashboard/metric-3.png"
import metric4 from "assets/img/client-dashboard/metric-4.png"

import baseUri from "variables/baseURI.js";

class Dashboard extends React.Component {

    constructor() {
        super();
        this.authUser = JSON.parse(localStorage.getItem('authUser'));
        this.today = new Date();

        this.state = {
            pieChart: {
                series: [1, 1, 1, 1],
                options: {
                    chart: {
                        width: 380,
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
            nutrientsTotal: [],
            redirectProfile: false,
            heartSegmentStops: [49, 62, 66, 75, 82, 95],
            heartRate: 0

        };

        this.fetchNutrients = this.fetchNutrients.bind(this);
        this.fetchHeart = this.fetchHeart.bind(this);
    }

    classes = {
        cardHeader: {
            backgroundColor: "#00acc1",
            color: "white",
            fontSize: "18px",
        }
    }

    fetchHeart() {
        fetch(baseUri.restApi.heartLabel + this.authUser.message.email, {
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

                for (let key in data.message.scale) {
                    key = key + "-";
                    heartSegmentStops.push(parseInt(String(key).split("-")[0]))
                }
                heartSegmentStops.push(99);
                console.log(heartSegmentStops.sort())
                this.setState({
                    heartSegmentStops: heartSegmentStops.sort(),
                    heartRate: data.message.avg_heart_rate <= 99 ? data.message.avg_heart_rate : 99
                })

            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })
    }

    fetchNutrients() {
        fetch(baseUri.restApi.nutrientsRatio + this.authUser.message.email + "/" + this.today.toISOString().slice(0, 10), {
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
                    redirectProfile: this.state.redirectProfile
                })



            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })

        fetch(baseUri.restApi.nutrientsTotal + this.authUser.message.email + "/" + this.today.toISOString().slice(0, 10), {
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

                let nutrients = [
                    [<span><i className="fas fa-circle" style={{ color: "#007280" }}></i> Carbs</span>, data.message.carbs.total, data.message.carbs.goal, String(data.message.carbs.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.carbs.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.carbs.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#00acc1" }}></i> Fats</span>, data.message.fat.total, data.message.fat.goal, String(data.message.fat.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.fat.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.fat.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#00cde6" }}></i> Proteins</span>, data.message.proteins.total, data.message.proteins.goal, String(data.message.proteins.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.proteins.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.proteins.left}</span>],
                    [<span><i className="fas fa-circle" style={{ color: "#1ae6ff" }}></i> Calories</span>, data.message.calories.total, data.message.calories.goal, String(data.message.calories.left).includes("-") === true ? <span style={{ color: "red" }}>{String(data.message.calories.left).substr(1)}</span> : <span style={{ color: "green" }}>{data.message.calories.left}</span>]
                ];

                this.setState({
                    pieChart: this.state.pieChart,
                    nutrientsTotal: nutrients,
                    redirectProfile: this.state.redirectProfile
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
                        redirectProfile: this.state.redirectProfile
                    })
                }
            })

    }

    dayLabel() {
        switch (parseInt(String(this.today.getUTCDate()).charAt(String(this.today.getUTCDate()).length - 1))) {
            case 1:
                return "st"
            case 2:
                return "nd"
            case 3:
                return "rd"
            default:
                return "th"
        }
    }

    componentDidMount() {
        this.fetchHeart();
        this.fetchNutrients();
    }

    render() {
        if (this.state.redirectProfile) return <Redirect to="/client/profile" />
        return (
            <div id="client-dashboard">
                <GridContainer>
                    <GridItem xs={12} sm={12} md={1}>
                        <img style={{ height: "40px", borderRadius: "50%" }} src={"data:image;base64," + this.authUser.message.photo} alt={this.authUser.message.name} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8} style={{ marginTop: "-20px", marginLeft: "-30px" }}>
                        <h3> Welcome, <a href="#i" onClick={() => this.setState({ redirectProfile: true })}>{this.authUser.message.name}!</a></h3>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: "-5px" }}>
                        <p><i className="fas fa-calendar-alt" style={{ color: "#00acc1" }}></i> {utils.weekday[this.today.getDay()]}, {this.today.getUTCDate()}{this.dayLabel()} of {utils.monthNames[this.today.getMonth()] + " " + this.today.getFullYear()}</p>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-20px" }}>
                        <Card>
                            <CardHeader style={this.classes.cardHeader}>
                                <i className="fas fa-heartbeat"></i> <strong>Your daily health measures</strong>
                            </CardHeader>
                        </Card>

                    </GridItem>

                    <GridItem xs={12} sm={12} md={6} style={{ marginTop: "25px" }}>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={6}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric1} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={12}><h4>{this.authUser.message.heart_rate !== null && this.authUser.message.heart_rate !== "" ? this.authUser.message.heart_rate + " bpm" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Heart Rate</h6></GridItem>
                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric2} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.authUser.message.steps !== null && this.authUser.message.steps !== "" ? this.authUser.message.steps : 0}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.authUser.message.distance !== null && this.authUser.message.distance !== "" ? String(this.authUser.message.distance).substring(0, 4) : 0} km</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Steps</h6></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Distance</h6></GridItem>
                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric4} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.authUser.message.height !== null && this.authUser.message.height !== "" ? this.authUser.message.height + " m" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6}><h4>{this.authUser.message.current_weight !== null && this.authUser.message.current_weight !== "" ? this.authUser.message.current_weight + " kg" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Height</h6></GridItem>
                                            <GridItem xs={12} sm={12} md={6} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Weight</h6></GridItem>
                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <Card profile>
                                    <CardAvatar profile style={{ height: "100px", width: "100px" }}>
                                        <a href="#i" onClick={this.changeProfilePicture}>
                                            <img className="profile-picture" src={metric3} alt="Edit profile" />
                                        </a>
                                    </CardAvatar>
                                    <CardBody profile>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={12}><h4>{this.authUser.message.heart_rate !== null && this.authUser.message.weight_goal !== "" ? this.authUser.message.weight_goal + " kg" : "Not found"}</h4></GridItem>
                                            <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-40px", color: "#00acc1" }}><h6>Weight Goal</h6></GridItem>

                                        </GridContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </GridContainer>
                    </GridItem>

                    <GridItem xs={12} sm={12} md={6} style={{ marginTop: "25px" }}>
                        <Card>
                            <CardHeader style={this.classes.cardHeader}>
                                <i className="fas fa-apple-alt"></i> Nutrients
                            </CardHeader>
                            <CardBody>
                                <GridContainer >
                                    <GridItem xs={12} sm={12} md={3}></GridItem>
                                    <GridItem xs={12} sm={12} md={7}>
                                        <Chart options={this.state.pieChart.options} series={this.state.pieChart.series} type="pie" width={300} />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={2}></GridItem>
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
            </div>
        )
    }

}

export default Dashboard;