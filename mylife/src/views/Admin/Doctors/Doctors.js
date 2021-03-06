import React from "react";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import Button from "components/CustomButtons/Button.js";
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import AddCircleIcon from '@material-ui/icons/AddCircle';

import AddDoctor from "views/Admin/Doctors/AddDoctor.js";

import baseURI from "variables/baseURI.js";

class Doctors extends React.Component {

    constructor() {
        super();
        this.state = {
            authUser: JSON.parse(localStorage.getItem('authUser')),
            doctors: [],
            deleteDialog: false,
            currentDoctor: null,
            successDialog: false,
            addDoctor: false
        }
        this.deleteDoctor = this.deleteDoctor.bind(this);
        this.deleteDialog = this.deleteDialog.bind(this);
        this.toggleSuccessDialog = this.toggleSuccessDialog.bind(this);
        this.addDoctor = this.addDoctor.bind(this);
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
            backgroundColor: "#00acc1"
        },
        picture: {
            height: "40px", width: "40px", borderRadius: "50%"
        }
    };

    deleteDoctor() {
        fetch(baseURI.restApi.doctors + "/" + this.state.currentDoctor, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.state.authUser.token
            }
        })
            .then(response => {
                if (response.status === 204 || response.status === 200) {
                    var doctors = [];
                    for (var i = 0; i < this.state.doctors.length; i++) {
                        if (this.state.doctors[i][2] !== this.state.currentDoctor)
                            doctors.push(this.state.doctors[i]);
                    }

                    this.setState({
                        authUser: this.state.authUser,
                        doctors: doctors,
                        deleteDialog: false,
                        currentDoctor: null,
                        successDialog: true,
                        addDoctor: this.state.addDoctor
                    })
                    return
                }
                else throw new Error(response.status)
            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })
    }

    toggleSuccessDialog() {
        this.setState({
            authUser: this.state.authUser,
            doctors: this.state.doctors,
            deleteDialog: this.state.deleteDialog,
            currentDoctor: this.state.currentDoctor,
            successDialog: !this.state.successDialog,
            addDoctor: this.state.addDoctor
        })
    }

    deleteDialog(doctorEmail) {
        this.setState({
            authUser: this.state.authUser,
            doctors: this.state.doctors,
            deleteDialog: !this.state.deleteDialog,
            currentDoctor: doctorEmail,
            successDialog: this.state.successDialog,
            addDoctor: this.state.addDoctor
        })

    }

    componentDidMount() {

        fetch(baseURI.restApi.hospitalDoctors, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + this.state.authUser.token
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();

            })
            .then(data => {
                var doctors = [];

                data.message.forEach(doctor => doctors.push(
                    [
                        <img style={this.classes.picture} src={"data:image;base64," + doctor.photo} alt={doctor.name} />,
                        doctor.name,
                        doctor.email,
                        doctor.hospital,
                        <IconButton aria-label="delete">
                            <DeleteIcon onClick={() => this.deleteDialog(doctor.email)} style={{ color: "#f44336" }} fontSize="medium" />
                        </IconButton>
                    ]
                ))

                this.setState({
                    authUser: this.state.authUser,
                    doctors: doctors,
                    deleteDialog: this.state.deleteDialog,
                    currentDoctor: this.state.currentDoctor,
                    successDialog: this.state.successDialog,
                    addDoctor: this.state.addDoctor
                })
            })
            .catch(error => {
                console.log("Fetch error: " + error);
            })

    }

    addDoctor() {
        this.setState({
            addDoctor: true
        })
    }

    render() {
        if(this.state.addDoctor) return <AddDoctor />
        return (
            <div>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <Card>
                            <CardHeader style={this.classes.cardHeader}>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={9}>
                                        <h4 style={this.classes.cardTitleWhite}><i class="fas fa-user-md"></i>  Doctors list</h4>
                                        <p style={this.classes.cardCategoryWhite}>Manage all doctors from your hospital</p>
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={3}><Button color="success" onClick={this.addDoctor} round><AddCircleIcon /> Add new doctor</Button></GridItem>
                                </GridContainer>

                            </CardHeader>
                            <CardBody>
                                <Table
                                    tableHeaderColor="info"
                                    tableHead={["", "Name", "Email", "Hospital", "Remove"]}
                                    tableData={this.state.doctors}
                                />
                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>
                <Dialog
                    open={this.state.deleteDialog}
                    onClose={this.deleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" style={{ color: "#f44336" }}>
                        <i class="fas fa-exclamation-circle"></i> Are you sure you want to remove <strong style={{ color: "#00acc1" }}>{this.state.currentDoctor}?</strong>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">This action will be <strong>permanent.</strong>

                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button block onClick={() => this.deleteDialog()} color="info">Cancel</Button>
                        <Button block onClick={() => this.deleteDoctor()} color="danger">Remove</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.successDialog}
                    onClose={this.toggleSuccessDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" style={{ color: "#4caf50" }}>
                        <i class="fas fa-check-circle"></i>Doctor removed with success!
					</DialogTitle>
                    <DialogActions>
                        <Button block onClick={() => this.toggleSuccessDialog()} color="success">Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

}

export default Doctors;