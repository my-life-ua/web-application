import React from 'react';


import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBackIos';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';

import SearchIcon from '@material-ui/icons/Search';
import Button from "components/CustomButtons/Button.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import Card from "components/Card/Card.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

import AddCircleIcon from '@material-ui/icons/AddCircle';

import Patients from "views/Doctor/Patients/Patients.js";

import myLifeLogo from 'assets/img/mylife-logo.png'

import baseUri from "variables/baseURI.js";

class AddPatient extends React.Component {

    constructor() {
        super();
        this.state = {
            authUser: JSON.parse(localStorage.getItem('authUser')),
            return: false,
            notFound: false,
            foundClient: null,
            message: 'The searched email was not found!',
            color: 'danger'
        }
        this.toggleReturn = this.toggleReturn.bind(this);
        this.searchUser = this.searchUser.bind(this);
        this.addPatient = this.addPatient.bind(this);
    }

    searchUser() {
        var email = document.getElementById("outlined-adornment-amount").value;

        fetch(baseUri.restApi.checkEmail + email, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                if (data.message === false) {
                    this.setState({
                        authUser: this.state.authUser,
                        return: false,
                        notFound: true,
                        foundClient: null,
                        message: 'The searched email was not found!',
                        color: 'danger'
                    })
                    return;
                }

                fetch(baseUri.restApi.patientAssociation, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Token " + this.state.authUser.token
                    },
                    body: JSON.stringify({client: email})
                })
                    .then(response => {
                        if(response.status === 400) {
                            this.setState({
                                authUser: this.state.authUser,
                                return: false,
                                notFound: true,
                                foundClient: null,
                                message: "The searched user is already associated!",
                                color: "warning"
                            })
                        }
                        else if (!response.ok) throw new Error(response.status);
                        else return response.json();
                    })
                    .then(data => {
                        var authUser = this.state.authUser;
                        authUser.token = data.token;
                        localStorage.setItem('authUser', JSON.stringify(authUser));

                        fetch(baseUri.restApi.signup + "/" + email, {
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json",
                                "Authorization": "Token " + authUser.token
                            }
                        })
                            .then(response => {
                                if (!response.ok) throw new Error(response.status);
                                else return response.json();
                            })
                            .then(data => {
                                authUser.token = data.token
                                localStorage.setItem('authUser', JSON.stringify(authUser));
                                this.setState({
                                    authUser: authUser,
                                    return: this.state.return,
                                    notFound: true,
                                    foundClient: data.message,
                                    message: "User added with success to your patients list!",
                                    color: "success"
                                })
        
                            })
                            .catch(error => {
                                console.log("Fetch error 3: " + error);
                            })
                    })
                    .catch(error => {
                        console.log("Fetch error 2: " + error);
                    })
                
                
            })
            .catch(error => {
                console.log("Fetch error 1: " + error);
            })
    }

    addPatient() {

        console.log(baseUri.restApi.patientAssociation);
        console.log(this.state.foundClient.email);
        console.log(this.state.authUser.token)
        console.log({client: this.state.foundClient.email})
        fetch(baseUri.restApi.patientAssociation, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.state.authUser.token
            },
            body: JSON.stringify({"client": this.state.foundClient.email})
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })
    }

    toggleReturn() {
        this.setState({
            return: true
        })
    }

    render() {
        if (this.state.return) return <Patients />
        return (
            <div>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12} style={{ marginTop: "-50px", marginBottom: "20px" }}>
                        <h3><IconButton aria-label="back">
                            <ArrowBack onClick={() => this.toggleReturn()} style={{ color: "#00acc1" }} fontSize="medium" />
                        </IconButton>
                        Add patient</h3>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}></GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                        <FormControl fullWidth variant="outlined" >
                            <InputLabel htmlFor="outlined-adornment-amount">Email</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-amount"
                                startAdornment={<InputAdornment position="start"><i className="fas fa-envelope"></i></InputAdornment>}
                                labelWidth={60}
                            />
                        </FormControl>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}><Button color="info" onClick={this.searchUser} size="large" round><AddCircleIcon /> Add patient</Button></GridItem>
                    <GridItem xs={12} sm={12} md={1}></GridItem>
                    <GridItem xs={12} sm={12} md={1}></GridItem>

                    {this.state.notFound === true ?
                        <GridItem xs={12} sm={12} md={5} style={{ marginTop: "20px" }}>
                            <SnackbarContent
                                message={this.state.message}
                                color={this.state.color}
                            />
                        </GridItem> :
                        ""}
            
                    <GridItem xs={12} sm={12} md={6}></GridItem>
                    <GridItem xs={12} sm={12} md={5}></GridItem>
                    {this.state.foundClient !== null ?
                        <GridItem xs={12} sm={12} md={4}>
                            <Card profile>
                            <CardAvatar profile>
                                <a href="#pablo" >
                                    <img className="profile-picture" src={"data:image;base64," + this.state.foundClient.photo} alt="Client" />
                                </a>
                            </CardAvatar>
                            <CardBody profile>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={12}><h3>{this.state.foundClient.name}</h3></GridItem>
                                    <GridItem xs={12} sm={12} md={12}><a href={"mailto:" + this.state.foundClient.email}><strong>{this.state.foundClient.email}</strong></a></GridItem>
                                </GridContainer>
                            </CardBody>
                        </Card>

                        </GridItem>
                        : ""}

                </GridContainer>
            </div>
        )
    }

}

export default AddPatient;